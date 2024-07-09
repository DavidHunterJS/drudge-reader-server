import { Request, Response } from "express";
import XXHash from "xxhashjs";
import axios from "axios";
import { getModifiedLinks } from "./modifiedLinksController";
import { grabAnchors } from "../helpers/GrabAnchors";
import { getCapturePendingState } from "../helpers/captureState";

// Mock the dependencies
jest.mock("xxhashjs");
jest.mock("axios");
jest.mock("../helpers/GrabAnchors");
jest.mock("../helpers/captureState");

describe("getModifiedLinks", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockRequest = {
      body: {
        sortedDocuments: [
          { link: '<a href="http://example.com">Example</a>' },
          { link: '<a href="http://test.com">Test</a>' }
        ]
      }
    };
    mockResponse = {
      json: mockJson
    };

    // Mock XXHash
    (XXHash.h64 as jest.Mock).mockReturnValue({
      toString: jest.fn().mockReturnValue("mockedHash")
    });

    // Mock grabAnchors
    (grabAnchors as jest.Mock).mockResolvedValue({ compareBool: false });

    // Mock getCapturePendingState
    (getCapturePendingState as jest.Mock).mockResolvedValue(false);
  });

  it("should return modified links with correct structure", async () => {
    await getModifiedLinks(mockRequest as Request, mockResponse as Response);

    expect(mockJson).toHaveBeenCalledWith([
      {
        linkId: "mockedHash",
        newLink:
          '<a href="https://trippy.wtf/forum/composer?title=Example" target="_blank" className="new" >📝</a>',
        modifiedLink: '<a target="_blank" href="http://example.com">Example</a>'
      },
      {
        linkId: "mockedHash",
        newLink:
          '<a href="https://trippy.wtf/forum/composer?title=Test" target="_blank" className="new" >📝</a>',
        modifiedLink: '<a target="_blank" href="http://test.com">Test</a>'
      }
    ]);
  });

  it("should call capture route when compareBool is true", async () => {
    (grabAnchors as jest.Mock).mockResolvedValue({ compareBool: true });
    (axios.post as jest.Mock).mockResolvedValue({ data: "Capture successful" });

    await getModifiedLinks(mockRequest as Request, mockResponse as Response);

    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:8000/capture",
      { modifiedLinks: expect.any(Array) },
      { headers: { "Content-Type": "application/json" } }
    );
  });

  it("should call capture route when isCapturePending is true", async () => {
    (getCapturePendingState as jest.Mock).mockResolvedValue(true);
    (axios.post as jest.Mock).mockResolvedValue({ data: "Capture successful" });

    await getModifiedLinks(mockRequest as Request, mockResponse as Response);

    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:8000/capture",
      { modifiedLinks: expect.any(Array) },
      { headers: { "Content-Type": "application/json" } }
    );
  });

  it("should not call capture route when compareBool and isCapturePending are false", async () => {
    await getModifiedLinks(mockRequest as Request, mockResponse as Response);

    expect(axios.post).not.toHaveBeenCalled();
  });

  it("should handle errors gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    (grabAnchors as jest.Mock).mockRejectedValue(new Error("Test error"));

    await getModifiedLinks(mockRequest as Request, mockResponse as Response);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error in getModifiedLinks:",
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });

  it("should handle links without text content", async () => {
    mockRequest.body.sortedDocuments = [
      { link: '<a href="http://empty.com"></a>' }
    ];

    await getModifiedLinks(mockRequest as Request, mockResponse as Response);

    expect(mockJson).toHaveBeenCalledWith([
      {
        linkId: "mockedHash",
        newLink:
          '<a href="https://trippy.wtf/forum/composer?title=" target="_blank" className="new" >📝</a>',
        modifiedLink: '<a target="_blank" href="http://empty.com"></a>'
      }
    ]);
  });
});
