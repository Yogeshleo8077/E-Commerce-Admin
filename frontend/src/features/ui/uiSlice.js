import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isSidebarOpen: false,
  isCartDrawerOpen: false,
  globalLoading: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    toggleCartDrawer: (state) => {
      state.isCartDrawerOpen = !state.isCartDrawerOpen;
    },
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload;
    },
  },
});

export const { toggleSidebar, toggleCartDrawer, setGlobalLoading } =
  uiSlice.actions;
export default uiSlice.reducer;
