import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import * as cheerio from "cheerio";
import axios, { AxiosResponse } from "axios";
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
const URL: string = "https://drudgereport.com";

class Client {
  id: number;
  res: Response;
  constructor(id: number, res: Response) {
    this.id = id;
    this.res = res;
  }
}
let clients: Client[] = [];

let anchorsArr: Object[];

// const grabAnchors = async (req: Request, res: Response, nxt: NextFunction) => {
//   let anchors: Object[] = [];
//   let linkArr: String[] = [];
//   let data = await axios.get(URL).then((response: AxiosResponse) => {
//     return response.data;
//   });
//   const $ = cheerio.load(data);
//   // CHEERIO DATA TRANSFORMING PART
//   // HEADLINE LINKS
//   $("html body tt b tt b center")
//     .find("A")
//     .each((i, e) => {
//       let el = $.html(e);
//       linkArr.push(el);
//       const headline = "headline";
//       let addedOn: number = Date.now();
//       let removedOn: number = 0;
//       let record: {} = {
//         link: el,
//         addedOn: addedOn,
//         removedOn: removedOn,
//         pageLoc: headline
//       };
//       anchors.push(record);
//     });
//   // TOP LEFT LINKS
//   $("html body tt b tt b center")
//     .prevAll()
//     .filter("A")
//     .each((i, e) => {
//       let el = $.html(e);
//       linkArr.push(el);
//       const topLeft = "topLeft";
//       let addedOn: number = Date.now();
//       let removedOn: number = 0;
//       let record: {} = {
//         link: el,
//         addedOn: addedOn,
//         removedOn: removedOn,
//         pageLoc: topLeft
//       };
//       anchors.push(record);
//     });
//   // COLUMN 1 LINKS
//   $("#div-gpt-ad-1564685732534-0")
//     .prevAll()
//     .filter("A")
//     .each((i, e) => {
//       let el = $.html(e);
//       linkArr.push(el);
//       const column1 = "column1";
//       let addedOn: number = Date.now();
//       let removedOn: number = 0;
//       let record: {} = {
//         link: el,
//         addedOn: addedOn,
//         removedOn: removedOn,
//         pageLoc: column1
//       };
//       anchors.push(record);
//     });
//   // // COLUMN 2 LINKS
//   $("#div-gpt-ad-1567201323104-0")
//     .prevAll()
//     .filter("A")
//     .each((i, e) => {
//       let el = $.html(e);
//       linkArr.push(el);
//       const column2 = "column2";
//       let addedOn: number = Date.now();
//       let removedOn: number = 0;
//       let record: {} = {
//         link: el,
//         addedOn: addedOn,
//         removedOn: removedOn,
//         pageLoc: column2
//       };
//       anchors.push(record);
//     });
//   // // COLUMN 3 LINKS
//   $("#div-gpt-ad-1564685863820-0")
//     .prevAll()
//     .filter("A")
//     .each((i, e) => {
//       let el = $.html(e);
//       linkArr.push(el);
//       const column3 = "column3";
//       let addedOn: number = Date.now();
//       let removedOn: number = 0;
//       let record: {} = {
//         link: el,
//         addedOn: addedOn,
//         removedOn: removedOn,
//         pageLoc: column3
//       };
//       anchors.push(record);
//     });
//   let compareBool = compareArrays(linkArr);
//   console.log(compareBool);
//   // console.log(anchors);
//   console.log(anchors.length);
//   anchorsArr = [...anchors];
//   nxt();
// };

app.use(grabAnchors);

// write to database
// check for $nin
//   move to Archive collection
// send final data to client

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
    const data = `${JSON.stringify(reqData)}\n\n`;
    // console.log(reqData);
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
