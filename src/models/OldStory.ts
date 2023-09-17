import mongoose, { Model, Document } from "mongoose";
import { IStory } from "./Story";

export type IOldStory = IStory & Document;

import Story from "./Story";
const OldStoryModel: Model<IOldStory> = mongoose.model<IOldStory>(
  "OldStory",
  Story.schema,
  "old-stories"
);

export default OldStoryModel;
