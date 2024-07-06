// modifiedLinksController.ts
import { Request, Response } from "express";
import XXHash from "xxhashjs";
import axios from "axios";
import { grabAnchors } from "../helpers/GrabAnchors";
import { getCapturePendingState } from "../helpers/captureState";

export const getModifiedLinks = async (req: Request, res: Response) => {
  const { sortedDocuments } = req.body;

  const modifiedLinks = sortedDocuments.map((document: any) => {
    const modifiedLink = document.link.replace(/<a/g, '<a target="_blank"');

    // Extract the text between the <a> tags
    const linkTextMatch = document.link.match(/<a[^>]*>([^<]*)<\/a>/);
    const linkText = linkTextMatch ? linkTextMatch[1] : "";

    // Create the new link with the correct URL format
    const newLink = `<a href="https://trippy.wtf/forum/composer?title=${encodeURIComponent(
      linkText
    )}" target="_blank" className="new" >\u{1F4DD}</a>`;

    // Generate the linkId using xxhashjs
    const linkId = XXHash.h64(modifiedLink, 0xcafebabe).toString(16);

    return { linkId, newLink, modifiedLink };
  });
  res.json(modifiedLinks);

  try {
    const { compareBool } = await grabAnchors();
    const isCapturePending = await getCapturePendingState();

    if (compareBool || isCapturePending) {
      console.log("Calling capture route from modifiedLinksController!!!");

      const captureResponse = await axios.post(
        "http://localhost:8000/capture",
        {
          modifiedLinks
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      console.log("Capture route response:", captureResponse.data);
    } else {
      console.log("No changes detected, capture route not called.");
    }
  } catch (error: any) {
    console.error("Error in getModifiedLinks:", error.data);
  }
};
