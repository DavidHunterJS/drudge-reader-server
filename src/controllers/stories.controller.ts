import Story from "../models/Story";
import { Socket } from "socket.io";

export const connectionHandler = (socket: Socket): void => {
  console.log(`A new client connected`, socket.id);

  const sendInitialData = async () => {
    try {
      const documents = await Story.find({});
      socket.emit("initialDocuments", documents);
    } catch (err) {
      console.error("Error sending initial data:", err);
    }
  };

  const startWatchingChanges = () => {
    const changeStream = Story.watch();
    changeStream.on("change", async () => {
      console.log("Change detected in Story collection");
      try {
        const updatedDocuments = await Story.find({});
        socket.emit("updateDocuments", updatedDocuments);
      } catch (err) {
        console.error("Error updating documents:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected, closing change stream");
      changeStream.close();
    });
  };

  sendInitialData();
  startWatchingChanges();
};
