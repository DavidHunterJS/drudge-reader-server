import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// Extend the Request interface
interface AuthenticatedRequest extends Request {
  user?: any;
}

const secretOrKey =
  process.env.NODE_ENV === "production"
    ? process.env.JWT_SECRET_PROD || "default_prod_secret"
    : process.env.JWT_SECRET_DEV || "default_dev_secret";

const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

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

export default authMiddleware;
