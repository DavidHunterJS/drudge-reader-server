// userController.ts
import { Request, Response } from "express";
import User from "../models/User";

// Extend the Request interface
interface AuthenticatedRequest extends Request {
  user?: any;
}

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete a user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get user profile
export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user.id; // Assuming the user ID is stored in req.user after authentication
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update user profile
export const updateUserProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
