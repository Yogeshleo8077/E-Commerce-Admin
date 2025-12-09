import api from "./apiClient";

export const getAllOrdersAdminApi = async (params = {}) => {
  const res = await api.get("/api/orders", { params });
  return res.data; // { orders, pagination }
};

export const getOrderByIdAdminApi = async (id) => {
  const res = await api.get(`/api/orders/${id}`);
  return res.data;
};

export const updateOrderStatusApi = async (id, status) => {
  const res = await api.put(`/api/orders/${id}/status`, { status });
  return res.data; // { message, order }
};
