import Story from "../models/Story";
import { Server } from "socket.io";
let io: Server;

export const connectionHandler = async (io: Server) => {
  console.log("connectionHandler Fired!");
  try {
    // Send the entire collection to the client
    const documents = await Story.find({});
    io.emit("initialDocuments", documents);
    // Watch for changes to the collection
    const changeStream = Story.watch();
    changeStream.on("change", async () => {
      console.log("Change Stream Fired!");
      try {
        const updatedDocuments = await Story.find({});
        io.emit("updateDocuments", updatedDocuments);
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
