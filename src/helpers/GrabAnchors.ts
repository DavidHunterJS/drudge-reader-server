import * as cheerio from "cheerio";
import axios, { AxiosResponse } from "axios";
import { checkLinkChanges } from "./LinkCompare";
import Story, { IStory } from "../models/Story";
import { setCapturePendingState, getCapturePendingState } from "./captureState";

const URL: string = "https://www.drudgereport.com/";

interface ScraperConfig {
  selector: string | ((cheerioAPI: cheerio.CheerioAPI) => cheerio.Cheerio);
  pageLocation: string;
}

const scraperConfigs: ScraperConfig[] = [
  { selector: "#DR-HU-MAIN", pageLocation: "headline" },
  { selector: "#DR-HU-TOP-LEFT", pageLocation: "topLeft" },
  {
    selector: "ins.adsbygoogle:nth-child(33)",
    pageLocation: "column1"
  },
  {
    selector: "ins.adsbygoogle:nth-child(37)",
    pageLocation: "column2"
  },
  {
    selector: "ins.adsbygoogle:nth-child(36)",
    pageLocation: "column3"
  }
];

function getAllComments($: cheerio.Root) {
  const comments: string[] = [];
  $.root()
    .find("*")
    .contents()
    .each((_, element) => {
      if (element.type === "comment") {
        comments.push($.html(element));
      }
    });
  return comments;
}

export const grabAnchors = async (url: string = URL) => {
  const response: AxiosResponse = await axios.get(url);
  const $ = cheerio.load(response.data);

  const allComments = getAllComments($);
  console.log("All comments found in the document:");
  allComments.forEach((comment, index) => {
    console.log(`Comment ${index + 1}:`, comment);
  });

  let anchors: IStory[] = [];
  let linkArr: string[] = [];

  scraperConfigs.forEach((config) => {
    const { selector, pageLocation } = config;

    if (pageLocation === "headline") {
      $(selector as string)
        .find("A")
        .each((i, e) => {
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
    } else if (pageLocation === "column1") {
      $(selector as string)
        .prevAll()
        .filter("A")
        .each((i, e) => {
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
    } else if (pageLocation === "topLeft") {
      $(selector as string)
        .find("A")
        .each((i, e) => {
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
    } else if (pageLocation === "column2") {
      $(selector as string)
        .prevAll()
        .filter("A")
        .each((i, e) => {
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
    } else if (pageLocation === "column3") {
      $(selector as string)
        .prevAll()
        .filter("A")
        .each((i, e) => {
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
    }
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
