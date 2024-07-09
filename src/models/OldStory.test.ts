// OldStory.test.ts

import mongoose, { Schema, Model } from "mongoose";
import OldStoryModel, { IOldStory } from "./OldStory"; // Adjust the import path as needed

// Mock for Story model
const mockStorySchema = new Schema({
  link: { type: String, required: true, index: true, unique: true },
  addedOn: { type: Date, required: true },
  removedOn: { type: Date, required: true },
  pageLocation: { type: String, required: true },
  active: { type: Boolean, required: true, default: true }
});

const MockStory = mongoose.model("Story", mockStorySchema);

// Mock the Story import
jest.mock("./Story", () => ({
  __esModule: true,
  default: MockStory,
  schema: mockStorySchema
}));

describe("OldStory Model", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost/testdb");
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await OldStoryModel.deleteMany({});
  });

  it("should use the same schema as Story model", () => {
    expect(OldStoryModel.schema).toEqual(mockStorySchema);
  });

  it("should use the correct collection name", () => {
    expect(OldStoryModel.collection.name).toBe("old-stories");
  });

  it("should create and save an old story successfully", async () => {
    const validOldStory = new OldStoryModel({
      link: "https://example.com/old-story",
      addedOn: new Date(),
      removedOn: new Date(),
      pageLocation: "archive",
      active: false
    });

    const savedOldStory = await validOldStory.save();

    expect(savedOldStory._id).toBeDefined();
    expect(savedOldStory.link).toBe(validOldStory.link);
    expect(savedOldStory.addedOn).toEqual(validOldStory.addedOn);
    expect(savedOldStory.removedOn).toEqual(validOldStory.removedOn);
    expect(savedOldStory.pageLocation).toBe(validOldStory.pageLocation);
    expect(savedOldStory.active).toBe(validOldStory.active);
  });

  it("should fail to create an old story without required fields", async () => {
    const invalidOldStory = new OldStoryModel({});
    let error;

    try {
      await invalidOldStory.save();
    } catch (err: any) {
      error = err;
    }

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.link).toBeDefined();
    expect(error.errors.addedOn).toBeDefined();
    expect(error.errors.removedOn).toBeDefined();
    expect(error.errors.pageLocation).toBeDefined();
  });

  it("should not create an old story with a duplicate link", async () => {
    const oldStory1 = new OldStoryModel({
      link: "https://example.com/duplicate-old",
      addedOn: new Date(),
      removedOn: new Date(),
      pageLocation: "archive",
      active: false
    });

    await oldStory1.save();

    const oldStory2 = new OldStoryModel({
      link: "https://example.com/duplicate-old",
      addedOn: new Date(),
      removedOn: new Date(),
      pageLocation: "other-archive",
      active: false
    });

    let error;
    try {
      await oldStory2.save();
    } catch (err: any) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(11000); // MongoDB duplicate key error code
  });
});
