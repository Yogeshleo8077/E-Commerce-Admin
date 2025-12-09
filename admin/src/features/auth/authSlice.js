import { createSlice } from "@reduxjs/toolkit";

const adminFromStorage = localStorage.getItem("admin_user")
  ? JSON.parse(localStorage.getItem("admin_user"))
  : null;

const tokenFromStorage = localStorage.getItem("admin_token")
  ? localStorage.getItem("admin_token")
  : null;

const initialState = {
  user: adminFromStorage,
  token: tokenFromStorage,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;

      localStorage.setItem("admin_user", JSON.stringify(action.payload.user));
      localStorage.setItem("admin_token", action.payload.token);
    },
    authFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logoutAdmin: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("admin_user");
      localStorage.removeItem("admin_token");
    },
  },
});

export const { authStart, authSuccess, authFailure, logoutAdmin } =
  authSlice.actions;

export default authSlice.reducer;
