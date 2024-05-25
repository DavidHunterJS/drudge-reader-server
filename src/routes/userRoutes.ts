// userRoutes.ts
import express from "express";
import authMiddleware from "../middlewares/authMiddleware";
import adminMiddleware from "../middlewares/adminMiddleware";
import {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser,
  registerUser,
  loginUser,
  updateUser
} from "../controllers/userController";

const router = express.Router();

// API endpoint to fetch all users
router.get("/users", getAllUsers);

// API endpoint to delete a user
router.delete("/:userId", deleteUser);

router.post("/register", registerUser);

router.post("/login", loginUser);

router.put("/users/:id", updateUser);

// protected routes
router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);

// protected admin route
router.get("/admin-dashboard", authMiddleware, adminMiddleware, (req, res) => {
  res.status(200).json({ message: "Welcome to the admin dashboard!" });
});

export default router;
