import { Request, Response, NextFunction } from "express";
import * as cheerio from "cheerio";
import axios, { AxiosResponse } from "axios";
const compareArrays = require("./LinkCompare");
const URL: string = "https://drudgereport.com";

let anchorsArr: Object[];
const grabAnchors = async (req: Request, res: Response, nxt: NextFunction) => {
  //set interval here
  let anchors: Object[] = [];
  let linkArr: String[] = [];
  let data = await axios.get(URL).then((response: AxiosResponse) => {
    return response.data;
  });
  const $ = cheerio.load(data);
  // CHEERIO DATA TRANSFORMING PART
  // HEADLINE LINKS
  $("html body tt b tt b center")
    .find("A")
    .each((i, e) => {
      let el = $.html(e);
      linkArr.push(el);
      const headline = "headline";
      let addedOn: number = Date.now();
      let removedOn: number = 0;
      let record: {} = {
        link: el,
        addedOn: addedOn,
        removedOn: removedOn,
        pageLoc: headline
      };
      anchors.push(record);
    });
  // TOP LEFT LINKS
  $("html body tt b tt b center")
    .prevAll()
    .filter("A")
    .each((i, e) => {
      let el = $.html(e);
      linkArr.push(el);
      const topLeft = "topLeft";
      let addedOn: number = Date.now();
      let removedOn: number = 0;
      let record: {} = {
        link: el,
        addedOn: addedOn,
        removedOn: removedOn,
        pageLoc: topLeft
      };
      anchors.push(record);
    });
  // COLUMN 1 LINKS
  $("#div-gpt-ad-1564685732534-0")
    .prevAll()
    .filter("A")
    .each((i, e) => {
      let el = $.html(e);
      linkArr.push(el);
      const column1 = "column1";
      let addedOn: number = Date.now();
      let removedOn: number = 0;
      let record: {} = {
        link: el,
        addedOn: addedOn,
        removedOn: removedOn,
        pageLoc: column1
      };
      anchors.push(record);
    });
  // // COLUMN 2 LINKS
  $("#div-gpt-ad-1567201323104-0")
    .prevAll()
    .filter("A")
    .each((i, e) => {
      let el = $.html(e);
      linkArr.push(el);
      const column2 = "column2";
      let addedOn: number = Date.now();
      let removedOn: number = 0;
      let record: {} = {
        link: el,
        addedOn: addedOn,
        removedOn: removedOn,
        pageLoc: column2
      };
      anchors.push(record);
    });
  // // COLUMN 3 LINKS
  $("#div-gpt-ad-1564685863820-0")
    .prevAll()
    .filter("A")
    .each((i, e) => {
      let el = $.html(e);
      linkArr.push(el);
      const column3 = "column3";
      let addedOn: number = Date.now();
      let removedOn: number = 0;
      let record: {} = {
        link: el,
        addedOn: addedOn,
        removedOn: removedOn,
        pageLoc: column3
      };
      anchors.push(record);
    });
  let compareBool = compareArrays(linkArr);
  console.log(compareBool);
  // console.log(anchors);
  console.log(anchors.length);
  anchorsArr = [...anchors];
  req.anchorsArr = anchorsArr;
  nxt();
};
module.exports = { grabAnchors };
