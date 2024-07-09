// captureState.test.ts

import mongoose from "mongoose";
import {
  CaptureState,
  getCapturePendingState,
  setCapturePendingState
} from "./captureState";

// Mock the mongoose model
jest.mock("mongoose", () => ({
  Schema: jest.fn(),
  model: jest.fn(() => ({
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn()
  }))
}));

describe("captureState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCapturePendingState", () => {
    it("should return false when no state is found", async () => {
      (CaptureState.findOne as jest.Mock).mockResolvedValue(null);

      const result = await getCapturePendingState();

      expect(result).toBe(false);
      expect(CaptureState.findOne).toHaveBeenCalled();
    });

    it("should return the isCapturePending value when state is found", async () => {
      (CaptureState.findOne as jest.Mock).mockResolvedValue({
        isCapturePending: true
      });

      const result = await getCapturePendingState();

      expect(result).toBe(true);
      expect(CaptureState.findOne).toHaveBeenCalled();
    });

    it("should handle errors and return false", async () => {
      (CaptureState.findOne as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      const result = await getCapturePendingState();

      expect(result).toBe(false);
      expect(CaptureState.findOne).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith("isCapturePending:: undefined");

      consoleSpy.mockRestore();
    });
  });

  describe("setCapturePendingState", () => {
    it("should call findOneAndUpdate with correct parameters", async () => {
      await setCapturePendingState(true);

      expect(CaptureState.findOneAndUpdate).toHaveBeenCalledWith(
        {},
        { isCapturePending: true },
        { upsert: true }
      );
    });

    it("should handle errors", async () => {
      (CaptureState.findOneAndUpdate as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await expect(setCapturePendingState(false)).rejects.toThrow(
        "Database error"
      );
      expect(CaptureState.findOneAndUpdate).toHaveBeenCalledWith(
        {},
        { isCapturePending: false },
        { upsert: true }
      );
    });
  });
});
