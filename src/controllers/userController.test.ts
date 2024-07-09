import mongoose from "mongoose";
import { Request, Response } from "express";
import User, { UserDocument } from "../models/User";
import * as userController from "../controllers/userController";

// Mock the entire mongoose module
jest.mock("mongoose");

// Mock the User model and its methods
jest.mock("../models/User", () => ({
  User: {
    findOne: jest.fn()
  },
  hashPassword: jest.fn()
}));

describe("User Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {}
    };
    responseJson = jest.fn();
    responseStatus = jest.fn().mockReturnValue({ json: responseJson });
    mockResponse = {
      status: responseStatus,
      json: responseJson
    };
  });

  describe("registerUser", () => {
    it("should register a new user", async () => {
      const newUser = {
        username: "newuser",
        email: "newuser@example.com",
        password: "password123",
        firstname: "New",
        lastname: "User",
        role: "user"
      };
      mockRequest.body = newUser;

      // Mock User.findOne to return null (user doesn't exist)
      (User.findOne as jest.Mock).mockResolvedValue(null);

      // Mock hashPassword
      (require("../models/User").hashPassword as jest.Mock).mockResolvedValue(
        "hashed_password"
      );

      // Create a mock UserDocument
      const mockUserDocument: Partial<UserDocument> = {
        ...newUser,
        _id: new mongoose.Types.ObjectId(),
        save: jest.fn().mockResolvedValue(undefined),
        generateJWT: jest.fn().mockReturnValue("mock-token"),
        toJSON: jest.fn().mockReturnValue(newUser)
      };

      // Mock mongoose.model to return a constructor function for our mock UserDocument
      (mongoose.model as jest.Mock).mockReturnValue(
        jest.fn().mockImplementation(() => mockUserDocument)
      );

      await userController.registerUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(User.findOne).toHaveBeenCalledWith({
        $or: [{ username: newUser.username }, { email: newUser.email }]
      });
      expect(require("../models/User").hashPassword).toHaveBeenCalledWith(
        newUser.password
      );
      expect(mockUserDocument.save).toHaveBeenCalled();
      expect(mockUserDocument.generateJWT).toHaveBeenCalled();
      expect(responseStatus).toHaveBeenCalledWith(201);
      expect(responseJson).toHaveBeenCalledWith({
        token: "mock-token",
        user: newUser
      });
    });

    it("should return 400 if user already exists", async () => {
      const existingUser = {
        username: "existinguser",
        email: "existing@example.com"
      };
      mockRequest.body = existingUser;
      (User.findOne as jest.Mock).mockResolvedValue(existingUser);

      await userController.registerUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: "Username or email already exists"
      });
    });

    // Add more tests for validation errors, server errors, etc.
  });

  describe("loginUser", () => {
    it("should login a user and return a token", async () => {
      const loginCredentials = {
        email: "user@example.com",
        password: "password123"
      };
      mockRequest.body = loginCredentials;

      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        email: loginCredentials.email,
        comparePassword: jest.fn().mockResolvedValue(true),
        generateJWT: jest.fn().mockReturnValue("mock-token"),
        toJSON: jest.fn().mockReturnValue({ email: loginCredentials.email })
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      await userController.loginUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(User.findOne).toHaveBeenCalledWith({
        email: loginCredentials.email
      });
      expect(mockUser.comparePassword).toHaveBeenCalledWith(
        loginCredentials.password
      );
      expect(mockUser.generateJWT).toHaveBeenCalled();
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        token: "mock-token",
        user: { email: loginCredentials.email }
      });
    });

    it("should return 401 if user not found", async () => {
      mockRequest.body = {
        email: "nonexistent@example.com",
        password: "password123"
      };
      (User.findOne as jest.Mock).mockResolvedValue(null);

      await userController.loginUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(responseStatus).toHaveBeenCalledWith(401);
      expect(responseJson).toHaveBeenCalledWith({
        error: "Invalid email or password"
      });
    });

    it("should return 401 if password is incorrect", async () => {
      const loginCredentials = {
        email: "user@example.com",
        password: "wrongpassword"
      };
      mockRequest.body = loginCredentials;

      const mockUser = {
        email: loginCredentials.email,
        comparePassword: jest.fn().mockResolvedValue(false)
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      await userController.loginUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(responseStatus).toHaveBeenCalledWith(401);
      expect(responseJson).toHaveBeenCalledWith({
        error: "Invalid email or password"
      });
    });
  });

  // Add tests for other controller functions (e.g., getUserProfile, updateUserProfile, etc.)
});
