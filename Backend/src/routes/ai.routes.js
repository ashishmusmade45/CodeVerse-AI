const express = require('express');
const router = express.Router();
const aiController = require("../controller/ai.controller");
const { requireAuth } = require('@clerk/express');

// Notice requireAuth() sits right between the URL path and the controller!
router.post("/get-review", requireAuth(), aiController.getReview);

module.exports = router;
