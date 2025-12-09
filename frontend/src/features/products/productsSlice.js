import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
  pagination: {
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  },
  currentProduct: null,
  loading: false,
  error: null,
  filters: {
    keyword: "",
    category: "",
    minPrice: 0,
    maxPrice: 0,
    sortBy: "createdAt",
    sortOrder: "desc",
  },
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    fetchProductsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchProductsSuccess: (state, action) => {
      state.loading = false;
      state.list = action.payload.products;
      state.pagination = action.payload.pagination;
    },
    fetchProductsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentProduct: (state, action) => {
      state.currentProduct = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
});

export const {
  fetchProductsStart,
  fetchProductsSuccess,
  fetchProductsFailure,
  setCurrentProduct,
  setFilters,
} = productsSlice.actions;
export default productsSlice.reducer;
