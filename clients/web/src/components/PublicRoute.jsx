import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// Prevent authenticated users from accessing public routes (e.g., /, /register)
// Redirects them to their role-based home. Usage:
// <Route element={<PublicRoute />}> <Route path="/" .../> </Route>
const PublicRoute = () => {
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  let user = null;
  try {
    user = userRaw ? JSON.parse(userRaw) : null;
  } catch {
    user = null;
  }

  if (token && user?.role) {
    const role = user.role;
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "petugas") return <Navigate to="/petugas" replace />;
    // default pengguna
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
