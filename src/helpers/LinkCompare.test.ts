// LinkCompare.test.ts

import { checkLinkChanges } from "./LinkCompare";
import { removeOldStories } from "./dbUtils";

// Mock the removeOldStories function
jest.mock("./dbUtils", () => ({
  removeOldStories: jest.fn()
}));

describe("LinkCompare", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the module to clear the savedLinks
    jest.resetModules();
  });

  describe("checkLinkChanges", () => {
    it("should return true and call removeOldStories on first run", () => {
      const currentLinks = ["link1", "link2", "link3"];
      const result = checkLinkChanges(currentLinks);

      expect(result).toBe(true);
      expect(removeOldStories).toHaveBeenCalledWith(currentLinks);
    });

    it("should return false when links are unchanged", () => {
      const currentLinks = ["link1", "link2", "link3"];

      // First call to set the initial state
      checkLinkChanges(currentLinks);

      // Second call with the same links
      const result = checkLinkChanges(currentLinks);

      expect(result).toBe(false);
      expect(removeOldStories).toHaveBeenCalledTimes(1); // Only called on the first run
    });

    it("should return true and call removeOldStories when links change", () => {
      const initialLinks = ["link1", "link2", "link3"];
      const newLinks = ["link1", "link2", "link4"];

      // First call to set the initial state
      checkLinkChanges(initialLinks);

      // Second call with different links
      const result = checkLinkChanges(newLinks);

      expect(result).toBe(true);
      expect(removeOldStories).toHaveBeenCalledTimes(2);
      expect(removeOldStories).toHaveBeenLastCalledWith(newLinks);
    });

    it("should handle empty arrays", () => {
      const result1 = checkLinkChanges([]);
      expect(result1).toBe(true);

      const result2 = checkLinkChanges([]);
      expect(result2).toBe(false);

      expect(removeOldStories).toHaveBeenCalledTimes(1);
      expect(removeOldStories).toHaveBeenCalledWith([]);
    });
  });

  // Test for the internal arraysAreEqual function
  describe("arraysAreEqual (internal function)", () => {
    // We need to extract the arraysAreEqual function to test it
    let arraysAreEqual: (arr1: string[], arr2: string[]) => boolean;

    beforeEach(() => {
      // Extract the function from the module
      const module = jest.requireActual("./LinkCompare");
      arraysAreEqual = module.arraysAreEqual;
    });

    it("should return true for identical arrays", () => {
      expect(arraysAreEqual(["a", "b", "c"], ["a", "b", "c"])).toBe(true);
    });

    it("should return false for arrays with different lengths", () => {
      expect(arraysAreEqual(["a", "b"], ["a", "b", "c"])).toBe(false);
    });

    it("should return false for arrays with same length but different elements", () => {
      expect(arraysAreEqual(["a", "b", "c"], ["a", "b", "d"])).toBe(false);
    });

    it("should return true for empty arrays", () => {
      expect(arraysAreEqual([], [])).toBe(true);
    });
  });
});
