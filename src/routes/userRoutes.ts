// userRoutes.ts
import express from "express";
import { authenticateJWT } from "../middlewares/authMiddleware";
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
import { getModifiedLinks } from "../controllers/modifiedLinksController";
import captureRoute from "../routes/captureRoute";
import { getUserInfo } from "../controllers/userAuthController";
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/reset-password", resetPassword);
router.get("/verify-token", verifyResetToken);
router.post("/password-request", passwordRequest);
router.get("/users", getAllUsers);

router.delete("/:userId", authenticateJWT, adminMiddleware, deleteUser);
router.post("/signup", registerUser);
router.post("/login", loginUser);
router.put("/users/:id", updateUser);
// protected routes
router.get("/profile", authenticateJWT, getUserProfile);
router.put("/profile", authenticateJWT, updateUserProfile);
// protected admin route
router.get("/admin-dashboard", authenticateJWT, adminMiddleware);
router.post("/modified-links", getModifiedLinks);
router.post("/capture", captureRoute);

router.get("/me", authenticateJWT, getUserInfo);

export default router;
