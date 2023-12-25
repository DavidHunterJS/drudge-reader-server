import { Router } from "express";

import { connectionHandler } from "../controllers/stories.controller";
const router = Router();
router.get("/", connectionHandler);

export default router;
