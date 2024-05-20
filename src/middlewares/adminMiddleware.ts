// middlewares/adminMiddleware.ts
import { Request, Response, NextFunction } from "express";
import User from "../models/User";

// Extend the Request interface
interface AuthenticatedRequest extends Request {
  user?: any;
}

const adminMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the user ID from the authenticated request
    const userId = req.user?.id;

    // Find the user in the database
    const user = await User.findById(userId);

    // If no user is found or the user is not an admin, send an error response
    if (!user || user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "Access denied. Admin privileges required." });
    }

    // If the user is an admin, proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Error during admin authorization:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default adminMiddleware;
