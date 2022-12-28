import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
const db = require("./db/connect");
const compareArrays = require("./modules/LinkCompare");
const { grabAnchors } = require("./modules/GrabAnchors");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
if (!process.env.PORT) {
  process.exit(1);
}

const PORT: number = parseInt(process.env.PORT as string, 10);

class Client {
  id: number;
  res: Response;
  constructor(id: number, res: Response) {
    this.id = id;
    this.res = res;
  }
}
let clients: Client[] = [];

// let anchorsArr: Object[];

// DB STUFF
// const collection = db.collection("links");
// const changeStream = collection.watch();
// changeStream.on("change", (event: {}) => {
//   console.log(JSON.stringify(event));
// });

app.use(grabAnchors);

// grab anchors indi of connected clients
// connected clients get data fromt db only
// clients get new data on changes via the event-stram

// const interval = setInterval(() => {
//   grabAnchors();
//   // let reqData = req.anchorsArr;
//   // const data = `${JSON.stringify(reqData)}\n\n`;
//   // console.log(reqData);
//   // res.write(data);
// }, 2000);

const connectionHandler = (req: Request, res: Response, nxt: NextFunction) => {
  const headers = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    ["Connection"]: "keep-alive"
  };
  res.writeHead(200, headers);
  res.flushHeaders();
  const interval = setInterval(() => {
    grabAnchors(req, res, nxt);
    let reqData = req.anchorsArr;
    console.log(reqData);
    const data = `${JSON.stringify(reqData)}\n\n`;
    // if compareBool is true
    // then add to db
    // and check if removals are needed
    // then send data to client
    res.write(data);
  }, 2000);

  const clientId: number = Date.now();
  let client: Client = new Client(clientId, res);
  clients.push(client);

  req.on("close", () => {
    clearInterval(interval);
    console.log(`${clientId} Connection closed`);
    clients = clients.filter((client) => client.id !== clientId);
  });
};

app.get("/dr", connectionHandler);

app.listen(PORT, () => {
  db.connectToServer(function (err: any) {
    if (err) console.error(err);
  });
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
