// captureRoute.test.ts
import request from "supertest";
import express from "express";
import captureRoute, { captureScreenshots } from "../routes/captureRoute";
import { setCapturePendingState } from "../helpers/captureState";
import puppeteer from "puppeteer-extra";
import fs from "fs";
import path from "path";
import Jimp from "jimp";

// Mocking dependencies
jest.mock("puppeteer-extra");
jest.mock("fs");
jest.mock("path");
jest.mock("jimp");
jest.mock("../helpers/captureState");

const app = express();
app.use(express.json());
app.use("/capture", captureRoute);

describe("Capture Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if modifiedLinks is missing or empty", async () => {
    const response = await request(app).post("/capture").send({}).expect(400);

    expect(response.body.message).toBe(
      "Invalid request, array of documents expected"
    );
  });

  it("should return 429 if a capture process is already running", async () => {
    // First request to start the capture process
    await request(app)
      .post("/capture")
      .send({ modifiedLinks: [{ modifiedLink: "test", linkId: "test" }] });

    // Second request should be rejected
    const response = await request(app)
      .post("/capture")
      .send({ modifiedLinks: [{ modifiedLink: "test", linkId: "test" }] })
      .expect(429);

    expect(response.body.message).toBe("A capture process is already running");
  });

  it("should start the capture process and return 200", async () => {
    const mockCaptureScreenshots = jest.fn().mockResolvedValue(undefined);
    (captureScreenshots as jest.Mock) = mockCaptureScreenshots;

    const response = await request(app)
      .post("/capture")
      .send({ modifiedLinks: [{ modifiedLink: "test", linkId: "test" }] })
      .expect(200);

    expect(response.body.message).toBe("Screenshot capture process started");
    expect(mockCaptureScreenshots).toHaveBeenCalledWith([
      { modifiedLink: "test", linkId: "test" }
    ]);
  });
});

describe("captureScreenshots function", () => {
  it("should capture screenshots for valid links", async () => {
    const mockLaunch = jest.fn().mockResolvedValue({
      newPage: jest.fn().mockResolvedValue({
        setViewport: jest.fn(),
        goto: jest.fn(),
        screenshot: jest.fn()
      }),
      close: jest.fn()
    });
    (puppeteer.launch as jest.Mock) = mockLaunch;

    (fs.readdirSync as jest.Mock).mockReturnValue([]);
    (path.join as jest.Mock).mockReturnValue("/mock/path");

    const mockRead = jest.fn().mockResolvedValue({
      resize: jest.fn().mockReturnThis(),
      getWidth: jest.fn().mockReturnValue(1000),
      getHeight: jest.fn().mockReturnValue(1000),
      writeAsync: jest.fn()
    });
    (Jimp.read as jest.Mock) = mockRead;

    const modifiedLinks = [
      { modifiedLink: 'href="http://example.com"', linkId: "test1" },
      { modifiedLink: 'href="http://example.org"', linkId: "test2" }
    ];

    await captureScreenshots(modifiedLinks);

    expect(mockLaunch).toHaveBeenCalledWith({ headless: true });
    expect(mockRead).toHaveBeenCalledTimes(2);
    expect(setCapturePendingState).toHaveBeenCalledWith(false);
  });

  it("should handle errors and skip invalid links", async () => {
    const mockLaunch = jest.fn().mockResolvedValue({
      newPage: jest.fn().mockResolvedValue({
        setViewport: jest.fn(),
        goto: jest.fn().mockRejectedValue(new Error("Navigation failed")),
        screenshot: jest.fn()
      }),
      close: jest.fn()
    });
    (puppeteer.launch as jest.Mock) = mockLaunch;

    (fs.readdirSync as jest.Mock).mockReturnValue([]);
    (path.join as jest.Mock).mockReturnValue("/mock/path");

    const modifiedLinks = [
      { modifiedLink: "invalid", linkId: "test1" },
      { modifiedLink: 'href="http://example.com"', linkId: "test2" }
    ];

    await captureScreenshots(modifiedLinks);

    expect(mockLaunch).toHaveBeenCalledWith({ headless: true });
    expect(setCapturePendingState).toHaveBeenCalledWith(false);
  });
});
