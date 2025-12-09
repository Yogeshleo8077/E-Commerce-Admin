import React from "react";
import AdminSidebar from "../components/AdminSidebar";

const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-slate-100">
      <AdminSidebar />
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
};

export default AdminLayout;
