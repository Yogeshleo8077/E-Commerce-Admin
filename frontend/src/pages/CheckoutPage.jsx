import React from "react";
import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { createOrderCODApi } from "../services/orderApi";
import { getMyCartApi } from "../services/cartApi";
import { setCartFromServer } from "../features/cart/cartSlice";
import { setCurrentOrder } from "../features/orders/ordersSlice";

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((state) => state.cart);
  const { token, user } = useSelector((state) => state.auth);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || "",
    phone: "",
    pincode: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
  });

  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  // Ensure we have latest cart from server
  const fetchCart = async () => {
    if (!token) return;
    try {
      setCartLoading(true);
      const data = await getMyCartApi();
      dispatch(setCartFromServer(data));
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load cart.";
      setError(msg);
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const totals = useMemo(() => {
    let itemsPrice = 0;
    items.forEach((item) => {
      const price = item.product?.price || 0;
      itemsPrice += price * item.quantity;
    });

    const shippingPrice = itemsPrice > 1000 ? 0 : itemsPrice === 0 ? 0 : 50;
    const taxPrice = Math.round(itemsPrice * 0.18);
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    return { itemsPrice, shippingPrice, taxPrice, totalPrice };
  }, [items]);

  const handleChange = (e) => {
    setShippingAddress((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMsg("");

      const data = await createOrderCODApi(shippingAddress);
      // backend returns { message, order }
      dispatch(setCurrentOrder(data.order));
      // clear cart in frontend (backend already cleared)
      dispatch(setCartFromServer({ items: [] }));
      setSuccessMsg("Order placed successfully!");

      // Redirect to order details page
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to place order (COD).";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4">
        <p className="mb-2">You need to login to checkout.</p>
        <Link
          to="/login"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  if (items.length === 0 && !cartLoading) {
    return (
      <div className="p-4">
        <p className="mb-2">Your cart is empty.</p>
        <Link
          to="/products"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="py-4 grid md:grid-cols-3 gap-4">
      {/* Shipping form */}
      <div className="md:col-span-2 bg-white rounded-lg shadow-sm p-4">
        <h1 className="text-2xl font-semibold mb-4">Checkout</h1>

        {error && (
          <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
            {successMsg}
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1 font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={shippingAddress.fullName}
                onChange={handleChange}
                required
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={shippingAddress.phone}
                onChange={handleChange}
                required
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1 font-medium text-gray-700">
                Pincode
              </label>
              <input
                type="text"
                name="pincode"
                value={shippingAddress.pincode}
                onChange={handleChange}
                required
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                name="city"
                value={shippingAddress.city}
                onChange={handleChange}
                required
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1 font-medium text-gray-700">
                State
              </label>
              <input
                type="text"
                name="state"
                value={shippingAddress.state}
                onChange={handleChange}
                required
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium text-gray-700">
              Address Line 1
            </label>
            <input
              type="text"
              name="addressLine1"
              value={shippingAddress.addressLine1}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium text-gray-700">
              Address Line 2 (optional)
            </label>
            <input
              type="text"
              name="addressLine2"
              value={shippingAddress.addressLine2}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* For now only COD flow implemented on frontend */}
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </p>
            <p className="text-sm text-gray-600">
              Currently, we are using{" "}
              <span className="font-semibold">Cash on Delivery (COD)</span> in
              frontend. Online payment integration will be added later.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || items.length === 0}
            className="mt-4 px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium disabled:opacity-60"
          >
            {loading ? "Placing order..." : "Place Order (COD)"}
          </button>
        </form>
      </div>

      {/* Order summary */}
      <div className="bg-white rounded-lg shadow-sm p-4 h-fit">
        <h2 className="text-lg font-semibold mb-2">Order Summary</h2>
        <p className="text-sm text-gray-600 mb-1">
          Items: {items.reduce((acc, i) => acc + i.quantity, 0)}
        </p>
        <p className="text-sm text-gray-700">
          Items total: ₹{totals.itemsPrice}
        </p>
        <p className="text-sm text-gray-700">
          Shipping: ₹{totals.shippingPrice}
        </p>
        <p className="text-sm text-gray-700">
          Tax (approx): ₹{totals.taxPrice}
        </p>
        <p className="text-base font-semibold text-blue-600 mt-2">
          Total: ₹{totals.totalPrice}
        </p>
      </div>
    </div>
  );
};

export default CheckoutPage;
