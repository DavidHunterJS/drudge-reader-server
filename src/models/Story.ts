import mongoose, { Document, Schema } from "mongoose";
mongoose.set("strictQuery", false);

export interface IStory extends Document {
  link: string;
  addedOn: Date;
  removedOn: Date;
  pageLocation: String;
  active: Boolean;
}

const storySchema = new Schema({
  link: { type: String, required: true, index: true, unique: true },
  addedOn: { type: Date, required: true },
  removedOn: { type: Date, required: true },
  pageLocation: { type: String, required: true },
  active: { type: Boolean, required: true, default: true }
});

export default mongoose.model<IStory>("Story", storySchema);
