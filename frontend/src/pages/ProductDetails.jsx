// src/pages/ProductDetails.jsx
import React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { getProductByIdApi } from "../services/productApi";
import { addToCartApi } from "../services/cartApi";
import {
  getProductReviewsApi,
  addOrUpdateReviewApi,
} from "../services/reviewApi";

import { setCurrentProduct } from "../features/products/productsSlice";
import { setCartFromServer } from "../features/cart/cartSlice";

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentProduct } = useSelector((state) => state.products);
  const { user, token } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(!currentProduct);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Reviews state
  const [reviewsData, setReviewsData] = useState({
    reviews: [],
    rating: 0,
    numReviews: 0,
  });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });
  const [reviewMsg, setReviewMsg] = useState("");
  const [reviewError, setReviewError] = useState("");

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProductByIdApi(id);
      dispatch(setCurrentProduct(data));
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to load product details.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      setReviewError("");
      const data = await getProductReviewsApi(id);
      setReviewsData({
        reviews: data.reviews || [],
        rating: data.rating || 0,
        numReviews: data.numReviews || 0,
      });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load reviews.";
      setReviewError(msg);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddToCart = async () => {
    if (!token) {
      navigate("/login", { state: { from: `/products/${id}` } });
      return;
    }

    if (!currentProduct) return;

    try {
      setAdding(true);
      setSuccessMsg("");
      setError(null);

      const data = await addToCartApi({
        productId: currentProduct._id,
        quantity: quantity,
      });

      dispatch(setCartFromServer(data.cart));
      setSuccessMsg("Added to cart!");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add item to cart.";
      setError(msg);
    } finally {
      setAdding(false);
    }
  };

  const handleReviewChange = (e) => {
    setReviewForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate("/login", { state: { from: `/products/${id}` } });
      return;
    }

    try {
      setReviewSubmitting(true);
      setReviewMsg("");
      setReviewError("");

      const payload = {
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      };

      await addOrUpdateReviewApi(id, payload);
      setReviewMsg("Review submitted successfully.");
      setReviewForm((prev) => ({ ...prev, comment: "" }));

      // Reload reviews
      await fetchReviews();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to submit review.";
      setReviewError(msg);
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) return <p className="p-4">Loading product...</p>;

  if (error)
    return (
      <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded-md">
        {error}
      </div>
    );

  if (!currentProduct) return <p className="p-4">Product not found.</p>;

  const image =
    currentProduct.images && currentProduct.images.length > 0
      ? currentProduct.images[0].url
      : "https://via.placeholder.com/400x300?text=No+Image";

  return (
    <div className="py-4 space-y-6">
      {/* Main product section */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <img
            src={image}
            alt={currentProduct.name}
            className="w-full max-h-96 object-contain bg-white rounded-lg shadow-sm"
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <h1 className="text-2xl font-semibold mb-2">{currentProduct.name}</h1>
          <p className="text-sm text-gray-600 mb-2">
            Category: {currentProduct.category}
          </p>

          {reviewsData.rating > 0 && (
            <p className="text-sm text-yellow-500 mb-2">
              ⭐ {reviewsData.rating.toFixed(1)} ({reviewsData.numReviews}{" "}
              reviews)
            </p>
          )}

          <p className="text-2xl font-bold text-blue-600 mb-2">
            ₹{currentProduct.price}
          </p>

          <p className="text-sm text-gray-700 mb-4">
            {currentProduct.description}
          </p>

          <p className="text-sm mb-2">
            <span className="font-medium">Stock:</span>{" "}
            {currentProduct.stock > 0 ? (
              <span className="text-green-600">
                In stock ({currentProduct.stock})
              </span>
            ) : (
              <span className="text-red-600">Out of stock</span>
            )}
          </p>

          {currentProduct.stock > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm">Quantity:</label>
              <input
                type="number"
                min="1"
                max={currentProduct.stock}
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    Math.min(
                      currentProduct.stock,
                      Math.max(1, Number(e.target.value) || 1)
                    )
                  )
                }
                className="w-20 border rounded-md px-2 py-1 text-sm"
              />
            </div>
          )}

          {successMsg && (
            <p className="text-sm text-green-600 mb-2">{successMsg}</p>
          )}

          <button
            disabled={currentProduct.stock === 0 || adding}
            onClick={handleAddToCart}
            className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium disabled:opacity-60"
          >
            {currentProduct.stock === 0
              ? "Out of stock"
              : adding
              ? "Adding..."
              : "Add to Cart"}
          </button>

          {!user && (
            <p className="mt-2 text-xs text-gray-500">
              You need to login to add items to cart.
            </p>
          )}
        </div>
      </div>

      {/* Reviews section */}
      <div className="md:col-span-2">
        <h2 className="text-xl font-semibold mb-3">Customer Reviews</h2>

        {reviewsLoading && <p className="text-sm">Loading reviews...</p>}
        {reviewError && (
          <p className="text-sm text-red-600 mb-2">{reviewError}</p>
        )}

        {reviewsData.reviews.length === 0 && !reviewsLoading ? (
          <p className="text-sm text-gray-600 mb-3">
            No reviews yet. Be the first to review this product.
          </p>
        ) : (
          <div className="space-y-3 mb-4">
            {reviewsData.reviews.map((rev) => (
              <div
                key={rev._id}
                className="bg-white rounded-md shadow-sm p-3 border"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-800">
                    {rev.name}
                  </span>
                  <span className="text-xs text-yellow-500">
                    ⭐ {rev.rating}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{rev.comment}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(rev.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold mb-2">
            {user ? "Write a review" : "Login to write a review"}
          </h3>

          {reviewMsg && (
            <p className="text-sm text-green-600 mb-2">{reviewMsg}</p>
          )}

          {user ? (
            <form onSubmit={handleSubmitReview} className="space-y-3">
              <div>
                <label className="block text-sm mb-1 font-medium text-gray-700">
                  Rating
                </label>
                <select
                  name="rating"
                  value={reviewForm.rating}
                  onChange={handleReviewChange}
                  className="border rounded-md px-2 py-2 text-sm"
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Good</option>
                  <option value={3}>3 - Average</option>
                  <option value={2}>2 - Poor</option>
                  <option value={1}>1 - Terrible</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1 font-medium text-gray-700">
                  Comment
                </label>
                <textarea
                  name="comment"
                  rows="3"
                  value={reviewForm.comment}
                  onChange={handleReviewChange}
                  required
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Share your experience with this product..."
                />
              </div>

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium disabled:opacity-60"
              >
                {reviewSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          ) : (
            <p className="text-sm text-gray-600">
              Please{" "}
              <span
                className="text-blue-600 underline cursor-pointer"
                onClick={() =>
                  navigate("/login", { state: { from: `/products/${id}` } })
                }
              >
                login
              </span>{" "}
              to leave a review.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
