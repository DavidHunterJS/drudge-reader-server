// webScrapeInterval.test.ts

import webScrapeInterval from "./WebScrapeInterval";
import { grabAnchors } from "./GrabAnchors";
import { addNewStories } from "./dbUtils";

// Mock the dependencies
jest.mock("./GrabAnchors");
jest.mock("./dbUtils");

describe("webScrapeInterval", () => {
  let originalSetInterval: typeof global.setInterval;
  let mockSetInterval: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    originalSetInterval = global.setInterval;
    mockSetInterval = jest.fn((callback, ms) => {
      return originalSetInterval(callback, ms);
    });
    global.setInterval = mockSetInterval as any;

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
    global.setInterval = originalSetInterval;
  });

  it("should set up an interval with the correct time", () => {
    webScrapeInterval();
    expect(mockSetInterval).toHaveBeenCalledWith(expect.any(Function), 20000);
  });

  it("should call grabAnchors on each interval", async () => {
    (grabAnchors as jest.Mock).mockResolvedValue({
      anchorsArr: [],
      compareBool: false
    });

    webScrapeInterval();
    await jest.advanceTimersByTimeAsync(20000);

    expect(grabAnchors).toHaveBeenCalled();
  });

  it("should call addNewStories when compareBool is true", async () => {
    const mockAnchorsArr = [{ link: "https://example.com" }];
    (grabAnchors as jest.Mock).mockResolvedValue({
      anchorsArr: mockAnchorsArr,
      compareBool: true
    });

    webScrapeInterval();
    await jest.advanceTimersByTimeAsync(20000);

    expect(addNewStories).toHaveBeenCalledWith(mockAnchorsArr);
  });

  it("should not call addNewStories when compareBool is false", async () => {
    (grabAnchors as jest.Mock).mockResolvedValue({
      anchorsArr: [],
      compareBool: false
    });

    webScrapeInterval();
    await jest.advanceTimersByTimeAsync(20000);

    expect(addNewStories).not.toHaveBeenCalled();
  });

  it("should continue running the interval", async () => {
    (grabAnchors as jest.Mock).mockResolvedValue({
      anchorsArr: [],
      compareBool: false
    });

    webScrapeInterval();
    await jest.advanceTimersByTimeAsync(20000);
    await jest.advanceTimersByTimeAsync(20000);

    expect(grabAnchors).toHaveBeenCalledTimes(2);
  });
});
