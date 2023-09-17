import mongoose, { Document, Schema, model, Model } from "mongoose";
mongoose.set("strictQuery", false);

export interface IStory extends Document {
  link: string;
  addedOn: Date;
  removedOn: Date;
  pageLocation: string;
  active: boolean;
}

const storySchema = new Schema({
  link: { type: String, required: true, index: true, unique: true },
  addedOn: { type: Date, required: true },
  removedOn: { type: Date, required: true },
  pageLocation: { type: String, required: true },
  active: { type: Boolean, required: true, default: true }
});

const Story: Model<IStory> = model<IStory>("Story", storySchema);
export default Story;
