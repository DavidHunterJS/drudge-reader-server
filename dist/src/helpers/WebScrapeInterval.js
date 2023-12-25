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
Object.defineProperty(exports, "__esModule", { value: true });
const GrabAnchors_1 = require("./GrabAnchors");
const dbUtils_1 = require("./dbUtils");
const webScrapeInterval = (req, res) => {
    const intervalTime = 20000; // Set your desired interval time in milliseconds
    const interval = setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        console.log(`Interval called`);
        // Fetch anchors and compare
        yield (0, GrabAnchors_1.grabAnchors)(req);
        const haveLinksChanged = req.compareBool;
        if (haveLinksChanged) {
            console.log(`compareBool is ${haveLinksChanged}`);
            // Add new stories if links have changed
            yield (0, dbUtils_1.addNewStories)(req, res);
            console.log(`addNewStories Called From webScrapeInterval`);
        }
    }), intervalTime);
};
exports.default = webScrapeInterval;
