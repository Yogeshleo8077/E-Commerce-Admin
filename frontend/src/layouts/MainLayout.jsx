import React from "react";

import Footer from "../components/Footer";
import Navbar from "../components/NavBar";

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-4">{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
