import express, { request, response } from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
const db = require("./db/connect");
const router = require("./routes/routes");
const { webSrcapeInterval } = require("./helpers/WebScrapeInterval");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
app.use(express.json());
app.use(cors());
webSrcapeInterval(request, response);
app.use("/", router);

if (!process.env.PORT) {
  process.exit(1);
}
const PORT: number = parseInt(process.env.PORT as string, 10);

app.use(express.static("public"));

// app.get("/", (req, res) => {
//   res.sendFile(__dirname + "./public/index.html");
// });

app.listen(PORT, () => {
  db.connectToServer(function (err: any) {
    if (err) console.error(err);
  });
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
