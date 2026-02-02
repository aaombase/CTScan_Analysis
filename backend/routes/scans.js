import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import { mockScans, mockPatients } from "../data/mockData.js";

const router = express.Router();

// Configure multer for file uploads (memory storage for mock)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

/**
 * GET /api/v1/scans
 * List scans (role-based filtering)
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { status, patientId, page = 1, pageSize = 10 } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    let filteredScans = [...mockScans];

    // Role-based filtering
    if (userRole === "patient") {
      // Patients see only their own scans
      const patient = req.user.patientId 
        ? mockPatients.find((p) => p.id === req.user.patientId)
        : mockPatients.find((p) => p.email === req.user.email);
      if (patient) {
        filteredScans = filteredScans.filter((s) => s.patientId === patient.id);
      } else {
        filteredScans = [];
      }
    } else {
      // Doctors see scans they uploaded
      filteredScans = filteredScans.filter((s) => s.uploadedBy === userId);
    }

    // Apply filters
    if (status) {
      filteredScans = filteredScans.filter((s) => s.status === status);
    }
    if (patientId) {
      filteredScans = filteredScans.filter((s) => s.patientId === patientId);
    }

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(pageSize);
    const endIndex = startIndex + parseInt(pageSize);
    const paginatedScans = filteredScans.slice(startIndex, endIndex);

    // Populate patient data
    const scansWithPatient = paginatedScans.map((scan) => ({
      ...scan,
      patient: mockPatients.find((p) => p.id === scan.patientId),
    }));

    res.json({
      success: true,
      data: {
        data: scansWithPatient,
        total: filteredScans.length,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(filteredScans.length / parseInt(pageSize)),
      },
    });
  } catch (error) {
    console.error("Get scans error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * GET /api/v1/scans/:id
 * Get scan by ID
 */
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const scan = mockScans.find((s) => s.id === id);

    if (!scan) {
      return res.status(404).json({
        success: false,
        error: "Scan not found",
      });
    }

    // Role-based access control
    if (userRole === "patient") {
      const patient = req.user.patientId 
        ? mockPatients.find((p) => p.id === req.user.patientId)
        : mockPatients.find((p) => p.email === req.user.email);
      if (scan.patientId !== patient?.id) {
        return res.status(403).json({
          success: false,
          error: "Access denied",
        });
      }
    } else {
      if (scan.uploadedBy !== userId) {
        return res.status(403).json({
          success: false,
          error: "Access denied",
        });
      }
    }

    const scanWithPatient = {
      ...scan,
      patient: mockPatients.find((p) => p.id === scan.patientId),
    };

    res.json({
      success: true,
      data: scanWithPatient,
    });
  } catch (error) {
    console.error("Get scan error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * POST /api/v1/scans/upload
 * Upload scan (doctor or patient)
 */
router.post(
  "/upload",
  authenticateToken,
  requireRole("doctor", "radiologist", "admin", "patient"),
  upload.array("files", 50),
  async (req, res) => {
    try {
      const { patientId: requestedPatientId } = req.body;
      const files = req.files || [];

      if (files.length === 0) {
        return res.status(400).json({
          success: false,
          error: "At least one file is required",
        });
      }

      // Determine patient for this upload
      // - patient role: must upload for self (ignore any provided patientId)
      // - doctor roles: must provide patientId explicitly
      let patientId = requestedPatientId;
      if (req.user.role === "patient") {
        const patient =
          req.user.patientId
            ? mockPatients.find((p) => p.id === req.user.patientId)
            : mockPatients.find((p) => p.email === req.user.email);
        if (!patient) {
          return res.status(400).json({
            success: false,
            error: "Patient profile not found for this account",
          });
        }
        patientId = patient.id;
      } else {
        if (!patientId) {
          return res.status(400).json({
            success: false,
            error: "Patient ID is required",
          });
        }
      }

      // Verify patient exists
      const patient = mockPatients.find((p) => p.id === patientId);
      if (!patient) {
        return res.status(404).json({
          success: false,
          error: "Patient not found",
        });
      }

      // Create scan record
      const newScan = {
        id: `scan_${uuidv4().split("-")[0]}`,
        patientId,
        uploadedBy: req.user.id,
        status: "pending",
        imageUrls: files.map(() => "/placeholder.svg"), // In production, upload to storage
        thumbnailUrl: "/placeholder.svg",
        sliceCount: files.length,
        fileSize: files.reduce((acc, f) => acc + f.size, 0),
        format: "DICOM",
        scanDate: new Date().toISOString(),
        uploadedAt: new Date().toISOString(),
        metadata: {
          modality: "CT",
          bodyPart: "HEAD",
          resolution: "512x512",
          sliceThickness: "5mm",
        },
      };

      // Add to mock data (in production, save to database)
      mockScans.push(newScan);

      const scanWithPatient = {
        ...newScan,
        patient,
      };

      res.status(201).json({
        success: true,
        data: scanWithPatient,
      });
    } catch (error) {
      console.error("Upload scan error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
);

export default router;
