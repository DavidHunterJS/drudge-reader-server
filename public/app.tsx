import React, { useEffect, useState } from "react";
import io from "socket.io-client";

interface Document {
  title: string;
  // Add other document properties as needed
}

const App: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    // Connect to the server using Socket.io
    const socket = io();

    // Listen for the initialDocuments event
    socket.on("initialDocuments", (initialDocuments: Document[]) => {
      setDocuments(initialDocuments);
    });

    // Listen for the updateDocuments event
    socket.on("updateDocuments", (updatedDocuments: Document[]) => {
      setDocuments(updatedDocuments);
    });

    return () => {
      // Disconnect from the server when the component unmounts
      socket.disconnect();
    };
  }, []);
  console.log("Right before Return");
  return (
    <div>
      <h1>Our Socket.io Application</h1>
      <div>
        <h2>Documents</h2>
        <ul>
          {documents.map((document, index) => (
            <li key={index}>{document.title}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
