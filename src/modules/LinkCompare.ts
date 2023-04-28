import Story from "../models/Story";
const updateDocument = require("./UpdateDb");
let saved: string[];

export default (temp: string[]) => {
  if (saved == undefined) {
    saved = [...temp];
    return true;
  } else {
    if (
      temp.length === saved.length &&
      temp.every((value, index) => value === saved[index])
    ) {
      return false;
    } else {
      updateDocument(saved, temp);
      return true;
    }
  }
};
// RETURNS FALSE IF NO CHANGES IN DATA
// RETURNS TRUE ON FIRST RUN AND WHEN THERE ARE CHANGES IN DATA
