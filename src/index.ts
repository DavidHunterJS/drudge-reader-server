// index.ts
import express, { Response, Request, NextFunction } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import { connectToServer } from "./db/connect";
import webSrcapeInterval from "./helpers/WebScrapeInterval";
import { connectionHandler } from "./controllers/stories.controller";
import userRoutes from "./routes/userRoutes";
import captureRouter from "./routes/captureRoute";
import { checkLinkChanges } from "./helpers/LinkCompare";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import User from "./models/User";

dotenv.config();

const app = express();

const ORIGIN =
  process.env.NODE_ENV === "production"
    ? process.env.PROD_ENV || ""
    : process.env.DEV_ENV || "";

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: ORIGIN, // Adjust this to match your front-end URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Access-Control-Allow-Origin"]
  }
});
const corsOptions = {
  origin: "http://localhost:3000", // This should be your frontend URL, e.g., 'http://localhost:3000'
  credentials: true,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(express.json());
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(__dirname + "/node_modules/socket.io/client-dist"));

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: "Incorrect username." });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return done(null, false, { message: "Incorrect password." });
      }

      return done(null, user);
    } catch (err) {
      console.error("Error in Passport strategy:", err);
      return done(err);
    }
  })
);

// Mount user routes
app.use("/api", userRoutes);

// screenshot capture
app.use("/capture", captureRouter);

app.use("/api", checkLinkChanges);

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
