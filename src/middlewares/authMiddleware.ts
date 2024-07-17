// authMiddleware.ts
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
  const secretOrKey = process.env.JWT_SECRET;
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
    console.log("No token provided in request");
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const secretKey = getSecretOrKey();
    console.log("Verifying token...");
    const decoded = jwt.verify(token, secretKey) as DecodedToken;
    console.log("Token verified successfully. Decoded payload:", decoded);

    // Ensure all required fields are present in the decoded token
    if (!decoded.id || !decoded.username || !decoded.role) {
      console.error("Decoded token is missing required fields");
      return res.status(401).json({ error: "Invalid token structure" });
    }

    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "Invalid token" });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "Token expired" });
    }
    // For any other errors
    return res.status(500).json({ error: "Authentication failed" });
  }
};

// Helper function to ensure request is authenticated
export const ensureAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!(req as AuthenticatedRequest).user) {
    return res.status(401).json({ error: "User not authenticated" });
  }
  next();
};
