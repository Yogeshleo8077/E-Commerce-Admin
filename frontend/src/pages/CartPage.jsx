import React from "react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getMyCartApi,
  updateCartItemApi,
  removeCartItemApi,
} from "../services/cartApi";
import { setCartFromServer } from "../features/cart/cartSlice";
import { Link, useNavigate } from "react-router-dom";

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((state) => state.cart);
  const { user, token } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [error, setError] = useState(null);

  const fetchCart = async () => {
    if (!token) return; // guest – we can later support local cart if you want
    try {
      setLoading(true);
      setError(null);
      const data = await getMyCartApi();
      dispatch(setCartFromServer(data));
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load cart.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleQuantityChange = async (productId, newQty) => {
    if (newQty < 1) return;

    try {
      setUpdatingItemId(productId);
      const data = await updateCartItemApi({ productId, quantity: newQty });
      dispatch(setCartFromServer(data.cart));
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update cart item.";
      setError(msg);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      setUpdatingItemId(productId);
      const data = await removeCartItemApi(productId);
      dispatch(setCartFromServer(data.cart));
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to remove item from cart.";
      setError(msg);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const totals = useMemo(() => {
    let total = 0;
    items.forEach((item) => {
      const price = item.product?.price || 0;
      total += price * item.quantity;
    });
    return {
      itemsCount: items.reduce((acc, item) => acc + item.quantity, 0),
      totalPrice: total,
    };
  }, [items]);

  if (!user) {
    return (
      <div className="p-4">
        <p className="mb-2">You need to login to view your cart.</p>
        <Link
          to="/login"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="py-4">
      <h1 className="text-2xl font-semibold mb-4">Your Cart</h1>

      {loading && <p>Loading cart...</p>}
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      {items.length === 0 && !loading ? (
        <p className="text-gray-600">
          Your cart is empty.{" "}
          <Link to="/products" className="text-blue-600 underline">
            Browse products
          </Link>
        </p>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {/* Cart items */}
          <div className="md:col-span-2 space-y-3">
            {items.map((item) => {
              const product = item.product;
              const image =
                product?.images && product.images.length > 0
                  ? product.images[0].url
                  : "https://via.placeholder.com/80x80?text=No+Image";

              return (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow-sm p-3 flex gap-3"
                >
                  <img
                    src={image}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <Link
                      to={`/products/${product._id}`}
                      className="font-medium text-sm text-gray-800 hover:text-blue-600"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-gray-500">
                      ₹{product.price} x {item.quantity}
                    </p>
                    <p className="text-sm font-semibold text-blue-600 mt-1">
                      ₹{product.price * item.quantity}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            product._id,
                            Number(e.target.value) || item.quantity
                          )
                        }
                        className="w-16 border rounded-md px-2 py-1 text-xs"
                        disabled={updatingItemId === product._id}
                      />
                      <button
                        onClick={() => handleRemoveItem(product._id)}
                        disabled={updatingItemId === product._id}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-lg shadow-sm p-4 h-fit">
            <h2 className="text-lg font-semibold mb-2">Summary</h2>
            <p className="text-sm text-gray-600 mb-1">
              Items: {totals.itemsCount}
            </p>
            <p className="text-base font-semibold text-blue-600 mb-4">
              Total: ₹{totals.totalPrice}
            </p>

            <button
              onClick={() => navigate("/checkout")}
              disabled={items.length === 0}
              className="w-full px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium disabled:opacity-60"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
