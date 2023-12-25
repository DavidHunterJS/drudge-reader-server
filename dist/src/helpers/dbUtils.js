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
exports.removeOldStories = exports.addNewStories = void 0;
const Story_1 = __importDefault(require("../models/Story"));
const OldStory_1 = __importDefault(require("../models/OldStory"));
// ADDS ALL THE NEW STORIES TO THE STORIES COLLECTION
const addNewStories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("addNewStories fired - from addNewStories.");
        const stories = req.anchorsArr || [];
        const result = yield Story_1.default.insertMany(stories, { ordered: false }).catch((error) => {
            console.log("The following error is expected after insertMany", error);
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error occurred" });
    }
});
exports.addNewStories = addNewStories;
// CHECKS IF STORY IS NO LONGER ON CURRENT WEBPAGE BUT STILL IN DB
// REMOVES STORIES FROM DATABASE THAT ARE NO LONGER ON CURRENT LIVE WEB PAGE
const removeOldStories = (temp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("removeOldStories Fired!");
        // Find all documents in Story collection with links not in temp
        const oldStoryLinks = yield Story_1.default.find({ link: { $nin: temp } }).exec();
        const oldStories = oldStoryLinks.map((document) => {
            document.active = false;
            document.removedOn = new Date();
            return new OldStory_1.default(document.toObject());
        });
        // Remove the original documents from Story collection
        const deleteResult = yield Story_1.default.deleteMany({
            link: { $in: oldStoryLinks.map((doc) => doc.link) }
        });
        console.log("Delete Result", deleteResult);
        // Insert the old documents into OldStory collection
        yield OldStory_1.default.insertMany(oldStories, { ordered: false });
    }
    catch (error) {
        console.error("Error in removeOldStories:", error);
    }
});
exports.removeOldStories = removeOldStories;
