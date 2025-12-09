import React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyOrdersStart,
  fetchMyOrdersSuccess,
  fetchMyOrdersFailure,
} from "../features/orders/ordersSlice";
import { getMyOrdersApi } from "../services/orderApi";
import { Link } from "react-router-dom";

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { myOrders, loading, error } = useSelector((state) => state.orders);

  const [firstLoaded, setFirstLoaded] = useState(false);

  const fetchOrders = async () => {
    try {
      dispatch(fetchMyOrdersStart());
      const data = await getMyOrdersApi();
      dispatch(fetchMyOrdersSuccess(data));
      setFirstLoaded(true);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load your orders.";
      dispatch(fetchMyOrdersFailure(msg));
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="py-4">
      <h1 className="text-2xl font-semibold mb-4">My Orders</h1>

      {loading && !firstLoaded && <p>Loading your orders...</p>}

      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      {myOrders.length === 0 && !loading ? (
        <p className="text-gray-600">
          You have no orders yet.{" "}
          <Link to="/products" className="text-blue-600 underline">
            Start shopping
          </Link>
        </p>
      ) : (
        <div className="space-y-3">
          {myOrders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="block bg-white rounded-lg shadow-sm p-4 border hover:border-blue-400 transition-colors"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-500">
                  Order ID: {order._id}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {order.orderStatus}
                </span>
              </div>
              <p className="text-sm text-gray-700">
                Total:{" "}
                <span className="font-semibold">₹{order.totalPrice}</span>
              </p>
              <p className="text-xs text-gray-500">
                Placed on: {new Date(order.createdAt).toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
