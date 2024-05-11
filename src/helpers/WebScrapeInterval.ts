import { grabAnchors } from "./GrabAnchors";
import { addNewStories } from "./dbUtils";

const webScrapeInterval = () => {
  const intervalTime = 20000; // Set your desired interval time in milliseconds

  const interval = setInterval(async () => {
    console.log(`Interval called`);
    const { anchorsArr, compareBool } = await grabAnchors();
    // Fetch anchors and compare

    if (compareBool) {
      console.log(`compareBool is ${compareBool}`);

      // Add new stories if links have changed
      await addNewStories(anchorsArr);
      console.log(`addNewStories Called From webScrapeInterval`);
    }
  }, intervalTime);
};

export default webScrapeInterval;
