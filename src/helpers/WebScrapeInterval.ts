import { Request, Response, NextFunction } from "express";
const { grabAnchors } = require("./GrabAnchors");
const { addNewStories } = require("./UpdateDb");

export const webSrcapeInterval = async (
  req: Request,
  res: Response,
  nxt: NextFunction
) => {
  const interval = setInterval(() => {
    console.log(`Interval called`);
    grabAnchors(req, res, nxt);
    let haveLinksChanged = req.compareBool;
    if (haveLinksChanged) {
      console.log(`compareBool is ${haveLinksChanged}`);
      addNewStories(req, res, nxt);
      console.log(`addNewStories Called From setInterval`);
    }
  }, 20000);
};
