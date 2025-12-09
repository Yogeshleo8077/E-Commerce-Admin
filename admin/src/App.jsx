import React from "react";
import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";

import AdminLayout from "./layouts/AdminLayout";
import ProtectedRouteAdmin from "./components/ProtectedRouteAdmin";

import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import LoginPage from "./pages/LoginPage";

function App() {
  const { user } = useSelector((state) => state.auth);

  // If not logged in or not admin, redirect to login for protected pages
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/*"
        element={
          <ProtectedRouteAdmin>
            <AdminLayout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/orders" element={<OrdersPage />} />
              </Routes>
            </AdminLayout>
          </ProtectedRouteAdmin>
        }
      />
    </Routes>
  );
}

export default App;
