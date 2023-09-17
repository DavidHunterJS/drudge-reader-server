import { removeOldStories } from "./UpdateDb";

let saved: string[] | undefined;

// RETURNS FALSE IF NO CHANGES IN DATA
// RETURNS TRUE ON FIRST RUN AND WHEN THERE ARE CHANGES IN DATA
export default (temp: string[]): boolean => {
  console.log(`LinkCompare Fired!`);

  if (saved === undefined || !arraysAreEqual(temp, saved)) {
    // WHEN THE DATA CHANGES OR ON FIRST RUN, CHECK FOR OLD STORIES AND REMOVE THEM
    removeOldStories(temp);
    saved = [...temp];
    return true;
  }

  return false; // WHEN THERE ARE NO CHANGES IN THE DATA
};

// Helper function to check if two arrays are equal
function arraysAreEqual(arr1: string[], arr2: string[]): boolean {
  return (
    arr1.length === arr2.length &&
    arr1.every((value, index) => value === arr2[index])
  );
}
