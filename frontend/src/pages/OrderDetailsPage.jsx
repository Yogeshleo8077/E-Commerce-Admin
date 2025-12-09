import React from "react";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getOrderByIdApi } from "../services/orderApi";
import { setCurrentOrder } from "../features/orders/ordersSlice";
import socket from "../services/socket";

const OrderDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentOrder } = useSelector((state) => state.orders);

  const [loading, setLoading] = useState(
    !currentOrder || currentOrder._id !== id
  );
  const [error, setError] = useState(null);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const order = await getOrderByIdApi(id);
      dispatch(setCurrentOrder(order));
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to load order details.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Join order room for realtime updates
  useEffect(() => {
    if (!id) return;

    socket.emit("joinOrderRoom", id);

    const handleStatusUpdate = (data) => {
      // data: { orderId, status }
      if (data.orderId === id) {
        dispatch(updateOrderStatusRealtime(data));
      }
    };

    socket.on("orderStatusUpdated", handleStatusUpdate);

    return () => {
      socket.off("orderStatusUpdated", handleStatusUpdate);
    };
  }, [id, dispatch]);

  if (loading) return <p className="p-4">Loading order...</p>;

  if (error)
    return (
      <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded-md">
        {error}
      </div>
    );

  if (!currentOrder) return <p className="p-4">Order not found.</p>;

  const { shippingAddress, orderItems } = currentOrder;

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Order Details</h1>
        <Link to="/orders" className="text-sm text-blue-600 hover:underline">
          Back to My Orders
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Order info */}
        <div className="md:col-span-2 space-y-3">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-2">Order Info</h2>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Order ID:</span> {currentOrder._id}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Status:</span>{" "}
              <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                {currentOrder.orderStatus}
              </span>
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Payment Method:</span>{" "}
              {currentOrder.paymentMethod}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Payment Status:</span>{" "}
              {currentOrder.paymentStatus}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Placed on: {new Date(currentOrder.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Shipping */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-2">Shipping Address</h2>
            {shippingAddress ? (
              <div className="text-sm text-gray-700 space-y-1">
                <p>{shippingAddress.fullName}</p>
                <p>Phone: {shippingAddress.phone}</p>
                <p>
                  {shippingAddress.addressLine1}
                  {shippingAddress.addressLine2 && (
                    <> , {shippingAddress.addressLine2}</>
                  )}
                </p>
                <p>
                  {shippingAddress.city}, {shippingAddress.state} -{" "}
                  {shippingAddress.pincode}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No address info.</p>
            )}
          </div>

          {/* Items */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-2">Items</h2>
            <div className="space-y-3">
              {orderItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 border-b pb-2 last:border-b-0 last:pb-0"
                >
                  <img
                    src={
                      item.image ||
                      "https://via.placeholder.com/80x80?text=No+Image"
                    }
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity} × ₹{item.price}
                    </p>
                    <p className="text-sm font-semibold text-blue-600 mt-1">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow-sm p-4 h-fit">
          <h2 className="text-lg font-semibold mb-2">Price Summary</h2>
          <p className="text-sm text-gray-700">
            Items total: ₹{currentOrder.itemsPrice}
          </p>
          <p className="text-sm text-gray-700">
            Shipping: ₹{currentOrder.shippingPrice}
          </p>
          <p className="text-sm text-gray-700">Tax: ₹{currentOrder.taxPrice}</p>
          <p className="text-base font-semibold text-blue-600 mt-2">
            Total: ₹{currentOrder.totalPrice}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
