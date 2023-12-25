import { Request, Response } from "express";
import Story, { IStory } from "../models/Story";
import OldStory from "../models/OldStory";
import { log } from "console";

// ADDS ALL THE NEW STORIES TO THE STORIES COLLECTION
export const addNewStories = async (req: Request, res: Response) => {
  try {
    console.log("addNewStories fired - from addNewStories.");

    const stories: IStory[] = (req.anchorsArr as IStory[]) || [];

    const result = await Story.insertMany(stories, { ordered: false }).catch(
      (error) => {
        console.log("The following error is expected after insertMany", error);
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error occurred" });
  }
};

// CHECKS IF STORY IS NO LONGER ON CURRENT WEBPAGE BUT STILL IN DB
// REMOVES STORIES FROM DATABASE THAT ARE NO LONGER ON CURRENT LIVE WEB PAGE
export const removeOldStories = async (temp: string[]) => {
  try {
    console.log("removeOldStories Fired!");

    // Find all documents in Story collection with links not in temp
    const oldStoryLinks = await Story.find({ link: { $nin: temp } }).exec();

    const oldStories = oldStoryLinks.map((document) => {
      document.active = false;
      document.removedOn = new Date();
      return new OldStory(document.toObject());
    });

    // Remove the original documents from Story collection
    const deleteResult = await Story.deleteMany({
      link: { $in: oldStoryLinks.map((doc) => doc.link) }
    });
    console.log("Delete Result", deleteResult);

    // Insert the old documents into OldStory collection
    await OldStory.insertMany(oldStories, { ordered: false });
  } catch (error) {
    console.error("Error in removeOldStories:", error);
  }
};
