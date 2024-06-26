// index.ts
import express, { Response, Request, NextFunction } from "express";
import { createServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import { connectToServer } from "./db/connect";
import webSrcapeInterval from "./helpers/WebScrapeInterval";
import { connectionHandler } from "./controllers/stories.controller";
import userRoutes from "./routes/userRoutes";

dotenv.config();

const app = express();

// const ORIGIN =
//   process.env.NODE_ENV === "production"
//     ? process.env.PROD_ENDPOINT || ""
//     : process.env.DEV_ENDPOINT || "";

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "http://localhost:3000", // Adjust this to match your front-end URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Access-Control-Allow-Origin"]
  }
});

app.use(express.json());
app.use(cors());
app.use(express.static(__dirname + "/node_modules/socket.io/client-dist"));

// Mount user routes
app.use("/api", userRoutes);

app.get("/", (request, response) => {
  response.send("Hello World!");
});

if (!process.env.PORT) {
  process.exit(1);
}
const PORT: number = parseInt(process.env.PORT as string, 10);

io.on("connection", (socket: Socket) => connectionHandler(socket));

app.use(
  (error: any, request: Request, response: Response, next: NextFunction) => {
    console.error(error.stack);
    response.status(500).send("Internal Server Error");
  }
);
httpServer.listen(PORT, () => {
  connectToServer();
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});

webSrcapeInterval();
// comments
