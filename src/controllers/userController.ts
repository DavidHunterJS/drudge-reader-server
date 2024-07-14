// userController.ts
import passport from "passport";
import { Request, Response, NextFunction } from "express";
import User, { validateUser, hashPassword } from "../models/User";
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

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
    const { name, email, role } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, role },
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

export const registerUser = async (req: Request, res: Response) => {
  console.log("Registration route called");
  try {
    // Extract user registration data from the request body
    const { username, email, password, firstname, lastname, role } = req.body;

    // Validate the registration data
    const validationError = await validateUser(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError.error });
    }

    // Check if a user with the same username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Username or email already exists" });
    }

    // Create a new user instance
    const newUser = new User({
      provider: "local",
      firstname,
      lastname,
      username,
      email,
      password,
      role
    });

    // Hash the password
    newUser.password = await hashPassword(password);

    // Save the new user to the database
    await newUser.save();

    // Generate a JWT token
    const token = newUser.generateJWT();

    // Send a success response with the token and user data
    res.status(201).json({ token, user: newUser.toJSON() });
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const loginUser = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    "local",
    { session: false },
    (err: any, user: any, info: any) => {
      if (err) {
        return next(err); // Pass errors to Express error handler
      }

      if (!user) {
        return res
          .status(401)
          .json({ error: info.message || "Authentication failed" });
      }

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h" // Token expiration time
      });

      // Set the token as an HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        sameSite: "lax", // Use 'strict' in production if possible
        maxAge: 3600000 // 1 hour
      });

      // Send user info without sensitive data
      const safeUser = {
        id: user._id,
        username: user.username
        // Add other non-sensitive fields as needed
      };

      res.status(200).json({ user: safeUser });
    }
  )(req, res, next);
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const updatedUser = req.body;

    // Find the user by ID and update it
    const user = await User.findByIdAndUpdate(userId, updatedUser, {
      new: true
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
