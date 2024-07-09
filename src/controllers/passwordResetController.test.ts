import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
const nodemailer = require("nodemailer");
import jwt from "jsonwebtoken";
import {
  passwordRequest,
  verifyResetToken,
  resetPassword
} from "../controllers/passwordResetController";

// Mock dependencies
jest.mock("../models/User");
jest.mock("bcryptjs");
jest.mock("nodemailer");
jest.mock("jsonwebtoken");

describe("Password Reset Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {}
    };
    responseJson = jest.fn();
    responseStatus = jest.fn().mockReturnValue({ json: responseJson });
    mockResponse = {
      status: responseStatus,
      json: responseJson
    };

    // Reset mocks
    jest.clearAllMocks();
  });

  describe("passwordRequest", () => {
    it("should send a password reset email when user is found", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        save: jest.fn()
      };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue("mockToken");
      const mockSendMail = jest.fn().mockResolvedValue({});
      (nodemailer.createTransport as jest.Mock).mockReturnValue({
        sendMail: mockSendMail
      });

      mockRequest.body = { email: "test@example.com" };

      await passwordRequest(mockRequest as Request, mockResponse as Response);

      expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(jwt.sign).toHaveBeenCalled();
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockSendMail).toHaveBeenCalled();
      expect(responseJson).toHaveBeenCalledWith({
        message: "Password reset email sent"
      });
    });

    it("should return 404 when user is not found", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      mockRequest.body = { email: "nonexistent@example.com" };

      await passwordRequest(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({ error: "User not found" });
    });

    it("should handle errors and return 500", async () => {
      (User.findOne as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      mockRequest.body = { email: "test@example.com" };

      await passwordRequest(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({ error: "An error occurred" });
    });
  });

  describe("verifyResetToken", () => {
    it("should return valid true when token is valid and not expired", async () => {
      const mockUser = {
        resetToken: "validToken",
        resetTokenExpiration: new Date(Date.now() + 3600000)
      };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      mockRequest.query = { token: "validToken" };

      await verifyResetToken(mockRequest as Request, mockResponse as Response);

      expect(responseJson).toHaveBeenCalledWith({ valid: true });
    });

    it("should return valid false when token is not found", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      mockRequest.query = { token: "invalidToken" };

      await verifyResetToken(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        valid: false,
        error: "Invalid token"
      });
    });

    it("should return valid false when token is expired", async () => {
      const mockUser = {
        resetToken: "expiredToken",
        resetTokenExpiration: new Date(Date.now() - 3600000)
      };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      mockRequest.query = { token: "expiredToken" };

      await verifyResetToken(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        valid: false,
        error: "Token expired"
      });
    });
  });

  describe("resetPassword", () => {
    it("should reset password when token is valid", async () => {
      const mockUser = {
        resetToken: "validToken",
        resetTokenExpiration: new Date(Date.now() + 3600000),
        save: jest.fn()
      };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue("mockSalt");
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");

      mockRequest.body = { token: "validToken", password: "newPassword" };

      await resetPassword(mockRequest as Request, mockResponse as Response);

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith("newPassword", "mockSalt");
      expect(mockUser.save).toHaveBeenCalled();
      expect(responseJson).toHaveBeenCalledWith({
        success: true,
        message: "Password reset successful"
      });
    });

    it("should return error when token is invalid", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      mockRequest.body = { token: "invalidToken", password: "newPassword" };

      await resetPassword(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        success: false,
        error: "Invalid token"
      });
    });

    it("should return error when token is expired", async () => {
      const mockUser = {
        resetToken: "expiredToken",
        resetTokenExpiration: new Date(Date.now() - 3600000)
      };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      mockRequest.body = { token: "expiredToken", password: "newPassword" };

      await resetPassword(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        success: false,
        error: "Token expired"
      });
    });
  });
});
