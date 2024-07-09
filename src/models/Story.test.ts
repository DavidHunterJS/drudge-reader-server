// story.test.ts

import mongoose from "mongoose";
import Story, { IStory } from "./Story"; // Adjust the import path as needed

describe("Story Model", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost/testdb");
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Story.deleteMany({});
  });

  it("should create and save a story successfully", async () => {
    const validStory = new Story({
      link: "https://example.com/story",
      addedOn: new Date(),
      removedOn: new Date(),
      pageLocation: "homepage",
      active: true
    });

    const savedStory = await validStory.save();

    expect(savedStory._id).toBeDefined();
    expect(savedStory.link).toBe(validStory.link);
    expect(savedStory.addedOn).toEqual(validStory.addedOn);
    expect(savedStory.removedOn).toEqual(validStory.removedOn);
    expect(savedStory.pageLocation).toBe(validStory.pageLocation);
    expect(savedStory.active).toBe(validStory.active);
  });

  it("should fail to create a story without required fields", async () => {
    const invalidStory = new Story({});
    let error;

    try {
      await invalidStory.save();
    } catch (err: any) {
      error = err;
    }

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.link).toBeDefined();
    expect(error.errors.addedOn).toBeDefined();
    expect(error.errors.removedOn).toBeDefined();
    expect(error.errors.pageLocation).toBeDefined();
  });

  it("should not create a story with a duplicate link", async () => {
    const story1 = new Story({
      link: "https://example.com/duplicate",
      addedOn: new Date(),
      removedOn: new Date(),
      pageLocation: "homepage",
      active: true
    });

    await story1.save();

    const story2 = new Story({
      link: "https://example.com/duplicate",
      addedOn: new Date(),
      removedOn: new Date(),
      pageLocation: "other",
      active: false
    });

    let error;
    try {
      await story2.save();
    } catch (err: any) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(11000); // MongoDB duplicate key error code
  });

  it("should set active to true by default", async () => {
    const story = new Story({
      link: "https://example.com/default-active",
      addedOn: new Date(),
      removedOn: new Date(),
      pageLocation: "homepage"
    });

    const savedStory = await story.save();
    expect(savedStory.active).toBe(true);
  });

  it("should allow setting active to false", async () => {
    const story = new Story({
      link: "https://example.com/inactive",
      addedOn: new Date(),
      removedOn: new Date(),
      pageLocation: "homepage",
      active: false
    });

    const savedStory = await story.save();
    expect(savedStory.active).toBe(false);
  });

  it("should enforce data types", async () => {
    const invalidStory = new Story({
      link: 123, // Should be a string
      addedOn: "not a date",
      removedOn: "not a date",
      pageLocation: 42, // Should be a string
      active: "not a boolean"
    });

    let error;
    try {
      await invalidStory.validate();
    } catch (err: any) {
      error = err;
    }

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.link).toBeDefined();
    expect(error.errors.addedOn).toBeDefined();
    expect(error.errors.removedOn).toBeDefined();
    expect(error.errors.pageLocation).toBeDefined();
    expect(error.errors.active).toBeDefined();
  });
});
