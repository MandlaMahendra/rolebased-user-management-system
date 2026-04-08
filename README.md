# Role-Based User Management System (RBMS)

A modern, full-stack User Management System with granular role-based access control (RBAC), featuring an Admin Dashboard for user management and a User Dashboard for profile management.

## 🚀 Live Demo
- **Backend API:** [Role-Based API on Render](https://rolebased-user-management-system.onrender.com/api/health)
- **Frontend :https://rolebased-user-management-system-h5.vercel.app

## ✨ Features
- **Authentication:** Secure login/signup with JWT and bcrypt password hashing.
- **Role-Based Access Control:** Secure routes for `Admin` and `User` roles.
- **Admin Dashboard:**
  - View project statistics (Total/Active/Admin users).
  - CRUD operations for users.
  - Granular permission management (Read, Write, Update, Delete).
  - Activity logs for tracking administrative actions.
  - Interactive JSON editor for user data.
- **User Dashboard:**
  - View personal profile and assigned permissions.
- **Modern UI:** Clean, responsive design using React + Tailwind (frontend-react) and Vanilla CSS (frontend).

## 🛠️ Tech Stack
- **Frontend:** React (Vite), Vanilla HTML/JS, CSS3
- **Backend:** Node.js, Express
- **Database:** MongoDB (Atlas)
- **Authentication:** JWT (JSON Web Tokens)

## 📦 Project Structure
```text
Role-Based User Management System/
├── backend/            # Express server, MongoDB models, & API routes
├── frontend-react/     # Modern React application (Vite)
├── frontend/           # Vanilla JS/HTML version of the app
└── .gitignore          # Root ignore file
```

## ⚙️ Local Setup

### 1. Prerequisites
- Node.js (v16+)
- MongoDB Atlas account or local MongoDB instance

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` folder:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```
Start the server:
```bash
npm run dev
```

### 3. Frontend (React) Setup
```bash
cd frontend-react
npm install
npm run dev
```

### 4. Frontend (Vanilla JS) Setup
Simply open `frontend/index.html` in your browser or use a Live Server.

## 🔒 Security
- Passwords are never stored in plain text (hashed with bcrypt).
- JWT tokens are required for all protected API calls.
- CORS policy restricts unauthorized cross-origin requests.

## 📄 License
MIT
