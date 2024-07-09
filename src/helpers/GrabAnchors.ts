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
  { selector: "html body tt b tt b center", pageLocation: "headline" },
  { selector: "html body tt b tt b center", pageLocation: "topLeft" },
  {
    selector: ($: cheerio.Root) => {
      let commentElement;
      $("*")
        .contents()
        .each((_, el) => {
          if (el.type === "comment") {
            const normalizedText = $(el).text().replace(/\s+/g, " ").trim();
            console.log("Found comment:", normalizedText);
            if (normalizedText === "L I NKS FI RS T C O LU MN") {
              commentElement = $(el);
              return false; // stop iterating
            }
          }
        });
      console.log("Target comment found:", commentElement != null);
      return commentElement;
    },
    pageLocation: "column1"
  },
  {
    selector: "html body font font center table tbody tr td",
    pageLocation: "column2"
  },
  {
    selector: "html body font font center table tbody tr td tt b hr",
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
      const commentElement = (selector as Function)($);
      console.log("Comment element found:", commentElement != null);
      if (commentElement != null) {
        console.log("Comment text:", commentElement.text());
        const nextElements = commentElement.nextAll();
        console.log("Next elements:", nextElements.length);
        console.log(
          "Next elements types:",
          nextElements.map((_, el) => el.tagName).get()
        );
        const nextAnchors = nextElements.filter("a");
        console.log("Next anchor elements:", nextAnchors.length);

        nextAnchors.each((i: number, e: cheerio.Element) => {
          const el = $.html(e);
          console.log("Found anchor:", el);
          linkArr.push(el);
          const story: IStory = new Story({
            link: el,
            addedOn: Date.now(),
            removedOn: 0,
            pageLocation
          });
          anchors.push(story);
        });
      } else {
        console.log("Comment element not found for column1");
      }
    } else if (pageLocation === "topLeft") {
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
