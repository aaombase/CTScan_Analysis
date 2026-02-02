import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { mockScans, mockResults, mockReports, mockPatients } from "../data/mockData.js";

const router = express.Router();

/**
 * GET /api/v1/dashboard/stats
 * Get dashboard statistics (role-based)
 */
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole === "patient") {
      // Patient dashboard stats
      // Find patient by patientId from token, or by user email
      const patient = req.user.patientId 
        ? mockPatients.find((p) => p.id === req.user.patientId)
        : mockPatients.find((p) => p.email === req.user.email);
      const patientReports = patient
        ? mockReports.filter((r) => r.patientId === patient.id)
        : [];

      const stats = {
        totalReports: patientReports.length,
        completedReports: patientReports.filter((r) => r.status === "finalized").length,
        pendingReports: patientReports.filter((r) => r.status === "draft").length,
        recentReports: patientReports
          .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
          .slice(0, 5)
          .map((report) => ({
            ...report,
            scan: mockScans.find((s) => s.id === report.scanId),
            result: mockResults.find((r) => r.id === report.resultId),
            patient: mockPatients.find((p) => p.id === report.patientId),
          })),
      };

      return res.json({
        success: true,
        data: stats,
      });
    }

    // Doctor dashboard stats
    const doctorScans = mockScans.filter((s) => s.uploadedBy === userId);
    const doctorScanIds = doctorScans.map((s) => s.id);
    const doctorResults = mockResults.filter((r) => doctorScanIds.includes(r.scanId));

    const stats = {
      totalScans: doctorScans.length,
      analyzedScans: doctorResults.length,
      positiveStrokeCases: doctorResults.filter((r) => r.prediction === "stroke").length,
      pendingScans: doctorScans.filter((s) => s.status === "pending" || s.status === "analyzing").length,
      todayScans: doctorScans.filter((s) => {
        const today = new Date().toISOString().split("T")[0];
        return s.uploadedAt.startsWith(today);
      }).length,
      weeklyTrend: [], // Simplified for mock
      recentScans: doctorScans
        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
        .slice(0, 5)
        .map((scan) => ({
          ...scan,
          patient: mockPatients.find((p) => p.id === scan.patientId),
        })),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

export default router;
