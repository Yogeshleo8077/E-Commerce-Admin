import React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductsStart,
  fetchProductsSuccess,
  fetchProductsFailure,
  setFilters,
} from "../features/products/productsSlice";
import { getProductsApi } from "../services/productApi";
import ProductCard from "../components/ProductCard";

const ProductList = () => {
  const dispatch = useDispatch();
  const { list, loading, error, filters, pagination } = useSelector(
    (state) => state.products
  );

  const [localSearch, setLocalSearch] = useState(filters.keyword || "");

  const fetchProducts = async (page = 1) => {
    try {
      dispatch(fetchProductsStart());

      const params = {
        page,
        limit: pagination.limit,
        keyword: filters.keyword || undefined,
        category: filters.category || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };

      const data = await getProductsApi(params);
      dispatch(fetchProductsSuccess(data));
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load products.";
      dispatch(fetchProductsFailure(msg));
    }
  };

  useEffect(() => {
    fetchProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.keyword, filters.category, filters.sortBy, filters.sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(setFilters({ keyword: localSearch }));
  };

  const handlePageChange = (newPage) => {
    fetchProducts(newPage);
  };

  return (
    <div className="py-4">
      <h1 className="text-2xl font-semibold mb-4">All Products</h1>

      {/* Filters */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-col sm:flex-row gap-2 mb-4 items-center"
      >
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full sm:w-64 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={filters.sortBy}
          onChange={(e) => dispatch(setFilters({ sortBy: e.target.value }))}
          className="border rounded-md px-2 py-2 text-sm"
        >
          <option value="createdAt">Newest</option>
          <option value="price">Price</option>
          <option value="rating">Rating</option>
        </select>

        <select
          value={filters.sortOrder}
          onChange={(e) => dispatch(setFilters({ sortOrder: e.target.value }))}
          className="border rounded-md px-2 py-2 text-sm"
        >
          <option value="desc">High to low</option>
          <option value="asc">Low to high</option>
        </select>

        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm"
        >
          Apply
        </button>
      </form>

      {/* Products */}
      {loading && <p>Loading products...</p>}
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

      {!loading && list.length === 0 && (
        <p className="text-gray-600">No products found.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {list.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            disabled={pagination.page === 1}
            onClick={() => handlePageChange(pagination.page - 1)}
            className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            disabled={pagination.page === pagination.pages}
            onClick={() => handlePageChange(pagination.page + 1)}
            className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList;
