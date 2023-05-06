import mongoose from "mongoose";
import Story from "./Story";
export default mongoose.model("OldStory", Story.schema, "old-stories");
