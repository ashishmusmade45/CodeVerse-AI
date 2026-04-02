const aiService = require("../services/ai.service");

module.exports.getReview = async (req, res) => {
  try {
    const code = req.body?.code;
    if (!code) {
      return res.status(400).json({ error: "code is required in request body" });
    }

    const result = await aiService(code);
    if (!result || !result.review) {
      return res.status(500).json({ error: "No review returned from AI" });
    }
    return res.json(result);
  } catch (err) {
    console.error("Controller Error:", err);
    const message =
      err?.message && typeof err.message === "string"
        ? err.message
        : "Internal server error";
    return res.status(500).json({ error: message });
  }
};
