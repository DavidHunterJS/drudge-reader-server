import { Request, Response } from "express";
import Story from "../models/Story";
const io = require("../index");
export const connectionHandler = async (req: Request, res: Response) => {
  console.log("connectionHandler Fired!");
  try {
    // Send the entire collection to the client
    const documents = await Story.find({});
    io.emit("initialData", documents);
    res.json(documents);
    // Watch for changes to the collection
    const changeStream = Story.watch();
    changeStream.on("change", async () => {
      try {
        const updatedDocuments = await Story.find({});
        io.emit("updateData", updatedDocuments);
      } catch (err) {
        console.log(err);
      }
    });
    // Close the Socket.IO connection if the client disconnects
    io.on("disconnect", () => {
      changeStream.close();
    });
  } catch (err) {
    console.log(err);
    return;
  }
};
