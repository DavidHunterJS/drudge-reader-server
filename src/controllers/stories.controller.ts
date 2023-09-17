import { Request, Response } from "express";
import Story from "../models/Story";
export const connectionHandler = async (req: Request, res: Response) => {
  console.log("connectionHandler Fired!");
  try {
    // Send the entire collection to the client
    const documents = await Story.find({});
    res.json(documents);
    // Watch for changes to the collection
    const changeStream = Story.watch();
    changeStream.on("change", async () => {
      console.log("Change Stream Fired!");
      try {
        const updatedDocuments = await Story.find({});
        // res.json(updatedDocuments);
        // console.log("updatedDocuments were sent");
      } catch (err) {
        console.log(err);
      }
    });
    // Close the Socket.IO connection if the client disconnects
  } catch (err) {
    console.log(err);
    return;
  }
};
