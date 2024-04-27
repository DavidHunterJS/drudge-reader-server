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
const connectionHandler = (socket) => {
    console.log(`A new client connected`, socket.id);
    const sendInitialData = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const documents = yield Story_1.default.find({});
            socket.emit("initialDocuments", documents);
        }
        catch (err) {
            console.error("Error sending initial data:", err);
        }
    });
    const startWatchingChanges = () => {
        const changeStream = Story_1.default.watch();
        changeStream.on("change", () => __awaiter(void 0, void 0, void 0, function* () {
            console.log("Change detected in Story collection");
            try {
                const updatedDocuments = yield Story_1.default.find({});
                socket.emit("updateDocuments", updatedDocuments);
            }
            catch (err) {
                console.error("Error updating documents:", err);
            }
        }));
        socket.on("disconnect", () => {
            console.log("Client disconnected, closing change stream");
            changeStream.close();
        });
    };
    sendInitialData();
    startWatchingChanges();
};
exports.connectionHandler = connectionHandler;
