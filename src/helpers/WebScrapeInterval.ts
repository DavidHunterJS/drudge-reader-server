import { Request, Response } from "express";
import { grabAnchors } from "./GrabAnchors";
import { addNewStories } from "./dbUtils";

const webScrapeInterval = (req: Request, res: Response) => {
  const intervalTime = 20000; // Set your desired interval time in milliseconds

  const interval = setInterval(async () => {
    console.log(`Interval called`);

    // Fetch anchors and compare
    await grabAnchors(req);
    const haveLinksChanged = req.compareBool;

    if (haveLinksChanged) {
      console.log(`compareBool is ${haveLinksChanged}`);

      // Add new stories if links have changed
      await addNewStories(req, res);
      console.log(`addNewStories Called From webScrapeInterval`);
    }
  }, intervalTime);
};

export default webScrapeInterval;
