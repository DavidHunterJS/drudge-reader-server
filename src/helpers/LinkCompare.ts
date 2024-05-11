import { removeOldStories } from "./dbUtils";

let savedLinks: Set<string> | undefined;

function arraysAreEqual(arr1: string[], arr2: string[]): boolean {
  return (
    arr1.length === arr2.length &&
    arr1.every((value, index) => value === arr2[index])
  );
}

export function checkLinkChanges(currentLinks: string[]): boolean {
  console.log("Checking for link changes...");

  if (!savedLinks || !arraysAreEqual([...savedLinks], currentLinks)) {
    // When the data changes or on the first run, check for old stories and remove them
    removeOldStories(currentLinks);
    savedLinks = new Set(currentLinks);
    return true;
  }

  return false; // When there are no changes in the data
}
