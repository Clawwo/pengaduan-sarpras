import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import React from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import UserDashboard from "./pages/dashboard/UserDashboard";
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
          <Route path="/dashboard" element={<UserDashboard />}>
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
