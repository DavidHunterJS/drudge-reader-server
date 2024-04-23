import express, { request, response } from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db/connect";
import router from "./routes/routes";
import webSrcapeInterval from "./helpers/WebScrapeInterval";
import { connectionHandler } from "./controllers/stories.controller";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000"
  }
});

if (!process.env.PORT) {
  process.exit(1);
}
const PORT: number = parseInt(process.env.PORT as string, 10);

app.use(express.json());
app.use(cors());

// app.use("/", router);
// app.use(express.static("public"));
// more

io.on("connection", (socket) => {
  console.log("a user connected using SOCKETIO");
  connectionHandler(io);
});

server.listen(PORT, () => {
  db.connectToServer();
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});

webSrcapeInterval(request, response);
