import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
  pagination: {
    page: 1,
    pages: 1,
    total: 0,
    limit: 20,
  },
  currentOrder: null,
  loading: false,
  error: null,
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    fetchOrdersStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchOrdersSuccess: (state, action) => {
      state.loading = false;
      state.list = action.payload.orders;
      state.pagination = action.payload.pagination;
    },
    fetchOrdersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    updateOrderStatusLocally: (state, action) => {
      const { orderId, status } = action.payload;
      const order = state.list.find((o) => o._id === orderId);
      if (order) {
        order.orderStatus = status;
      }
      if (state.currentOrder && state.currentOrder._id === orderId) {
        state.currentOrder.orderStatus = status;
      }
    },
  },
});

export const {
  fetchOrdersStart,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  setCurrentOrder,
  updateOrderStatusLocally,
} = ordersSlice.actions;

export default ordersSlice.reducer;
