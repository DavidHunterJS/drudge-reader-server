"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Story_1 = __importDefault(require("./Story"));
const OldStoryModel = mongoose_1.default.model("OldStory", Story_1.default.schema, "old-stories");
exports.default = OldStoryModel;
