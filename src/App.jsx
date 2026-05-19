import { Routes, Route, Navigate } from "react-router";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Users from "./pages/Users.jsx";
import UserForm from "./pages/UserForm.jsx";
import Categories from "./pages/Categories.jsx";
import Books from "./pages/Books.jsx";
import BookForm from "./pages/BookForm.jsx";
import BookDetail from "./pages/BookDetail.jsx";
import Borrowings from "./pages/Borrowings.jsx";
import Reports from "./pages/Reports.jsx";
import Profile from "./pages/Profile.jsx";

const ADMIN = ["admin"];
const STAFF = ["admin", "petugas"];

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/users" element={<ProtectedRoute roles={ADMIN}><Users /></ProtectedRoute>} />
        <Route path="/users/create" element={<ProtectedRoute roles={ADMIN}><UserForm /></ProtectedRoute>} />
        <Route path="/users/:id/edit" element={<ProtectedRoute roles={ADMIN}><UserForm /></ProtectedRoute>} />

        <Route path="/categories" element={<Categories />} />

        <Route path="/books" element={<Books />} />
        <Route path="/books/create" element={<ProtectedRoute roles={ADMIN}><BookForm /></ProtectedRoute>} />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/books/:id/edit" element={<ProtectedRoute roles={ADMIN}><BookForm /></ProtectedRoute>} />

        <Route path="/borrowings" element={<Borrowings />} />
        <Route path="/reports" element={<ProtectedRoute roles={STAFF}><Reports /></ProtectedRoute>} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
