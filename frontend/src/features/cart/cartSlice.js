import { createSlice } from "@reduxjs/toolkit";

const cartFromStorage = localStorage.getItem("cart")
  ? JSON.parse(localStorage.getItem("cart"))
  : { items: [] };

const initialState = {
  items: cartFromStorage.items,
  loading: false,
  error: null,
};

const saveCart = (state) => {
  localStorage.setItem("cart", JSON.stringify({ items: state.items }));
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartFromServer: (state, action) => {
      state.items = action.payload.items || [];
      saveCart(state);
    },
    addLocalItem: (state, action) => {
      const { product, quantity } = action.payload;
      const existing = state.items.find((i) => i.product._id === product._id);

      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({ product, quantity });
      }
      saveCart(state);
    },
    clearLocalCart: (state) => {
      state.items = [];
      saveCart(state);
    },
  },
});

export const { setCartFromServer, addLocalItem, clearLocalCart } =
  cartSlice.actions;
export default cartSlice.reducer;
