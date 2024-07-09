// dbUtils.test.ts

import { addNewStories, removeOldStories } from "./dbUtils";
import Story from "../models/Story";
import OldStory from "../models/OldStory";

// Mock the Story and OldStory models
jest.mock("../models/Story");
jest.mock("../models/OldStory");

describe("dbUtils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addNewStories", () => {
    it("should call Story.insertMany with the provided stories", async () => {
      const mockStories = [{ title: "Story 1" }, { title: "Story 2" }];
      await addNewStories(mockStories);

      expect(Story.insertMany).toHaveBeenCalledWith(mockStories, {
        ordered: false
      });
    });

    it("should log an error if Story.insertMany throws", async () => {
      const mockError = new Error("Database error");
      (Story.insertMany as jest.Mock).mockRejectedValue(mockError);

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      await addNewStories([]);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error in addNewStories:",
        mockError
      );
      consoleSpy.mockRestore();
    });
  });

  describe("removeOldStories", () => {
    it("should remove old stories and add them to OldStory collection", async () => {
      const currentLinks = ["link1", "link2"];
      const mockOldStories = [
        {
          _id: "id1",
          link: "oldLink1",
          toObject: jest.fn(() => ({ link: "oldLink1" }))
        },
        {
          _id: "id2",
          link: "oldLink2",
          toObject: jest.fn(() => ({ link: "oldLink2" }))
        }
      ];

      (Story.find as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOldStories)
      });

      (Story.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 2 });

      await removeOldStories(currentLinks);

      expect(Story.find).toHaveBeenCalledWith({ link: { $nin: currentLinks } });
      expect(Story.deleteMany).toHaveBeenCalledWith({
        _id: { $in: ["id1", "id2"] }
      });
      expect(OldStory.insertMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            active: false,
            removedOn: expect.any(Date)
          }),
          expect.objectContaining({
            active: false,
            removedOn: expect.any(Date)
          })
        ]),
        { ordered: false }
      );
    });

    it("should log an error if an exception occurs", async () => {
      const mockError = new Error("Database error");
      (Story.find as jest.Mock).mockRejectedValue(mockError);

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      await removeOldStories([]);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error in removeOldStories:",
        mockError
      );
      consoleSpy.mockRestore();
    });
  });
});
