import express, {
  request,
  response,
  Response,
  Request,
  NextFunction
} from "express";
import http, { createServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db/connect";
import router from "./routes/routes";
import webSrcapeInterval from "./helpers/WebScrapeInterval";
import { connectionHandler } from "./controllers/stories.controller";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const server = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*", // Adjust this to match your front-end URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Access-Control-Allow-Origin"]
  }
});

app.get("/", (request, response) => {
  response.send("Hello World!");
});

if (!process.env.PORT) {
  process.exit(1);
}
const PORT: number = parseInt(process.env.PORT as string, 10);

app.use(express.json());
// app.use(cors());
io.on("connection", (socket: Socket) => connectionHandler(socket));

app.use(
  (error: any, request: Request, response: Response, next: NextFunction) => {
    console.error(error.stack);
    response.status(500).send("Something broke!");
  }
);

httpServer.listen(PORT, () => {
  db.connectToServer();
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});

webSrcapeInterval(request, response);
