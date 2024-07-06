const { grabAnchors } = require("./GrabAnchors");
const axios = require("axios");
const { checkLinkChanges } = require("./LinkCompare");
const fs = require("fs");
const path = require("path");

// Rest of the code remains the same

jest.mock("axios");
jest.mock("./LinkCompare");

describe("grabAnchors", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(checkLinkChanges).mockReturnValue(true);
  });

  const testCases = [
    { fileName: "01.html", expectedAnchors: 39 },
    { fileName: "02.html", expectedAnchors: 40 },
    { fileName: "03.html", expectedAnchors: 41 }
  ];

  testCases.forEach(({ fileName, expectedAnchors }) => {
    it(`should scrape ${expectedAnchors} anchors from ${fileName}`, async () => {
      const htmlContent = fs.readFileSync(
        path.join(__dirname, "test_data", fileName),
        "utf-8"
      );
      jest.mocked(axios.get).mockResolvedValue({ data: htmlContent });

      const result = await grabAnchors();

      expect(result.anchorsArr.length).toBe(expectedAnchors);
      expect(result.compareBool).toBe(true);
    });
  });

  it("should handle errors gracefully", async () => {
    jest.mocked(axios.get).mockRejectedValue(new Error("Network error"));

    await expect(grabAnchors()).rejects.toThrow("Network error");
  });
});
