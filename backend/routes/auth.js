import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { mockUsers, mockPatients } from "../data/mockData.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

/**
 * POST /api/v1/auth/login
 * Login user
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    // Find user (in production, query database)
    const user = mockUsers.find((u) => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Verify password (in production, use bcrypt.compare)
    // For mock: accept any password
    if (password !== "password123" && !password.startsWith("$2a$")) {
      // Simple mock check - in production, use bcrypt.compare(user.password, password)
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        accessToken: token,
        refreshToken: `refresh_${token}`, // In production, generate proper refresh token
        expiresIn: 24 * 60 * 60, // 24 hours in seconds
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * POST /api/v1/auth/register
 * Register new user
 */
router.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, department, specialization, dateOfBirth, gender } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({
        success: false,
        error: "Required fields: email, password, firstName, lastName, role",
      });
    }

    // Validate role
    const validRoles = ["doctor", "radiologist", "patient"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: `Role must be one of: ${validRoles.join(", ")}`,
      });
    }

    // Check if email exists
    if (mockUsers.some((u) => u.email === email)) {
      return res.status(409).json({
        success: false,
        error: "Email already registered",
      });
    }

    // Hash password (in production)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      id: `usr_${uuidv4().split("-")[0]}`,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      department: role !== "patient" ? department : undefined,
      specialization: role !== "patient" ? specialization : undefined,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    // If patient, create patient record
    let patientId = null;
    if (role === "patient") {
      const newPatient = {
        id: `pat_${uuidv4().split("-")[0]}`,
        patientId: `P-2025-${String(mockPatients.length + 1).padStart(4, "0")}`,
        firstName,
        lastName,
        dateOfBirth: dateOfBirth || new Date().toISOString().split("T")[0],
        gender: gender || "other",
        email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockPatients.push(newPatient);
      patientId = newPatient.id;
      newUser.patientId = patientId;
    }

    // Add to mock users (in production, save to database)
    mockUsers.push(newUser);

    // Generate JWT token
    const tokenPayload = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    };
    
    // Include patientId in token if user is a patient
    if (newUser.patientId) {
      tokenPayload.patientId = newUser.patientId;
    }
    
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      data: {
        user: userWithoutPassword,
        accessToken: token,
        refreshToken: `refresh_${token}`,
        expiresIn: 24 * 60 * 60,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

/**
 * POST /api/v1/auth/logout
 * Logout user (client-side token removal)
 */
router.post("/logout", (req, res) => {
  // In production, invalidate refresh token
  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

/**
 * GET /api/v1/auth/me
 * Get current user
 */
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = mockUsers.find((u) => u.id === decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }
});

export default router;
