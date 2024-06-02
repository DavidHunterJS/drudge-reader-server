// userController.ts
import { Request, Response } from "express";
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

export const loginUser = async (req: Request, res: Response) => {
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

// DEV OR PROD ENDPOINT
// const ENDPOINT =
//   process.env.NODE_ENV === "production"
//     ? process.env.REACT_APP_PROD_ENDPOINT || ""
//     : process.env.REACT_APP_DEV_ENDPOINT || "";
// // Create a Nodemailer transporter
// const transporter = nodemailer.createTransport({
//   host: "smtp.dreamhost.com",
//   port: 465,
//   secure: true,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD
//   }
// });

// export const resetPassword = async (req: Request, res: Response) => {
//   const { email } = req.body;
//   try {
//     // Find the user by their email address
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Generate a unique password reset token
//     const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "1h" // Token expires in 1 hour
//     });

//     // Store the reset token and expiration timestamp in the user's document
//     user.resetToken = resetToken;
//     user.resetTokenExpiration = new Date(Date.now() + 3600000); // Token expires in 1 hour (3600000 milliseconds)
//     await user.save();

//     // Create the password reset email
//     const resetUrl = `https://${ENDPOINT}/reset-password?token=${resetToken}`;
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: "Drudge Reader Password Reset",
//       html: `
//         <p>You have requested to reset your password.</p>
//         <p>Please click the following link to reset your password:</p>
//         <a href="${resetUrl}">${resetUrl}</a>
//         <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
//       `
//     };

//     // Send the password reset email
//     await transporter.sendMail(mailOptions);

//     res.json({ message: "Password reset email sent" });
//   } catch (error) {
//     console.error("Error generating password reset token:", error);
//     res.status(500).json({ error: "An error occurred" });
//   }
// };
