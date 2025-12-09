import React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductsStart,
  fetchProductsSuccess,
  fetchProductsFailure,
  setCurrentProduct,
} from "../features/products/productsSlice";
import {
  getProductsAdminApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
} from "../services/productApi";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "",
  brand: "",
  imageUrl: "",
  isFeatured: false,
};

const ProductsPage = () => {
  const dispatch = useDispatch();
  const { list, loading, error, currentProduct, pagination } = useSelector(
    (state) => state.products
  );

  const [form, setForm] = useState(emptyForm);
  const [formMode, setFormMode] = useState("create"); // or "edit"
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchProducts = async (page = 1) => {
    try {
      dispatch(fetchProductsStart());
      const data = await getProductsAdminApi({ page, limit: pagination.limit });
      dispatch(fetchProductsSuccess(data));
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load products.";
      dispatch(fetchProductsFailure(msg));
    }
  };

  useEffect(() => {
    fetchProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setFormMode("create");
    dispatch(setCurrentProduct(null));
    setFormError("");
  };

  const handleEditClick = (product) => {
    dispatch(setCurrentProduct(product));
    setFormMode("edit");
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      brand: product.brand || "",
      imageUrl: product.images?.[0]?.url || "",
      isFeatured: product.isFeatured || false,
    });
  };

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock),
      category: form.category,
      brand: form.brand,
      isFeatured: form.isFeatured,
      images: form.imageUrl ? [{ url: form.imageUrl }] : [],
    };

    try {
      if (formMode === "create") {
        await createProductApi(payload);
      } else if (currentProduct) {
        await updateProductApi(currentProduct._id, payload);
      }
      resetForm();
      fetchProducts(pagination.page);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save product.";
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProductApi(id);
      fetchProducts(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete product.");
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Products</h1>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-2">
          {formMode === "create" ? "Add New Product" : "Edit Product"}
        </h2>

        {formError && <p className="text-sm text-red-600 mb-2">{formError}</p>}

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1 font-medium text-gray-700">
              Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium text-gray-700">
              Category
            </label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium text-gray-700">
              Price
            </label>
            <input
              type="number"
              min="0"
              name="price"
              value={form.price}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium text-gray-700">
              Stock
            </label>
            <input
              type="number"
              min="0"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium text-gray-700">
              Brand
            </label>
            <input
              name="brand"
              value={form.brand}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium text-gray-700">
              Image URL
            </label>
            <input
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 mt-1">
            <input
              id="featured"
              type="checkbox"
              name="isFeatured"
              checked={form.isFeatured}
              onChange={handleChange}
            />
            <label
              htmlFor="featured"
              className="text-sm text-gray-700 select-none"
            >
              Featured
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-1 font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={formLoading}
              className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm disabled:opacity-60"
            >
              {formLoading
                ? "Saving..."
                : formMode === "create"
                ? "Create Product"
                : "Update Product"}
            </button>
            {formMode === "edit" && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-md border text-sm"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-2">All Products</h2>

        {loading && <p>Loading products...</p>}
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left py-2 px-2">Name</th>
                <th className="text-left py-2 px-2">Category</th>
                <th className="text-left py-2 px-2">Price</th>
                <th className="text-left py-2 px-2">Stock</th>
                <th className="text-left py-2 px-2">Featured</th>
                <th className="text-left py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p._id} className="border-b last:border-b-0">
                  <td className="py-2 px-2">{p.name}</td>
                  <td className="py-2 px-2">{p.category}</td>
                  <td className="py-2 px-2">₹{p.price}</td>
                  <td className="py-2 px-2">{p.stock}</td>
                  <td className="py-2 px-2">{p.isFeatured ? "Yes" : "No"}</td>
                  <td className="py-2 px-2 space-x-2">
                    <button
                      onClick={() => handleEditClick(p)}
                      className="text-xs px-2 py-1 bg-yellow-500 text-white rounded-md"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="text-xs px-2 py-1 bg-red-500 text-white rounded-md"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {list.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="py-3 text-center text-gray-500">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
