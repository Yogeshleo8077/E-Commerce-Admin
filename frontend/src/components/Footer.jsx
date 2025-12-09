import React from "react";
const Footer = () => {
  return (
    <footer className="mt-8 py-4 text-center text-sm text-gray-500 border-t">
      © {new Date().getFullYear()} MyShop. All rights reserved.
    </footer>
  );
};

export default Footer;
