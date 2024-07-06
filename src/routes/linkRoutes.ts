// linkRoutes.ts
import express from "express";
import { checkLinkChanges } from "../helpers/LinkCompare";

const router = express.Router();

router.post("/link-changes", (req, res) => {
  const currentLinks = req.body.currentLinks;
  const hasChanges = checkLinkChanges(currentLinks);
  res.json({ hasChanges });
});

export default router;
