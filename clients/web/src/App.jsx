import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import React from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Home from "./pages/dashboard/Home";
import Riwayat from "./pages/dashboard/Riwayat";
import Tambah from "./pages/dashboard/Tambah";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* User Dashboard (pengguna) */}
        <Route element={<ProtectedRoute roles={["pengguna"]} />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Home />} />
            <Route path="riwayat" element={<Riwayat />} />
            <Route path="tambah" element={<Tambah />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
