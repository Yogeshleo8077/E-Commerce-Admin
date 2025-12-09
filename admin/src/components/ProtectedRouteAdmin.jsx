import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRouteAdmin = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="text-red-600 font-medium">Access denied. Admin only.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRouteAdmin;
