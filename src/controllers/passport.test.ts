import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy } from "passport-jwt";
import bcrypt from "bcryptjs";
import User from "../models/User";

// Mock the dependencies
jest.mock("passport");
jest.mock("passport-local");
jest.mock("passport-jwt");
jest.mock("bcryptjs");
jest.mock("../models/User");

// Import the file that contains the passport configuration
import "../config/passport";

// Define a mock user type
interface MockUser {
  id: string;
  username: string;
  password: string;
}

describe("Passport Configuration", () => {
  describe("Local Strategy", () => {
    let localStrategyCallback: Function;

    beforeAll(() => {
      // Get the callback function passed to LocalStrategy
      localStrategyCallback = (LocalStrategy as jest.Mock).mock.calls[0][0];
    });

    it("should authenticate valid credentials", async () => {
      const mockUser: MockUser = {
        id: "1",
        username: "testuser",
        password: "hashedpassword"
      };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const done = jest.fn();

      await localStrategyCallback("testuser", "password", done);

      expect(User.findOne).toHaveBeenCalledWith({ username: "testuser" });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password",
        mockUser.password
      );
      expect(done).toHaveBeenCalledWith(null, mockUser);
    });

    it("should reject invalid username", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const done = jest.fn();

      await localStrategyCallback("invaliduser", "password", done);

      expect(User.findOne).toHaveBeenCalledWith({ username: "invaliduser" });
      expect(done).toHaveBeenCalledWith(null, false, {
        message: "Invalid username or password"
      });
    });

    it("should reject invalid password", async () => {
      const mockUser: MockUser = {
        id: "1",
        username: "testuser",
        password: "hashedpassword"
      };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const done = jest.fn();

      await localStrategyCallback("testuser", "wrongpassword", done);

      expect(User.findOne).toHaveBeenCalledWith({ username: "testuser" });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "wrongpassword",
        mockUser.password
      );
      expect(done).toHaveBeenCalledWith(null, false, {
        message: "Invalid username or password"
      });
    });

    it("should handle errors", async () => {
      const mockError = new Error("Database error");
      (User.findOne as jest.Mock).mockRejectedValue(mockError);

      const done = jest.fn();

      await localStrategyCallback("testuser", "password", done);

      expect(User.findOne).toHaveBeenCalledWith({ username: "testuser" });
      expect(done).toHaveBeenCalledWith(mockError);
    });
  });

  describe("JWT Strategy", () => {
    let jwtStrategyCallback: Function;

    beforeAll(() => {
      // Get the callback function passed to JwtStrategy
      jwtStrategyCallback = (JwtStrategy as jest.Mock).mock.calls[0][1];
    });

    it("should authenticate valid JWT payload", async () => {
      const mockUser: MockUser = {
        id: "1",
        username: "testuser",
        password: "hashedpassword"
      };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const done = jest.fn();
      const payload = { userId: "1" };

      await jwtStrategyCallback(payload, done);

      expect(User.findById).toHaveBeenCalledWith("1");
      expect(done).toHaveBeenCalledWith(null, mockUser);
    });

    it("should reject invalid JWT payload", async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      const done = jest.fn();
      const payload = { userId: "invalid" };

      await jwtStrategyCallback(payload, done);

      expect(User.findById).toHaveBeenCalledWith("invalid");
      expect(done).toHaveBeenCalledWith(null, false);
    });

    it("should handle errors", async () => {
      const mockError = new Error("Database error");
      (User.findById as jest.Mock).mockRejectedValue(mockError);

      const done = jest.fn();
      const payload = { userId: "1" };

      await jwtStrategyCallback(payload, done);

      expect(User.findById).toHaveBeenCalledWith("1");
      expect(done).toHaveBeenCalledWith(mockError);
    });
  });
});
