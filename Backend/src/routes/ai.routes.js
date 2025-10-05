const express = require('express');
const router = express.Router();
const aiController = require("../controller/ai.controller");

router.post("/get-response",aiController.getResponse)

module.exports = router;