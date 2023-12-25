"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.grabAnchors = void 0;
const cheerio = __importStar(require("cheerio"));
const axios_1 = __importDefault(require("axios"));
const LinkCompare_1 = __importDefault(require("./LinkCompare"));
const URL = "https://drudgereport.com";
const Story_1 = __importDefault(require("../models/Story"));
let anchorsArr;
const grabAnchors = (req) => __awaiter(void 0, void 0, void 0, function* () {
    let anchors = [];
    let linkArr = [];
    let data = yield axios_1.default.get(URL).then((response) => {
        return response.data;
    });
    // SCRAPING THE PAGE FOR LINKS WITH CHEERIO
    const $ = cheerio.load(data);
    // HEADLINE LINKS
    $("html body tt b tt b center")
        .find("A")
        .each((i, e) => {
        let el = $.html(e);
        linkArr.push(el);
        let story = new Story_1.default({
            link: el,
            addedOn: Date.now(),
            removedOn: 0,
            pageLocation: "headline"
        });
        anchors.push(story);
    });
    // TOP LEFT LINKS
    $("html body tt b tt b center")
        .prevAll()
        .filter("A")
        .each((i, e) => {
        let el = $.html(e);
        linkArr.push(el);
        let story = new Story_1.default({
            link: el,
            addedOn: Date.now(),
            removedOn: 0,
            pageLocation: "topLeft"
        });
        anchors.push(story);
    });
    // COLUMN 1 LINKS
    $("#div-gpt-ad-1564685732534-0")
        .prevAll()
        .filter("A")
        .each((i, e) => {
        let el = $.html(e);
        linkArr.push(el);
        let story = new Story_1.default({
            link: el,
            addedOn: Date.now(),
            removedOn: 0,
            pageLocation: "column1"
        });
        anchors.push(story);
    });
    // COLUMN 2 LINKS
    $("#div-gpt-ad-1567201323104-0")
        .prevAll()
        .filter("a")
        .each((i, e) => {
        let el = $.html(e);
        linkArr.push(el);
        let story = new Story_1.default({
            link: el,
            addedOn: Date.now(),
            removedOn: 0,
            pageLocation: "column2"
        });
        anchors.push(story);
    });
    // COLUMN 3 LINKS
    $("#div-gpt-ad-1564685863820-0")
        .prevAll()
        .filter("A")
        .each((i, e) => {
        let el = $.html(e);
        linkArr.push(el);
        let story = new Story_1.default({
            link: el,
            addedOn: Date.now(),
            removedOn: 0,
            pageLocation: "column3"
        });
        anchors.push(story);
    });
    let compareBool = (0, LinkCompare_1.default)(linkArr);
    console.log(compareBool);
    console.log(anchors.length);
    // console.log(anchors);
    anchorsArr = [...anchors];
    req.anchorsArr = anchorsArr;
    req.compareBool = compareBool;
});
exports.grabAnchors = grabAnchors;
