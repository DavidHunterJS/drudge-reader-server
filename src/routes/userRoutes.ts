// userRoutes.ts
import express, { Request, Response, NextFunction } from "express";
import User, { validateUser, hashPassword } from "../models/User";
import authMiddleware from "../middlewares/authMiddleware";
import adminMiddleware from "../middlewares/adminMiddleware";
import {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser
} from "../controllers/userController";

const router = express.Router();

// Extend the Request interface
interface AuthenticatedRequest extends Request {
  user?: any;
}

// API endpoint to fetch all users
router.get("/", getAllUsers);

// API endpoint to delete a user
router.delete("/:userId", deleteUser);

router.post("/register", async (req, res) => {
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
});

router.post("/login", async (req, res) => {
  try {
    // Extract login credentials from the request body
    const { username, password, role } = req.body;

    // Find the user in the database
    const user = await User.findOne({ username });

    // If no user is found, send an error response
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Compare the provided password with the hashed password
    user.comparePassword(password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ error: "Internal server error" });
      }

      // If the password comparison fails, send an error response
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Generate a JWT token
      const token = user.generateJWT();

      // Send a success response with the token and user data
      res.status(200).json({ token, user: user.toJSON() });
    });
  } catch (error) {
    console.error("Error during user login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/users/:id", async (req: Request, res: Response) => {
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
});

// protected routes
router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);

// protected admin route
router.get("/admin-dashboard", authMiddleware, adminMiddleware, (req, res) => {
  res.status(200).json({ message: "Welcome to the admin dashboard!" });
});

export default router;
