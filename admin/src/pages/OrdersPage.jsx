import React from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrdersStart,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  updateOrderStatusLocally,
} from "../features/orders/ordersSlice";
import {
  getAllOrdersAdminApi,
  updateOrderStatusApi,
} from "../services/orderApi";

const statusOptions = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { list, loading, error, pagination } = useSelector(
    (state) => state.orders
  );

  const fetchOrders = async (page = 1) => {
    try {
      dispatch(fetchOrdersStart());
      const data = await getAllOrdersAdminApi({
        page,
        limit: pagination.limit,
      });
      dispatch(fetchOrdersSuccess(data));
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load orders.";
      dispatch(fetchOrdersFailure(msg));
    }
  };

  useEffect(() => {
    fetchOrders(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatusApi(orderId, newStatus);
      dispatch(updateOrderStatusLocally({ orderId, status: newStatus }));
      // This will also trigger Socket.IO events → user side will update in realtime
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Orders</h1>

      {loading && <p>Loading orders...</p>}
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="text-left py-2 px-2">Order ID</th>
              <th className="text-left py-2 px-2">User</th>
              <th className="text-left py-2 px-2">Total</th>
              <th className="text-left py-2 px-2">Payment</th>
              <th className="text-left py-2 px-2">Status</th>
              <th className="text-left py-2 px-2">Placed At</th>
            </tr>
          </thead>
          <tbody>
            {list.map((order) => (
              <tr key={order._id} className="border-b last:border-b-0">
                <td className="py-2 px-2">{order._id}</td>
                <td className="py-2 px-2">
                  {order.user?.name} <br />
                  <span className="text-xs text-gray-500">
                    {order.user?.email}
                  </span>
                </td>
                <td className="py-2 px-2">₹{order.totalPrice}</td>
                <td className="py-2 px-2">
                  {order.paymentMethod} <br />
                  <span className="text-xs text-gray-500">
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="py-2 px-2">
                  <select
                    value={order.orderStatus}
                    onChange={(e) =>
                      handleStatusChange(order._id, e.target.value)
                    }
                    className="border rounded-md px-2 py-1 text-xs"
                  >
                    {statusOptions.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-2 text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}

            {list.length === 0 && !loading && (
              <tr>
                <td colSpan="6" className="py-3 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersPage;
