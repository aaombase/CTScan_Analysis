import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import scanRoutes from "./routes/scans.js";
import analysisRoutes from "./routes/analysis.js";
import reportRoutes from "./routes/reports.js";
import dashboardRoutes from "./routes/dashboard.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// Dev-friendly CORS:
// - allows localhost/127.0.0.1 on any port (Vite can change ports)
// - allows tools like Postman (no Origin header)
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed =
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:") ||
        origin === process.env.FRONTEND_URL;
      return callback(null, allowed);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "CT Scan API is running" });
});

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/scans", scanRoutes);
app.use("/api/v1/analysis", analysisRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api/v1`);
});

export default app;
