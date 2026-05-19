import { Navigate } from "react-router";
import { getUser } from "../api.js";

export default function ProtectedRoute({ children, roles = null }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  if (roles) {
    const user = getUser();
    if (!user || !roles.includes(user.role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
