import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const itemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold text-blue-600">
        MyShop
      </Link>

      <div className="flex items-center gap-4 text-sm">
        <Link to="/products" className="text-gray-700 hover:text-blue-600">
          Products
        </Link>

        <Link to="/cart" className="relative text-gray-700 hover:text-blue-600">
          Cart
          {itemsCount > 0 && (
            <span className="absolute -top-2 -right-3 text-xs bg-red-500 text-white rounded-full px-1">
              {itemsCount}
            </span>
          )}
        </Link>

        {user ? (
          <>
            <span className="text-gray-600 hidden sm:inline">
              Hi, <span className="font-medium">{user.name}</span>
            </span>
            <Link to="/orders" className="text-gray-700 hover:text-blue-600">
              My Orders
            </Link>
            <Link to="/profile" className="text-gray-700 hover:text-blue-600">
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-1 rounded-md bg-red-500 text-white"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="px-3 py-1 rounded-md bg-blue-600 text-white"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
