// user.test.ts

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, { UserDocument, hashPassword, validateUser } from "./User";

// Mock external dependencies
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("fs");

describe("User Model", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost/testdb");
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  it("should create and save a user successfully", async () => {
    const userData = {
      provider: "local",
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      firstName: "Test",
      lastName: "User",
      role: "USER"
    };

    const validUser = new User(userData);
    const savedUser = await validUser.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.username).toBe(userData.username);
    expect(savedUser.email).toBe(userData.email);
  });

  it("should fail to create a user with invalid email", async () => {
    const invalidUser = new User({
      provider: "local",
      username: "testuser",
      email: "invalid-email",
      password: "password123"
    });

    let err;
    try {
      await invalidUser.save();
    } catch (error: any) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.email).toBeDefined();
  });

  it("should generate JWT token", () => {
    const user = new User({
      provider: "local",
      username: "testuser",
      email: "test@example.com",
      role: "USER"
    });

    (jwt.sign as jest.Mock).mockReturnValue("mocked-jwt-token");

    const token = user.generateJWT();
    expect(token).toBe("mocked-jwt-token");
    expect(jwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        id: user._id,
        provider: user.provider,
        email: user.email,
        role: user.role
      }),
      expect.any(String)
    );
  });

  it("should register a new user with hashed password", async () => {
    const newUser = new User({
      provider: "local",
      username: "newuser",
      email: "new@example.com",
      password: "password123"
    });

    (bcrypt.genSalt as jest.Mock).mockImplementation((rounds, callback) => {
      callback(null, "mock-salt");
    });

    (bcrypt.hash as jest.Mock).mockImplementation(
      (password, salt, callback) => {
        callback(null, "hashed-password");
      }
    );

    await new Promise<void>((resolve) => {
      newUser.registerUser(newUser, (err) => {
        expect(err).toBeUndefined();
        expect(newUser.password).toBe("hashed-password");
        resolve();
      });
    });
  });

  it("should compare password correctly", async () => {
    const user = new User({
      provider: "local",
      username: "testuser",
      email: "test@example.com",
      password: "hashed-password"
    });

    (bcrypt.compare as jest.Mock).mockImplementation(
      (candidatePassword, hashedPassword, callback) => {
        callback(null, candidatePassword === "correct-password");
      }
    );

    await new Promise<void>((resolve) => {
      user.comparePassword("correct-password", (err, isMatch) => {
        expect(err).toBeNull();
        expect(isMatch).toBe(true);
        resolve();
      });
    });

    await new Promise<void>((resolve) => {
      user.comparePassword("wrong-password", (err, isMatch) => {
        expect(err).toBeNull();
        expect(isMatch).toBe(false);
        resolve();
      });
    });
  });

  it("should hash password", async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");

    const hashedPassword = await hashPassword("password123");
    expect(hashedPassword).toBe("hashed-password");
    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
  });

  it("should validate user data", async () => {
    const validUserData = {
      username: "validuser",
      password: "password123",
      firstName: "Valid",
      lastName: "User"
    };

    const invalidUserData = {
      username: "in",
      password: "short"
    };

    const validResult = await validateUser(validUserData);
    expect(validResult).toBeNull();

    const invalidResult = await validateUser(invalidUserData);
    expect(invalidResult).not.toBeNull();
    if (invalidResult) {
      expect(invalidResult).toHaveProperty("error");
      expect(invalidResult.error).toBeInstanceOf(Error);
    } else {
      fail("Expected invalidResult to not be null");
    }
  });
});
