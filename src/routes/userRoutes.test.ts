import request from "supertest";
import express from "express";
import userRoutes from "./userRoutes";
import { authenticateJWT } from "../middlewares/authMiddleware";
import adminMiddleware from "../middlewares/adminMiddleware";
import * as passwordResetController from "../controllers/passwordResetController";
import * as userController from "../controllers/userController";
import * as modifiedLinksController from "../controllers/modifiedLinksController";
import captureRoute from "../routes/captureRoute";

jest.mock("../middlewares/authMiddleware");
jest.mock("../middlewares/adminMiddleware");
jest.mock("../controllers/passwordResetController");
jest.mock("../controllers/userController");
jest.mock("../controllers/modifiedLinksController");

// Instead of mocking captureRoute, we'll mock its handler
jest.mock("../routes/captureRoute", () => {
  const mockCaptureHandler = jest.fn((req, res) => res.sendStatus(200));
  return {
    __esModule: true,
    default: {
      post: jest.fn().mockReturnValue(mockCaptureHandler)
    }
  };
});

const app = express();
app.use(express.json());
app.use("/api", userRoutes);

describe("User Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ... (keep all other tests the same)

  it("should handle POST /capture", async () => {
    const response = await request(app).post("/api/capture");
    expect(response.status).toBe(200);
    expect(captureRoute.post).toHaveBeenCalled();
  });
});
