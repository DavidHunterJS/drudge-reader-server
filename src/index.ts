import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
const db = require("./db/connect");
const router = require("./routes/routes");
const { webSrcapeInterval } = require("./helpers/WebScrapeInterval");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(webSrcapeInterval);
app.use("/", router);

if (!process.env.PORT) {
  process.exit(1);
}
const PORT: number = parseInt(process.env.PORT as string, 10);

app.get("/", (req, res) => {
  res.json({ message: "Drudge Reader." });
});

app.listen(PORT, () => {
  db.connectToServer(function (err: any) {
    if (err) console.error(err);
  });
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
