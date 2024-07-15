import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User"; // Adjust the import path as needed

interface JwtPayload {
  userId: string;
}

export const checkAuth = async (req: Request, res: Response) => {
  console.log("Raw cookies:", req.headers.cookie);
  console.log("Parsed cookies:", req.cookies);
  console.log("Token from parsed cookies:", req.cookies.token);
  const token = req.cookies.token || req.headers.cookie?.split("token=")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    if (!decoded || typeof decoded !== "object" || !("userId" in decoded)) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Set headers to prevent caching
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    res.status(200).json({
      id: user._id,
      username: user.username
      // Add other non-sensitive fields as needed
    });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
