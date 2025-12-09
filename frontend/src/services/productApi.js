import api from "./apiClient";

// Get products list with optional query params
export const getProductsApi = async (params = {}) => {
  const res = await api.get("/api/products", { params });
  return res.data; // { products, pagination }
};

// Get single product by id
export const getProductByIdApi = async (id) => {
  const res = await api.get(`/api/products/${id}`);
  return res.data; // product object
};
