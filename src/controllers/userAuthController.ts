// userAuthController.ts
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export const getUserInfo = (req: Request, res: Response) => {
  console.log("Received request to get user info");
  try {
    const token = req.cookies.token; // Access the token from the cookie

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const secretOrKey =
      process.env.NODE_ENV === "production"
        ? process.env.JWT_SECRET_PROD || "default_prod_secret"
        : process.env.JWT_SECRET_DEV || "default_dev_secret";

    const decoded = jwt.verify(token, secretOrKey) as {
      sub: string;
      exp: number;
    };

    console.log("Decoded token payload:", decoded);

    // Check if the token has expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      return res.status(401).json({ error: "Token has expired" });
    }

    // Extract the user ID from the 'sub' claim
    const userId = decoded.sub;

    // Return the user information
    res.json({
      id: userId
      // Include any other relevant user information from the token
    });
  } catch (error) {
    console.error("Error retrieving user information:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "Invalid token" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};
