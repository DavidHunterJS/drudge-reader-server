import * as cheerio from "cheerio";
import axios, { AxiosResponse } from "axios";
import { checkLinkChanges } from "./LinkCompare";
import Story, { IStory } from "../models/Story";
import { setCapturePendingState, getCapturePendingState } from "./captureState";

const URL: string = "https://www.drudgereport.com/";

interface ScraperConfig {
  selector: string | cheerio.Cheerio;
  pageLocation: string;
}

function getAllComments($: cheerio.Root) {
  const comments: cheerio.Element[] = [];
  $.root()
    .find("*")
    .contents()
    .each((_, element) => {
      if (element.type === "comment") {
        comments.push(element);
      }
    });
  return comments;
}

export const grabAnchors = async (url: string = URL) => {
  const response: AxiosResponse = await axios.get(url);
  const $ = cheerio.load(response.data);

  const allComments = getAllComments($);
  // console.log("All comments found in the document:");
  // allComments.forEach((comment, index) => {
  //   console.log(`Comment ${index + 1}:`, $(comment).text().trim());
  // });

  const selector1 = $(allComments[7]).next();
  const selector2 = $(allComments[8]).next();
  const selector3 = $(allComments[9]).next();

  const scraperConfigs: ScraperConfig[] = [
    { selector: "#DR-HU-MAIN", pageLocation: "headline" },
    { selector: "#DR-HU-TOP-LEFT", pageLocation: "topLeft" },
    { selector: selector1, pageLocation: "column1" },
    { selector: selector2, pageLocation: "column2" },
    { selector: selector3, pageLocation: "column3" }
  ];

  let anchors: IStory[] = [];
  let linkArr: string[] = [];

  scraperConfigs.forEach((config) => {
    const { selector, pageLocation } = config;

    const $links = pageLocation.startsWith("column")
      ? (selector as cheerio.Cheerio).prevAll().find("a").addBack("a")
      : $(selector as string).find("A");

    $links.each((i, e) => {
      const el = $.html(e);
      linkArr.push(el);
      const story: IStory = new Story({
        link: el,
        addedOn: Date.now(),
        removedOn: 0,
        pageLocation
      });
      anchors.push(story);
    });
  });

  const compareBool = checkLinkChanges(linkArr);

  if (compareBool) {
    console.log("Changes detected, setting isCapturePending to true.");
    await setCapturePendingState(true);
  } else {
    console.log("No changes detected.");
  }
  getCapturePendingState();

  console.log("compareBool is " + compareBool);
  console.log(anchors.length);

  return { anchorsArr: anchors, compareBool };
};
