import express from "express";
import multer from "multer";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { mockPatients, mockResults, mockScans } from "../data/mockData.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      return callback(new Error("Only image uploads are supported"));
    }
    callback(null, true);
  },
});

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

const getUserFromRequest = (req) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Image file is required",
      });
    }

    const user = getUserFromRequest(req);
    const patient =
      mockPatients.find((p) => p.id === req.body.patientId) ||
      mockPatients.find((p) => p.email === user?.email) ||
      mockPatients[0];

    const formData = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    formData.append("image", blob, req.file.originalname);

    const response = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: data?.detail || data?.error || "Prediction service failed",
      });
    }

    const scanId = `scan_${uuidv4().split("-")[0]}`;
    const resultId = `result_${uuidv4().split("-")[0]}`;
    const now = new Date().toISOString();

    const scan = {
      id: scanId,
      patientId: patient.id,
      uploadedBy: user?.id || "usr_002",
      status: "completed",
      imageUrls: ["/placeholder.svg"],
      thumbnailUrl: "/placeholder.svg",
      sliceCount: 1,
      fileSize: req.file.size,
      format: req.file.mimetype.includes("png") ? "PNG" : "JPG",
      scanDate: now,
      uploadedAt: now,
      analyzedAt: now,
      metadata: {
        modality: "CT",
        bodyPart: "HEAD",
        resolution: "224x224",
        originalFileName: req.file.originalname,
      },
    };

    const result = {
      id: resultId,
      scanId,
      prediction: data.predicted_class.toLowerCase(),
      confidence: data.confidence,
      probabilities: data.probabilities,
      modelName: "EfficientNet-B0 + BiLSTM",
      modelVersion: "best_model.pth",
      processingTime: data.processing_time_ms,
      heatmapUrl: "/placeholder.svg",
      overlayUrl: "/placeholder.svg",
      analyzedAt: now,
    };

    mockScans.push(scan);
    mockResults.push(result);

    res.json({
      success: true,
      data: {
        ...data,
        scan,
        result,
      },
    });
  } catch (error) {
    console.error("Prediction error:", error);
    res.status(503).json({
      success: false,
      error:
        "Prediction service is unavailable. Start the FastAPI service on port 8000 and try again.",
    });
  }
});

export default router;
