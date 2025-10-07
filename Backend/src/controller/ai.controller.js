const aiService = require("../services/ai.service");

module.exports.getReview = async (req, res) => {
  try {
    const code = req.body?.code;
    if (!code) {
      return res.status(400).json({ error: "code is required in request body" });
    }

    const result = await aiService(code);
    // result should be { review: "..." }
    if (!result || !result.review) {
      return res.status(500).json({ error: "No review returned from AI" });
    }
    return res.json(result);
  } catch (err) {
    console.error("Controller Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
