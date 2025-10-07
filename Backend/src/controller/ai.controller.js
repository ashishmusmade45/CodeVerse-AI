const aiService = require("../services/ai.service");

module.exports.getReview = async (req, res) => {
  try {
    console.log("📩 POST /ai/get-review hit");

    const code = req.body.code;

    if (!code) {
      console.warn("⚠️ No code received in request body");
      return res.status(400).json({ error: "Code is required" });
    }

    console.log("🧠 Sending code to Gemini API...");
    const response = await aiService(code);

    res.status(200).json({ review: response });
  } catch (error) {
    console.error("❌ Error in controller:", error.message);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};
