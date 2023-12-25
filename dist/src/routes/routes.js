"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stories_controller_1 = require("../controllers/stories.controller");
const router = (0, express_1.Router)();
router.get("/", stories_controller_1.connectionHandler);
exports.default = router;
