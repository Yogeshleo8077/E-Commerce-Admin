import api from "./apiClient";

export const getProductsAdminApi = async (params = {}) => {
  const res = await api.get("/api/products", { params });
  return res.data;
};

export const createProductApi = async (payload) => {
  const res = await api.post("/api/products", payload);
  return res.data;
};

export const updateProductApi = async (id, payload) => {
  const res = await api.put(`/api/products/${id}`, payload);
  return res.data;
};

export const deleteProductApi = async (id) => {
  const res = await api.delete(`/api/products/${id}`);
  return res.data;
};
