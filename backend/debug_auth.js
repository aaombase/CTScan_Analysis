import { authenticateToken, requireRole } from "./middleware/auth.js";
console.log("authenticateToken:", typeof authenticateToken);
console.log("requireRole:", typeof requireRole);
