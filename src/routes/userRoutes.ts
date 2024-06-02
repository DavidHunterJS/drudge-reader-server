// userRoutes.ts
import express from "express";
import authMiddleware from "../middlewares/authMiddleware";
import adminMiddleware from "../middlewares/adminMiddleware";
import {
  passwordRequest,
  verifyResetToken,
  resetPassword
} from "../controllers/passwordResetController";
import {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser,
  registerUser,
  loginUser,
  updateUser
} from "../controllers/userController";
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/reset-password", resetPassword);
router.get("/verify-token", verifyResetToken);
router.post("/password-request", passwordRequest);
router.get("/users", getAllUsers);
router.delete("/:userId", authMiddleware, adminMiddleware, deleteUser);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/users/:id", updateUser);
// protected routes
router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);
// protected admin route
router.get("/admin-dashboard", authMiddleware, adminMiddleware);

export default router;
