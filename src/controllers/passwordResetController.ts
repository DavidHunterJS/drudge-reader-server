import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

// DEV OR PROD ENDPOINT
const ENDPOINT =
  process.env.NODE_ENV === "production"
    ? process.env.PROD_ENV || ""
    : process.env.DEV_ENV || "";
// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp.dreamhost.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const passwordRequest = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    // Find the user by their email address
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a unique password reset token
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h" // Token expires in 1 hour
    });

    // Store the reset token and expiration timestamp in the user's document
    user.resetToken = resetToken;
    user.resetTokenExpiration = new Date(Date.now() + 3600000); // Token expires in 1 hour (3600000 milliseconds)
    await user.save();

    // Create the password reset email
    const resetUrl = `${ENDPOINT}/password-reset?token=${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Drudge Reader Password Reset",
      html: `
        <p>You have requested to reset your password.</p>
        <p>Please click the following link to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      `
    };

    // Send the password reset email
    await transporter.sendMail(mailOptions);

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Error generating password reset token:", error);
    res.status(500).json({ error: "An error occurred" });
  }
};

export const verifyResetToken = async (req: Request, res: Response) => {
  const { token } = req.query;

  try {
    // Find the user by the provided token
    const user = await User.findOne({ resetToken: token });

    if (!user) {
      return res.status(400).json({ valid: false, error: "Invalid token" });
    }

    // Check if the token has expired
    if (user.resetTokenExpiration && user.resetTokenExpiration < new Date()) {
      return res.status(400).json({ valid: false, error: "Token expired" });
    }

    res.json({ valid: true });
  } catch (error) {
    console.error("Error verifying reset token:", error);
    res.status(500).json({ valid: false, error: "An error occurred" });
  }
};
export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;

  try {
    // Find the user by the provided token
    const user = await User.findOne({ resetToken: token });

    if (!user) {
      return res.status(400).json({ success: false, error: "Invalid token" });
    }

    // Check if the token has expired
    if (user.resetTokenExpiration && user.resetTokenExpiration < new Date()) {
      return res.status(400).json({ success: false, error: "Token expired" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update the user's password in the database
    user.password = hashedPassword;
    user.resetToken = undefined; // Remove the reset token
    user.resetTokenExpiration = undefined; // Remove the token expiration
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ success: false, error: "An error occurred" });
  }
};
