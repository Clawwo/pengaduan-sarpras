import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoute.js";
import userRoutes from "./routes/userRoute.js";
import lokasiRoutes from "./routes/lokasiRoute.js";

dotenv.config();
const app = express();

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/pengguna", userRoutes);
app.use("/api/lokasi", lokasiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
