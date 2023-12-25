import { Request, Response, NextFunction } from "express";
import * as cheerio from "cheerio";
import axios, { AxiosResponse } from "axios";
import compareArrays from "./LinkCompare";
const URL: string = "https://drudgereport.com";
import Story, { IStory } from "../models/Story";

let anchorsArr: Object[];

export const grabAnchors = async (req: Request) => {
  let anchors: IStory[] = [];
  let linkArr: string[] = [];
  let data = await axios.get(URL).then((response: AxiosResponse) => {
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
      let story = new Story({
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
      let story = new Story({
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
      let story = new Story({
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
      let story = new Story({
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
      let story = new Story({
        link: el,
        addedOn: Date.now(),
        removedOn: 0,
        pageLocation: "column3"
      });
      anchors.push(story);
    });

  let compareBool = compareArrays(linkArr);
  console.log(compareBool);
  console.log(anchors.length);
  // console.log(anchors);
  anchorsArr = [...anchors];
  req.anchorsArr = anchorsArr;
  req.compareBool = compareBool;
};
