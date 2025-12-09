import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  myOrders: [],
  currentOrder: null,
  loading: false,
  error: null,
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    fetchMyOrdersStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchMyOrdersSuccess: (state, action) => {
      state.loading = false;
      state.myOrders = action.payload;
    },
    fetchMyOrdersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    updateOrderStatusRealtime: (state, action) => {
      const { orderId, status } = action.payload;

      if (state.currentOrder && state.currentOrder._id === orderId) {
        state.currentOrder.orderStatus = status;
      }

      const order = state.myOrders.find((o) => o._id === orderId);
      if (order) {
        order.orderStatus = status;
      }
    },
  },
});

export const {
  fetchMyOrdersStart,
  fetchMyOrdersSuccess,
  fetchMyOrdersFailure,
  setCurrentOrder,
  updateOrderStatusRealtime,
} = ordersSlice.actions;
export default ordersSlice.reducer;
