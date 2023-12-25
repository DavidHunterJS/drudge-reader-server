"use strict";
exports.__esModule = true;
var react_1 = require("react");
var socket_io_client_1 = require("socket.io-client");
var App = function () {
    var _a = react_1.useState([]), documents = _a[0], setDocuments = _a[1];
    react_1.useEffect(function () {
        // Connect to the server using Socket.io
        var socket = socket_io_client_1["default"]();
        // Listen for the initialDocuments event
        socket.on("initialDocuments", function (initialDocuments) {
            setDocuments(initialDocuments);
        });
        // Listen for the updateDocuments event
        socket.on("updateDocuments", function (updatedDocuments) {
            setDocuments(updatedDocuments);
        });
        return function () {
            // Disconnect from the server when the component unmounts
            socket.disconnect();
        };
    }, []);
    console.log("Right before Return");
    return (<div>
      <h1>Our Socket.io Application</h1>
      <div>
        <h2>Documents</h2>
        <ul>
          {documents.map(function (document, index) { return (<li key={index}>{document.title}</li>); })}
        </ul>
      </div>
    </div>);
};
exports["default"] = App;
