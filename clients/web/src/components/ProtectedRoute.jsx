import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// Guard children routes by role. Usage:
// <Route element={<ProtectedRoute roles={["pengguna"]} />}> ... </Route>
const ProtectedRoute = ({ roles = [] }) => {
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  let user = null;
  try {
    user = userRaw ? JSON.parse(userRaw) : null;
  } catch {
    user = null;
  }

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  if (roles.length && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
