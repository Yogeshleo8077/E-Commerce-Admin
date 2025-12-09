import React from "react";
import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import ProductDetails from "./pages/ProductDetails";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/ProtectedRoute";

import socket from "./services/socket";
import { updateOrderStatusRealtime } from "./features/orders/ordersSlice";

function App() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Join user room & listen for order updates
  useEffect(() => {
    if (user?._id) {
      socket.emit("joinUserRoom", user._id);

      // When an order is created (ONLINE or COD)
      socket.on("orderCreated", (data) => {
        console.log("Order created (realtime):", data);
        // You could optionally fetch orders again or show toast
      });

      // When an order status is updated by admin
      socket.on("orderStatusUpdated", (data) => {
        console.log("Order status updated:", data);
        dispatch(updateOrderStatusRealtime(data)); // { orderId, status }
      });
    }

    return () => {
      socket.off("orderCreated");
      socket.off("orderStatusUpdated");
    };
  }, [user, dispatch]);

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetails />} />

        <Route path="/cart" element={<CartPage />} />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
