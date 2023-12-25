"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dbUtils_1 = require("./dbUtils");
let saved;
// RETURNS FALSE IF NO CHANGES IN DATA
// RETURNS TRUE ON FIRST RUN AND WHEN THERE ARE CHANGES IN DATA
exports.default = (temp) => {
    console.log(`LinkCompare Fired!`);
    if (saved === undefined || !arraysAreEqual(temp, saved)) {
        // WHEN THE DATA CHANGES OR ON FIRST RUN, CHECK FOR OLD STORIES AND REMOVE THEM
        (0, dbUtils_1.removeOldStories)(temp);
        saved = [...temp];
        return true;
    }
    return false; // WHEN THERE ARE NO CHANGES IN THE DATA
};
// Helper function to check if two arrays are equal
function arraysAreEqual(arr1, arr2) {
    return (arr1.length === arr2.length &&
        arr1.every((value, index) => value === arr2[index]));
}
