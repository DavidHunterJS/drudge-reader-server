import * as express from "express";
const router = express.Router();
const { connectionHandler } = require("../controllers/storiesController");

router.get("/dr", connectionHandler);

module.exports = router;
