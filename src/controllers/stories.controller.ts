import { Request, Response } from "express";
import Story from "../models/Story";
import { Server } from "socket.io";

export const connectionHandler = async (req: Request, res: Response) => {
  // Set up Socket.IO server
  const io = new Server(res, { cors: { origin: "*" } });

  try {
    // Send the entire collection to the client
    const documents = await Story.find({});
    io.emit("initialData", documents);

    // Watch for changes to the collection
    const changeStream = Story.watch();
    changeStream.on("change", async () => {
      // console.log(c);
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
