import { Request, Response, NextFunction } from "express";
import Story, { IStory } from "../models/Story";

exports.updateDb = async (req: Request, res: Response, nxt: NextFunction) => {
  try {
    console.log("Update DB Fired");

    let stories: Object[] | undefined;
    if (req.anchorsArr) {
      stories = req.anchorsArr;
    } else {
      stories = [];
    }
    //save reqData to DB
    //check if story is no longer on current page but still in DB
    //change document to active: no, and timestamp removed on
    //move document to archive collection
    const result = await Story.insertMany(stories)
      .then((docs) => {
        console.log("Saved Stories");
        // console.log(docs);
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {
    console.log(error);
  }
};

exports.updateDocument = async (saved: string[], temp: string[]) => {
  for (const item of saved) {
    if (!temp.includes(item)) {
      try {
        const document = await Story.findOneAndUpdate(
          { link: item },
          { active: false, removedOn: Date.now() }
        ).exec();
        console.log(document);
      } catch (err) {
        console.error(err);
      }
    }
  }
};
