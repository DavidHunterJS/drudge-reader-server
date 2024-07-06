// routes/captureRoute.ts
import { Router, Request, Response } from "express";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import path from "path";
import fs from "fs";
import Jimp from "jimp";
import { grabAnchors } from "../helpers/GrabAnchors";
import { setCapturePendingState } from "../helpers/captureState";

puppeteer.use(StealthPlugin());

const router = Router();

let isCapturing = false; // Flag to track if a capture process is already running

router.post("/", async (req: Request, res: Response) => {
  const modifiedLinks: any[] = req.body.modifiedLinks;

  if (!modifiedLinks || modifiedLinks.length === 0) {
    return res
      .status(400)
      .json({ message: "Invalid request, array of documents expected" });
  }

  if (isCapturing) {
    return res
      .status(429)
      .json({ message: "A capture process is already running" });
  }

  isCapturing = true; // Set the flag to indicate a capture process is running

  // Send an immediate response to the client
  res.status(200).json({ message: "Screenshot capture process started" });

  // Start the screenshot capture process
  captureScreenshots(modifiedLinks)
    .catch((error) => {
      console.error("Error capturing screenshots:", error);
    })
    .finally(() => {
      isCapturing = false; // Reset the flag when the capture process is completed
      setCapturePendingState(false);
    });
});

export async function captureScreenshots(modifiedLinks: any[]): Promise<void> {
  console.log("~~~~~~~~~~~~captureScreenshots~~~~~~~~~~~FIRED~~~~~~~~~~~");

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1700, height: 2160 });

  const isDevelopment = process.env.NODE_ENV !== "production";
  const screenshotDir = isDevelopment
    ? path.join(__dirname, "..", "..", "..", "client", "public", "images")
    : "/var/www/html/trippy.wtf/images";
  const existingScreenshots = fs.readdirSync(screenshotDir);

  for (const document of modifiedLinks) {
    let url = "";
    try {
      if (!document.modifiedLink || !document.linkId) {
        console.error(`Missing required properties for document:`, document);
        continue;
      }

      const modifiedLink = document.modifiedLink;
      const hashId = document.linkId;

      // Check if the screenshot already exists
      const screenshotFileName = `${hashId}.png`;
      if (existingScreenshots.includes(screenshotFileName)) {
        console.log(`Screenshot already exists for ${hashId}. Skipping...`);
        continue;
      }

      // Extract the URL from the modifiedLink using a regular expression
      const urlMatch = modifiedLink.match(/href="(.*?)"/);
      if (urlMatch && urlMatch[1]) {
        url = urlMatch[1];
        console.log(url); // CONSOLE.LOOOOOOG
      } else {
        console.error(`Failed to extract URL from modifiedLink:`, modifiedLink);
        continue;
      }

      const imagePath = path.join(screenshotDir, screenshotFileName);

      try {
        await page.goto(url, { timeout: 30000, waitUntil: "networkidle0" });
        await page.screenshot({ path: imagePath, fullPage: false });

        // Resize the screenshot to 10% of its original size using Jimp
        const image = await Jimp.read(imagePath);
        await image
          .resize(
            Math.round(image.getWidth() * 0.1),
            Math.round(image.getHeight() * 0.1)
          )
          .writeAsync(imagePath);
      } catch (navigationError) {
        console.error(`Navigation error for ${url}:`, navigationError);
      }

      // Wait for 5 seconds before capturing the next screenshot
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } catch (error) {
      console.error(`Failed to capture screenshot for ${url}:`, error);
    }
  }
  console.log("~~~~Screenshot Capture Has Finished~~~~~");
  await browser.close();
}

export default router;
