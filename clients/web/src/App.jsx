import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// Admin imports
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import React from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Home from "./pages/pengguna/Home";
import Riwayat from "./pages/pengguna/Riwayat";
import Tambah from "./pages/pengguna/Tambah";
import PetugasLayout from "./layouts/PetugasLayout";
import PetugasPengaduan from "./pages/petugas/Pengaduan";
import AdminPengaduan from "./pages/admin/Pengaduan";
import AdminPetugas from "./pages/admin/Petugas";
import AdminItems from "./pages/admin/Items";
import AdminLokasi from "./pages/admin/Lokasi";

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

        {/* Petugas Dashboard */}
        <Route element={<ProtectedRoute roles={["petugas"]} />}>
          <Route path="/petugas" element={<PetugasLayout />}>
            <Route index element={<PetugasPengaduan />} />
          </Route>
        </Route>

        {/* Admin Dashboard */}
        <Route element={<ProtectedRoute roles={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="pengaduan" element={<AdminPengaduan />} />
            <Route path="petugas" element={<AdminPetugas />} />
            <Route path="items" element={<AdminItems />} />
            <Route path="lokasi" element={<AdminLokasi />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
