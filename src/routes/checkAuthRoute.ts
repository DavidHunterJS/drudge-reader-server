// checkAuthRoute.ts
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export const checkAuth = (req: Request, res: Response) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ isAuthenticated: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    res.status(200).json({ isAuthenticated: true, user: decoded });
  } catch (error) {
    res.clearCookie("token"); // Clear the invalid token
    res.status(401).json({ isAuthenticated: false });
  }
};
