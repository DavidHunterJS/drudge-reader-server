const express = require("express");
const Story = require("./models/Story");
const router = express.Router();

router.get("/stories", async (req: any, res: any) => {
  const stories = await Story.find();
  res.send(stories);
});

module.exports = router;
