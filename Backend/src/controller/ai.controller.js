const aiService = require("../services/ai.service");
const db = require("../db");
const { clerkClient } = require("@clerk/express"); 

module.exports.getReview = async (req, res) => {
  try {
    const { code, prompt, language } = req.body;
    const { userId } = req.auth(); 

    if (!code) {
      return res.status(400).json({ error: "code is required" });
    }

    const clerkUser = await clerkClient.users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress || "no-email@clerk.com";

    const result = await aiService(code, prompt);
    const reviewText = result.review;

    if (!reviewText) {
      return res.status(500).json({ error: "No review returned from AI" });
    }

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) {
        await db.user.create({
            data: { clerkUserId: userId, email }
        });
    }

    await db.prompt.create({
      data: {
        userId: (await db.user.findUnique({ where: { clerkUserId: userId } })).id,
        promptText: prompt || "Review my code",
        submission: {
          create: { 
            sourceCode: code, 
            language: language || "javascript" 
          }
        },
        aiResponse: {
          create: { reviewText: reviewText }
        }
      }
    });

    return res.json(result);

  } catch (err) {
    console.error("Database or AI Error:", err);
    return res.status(500).json({ 
      error: err?.message || "Internal server error during processing" 
    });
  }
};

module.exports.getHistory = async (req, res) => {
  try {
    const { userId } = req.auth(); 

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return res.json({ history: [] });
    }

    const history = await db.prompt.findMany({
      where: { userId: user.id },
      include: {
        submission: true,
        aiResponse: true,
      },
      orderBy: {
        createdAt: "desc", 
      },
    });

    return res.json({ history });
  } catch (err) {
    console.error("Error fetching history:", err);
    return res.status(500).json({ error: "Failed to fetch your review history" });
  }
};