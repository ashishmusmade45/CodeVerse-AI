const express = require('express');
const router = express.Router();
const aiController = require("../controller/ai.controller");
const { requireAuth } = require('@clerk/express');

router.post("/get-review", requireAuth(), aiController.getReview);

router.get("/get-history", requireAuth(), aiController.getHistory);

module.exports = router;
