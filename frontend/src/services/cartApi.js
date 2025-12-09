import api from "./apiClient";

// Get current user's cart
export const getMyCartApi = async () => {
  const res = await api.get("/api/cart");
  return res.data; // cart object
};

// Add to cart
export const addToCartApi = async ({ productId, quantity = 1 }) => {
  const res = await api.post("/api/cart", { productId, quantity });
  return res.data; // { message, cart }
};

// Update quantity
export const updateCartItemApi = async ({ productId, quantity }) => {
  const res = await api.put("/api/cart", { productId, quantity });
  return res.data;
};

// Remove item
export const removeCartItemApi = async (productId) => {
  const res = await api.delete(`/api/cart/item/${productId}`);
  return res.data;
};

// Clear cart
export const clearCartApi = async () => {
  const res = await api.delete("/api/cart");
  return res.data;
};
