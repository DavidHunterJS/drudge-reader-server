import * as cheerio from "cheerio";
import axios, { AxiosResponse } from "axios";
import { checkLinkChanges } from "./LinkCompare";
import Story, { IStory } from "../models/Story";

const URL: string = "https://drudgereport.com";

interface ScraperConfig {
  selector: string;
  pageLocation: string;
}

const scraperConfigs: ScraperConfig[] = [
  { selector: "html body tt b tt b center", pageLocation: "headline" },
  { selector: "html body tt b tt b center", pageLocation: "topLeft" },
  { selector: "#dr_dae_BTF_left", pageLocation: "column1" },
  { selector: "#dr_dae_BTF_center", pageLocation: "column2" },
  { selector: "#dr_dae_BTF_right", pageLocation: "column3" }
];

export const grabAnchors = async () => {
  const response: AxiosResponse = await axios.get(URL);
  const $ = cheerio.load(response.data);

  let anchors: IStory[] = [];
  let linkArr: string[] = [];

  scraperConfigs.forEach((config) => {
    const { selector, pageLocation } = config;

    if (pageLocation === "headline") {
      $(selector)
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
    } else {
      $(selector)
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
  console.log(compareBool);
  console.log(anchors.length);

  return { anchorsArr: anchors, compareBool };
};
