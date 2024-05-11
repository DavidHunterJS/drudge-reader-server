import Story from "../models/Story";
import OldStory from "../models/OldStory";

export const addNewStories = async (stories: Object[]) => {
  try {
    console.log("addNewStories fired");
    await Story.insertMany(stories, { ordered: false });
  } catch (error) {
    console.error("Error in addNewStories:", error);
    // Log the error instead of throwing
  }
};

export const removeOldStories = async (currentLinks: string[]) => {
  try {
    console.log("removeOldStories fired");

    const oldStoryLinks = await Story.find({
      link: { $nin: currentLinks }
    }).exec();

    const oldStories = oldStoryLinks.map((document) => {
      document.active = false;
      document.removedOn = new Date();
      return new OldStory(document.toObject());
    });

    const deleteResult = await Story.deleteMany({
      _id: { $in: oldStoryLinks.map((doc) => doc._id) }
    });
    console.log("Delete Result", deleteResult);

    await OldStory.insertMany(oldStories, { ordered: false });
  } catch (error) {
    console.error("Error in removeOldStories:", error);
    // Log the error instead of throwing
  }
};
