import React from "react";
import { NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutAdmin } from "../features/auth/authSlice";

const AdminSidebar = () => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutAdmin());
    window.location.href = "/login";
  };

  const linkClass =
    "block px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-100";

  return (
    <aside className="w-56 bg-white border-r h-screen sticky top-0 p-4 flex flex-col">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-blue-600">MyShop Admin</h1>
      </div>

      <nav className="flex-1 space-y-1">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `${linkClass} ${
              isActive ? "bg-blue-50 text-blue-700" : "text-gray-700"
            }`
          }
          end
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/products"
          className={({ isActive }) =>
            `${linkClass} ${
              isActive ? "bg-blue-50 text-blue-700" : "text-gray-700"
            }`
          }
        >
          Products
        </NavLink>
        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `${linkClass} ${
              isActive ? "bg-blue-50 text-blue-700" : "text-gray-700"
            }`
          }
        >
          Orders
        </NavLink>
      </nav>

      <button
        onClick={handleLogout}
        className="mt-4 w-full text-sm px-3 py-2 rounded-md bg-red-500 text-white"
      >
        Logout
      </button>
    </aside>
  );
};

export default AdminSidebar;
