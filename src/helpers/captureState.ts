// captureState.ts
import mongoose from "mongoose";

const captureStateSchema = new mongoose.Schema({
  isCapturePending: {
    type: Boolean,
    required: true,
    default: false
  }
});

export const CaptureState = mongoose.model("CaptureState", captureStateSchema);

export async function getCapturePendingState(): Promise<boolean> {
  const state = await CaptureState.findOne();
  console.log("isCapturePending:: " + state);
  return state?.isCapturePending ?? false;
}

export async function setCapturePendingState(value: boolean): Promise<void> {
  await CaptureState.findOneAndUpdate(
    {},
    { isCapturePending: value },
    { upsert: true }
  );
}
