# 🛍️ MERN E-Commerce Website + Admin Panel

A fully-featured E-commerce platform built with **MERN Stack**, including:

✔ User & Admin authentication  
✔ Product listing & management  
✔ Shopping cart & checkout (COD)  
✔ Order tracking with real-time status updates (Socket.IO)  
✔ Reviews & ratings for products  
✔ Admin panel for product & order management  
✔ Mobile-responsive UI using Tailwind CSS  
✔ Backend API with JWT auth + MongoDB

---

## 🚀 Tech Stack

### Frontend (User + Admin)

- React + Vite
- Redux Toolkit (global state management)
- React Router
- Tailwind CSS
- Axios

### Backend

- Node.js + Express.js
- MongoDB Atlas (Mongoose ODM)
- JWT Authentication
- Socket.IO (real-time)
- Nodemailer for emails

---

## 📌 Features

### User Side

- Register & Login
- Browse products with filters/search
- Product details with images & ratings
- Add to cart, update quantity, remove items
- Checkout (Cash on Delivery)
- Order history & real-time status updates
- Write and update product reviews

### Admin Side

- Secure admin login
- Create, Edit, Delete products
- View all orders
- Update order status → users see updates instantly!

---

## 🗂️ Project Structure

ecommerce-project/
│
├── backend/ → Node.js + Express API
├── frontend/ → Customer website
└── admin/ → Admin dashboard

yaml
Copy code

---

## 🔧 Environment Variables

Create `.env` files inside `backend/` and set:

PORT=
MONGODB_URI=
JWT_SECRET=
EMAIL_USER=
EMAIL_PASS=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
FRONTEND_URL=
ADMIN_URL=

go
Copy code

For `frontend/` & `admin/`:

VITE_API_BASE_URL=

yaml
Copy code

---

## 🏁 Run Locally

### Backend

```bash
cd backend
npm install
npm run dev
Frontend
bash
Copy code
cd frontend
npm install
npm run dev
Admin Panel
bash
Copy code
cd admin
npm install
npm run dev
📸 Screenshots (optional)
Add screenshots of products, cart, admin panel later

✨ Author
Yogesh Kushwah
📧 yogeshleo420@example.com
🔥 Passionate MERN Developer

If you like this project, ⭐ the repo!

yaml
Copy code

You can edit **name**, **email**, **screenshots** later.
```
