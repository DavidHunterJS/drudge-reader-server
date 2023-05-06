import { Request, Response, NextFunction } from "express";
import Story from "../models/Story";
import OldStory from "../models/OldStory";

// ADDS ALL THE NEW STORIES TO THE STORIES COLLECTION
exports.addNewStories = async (req: Request, res: Response) => {
  try {
    console.log("addNewStories fired - from addNewStories.");
    let stories: Object[] | undefined;
    if (req.anchorsArr) {
      stories = req.anchorsArr;
    } else {
      stories = [];
    }
    const result = await Story.insertMany(stories, { ordered: false })
      .then((docs) => {
        console.log(`Here are the docs when addNewStories ran ${docs.length}`);
      })
      .catch((error) => {
        console.log("Story insertMany error");
        console.log(error);
      });
    console.log(`This is the result from insertMany ${result}`);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error occurred" });
  }
};

// CHECKS IF STORY IS NO LONGER ON CURRENT PAGE BUT STILL IN DB
exports.removeOldStories = async (temp: string[]) => {
  console.log(`removeOldStories Fired!`);
  // GRAB JUST THE LINKS FROM THE CURRENT STORIES COLLECTION
  const linksObj: Object = await Story.find({}, { link: 1, _id: 0 }).exec();
  const links = Object.values(linksObj).map((o) => o.link);

  let oldStories: Object[] = [];
  // CHECKING FOR LINKS IN THE STORY COLLECTION THAT ARE NOT IN CURRENT PAGE OR TEMP
  for (const item of links) {
    if (!temp.includes(item)) {
      try {
        const document = await Story.findOne({ link: item }).exec();
        if (document) {
          document.active = false;
          document.removedOn = new Date();
          // CREATING A NEW DOCUMENT WITH THE ORIGINAL THAT WAS COPIED TO THE OLDSTORY COLLECTION
          const updatedDocument = await new OldStory(document.toObject());
          oldStories.push(updatedDocument);

          try {
            // REMOVING THE ORIGINAL DOCUMENT THAT WAS COPIED TO THE OLDSTORIES ARRAY
            const result = await Story.deleteOne({
              link: updatedDocument.link
            });
            console.log(` Detele One Result ${result}`);
          } catch (error) {}
        }
      } catch (err) {
        console.error(err);
      }
    }
  }
  try {
    // SAVE ALL THE UPDATED DOCUMENTS TO THE OLDSTORY COLLECTION
    await OldStory.insertMany(oldStories, { ordered: false });
  } catch (error) {
    console.log("OldStory insertMany error");
    console.log(error);
  }
};
