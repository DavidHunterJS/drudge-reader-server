import { Request, Response, NextFunction } from "express";
import Story, { IStory } from "../models/Story";
const { grabAnchors } = require("../modules/GrabAnchors");
const { updateDb } = require("../modules/UpdateDb");

class Client {
  id: number;
  res: Response;
  constructor(id: number, res: Response) {
    this.id = id;
    this.res = res;
  }
}
let clients: Client[] = [];

exports.connectionHandler = async (
  req: Request,
  res: Response,
  nxt: NextFunction
) => {
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
    let haveLinksChanged = req.compareBool;
    if (haveLinksChanged) {
      console.log(`compareBool is ${haveLinksChanged}`);
      updateDb(req, res, nxt);
    }

    const data = `${JSON.stringify(reqData)}\n\n`;

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
