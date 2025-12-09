import api from "./apiClient";

// COD order from cart
export const createOrderCODApi = async (shippingAddress) => {
  const res = await api.post("/api/orders", {
    shippingAddress,
    paymentMethod: "COD",
  });
  return res.data; // { message, order }
};

// My orders
export const getMyOrdersApi = async () => {
  const res = await api.get("/api/orders/my");
  return res.data; // [orders]
};

// Single order
export const getOrderByIdApi = async (id) => {
  const res = await api.get(`/api/orders/${id}`);
  return res.data; // order object
};
