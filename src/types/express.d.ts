// types/express.d.ts
import { Request } from "express";
import { User } from "../models/User"; // Adjust the import path as needed

export interface AuthenticatedRequest extends Request {
  user?: User;
}
