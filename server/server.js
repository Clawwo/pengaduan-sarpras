import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoute.js";
import userRoutes from "./routes/userRoute.js";
import lokasiRoutes from "./routes/lokasiRoute.js";
import itemRoutes from "./routes/itemRoute.js";
import petugasRoutes from "./routes/petugasRoute.js";
import listLokasiRoutes from "./routes/listLokasiRoute.js";
import temporaryItemRoutes from "./routes/temporaryItemRoute.js";

dotenv.config();
const app = express();

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/petugas", petugasRoutes);
app.use("/api/lokasi", lokasiRoutes);
app.use("/api/list-lokasi", listLokasiRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/temporary-items", temporaryItemRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
