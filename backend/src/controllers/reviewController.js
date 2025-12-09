import Product from "../models/Product.js";

// helper: recalculate average rating & numReviews
const updateProductRating = async (productId) => {
  const product = await Product.findById(productId);

  if (!product) return null;

  if (product.reviews.length === 0) {
    product.rating = 0;
    product.numReviews = 0;
  } else {
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((sum, r) => sum + r.rating, 0) /
      product.reviews.length;
  }

  await product.save();
  return product;
};

// @desc    Add or update review for a product
// @route   POST /api/reviews/:productId
// @access  Private
export const addOrUpdateReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res
        .status(400)
        .json({ message: "Rating and comment are required" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // check if user already reviewed
    const existingReview = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      // update existing review
      existingReview.rating = rating;
      existingReview.comment = comment;
    } else {
      // add new review
      product.reviews.push({
        user: req.user._id,
        name: req.user.name,
        rating,
        comment,
      });
    }

    await product.save();
    const updatedProduct = await updateProductRating(productId);

    res.status(201).json({
      message: existingReview
        ? "Review updated successfully"
        : "Review added successfully",
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId).select(
      "reviews rating numReviews"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      reviews: product.reviews,
      rating: product.rating,
      numReviews: product.numReviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review (admin)
// @route   DELETE /api/reviews/:productId/:reviewId
// @access  Private/Admin
export const deleteReview = async (req, res, next) => {
  try {
    const { productId, reviewId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const initialLength = product.reviews.length;

    product.reviews = product.reviews.filter(
      (r) => r._id.toString() !== reviewId
    );

    if (product.reviews.length === initialLength) {
      return res.status(404).json({ message: "Review not found" });
    }

    await product.save();
    const updatedProduct = await updateProductRating(productId);

    res.json({
      message: "Review deleted successfully",
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};
