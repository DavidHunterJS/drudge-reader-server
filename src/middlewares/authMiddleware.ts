import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Define a more specific type for the decoded token
interface DecodedToken {
  id: string;
  username: string;
  role: string;
  // Add any other properties that are included in your token
}

export interface AuthenticatedRequest extends Request {
  user?: DecodedToken;
}

const getSecretOrKey = (): string => {
  const secretOrKey =
    process.env.NODE_ENV === "production"
      ? process.env.JWT_SECRET_PROD
      : process.env.JWT_SECRET_DEV;

  if (!secretOrKey) {
    console.error(
      "WARNING: JWT secret is not defined in environment variables. Using a default secret."
    );
    return "default_secret_do_not_use_in_production";
  }

  return secretOrKey;
};

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, getSecretOrKey()) as DecodedToken;
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "Invalid token" });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "Token expired" });
    }
    // For any other errors
    console.error("Auth error:", error);
    return res.status(500).json({ error: "Authentication failed" });
  }
};
