// routes/screenshotRoute.ts
import { Router, Request, Response } from "express";
import path from "path";

const router = Router();

router.use("/", (req: Request, res: Response) => {
  const screenshotDir = path.join(__dirname, "..", "screenshots");
  res.sendFile(path.join(screenshotDir, req.url));
});

export default router;
