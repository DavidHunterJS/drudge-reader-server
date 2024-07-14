import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
  user?: any;
}

const secretOrKey =
  process.env.NODE_ENV === "production"
    ? process.env.JWT_SECRET_PROD || "default_prod_secret"
    : process.env.JWT_SECRET_DEV || "default_dev_secret";

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token; // Get token from cookies instead of header

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, secretOrKey);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
