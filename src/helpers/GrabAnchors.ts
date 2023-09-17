import { Request, Response, NextFunction } from "express";
import * as cheerio from "cheerio";
import axios, { AxiosResponse } from "axios";
import compareArrays from "./LinkCompare";
import Story, { IStory } from "../models/Story";
import fs from "fs";

const URL: string = "https://drudgereport.com";

export const grabAnchors = async (req: Request) => {
  try {
    const response: AxiosResponse = await axios.get(URL);
    const data: string = response.data;
    const $ = cheerio.load(data);
    const anchors: IStory[] = [];
    const linkArr: string[] = [];

    const processLink = (el: cheerio.Element, pageLocation: string) => {
      const link = $.html(el);
      linkArr.push(link);
      const story = new Story({
        link,
        addedOn: Date.now(),
        removedOn: 0,
        pageLocation
      });
      anchors.push(story);
    };

    $("html body tt b tt b center A").each((i, e) => {
      processLink(e, "headline");
    });

    $("html body tt b tt b center")
      .prevAll()
      .filter("A")
      .each((i, e) => {
        processLink(e, "topLeft");
      });

    const columns = [
      "#div-gpt-ad-1564685732534-0",
      "#div-gpt-ad-1567201323104-0",
      "#div-gpt-ad-1564685863820-0"
    ];

    columns.forEach((column, index) => {
      $(column)
        .prevAll()
        .filter("A")
        .each((i, e) => {
          processLink(e, `column${index + 1}`);
        });
    });

    const compareBool = compareArrays(linkArr);
    console.log(compareBool);
    console.log(anchors.length);

    req.anchorsArr = anchors;
    req.compareBool = compareBool;
  } catch (error) {
    console.log("Axios Error");
    console.log(error);
  }
};
