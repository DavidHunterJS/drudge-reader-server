import express, { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/express";

const router = express.Router();

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Clear the token cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/" // Make sure the path matches the one used when setting the cookie
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    next(error);
  }
};

// Remove authMiddleware from logout route
router.post("/logout", logout);

export default router;
