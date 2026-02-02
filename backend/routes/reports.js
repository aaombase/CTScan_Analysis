import express from "express";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import { mockReports, mockScans, mockResults, mockPatients } from "../data/mockData.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

/**
 * GET /api/v1/reports
 * List reports (role-based filtering)
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let filteredReports = [...mockReports];

    // Role-based filtering
    if (userRole === "patient") {
      // Patients see only their own reports
      const patient = req.user.patientId 
        ? mockPatients.find((p) => p.id === req.user.patientId)
        : mockPatients.find((p) => p.email === req.user.email);
      if (patient) {
        filteredReports = filteredReports.filter((r) => r.patientId === patient.id);
      } else {
        filteredReports = [];
      }
    } else {
      // Doctors see reports for scans they uploaded
      const doctorScans = mockScans.filter((s) => s.uploadedBy === userId);
      const doctorScanIds = doctorScans.map((s) => s.id);
      filteredReports = filteredReports.filter((r) => doctorScanIds.includes(r.scanId));
    }

    // Populate related data
    const reportsWithData = filteredReports.map((report) => ({
      ...report,
      scan: mockScans.find((s) => s.id === report.scanId),
      result: mockResults.find((r) => r.id === report.resultId),
      patient: mockPatients.find((p) => p.id === report.patientId),
    }));

    res.json({
      success: true,
      data: reportsWithData,
    });
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * GET /api/v1/reports/scan/:scanId
 * Get report by scan ID
 */
router.get("/scan/:scanId", authenticateToken, async (req, res) => {
  try {
    const { scanId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const report = mockReports.find((r) => r.scanId === scanId);

    if (!report) {
      return res.status(404).json({
        success: false,
        error: "Report not found",
      });
    }

    // Role-based access control
    if (userRole === "patient") {
      const patient = req.user.patientId
        ? mockPatients.find((p) => p.id === req.user.patientId)
        : mockPatients.find((p) => p.email === req.user.email);
      if (report.patientId !== patient?.id) {
        return res.status(403).json({
          success: false,
          error: "Access denied",
        });
      }
    } else {
      const scan = mockScans.find((s) => s.id === scanId);
      if (scan?.uploadedBy !== userId) {
        return res.status(403).json({
          success: false,
          error: "Access denied",
        });
      }
    }

    const reportWithData = {
      ...report,
      scan: mockScans.find((s) => s.id === report.scanId),
      result: mockResults.find((r) => r.id === report.resultId),
      patient: mockPatients.find((p) => p.id === report.patientId),
    };

    res.json({
      success: true,
      data: reportWithData,
    });
  } catch (error) {
    console.error("Get report by scan error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * GET /api/v1/reports/:id/pdf
 * Download report PDF (mock)
 */
router.get("/:id/pdf", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const report = mockReports.find((r) => r.id === id);

    if (!report) {
      return res.status(404).json({
        success: false,
        error: "Report not found",
      });
    }

    // Role-based access control
    if (userRole === "patient") {
      const patient = req.user.patientId
        ? mockPatients.find((p) => p.id === req.user.patientId)
        : mockPatients.find((p) => p.email === req.user.email);
      if (report.patientId !== patient?.id) {
        return res.status(403).json({
          success: false,
          error: "Access denied",
        });
      }
    } else {
      const scan = mockScans.find((s) => s.id === report.scanId);
      if (scan?.uploadedBy !== userId) {
        return res.status(403).json({
          success: false,
          error: "Access denied",
        });
      }
    }

    // Mock PDF payload (no real PDF generation yet)
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${report.reportNumber || "report"}-${report.id}.pdf"`
    );
    res.send(Buffer.from(`Mock PDF for ${report.reportNumber} (${report.id})`, "utf-8"));
  } catch (error) {
    console.error("Download report PDF error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * GET /api/v1/reports/:id
 * Get report by ID
 */
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const report = mockReports.find((r) => r.id === id);

    if (!report) {
      return res.status(404).json({
        success: false,
        error: "Report not found",
      });
    }

    // Role-based access control
    if (userRole === "patient") {
      const patient = req.user.patientId
        ? mockPatients.find((p) => p.id === req.user.patientId)
        : mockPatients.find((p) => p.email === req.user.email);
      if (report.patientId !== patient?.id) {
        return res.status(403).json({
          success: false,
          error: "Access denied",
        });
      }
    } else {
      const scan = mockScans.find((s) => s.id === report.scanId);
      if (scan?.uploadedBy !== userId) {
        return res.status(403).json({
          success: false,
          error: "Access denied",
        });
      }
    }

    const reportWithData = {
      ...report,
      scan: mockScans.find((s) => s.id === report.scanId),
      result: mockResults.find((r) => r.id === report.resultId),
      patient: mockPatients.find((p) => p.id === report.patientId),
    };

    res.json({
      success: true,
      data: reportWithData,
    });
  } catch (error) {
    console.error("Get report error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * POST /api/v1/reports/generate
 * Generate report (doctor only)
 */
router.post("/generate", authenticateToken, requireRole("doctor", "radiologist", "admin"), async (req, res) => {
  try {
    const { scanId, resultId } = req.body;

    if (!scanId || !resultId) {
      return res.status(400).json({
        success: false,
        error: "Scan ID and result ID are required",
      });
    }

    const scan = mockScans.find((s) => s.id === scanId);
    const result = mockResults.find((r) => r.id === resultId);

    if (!scan || !result) {
      return res.status(404).json({
        success: false,
        error: "Scan or result not found",
      });
    }

    // Check if report already exists
    const existingReport = mockReports.find((r) => r.scanId === scanId);
    if (existingReport) {
      return res.status(409).json({
        success: false,
        error: "Report already exists for this scan",
      });
    }

    // Generate report
    const report = {
      id: `report_${uuidv4().split("-")[0]}`,
      scanId,
      resultId,
      patientId: scan.patientId,
      reportNumber: `RPT-2025-${String(mockReports.length + 1).padStart(4, "0")}`,
      generatedAt: new Date().toISOString(),
      generatedBy: req.user.id,
      findings: result.prediction === "stroke"
        ? "AI-assisted analysis detected abnormalities consistent with acute ischemic stroke."
        : "AI-assisted analysis shows no evidence of acute intracranial pathology.",
      impression: result.prediction === "stroke"
        ? "ACUTE ISCHEMIC STROKE detected with high confidence."
        : "NORMAL CT HEAD. No evidence of stroke.",
      recommendations: result.prediction === "stroke"
        ? "Immediate neurology consultation recommended."
        : "Clinical correlation recommended.",
      status: "draft",
      pdfUrl: `/reports/report_${uuidv4().split("-")[0]}.pdf`,
    };

    mockReports.push(report);

    const reportWithData = {
      ...report,
      scan,
      result,
      patient: mockPatients.find((p) => p.id === scan.patientId),
    };

    res.status(201).json({
      success: true,
      data: reportWithData,
    });
  } catch (error) {
    console.error("Generate report error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

export default router;
