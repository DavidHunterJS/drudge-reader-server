"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionHandler = void 0;
const Story_1 = __importDefault(require("../models/Story"));
let io;
const connectionHandler = (io) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("connectionHandler Fired!");
    try {
        // Send the entire collection to the client
        const documents = yield Story_1.default.find({});
        io.emit("initialDocuments", documents);
        // Watch for changes to the collection
        const changeStream = Story_1.default.watch();
        changeStream.on("change", () => __awaiter(void 0, void 0, void 0, function* () {
            console.log("Change Stream Fired!");
            try {
                const updatedDocuments = yield Story_1.default.find({});
                io.emit("updateDocuments", updatedDocuments);
                // console.log("updatedDocuments were sent");
            }
            catch (err) {
                console.log(err);
            }
        }));
        // Close the Socket.IO connection if the client disconnects
    }
    catch (err) {
        console.log(err);
        return;
    }
});
exports.connectionHandler = connectionHandler;
