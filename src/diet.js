const activityFactors = new Set([1.2, 1.375, 1.55, 1.725, 1.9]);
const goals = new Set(["lose", "maintain", "gain"]);
const diets = new Set(["balanced", "vegetarian", "vegan", "high-protein"]);

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  throw error;
}

export function validateProfile(input = {}) {
  const profile = {
    age: Number(input.age),
    gender: input.gender === "female" ? "female" : "male",
    weight: Number(input.weight),
    height: Number(input.height),
    activity: Number(input.activity),
    goal: String(input.goal || "maintain"),
    diet: String(input.diet || "balanced"),
    allergies: String(input.allergies || "none").trim().slice(0, 200),
    meals: Math.min(6, Math.max(3, Number(input.meals) || 4))
  };

  if (!Number.isFinite(profile.age) || profile.age < 18 || profile.age > 100) badRequest("Age must be between 18 and 100.");
  if (!Number.isFinite(profile.weight) || profile.weight < 30 || profile.weight > 300) badRequest("Weight must be between 30 and 300 kg.");
  if (!Number.isFinite(profile.height) || profile.height < 120 || profile.height > 250) badRequest("Height must be between 120 and 250 cm.");
  if (!activityFactors.has(profile.activity)) badRequest("Choose a valid activity level.");
  if (!goals.has(profile.goal)) badRequest("Choose a valid goal.");
  if (!diets.has(profile.diet)) badRequest("Choose a valid diet preference.");
  return profile;
}

export function calculateTargets(profile) {
  const offset = profile.gender === "female" ? -161 : 5;
  const bmr = Math.round(10 * profile.weight + 6.25 * profile.height - 5 * profile.age + offset);
  const tdee = Math.round(bmr * profile.activity);
  const adjustment = profile.goal === "lose" ? -350 : profile.goal === "gain" ? 300 : 0;
  // A conservative floor prevents extreme low-calorie output from ordinary inputs.
  const calorieFloor = profile.gender === "female" ? 1200 : 1500;
  const calories = Math.max(calorieFloor, tdee + adjustment);
  const protein = Math.round(profile.weight * (profile.activity >= 1.55 || profile.goal !== "maintain" ? 1.6 : 1.3));
  const fat = Math.max(Math.round(profile.weight * 0.7), Math.round((calories * 0.25) / 9));
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));
  return { bmr, tdee, calories, protein, carbs, fat };
}

// Candidates for Desi macro-completion (Critique #14 & #15)
export const CANDIDATES = [
  { name: "Soya Chunks & Curd Cup", foods: "50g Soya Chunks (boiled) + 150g Low Fat Curd", calories: 265, protein: 33.5, carbs: 25.5, fat: 2.5, veg: true },
  { name: "Roasted Chana & Milk", foods: "50g Roasted Chana + 250ml Double Toned Milk", calories: 298, protein: 17.5, carbs: 40.5, fat: 6.3, veg: true },
  { name: "2 Boiled Eggs & Whole Wheat Toast", foods: "2 Boiled Eggs + 1 Slice Whole Wheat Bread", calories: 230, protein: 15.6, carbs: 14.0, fat: 11.0, veg: false },
  { name: "Paneer Sabzi & Roti", foods: "80g Paneer + 1 Whole Wheat Roti", calories: 316, protein: 17.9, carbs: 26.8, fat: 16.4, veg: true },
  { name: "Sprouts Salad & Curd", foods: "100g Moong Sprouts + 150g Low Fat Curd", calories: 195, protein: 14.5, carbs: 28.0, fat: 2.65, veg: true },
  { name: "Chicken Breast & White Rice", foods: "100g Chicken Breast (grilled) + 100g Cooked Rice", calories: 295, protein: 33.7, carbs: 28.0, fat: 3.9, veg: false },
  { name: "Boiled Eggs & Curd", foods: "2 Boiled Eggs + 150g Low Fat Curd", calories: 246, protein: 20.1, carbs: 10.2, fat: 12.85, veg: false },
  { name: "Soya Chunks Bhurji", foods: "60g Soya Chunks (dry wt cooked)", calories: 210, protein: 31.2, carbs: 19.8, fat: 0.3, veg: true },
  { name: "Roasted Chana", foods: "60g Crunchy Roasted Chana", calories: 216, protein: 12.0, carbs: 34.8, fat: 3.0, veg: true }
];

export function getMacroRecommendations(remaining = {}, dietPreference = "balanced") {
  const isVeg = ["vegetarian", "vegan"].includes(dietPreference);
  const rem = {
    calories: Math.max(0, Number(remaining.calories || 0)),
    protein: Math.max(0, Number(remaining.protein || 0)),
    carbs: Math.max(0, Number(remaining.carbs || 0)),
    fat: Math.max(0, Number(remaining.fat || 0))
  };

  // Filter out non-veg candidates if user is vegetarian
  let filtered = CANDIDATES;
  if (isVeg) {
    filtered = CANDIDATES.filter(c => c.veg === true);
  }

  // Score each candidate against remaining deficits
  const scored = filtered.map(c => {
    let penalty = 0;
    if (c.calories > rem.calories + 100) penalty += (c.calories - rem.calories) * 0.15;
    if (c.protein > rem.protein + 15) penalty += (c.protein - rem.protein) * 0.5;
    if (c.carbs > rem.carbs + 20) penalty += (c.carbs - rem.carbs) * 0.3;
    if (c.fat > rem.fat + 10) penalty += (c.fat - rem.fat) * 0.45;

    const pGapClosed = rem.protein > 0 ? Math.min(1.0, c.protein / rem.protein) : 0;
    const cGapClosed = rem.carbs > 0 ? Math.min(1.0, c.carbs / rem.carbs) : 0;
    const fGapClosed = rem.fat > 0 ? Math.min(1.0, c.fat / rem.fat) : 0;
    const calGapClosed = rem.calories > 0 ? Math.min(1.0, c.calories / rem.calories) : 0;

    // Weight coefficients: Protein has 60% weight, carbs 20%, fat 10%, calories 10%
    const score = (pGapClosed * 0.6 + cGapClosed * 0.2 + fGapClosed * 0.1 + calGapClosed * 0.1) * 100 - penalty;
    return { ...c, score };
  });

  // Sort descending by score
  return scored.sort((a, b) => b.score - a.score).slice(0, 3);
}

export const NUTRITION_DATABASE = {
  "cooked_rice": { name: "Cooked White Rice", category: "carbs", servingSize: 100, calories: 130, protein: 2.7, carbs: 28.0, fat: 0.3 },
  "dal": { name: "Cooked Yellow Dal", category: "protein", servingSize: 150, calories: 120, protein: 7.0, carbs: 20.0, fat: 2.0 },
  "paneer": { name: "Paneer", category: "protein", servingSize: 100, calories: 265, protein: 18.0, carbs: 6.0, fat: 20.0 },
  "roti": { name: "Whole Wheat Roti", category: "carbs", servingSize: 40, calories: 104, protein: 3.5, carbs: 22.0, fat: 0.4 },
  "boiled_egg": { name: "Boiled Egg", category: "protein", servingSize: 50, calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3 },
  "soya_chunks": { name: "Soya Chunks", category: "protein", servingSize: 100, calories: 345, protein: 52.0, carbs: 33.0, fat: 0.5 },
  "roasted_chana": { name: "Roasted Chana", category: "protein", servingSize: 100, calories: 360, protein: 20.0, carbs: 58.0, fat: 5.0 },
  "sprouts": { name: "Moong Sprouts", category: "protein", servingSize: 100, calories: 105, protein: 7.0, carbs: 19.0, fat: 0.4 },
  "chicken_breast": { name: "Chicken Breast", category: "protein", servingSize: 100, calories: 165, protein: 31.0, carbs: 0.0, fat: 3.6 },
  "curd": { name: "Low Fat Curd", category: "protein", servingSize: 100, calories: 60, protein: 5.0, carbs: 6.0, fat: 1.5 },
  "milk": { name: "Double Toned Milk", category: "protein", servingSize: 250, calories: 118, protein: 7.5, carbs: 11.5, fat: 3.8 },
  "banana": { name: "Banana", category: "carbs", servingSize: 100, calories: 89, protein: 1.1, carbs: 23.0, fat: 0.3 },
  "paneer_butter_masala": { name: "Paneer Butter Masala", category: "protein", servingSize: 150, calories: 340, protein: 12.0, carbs: 10.0, fat: 28.0 },
  "chole": { name: "Chole Masala", category: "carbs", servingSize: 150, calories: 220, protein: 8.0, carbs: 32.0, fat: 6.0 },
  "paratha": { name: "Aloo Paratha", category: "carbs", servingSize: 100, calories: 290, protein: 5.0, carbs: 48.0, fat: 9.0 },
  "mixed_veg": { name: "Mixed Vegetable Sabzi", category: "carbs", servingSize: 100, calories: 85, protein: 2.0, carbs: 12.0, fat: 3.5 }
};

export function analyzeMealComposition(scannedFoods = [], dietPreference = "balanced") {
  let totalCal = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  const resolvedFoods = scannedFoods.map(item => {
    let nameKey = String(item.name || "").toLowerCase().replace(/[^a-z0-9_]/g, "_");
    
    let ref = NUTRITION_DATABASE[nameKey];
    if (!ref) {
      const keys = Object.keys(NUTRITION_DATABASE);
      const found = keys.find(k => nameKey.includes(k) || k.includes(nameKey));
      if (found) {
        ref = NUTRITION_DATABASE[found];
      } else if (nameKey.includes("sabzi") || nameKey.includes("vegetable") || nameKey.includes("aloo") || nameKey.includes("bhindi") || nameKey.includes("veg")) {
        ref = NUTRITION_DATABASE["mixed_veg"];
      } else if (nameKey.includes("rice") || nameKey.includes("chawal")) {
        ref = NUTRITION_DATABASE["cooked_rice"];
      } else if (nameKey.includes("dal") || nameKey.includes("sambar") || nameKey.includes("lentil")) {
        ref = NUTRITION_DATABASE["yellow_dal"];
      } else if (nameKey.includes("curd") || nameKey.includes("dahi") || nameKey.includes("yogurt")) {
        ref = NUTRITION_DATABASE["curd"];
      } else if (nameKey.includes("paneer")) {
        ref = NUTRITION_DATABASE["paneer"];
      } else if (nameKey.includes("roti") || nameKey.includes("chapati") || nameKey.includes("phulka")) {
        ref = NUTRITION_DATABASE["roti"];
      } else {
        ref = { name: item.displayName || item.name, servingSize: 100, calories: 150, protein: 4, carbs: 20, fat: 5 };
      }
    }

    const portion = Number(item.estimatedPortionG || 100);
    const scale = portion / ref.servingSize;

    const calories = Math.round(ref.calories * scale);
    const protein = Math.round(ref.protein * scale * 10) / 10;
    const carbs = Math.round(ref.carbs * scale * 10) / 10;
    const fat = Math.round(ref.fat * scale * 10) / 10;

    totalCal += calories;
    totalProtein += protein;
    totalCarbs += carbs;
    totalFat += fat;

    return {
      name: ref.name,
      displayName: item.displayName || ref.name,
      estimatedPortionG: portion,
      calories,
      protein,
      carbs,
      fat,
      confidence: item.confidence || "medium"
    };
  });

  totalProtein = Math.round(totalProtein * 10) / 10;
  totalCarbs = Math.round(totalCarbs * 10) / 10;
  totalFat = Math.round(totalFat * 10) / 10;

  const proteinCal = totalProtein * 4;
  const carbsCal = totalCarbs * 4;
  const fatCal = totalFat * 9;
  const mealCal = proteinCal + carbsCal + fatCal || totalCal || 1;

  const pPct = proteinCal / mealCal;
  const cPct = carbsCal / mealCal;

  let insight = "This meal has a good nutritional balance.";
  let gap = "none";

  if (pPct < 0.20) {
    insight = "This meal is a little low in protein.";
    gap = "protein";
  } else if (cPct > 0.65) {
    insight = "This meal is relatively high in carbohydrates.";
    gap = "carbs";
  }

  const isVeg = ["vegetarian", "vegan"].includes(dietPreference);
  
  const ADDITIONS_POOL = [
    { name: "Low Fat Curd", portion: "150g", calories: 90, protein: 7.5, carbs: 9.0, fat: 2.25, veg: true },
    { name: "2 Boiled Eggs", portion: "2 eggs", calories: 156, protein: 12.6, carbs: 1.2, fat: 10.6, veg: false },
    { name: "Soya Chunks", portion: "40g", calories: 138, protein: 20.8, carbs: 13.2, fat: 0.2, veg: true },
    { name: "Paneer Cubes", portion: "50g", calories: 132, protein: 9.0, carbs: 3.0, fat: 10.0, veg: true },
    { name: "Roasted Chana", portion: "30g", calories: 108, protein: 6.0, carbs: 17.4, fat: 1.5, veg: true }
  ];

  let additions = ADDITIONS_POOL;
  if (isVeg) {
    additions = ADDITIONS_POOL.filter(a => a.veg === true);
  }

  additions = additions.map(a => {
    let score = 0;
    if (gap === "protein") {
      score = (a.protein / a.calories) * 1000;
    } else {
      score = a.protein * 2;
    }
    return { ...a, score };
  });

  additions.sort((a, b) => b.score - a.score);
  if (additions.length > 0) {
    additions[0].isBestFit = true;
  }

  return {
    resolvedFoods,
    mealTotals: { calories: totalCal, protein: totalProtein, carbs: totalCarbs, fat: totalFat },
    insight,
    additions: additions.slice(0, 3)
  };
}


