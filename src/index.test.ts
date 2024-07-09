import request from "supertest";
import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { io as SocketIOClient } from "socket.io-client";
import { connectToServer } from "./db/connect";
import userRoutes from "./routes/userRoutes";
import captureRouter from "./routes/captureRoute";
import { checkLinkChanges } from "./helpers/LinkCompare";

jest.mock("./db/connect");
jest.mock("./helpers/WebScrapeInterval");
jest.mock("./controllers/stories.controller");
jest.mock("./helpers/LinkCompare");

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer);

app.use(express.json());
app.use("/api", userRoutes);
app.use("/capture", captureRouter);
app.use("/api", checkLinkChanges);

describe("Express App", () => {
  let server: any;
  let clientSocket: ReturnType<typeof SocketIOClient>;

  beforeAll((done) => {
    server = httpServer.listen(0, () => {
      const port = (server.address() as any).port;
      clientSocket = SocketIOClient(`http://localhost:${port}`);
      clientSocket.on("connect", done);
    });
  });

  afterAll((done) => {
    server.close();
    clientSocket.disconnect();
    done();
  });

  it('should respond with "Hello World!" on GET /', async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.text).toBe("Hello World!");
  });

  it("should connect to the database on server start", async () => {
    expect(connectToServer).toHaveBeenCalled();
  });

  it("should handle 404 for unknown routes", async () => {
    const response = await request(app).get("/unknown-route");
    expect(response.status).toBe(404);
  });

  it("should use userRoutes for /api routes", async () => {
    const mockUserRoute = jest
      .fn()
      .mockImplementation((req, res) => res.sendStatus(200));
    (userRoutes as any).get("/test", mockUserRoute);

    await request(app).get("/api/test");
    expect(mockUserRoute).toHaveBeenCalled();
  });

  it("should use captureRouter for /capture routes", async () => {
    const mockCaptureRoute = jest
      .fn()
      .mockImplementation((req, res) => res.sendStatus(200));
    (captureRouter as any).get("/test", mockCaptureRoute);

    await request(app).get("/capture/test");
    expect(mockCaptureRoute).toHaveBeenCalled();
  });

  it("should use checkLinkChanges middleware for /api routes", async () => {
    const mockCheckLinkChanges = checkLinkChanges as jest.Mock;
    mockCheckLinkChanges.mockImplementation((req, res, next) => next());

    await request(app).get("/api/test");
    expect(mockCheckLinkChanges).toHaveBeenCalled();
  });

  it("should establish a socket connection", (done) => {
    expect(clientSocket.connected).toBe(true);
    done();
  });
});
