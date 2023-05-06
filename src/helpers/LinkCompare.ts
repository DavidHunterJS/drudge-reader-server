import Story from "../models/Story";
const { removeOldStories } = require("./UpdateDb");
let saved: string[];

// RETURNS FALSE IF NO CHANGES IN DATA
// RETURNS TRUE ON FIRST RUN AND WHEN THERE ARE CHANGES IN DATA
export default (temp: string[]) => {
  console.log(`LinkCompare Fired!`);
  if (saved == undefined) {
    removeOldStories(temp);
    saved = [...temp];
    return true;
  } else {
    if (
      temp.length === saved.length &&
      temp.every((value, index) => value === saved[index])
    ) {
      return false;
    } else {
      // WHEN THE DATA CHANGES CHECK FOR OLD STORIES AND REMOVE THEM
      removeOldStories(temp);
      saved = [...temp];
      return true;
    }
  }
};
