import * as express from "express";
const router = express.Router();
const { connectionHandler } = require("../controllers/stories.controller");

router.get("/dr", connectionHandler);

module.exports = router;
