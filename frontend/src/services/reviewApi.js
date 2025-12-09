import api from "./apiClient";

export const getProductReviewsApi = async (productId) => {
  const res = await api.get(`/api/reviews/${productId}`);
  return res.data; // { reviews, rating, numReviews }
};

export const addOrUpdateReviewApi = async (productId, { rating, comment }) => {
  const res = await api.post(`/api/reviews/${productId}`, { rating, comment });
  return res.data; // { message, product }
};
