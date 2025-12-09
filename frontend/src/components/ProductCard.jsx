import React from "react";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  const image =
    product.images && product.images.length > 0
      ? product.images[0].url
      : "https://via.placeholder.com/300x200?text=No+Image";

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
      <img
        src={image}
        alt={product.name}
        className="h-40 w-full object-cover"
      />

      <div className="p-3 flex-1 flex flex-col">
        <h3 className="font-medium text-sm mb-1 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 mb-2">
          {product.category || "Category"}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <div>
            <p className="text-base font-semibold text-blue-600">
              ₹{product.price}
            </p>
            {product.rating > 0 && (
              <p className="text-xs text-yellow-500">
                ⭐ {product.rating.toFixed(1)} ({product.numReviews} reviews)
              </p>
            )}
          </div>

          <Link
            to={`/products/${product._id}`}
            className="text-xs px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
