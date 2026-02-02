import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { mockScans, mockResults } from "../data/mockData.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

/**
 * POST /api/v1/analysis/analyze/:scanId
 * Trigger scan analysis (mocked)
 */
router.post("/analyze/:scanId", authenticateToken, requireRole("doctor", "radiologist", "admin"), async (req, res) => {
  try {
    const { scanId } = req.params;

    const scan = mockScans.find((s) => s.id === scanId);
    if (!scan) {
      return res.status(404).json({
        success: false,
        error: "Scan not found",
      });
    }

    // Update scan status
    scan.status = "analyzing";
    scan.analyzedAt = new Date().toISOString();

    // Simulate analysis delay (in production, this would trigger ML model)
    setTimeout(() => {
      // Generate mock result
      const isStroke = Math.random() > 0.7;
      const confidence = 85 + Math.random() * 12;

      const result = {
        id: `result_${uuidv4().split("-")[0]}`,
        scanId,
        prediction: isStroke ? "stroke" : "normal",
        confidence: parseFloat(confidence.toFixed(1)),
        // Model fields kept for doctor views; patients should ignore/never display them
        modelName: "CNN-GA-BiLSTM Hybrid Model",
        modelVersion: "2.1.0",
        processingTime: 2340 + Math.floor(Math.random() * 500),
        heatmapUrl: "/placeholder.svg",
        overlayUrl: "/placeholder.svg",
        analyzedAt: new Date().toISOString(),
      };

      mockResults.push(result);
      scan.status = "completed";
    }, 2000); // 2 second delay

    res.json({
      success: true,
      data: {
        message: "Analysis started",
        scanId,
        status: "analyzing",
      },
    });
  } catch (error) {
    console.error("Analyze scan error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * GET /api/v1/analysis/result/:scanId
 * Get analysis result
 */
router.get("/result/:scanId", authenticateToken, async (req, res) => {
  try {
    const { scanId } = req.params;

    const result = mockResults.find((r) => r.scanId === scanId);
    if (!result) {
      return res.status(404).json({
        success: false,
        error: "Analysis result not found",
      });
    }

    const scan = mockScans.find((s) => s.id === scanId);
    const resultWithScan = {
      ...result,
      scan,
    };

    res.json({
      success: true,
      data: resultWithScan,
    });
  } catch (error) {
    console.error("Get result error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

export default router;
