import express from "express";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import { mockReports, mockScans, mockResults, mockPatients } from "../data/mockData.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

const diagnosisText = {
  normal: {
    finding: "AI-assisted CT analysis did not detect bleeding or ischemic changes in the submitted brain slice.",
    impression: "NORMAL CT BRAIN SLICE by AI analysis.",
    recommendations: "Clinical correlation recommended. Continue routine review as indicated.",
  },
  bleeding: {
    finding: "AI-assisted CT analysis detected findings consistent with intracranial bleeding in the submitted brain slice.",
    impression: "BLEEDING DETECTED with high AI confidence.",
    recommendations: "Urgent radiology and neurology review recommended. Correlate immediately with clinical status.",
  },
  ischemia: {
    finding: "AI-assisted CT analysis detected findings consistent with ischemic change in the submitted brain slice.",
    impression: "ISCHEMIA DETECTED with high AI confidence.",
    recommendations: "Urgent stroke-team evaluation recommended. Consider follow-up imaging and clinical correlation.",
  },
  stroke: {
    finding: "AI-assisted analysis detected abnormalities consistent with acute ischemic stroke.",
    impression: "ACUTE ISCHEMIC STROKE detected with high confidence.",
    recommendations: "Immediate neurology consultation recommended.",
  },
  other: {
    finding: "The uploaded image was not validated as a brain CT scan by the pre-inference image validator.",
    impression: "OTHER IMAGE TYPE. Brain CT diagnosis was not performed.",
    recommendations: "Upload a valid brain CT slice for analysis.",
  },
};

const getDiagnosisCopy = (prediction = "normal") =>
  diagnosisText[String(prediction).toLowerCase()] || diagnosisText.normal;

const escapePdfText = (value = "") =>
  String(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const createReportPdf = ({ report, scan, result, patient }) => {
  const confidence =
    result?.confidence <= 1
      ? `${(result.confidence * 100).toFixed(1)}%`
      : `${Number(result?.confidence || 0).toFixed(1)}%`;
  const lines = [
    "CT Scan Analysis Report",
    `Report Number: ${report.reportNumber}`,
    `Generated: ${new Date(report.generatedAt).toLocaleString()}`,
    "",
    `Patient: ${patient ? `${patient.firstName} ${patient.lastName}` : "N/A"}`,
    `Patient ID: ${patient?.patientId || report.patientId}`,
    `Scan ID: ${scan?.id || report.scanId}`,
    "",
    `AI Diagnosis: ${String(result?.prediction || "N/A").toUpperCase()}`,
    `Confidence: ${confidence}`,
    `Model: ${result?.modelName || "EfficientNet-B0 + BiLSTM"}`,
    "",
    `Findings: ${report.findings}`,
    `Impression: ${report.impression}`,
    `Recommendations: ${report.recommendations}`,
    "",
    "Medical Disclaimer: This AI-generated report supports clinical review and does not replace a qualified radiologist or physician.",
  ];

  const text = lines
    .map((line, index) => `BT /F1 11 Tf 50 ${760 - index * 22} Td (${escapePdfText(line)}) Tj ET`)
    .join("\n");
  const stream = Buffer.from(text, "utf-8");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj\n",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n",
    `5 0 obj << /Length ${stream.length} >> stream\n${text}\nendstream endobj\n`,
  ];

  let offset = "%PDF-1.4\n".length;
  const xref = ["0000000000 65535 f \n"];
  const body = objects
    .map((object) => {
      xref.push(`${String(offset).padStart(10, "0")} 00000 n \n`);
      offset += Buffer.byteLength(object);
      return object;
    })
    .join("");
  const xrefStart = offset;

  return Buffer.from(
    `%PDF-1.4\n${body}xref\n0 ${objects.length + 1}\n${xref.join("")}trailer << /Size ${
      objects.length + 1
    } /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`,
    "utf-8"
  );
};

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

    const scan = mockScans.find((s) => s.id === report.scanId);
    const result = mockResults.find((r) => r.id === report.resultId);
    const patient = mockPatients.find((p) => p.id === report.patientId);
    const pdf = createReportPdf({ report, scan, result, patient });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${report.reportNumber || "report"}-${report.id}.pdf"`
    );
    res.send(pdf);
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
router.post("/generate", authenticateToken, requireRole("doctor", "radiologist", "admin", "patient"), async (req, res) => {
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

    const copy = getDiagnosisCopy(result.prediction);
    const report = {
      id: `report_${uuidv4().split("-")[0]}`,
      scanId,
      resultId,
      patientId: scan.patientId,
      reportNumber: `RPT-${new Date().getFullYear()}-${String(mockReports.length + 1).padStart(4, "0")}`,
      generatedAt: new Date().toISOString(),
      generatedBy: req.user.id,
      findings: copy.finding,
      impression: copy.impression,
      recommendations: copy.recommendations,
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
