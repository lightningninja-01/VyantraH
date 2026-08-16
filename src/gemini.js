import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM = `You are VyantraH, a practical Indian nutrition and fitness coach.
Give concise, affordable, realistic guidance. Never diagnose or claim to treat disease.
Respect every stated allergy and diet preference. Do not recommend supplements unless the user asks.
If the user mentions pregnancy, an eating disorder, severe symptoms, medication, diabetes, kidney, liver, or heart disease, recommend consulting a qualified clinician or registered dietitian.
Treat calorie and macro targets supplied by the application as fixed; do not recalculate them.`;

function client() {
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error("GEMINI_API_KEY is not configured. Copy .env.example to .env and add your key.");
    error.status = 503;
    throw error;
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

const mealSchema = {
  type: Type.OBJECT,
  required: ["summary", "meals", "tips", "disclaimer"],
  properties: {
    summary: { type: Type.STRING },
    meals: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ["name", "foods", "calories", "protein", "whyFits"],
        properties: {
          name: { type: Type.STRING },
          foods: { type: Type.STRING },
          calories: { type: Type.INTEGER },
          protein: { type: Type.INTEGER },
          whyFits: { type: Type.STRING }
        }
      }
    },
    tips: { type: Type.ARRAY, items: { type: Type.STRING } },
    disclaimer: { type: Type.STRING }
  }
};

export async function createDietPlan(profile, targets) {
  const prompt = `Create exactly ${profile.meals} meals for this profile.
Profile: ${JSON.stringify(profile)}
Application targets: ${JSON.stringify(targets)}
Meal calories should approximately add up to ${targets.calories} kcal. Use commonly available foods with specific household portions. For each meal, include a short "whyFits" description explaining why this meal fits their target and selected diet, using familiar Indian ingredients. Return only the requested structured data.`;
  const response = await client().models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM,
      responseMimeType: "application/json",
      responseSchema: mealSchema
    }
  });
  return JSON.parse(response.text);
}

export async function replyToCoach(message, history, context) {
  const safeHistory = history
    .filter(item => ["user", "model"].includes(item?.role) && typeof item?.text === "string")
    .map(item => ({ role: item.role, parts: [{ text: item.text.slice(0, 1200) }] }));
  const contents = [
    ...safeHistory,
    { role: "user", parts: [{ text: `${context ? `Current plan context: ${JSON.stringify(context)}\n` : ""}Question: ${message}` }] }
  ];
  const response = await client().models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
    contents,
    config: { systemInstruction: SYSTEM, maxOutputTokens: 500 }
  });
  return response.text;
}

const foodAnalysisSchema = {
  type: Type.OBJECT,
  required: ["foods"],
  properties: {
    foods: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ["name", "displayName", "estimatedPortionG", "confidence"],
        properties: {
          name: { type: Type.STRING, description: "Snake case identifier for mapping, e.g. cooked_rice, dal, paneer, roti, boiled_egg, paratha, chicken_breast, curd" },
          displayName: { type: Type.STRING },
          estimatedPortionG: { type: Type.INTEGER },
          confidence: { type: Type.STRING, enum: ["high", "medium", "low"] }
        }
      }
    }
  }
};

export async function analyzeFoodImage(base64Data, mimeType) {
  const prompt = `Analyze this food image. Identify the distinct dishes or food items shown.
For each item, estimate the portion/serving size in grams based on typical Indian restaurant or home serving sizes.
Assign a confidence rating ('high', 'medium', 'low') based on visibility.
Return only the structured JSON data matching the schema.`;

  const response = await client().models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
    contents: [
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      },
      prompt
    ],
    config: {
      systemInstruction: SYSTEM,
      responseMimeType: "application/json",
      responseSchema: foodAnalysisSchema
    }
  });

  return JSON.parse(response.text);
}


