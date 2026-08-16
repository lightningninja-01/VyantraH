import "dotenv/config";
import express from "express";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { calculateTargets, validateProfile, getMacroRecommendations, analyzeMealComposition } from "./src/diet.js";
import { createDietPlan, replyToCoach, analyzeFoodImage } from "./src/gemini.js";

const app = express();
const port = Number(process.env.PORT) || 3000;
const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "public");

app.use(express.json({ limit: "10mb" }));
app.use(express.static(publicDir));

app.post("/api/macro-recommendations", (req, res) => {
  try {
    const { remaining, diet } = req.body || {};
    const recs = getMacroRecommendations(remaining, diet || "balanced");
    res.json({ recommendations: recs });
  } catch (error) {
    console.error("Recommendations error:", error.message);
    res.status(500).json({ error: "Could not generate recommendations." });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, aiConfigured: Boolean(process.env.GEMINI_API_KEY) });
});

app.post("/api/diet-plan", async (req, res) => {
  try {
    const profile = validateProfile(req.body);
    const targets = calculateTargets(profile);
    const plan = await createDietPlan(profile, targets);
    res.json({ profile, targets, plan });
  } catch (error) {
    const status = error.status || 500;
    console.error("Diet plan error:", error.message);
    res.status(status).json({ error: status === 500 ? "Could not generate your plan right now." : error.message });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const message = String(req.body?.message || "").trim();
    if (!message || message.length > 1200) {
      return res.status(400).json({ error: "Enter a message between 1 and 1,200 characters." });
    }
    const history = Array.isArray(req.body.history) ? req.body.history.slice(-10) : [];
    const answer = await replyToCoach(message, history, req.body.context || null);
    res.json({ answer });
  } catch (error) {
    console.error("Coach error:", error.message);
    res.status(500).json({ error: "The coach is unavailable right now." });
  }
});

app.post("/api/food-scan", async (req, res) => {
  try {
    let { image, mimeType, diet } = req.body || {};
    if (!image) {
      return res.status(400).json({ error: "No image data received." });
    }

    if (image.startsWith("data:")) {
      const match = image.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        image = match[2];
      } else {
        return res.status(400).json({ error: "Invalid data URL format." });
      }
    }

    if (!mimeType) {
      mimeType = "image/jpeg";
    }

    const rawResult = await analyzeFoodImage(image, mimeType);
    const processed = analyzeMealComposition(rawResult.foods || [], diet || "balanced");
    res.json(processed);
  } catch (error) {
    console.error("Food scan error:", error.message);
    res.status(500).json({ error: "Could not scan food image." });
  }
});

app.post("/api/meal-analysis", (req, res) => {
  try {
    const { foods, diet } = req.body || {};
    const processed = analyzeMealComposition(foods || [], diet || "balanced");
    res.json(processed);
  } catch (error) {
    console.error("Meal analysis error:", error.message);
    res.status(500).json({ error: "Could not analyze meal composition." });
  }
});

app.listen(port, () => console.log(`VyantraH running at http://localhost:${port}`));
