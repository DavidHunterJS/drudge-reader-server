import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import jwt from "jsonwebtoken";
import passport from "passport";

// Extend the Request interface
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

// Extend the Request interface to include the 'user' property
interface AuthenticatedRequest extends Request {
  User?: typeof User;
}
export const authenticateJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    "jwt",
    { session: false },
    (err: any, user?: any, info?: any) => {
      if (err) {
        return res.status(500).json({ error: "Internal server error" });
      }

      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      req.user = user;
      next();
    }
  )(req, res, next);
};
