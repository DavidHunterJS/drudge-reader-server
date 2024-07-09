// db.test.ts

import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectToServer } from "./connect"; // Adjust the import path as needed

// Mock mongoose and dotenv
jest.mock("mongoose");
jest.mock("dotenv");

describe("Database Connection", () => {
  // Save the original process.env
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restore the original process.env
    process.env = originalEnv;
  });

  it("should connect to the database successfully", async () => {
    // Mock process.cwd()
    jest.spyOn(process, "cwd").mockReturnValue("/mock/path");

    // Mock dotenv.config
    (dotenv.config as jest.Mock).mockReturnValue({});

    // Set up mock ATLAS_URI
    process.env.ATLAS_URI = "mongodb://mockurl:27017/testdb";

    // Mock successful connection
    (mongoose.connect as jest.Mock).mockResolvedValue(undefined);

    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    await connectToServer();

    expect(dotenv.config).toHaveBeenCalledWith({ path: "/mock/path/.env" });
    expect(mongoose.connect).toHaveBeenCalledWith(
      "mongodb://mockurl:27017/testdb"
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      "⚡️[database]: Successfully connected to Atlas-MongoDB."
    );

    consoleSpy.mockRestore();
  });

  it("should handle connection errors", async () => {
    // Mock process.cwd()
    jest.spyOn(process, "cwd").mockReturnValue("/mock/path");

    // Mock dotenv.config
    (dotenv.config as jest.Mock).mockReturnValue({});

    // Set up mock ATLAS_URI
    process.env.ATLAS_URI = "mongodb://mockurl:27017/testdb";

    // Mock connection error
    const mockError = new Error("Connection failed");
    (mongoose.connect as jest.Mock).mockRejectedValue(mockError);

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    await connectToServer();

    expect(dotenv.config).toHaveBeenCalledWith({ path: "/mock/path/.env" });
    expect(mongoose.connect).toHaveBeenCalledWith(
      "mongodb://mockurl:27017/testdb"
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(mockError);

    consoleErrorSpy.mockRestore();
  });

  it("should not connect if ATLAS_URI is not set", async () => {
    // Mock process.cwd()
    jest.spyOn(process, "cwd").mockReturnValue("/mock/path");

    // Mock dotenv.config
    (dotenv.config as jest.Mock).mockReturnValue({});

    // Ensure ATLAS_URI is not set
    delete process.env.ATLAS_URI;

    await connectToServer();

    expect(dotenv.config).toHaveBeenCalledWith({ path: "/mock/path/.env" });
    expect(mongoose.connect).not.toHaveBeenCalled();
  });
});
