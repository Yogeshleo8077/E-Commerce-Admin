import React from "react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getCurrentUserApi } from "../services/authApi";

const ProfilePage = () => {
  const { user: storedUser } = useSelector((state) => state.auth);
  const [user, setUser] = useState(storedUser);
  const [loading, setLoading] = useState(!storedUser);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        setLoading(true);
        const data = await getCurrentUserApi();
        setUser(data.user);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch user details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (!storedUser) {
      fetchMe();
    }
  }, [storedUser]);

  if (loading) {
    return <p className="p-4">Loading profile...</p>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded-md">
        {error}
      </div>
    );
  }

  if (!user) {
    return <p className="p-4">No user data found.</p>;
  }

  return (
    <div className="max-w-lg mx-auto bg-white shadow-md rounded-lg p-6 mt-4">
      <h2 className="text-2xl font-semibold mb-4">My Profile</h2>
      <div className="space-y-2 text-sm">
        <p>
          <span className="font-medium text-gray-700">Name:</span> {user.name}
        </p>
        <p>
          <span className="font-medium text-gray-700">Email:</span> {user.email}
        </p>
        <p>
          <span className="font-medium text-gray-700">Role:</span>{" "}
          <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
            {user.role}
          </span>
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;
