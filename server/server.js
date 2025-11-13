import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoute.js";
import userRoutes from "./routes/userRoute.js";
import lokasiRoutes from "./routes/lokasiRoute.js";
import itemRoutes from "./routes/itemRoute.js";
import petugasRoutes from "./routes/petugasRoute.js";
import listLokasiRoutes from "./routes/listLokasiRoute.js";
import kategoriLokasiRoutes from "./routes/kategoriLokasiRoute.js";
import temporaryItemRoutes from "./routes/temporaryItemRoute.js";
import pengaduanRoutes from "./routes/pengaduanRoute.js";
import riwayatAksiRoutes from "./routes/riwayatAksiRoute.js";
import notificationRoutes from "./routes/notificationRoute.js";

dotenv.config();
const app = express();

// CORS configuration - allow mobile app access
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Web app
      "http://192.168.137.163:5000", // Mobile app (local IP)
      /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/, // Any local network IP
      /^http:\/\/localhost:\d+$/, // Any localhost port
      "exp://",
      "farelhry.my.id", 
      "ukk.farelhry.my.id",      
    ],
    credentials: true,
  })
);
app.use(express.json());

// Health check endpoint
app.get("/api", (req, res) => {
  res.json({
    status: "ok",
    message: "Sarpras API is running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/petugas", petugasRoutes);
app.use("/api/lokasi", lokasiRoutes);
app.use("/api/list-lokasi", listLokasiRoutes);
app.use("/api/kategori-lokasi", kategoriLokasiRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/temporary-item", temporaryItemRoutes);
app.use("/api/pengaduan", pengaduanRoutes);
app.use("/api/riwayat-aksi", riwayatAksiRoutes);
app.use("/api/notifications", notificationRoutes);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0"; // Bind to all interfaces for mobile access

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`Local access: http://localhost:${PORT}`);
  console.log(
    `Network access: http://192.168.137.163:${PORT} (use your actual IP)`
  );
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
