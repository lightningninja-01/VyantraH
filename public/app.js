const state = {
  plan: JSON.parse(localStorage.getItem("vyantrah-plan") || "null"),
  foods: JSON.parse(localStorage.getItem("vyantrah-foods") || "[]"),
  theme: localStorage.getItem("vyantrah-theme") || "light",
  history: []
};

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const views = { dashboard: $("#dashboardView"), planner: $("#plannerView"), tracker: $("#trackerView") };
const titles = { dashboard: "Good food. Clear goals.", planner: "", tracker: "Know what fuels you." };

// Defensive textContent helper to prevent runtime crashes (Critique #29)
function setTextContent(selector, text) {
  const el = $(selector);
  if (el) {
    el.textContent = text;
  }
}

// Initialize Theme
function applyTheme() {
  const isDark = state.theme === "dark";
  document.body.classList.toggle("dark-theme", isDark);
  const toggleBtn = $("#themeToggle");
  if (toggleBtn) {
    toggleBtn.innerHTML = isDark ? "<span>☼</span> Light" : "<span>🌗</span> Dark";
  }
}
applyTheme();

const themeBtn = $("#themeToggle");
if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    state.theme = state.theme === "light" ? "dark" : "light";
    localStorage.setItem("vyantrah-theme", state.theme);
    applyTheme();
  });
}

function navigate(name) {
  Object.entries(views).forEach(([key, node]) => {
    if (node) node.classList.toggle("active", key === name);
  });
  $$(".nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.view === name);
  });
  
  // Hide topbar header titles on Planner tab to avoid visual duplicates (Critique #6)
  const topbarTitleBlock = $(".topbar div");
  if (topbarTitleBlock) {
    if (name === "planner") {
      topbarTitleBlock.style.opacity = "0";
      topbarTitleBlock.style.pointerEvents = "none";
    } else {
      topbarTitleBlock.style.opacity = "1";
      topbarTitleBlock.style.pointerEvents = "auto";
      setTextContent("#pageTitle", titles[name]);
    }
  }

  const sidebar = $(".sidebar");
  if (sidebar) sidebar.classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

$$('[data-view]').forEach(button => button.addEventListener("click", () => navigate(button.dataset.view)));
$$('[data-go]').forEach(button => button.addEventListener("click", () => navigate(button.dataset.go)));

const menuBtn = $("#menuButton");
if (menuBtn) {
  menuBtn.addEventListener("click", () => {
    const sidebar = $(".sidebar");
    if (sidebar) sidebar.classList.toggle("open");
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
}

async function api(url, options = {}) {
  const response = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

// Stepper Wizard Logic (AI Planner)
let currentStep = 1;
function showStep(stepNum) {
  currentStep = stepNum;
  $$(".wizard-step").forEach(step => {
    step.style.display = Number(step.dataset.step) === stepNum ? "block" : "none";
  });
  $$(".step-indicator").forEach(ind => {
    const indStep = Number(ind.dataset.step);
    ind.classList.toggle("active", indStep === stepNum);
    ind.classList.toggle("completed", indStep < stepNum);
  });

  const prevBtn = $("#prevStep");
  if (prevBtn) prevBtn.disabled = stepNum === 1;

  const nextBtn = $("#nextStep");
  const submitBtn = $("#submitPlan");
  if (nextBtn && submitBtn) {
    if (stepNum === 3) {
      nextBtn.style.display = "none";
      submitBtn.style.display = "inline-flex";
    } else {
      nextBtn.style.display = "inline-flex";
      submitBtn.style.display = "none";
    }
  }
}

function validateStep(stepNum) {
  const stepEl = $(`.wizard-step[data-step="${stepNum}"]`);
  if (!stepEl) return true;
  const inputs = stepEl.querySelectorAll("input[required], select[required]");
  for (let input of inputs) {
    if (!input.checkValidity()) {
      input.reportValidity();
      return false;
    }
  }
  return true;
}

const prevBtn = $("#prevStep");
if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    if (currentStep > 1) showStep(currentStep - 1);
  });
}

const nextBtn = $("#nextStep");
if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    if (validateStep(currentStep)) showStep(currentStep + 1);
  });
}

// Chips Group Selector logic (Segmented Controls)
$$(".chip-group button").forEach(btn => {
  btn.addEventListener("click", event => {
    const group = event.currentTarget.closest(".chip-group");
    const name = group.dataset.name;
    const val = event.currentTarget.dataset.value;

    group.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
    event.currentTarget.classList.add("active");

    const hiddenInput = group.parentNode.querySelector(`input[name="${name}"]`);
    if (hiddenInput) {
      hiddenInput.value = val;
      hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });
});

// Live targets calculation in UI
function updateLiveTargets() {
  const form = $("#planForm");
  if (!form) return;
  
  const ageEl = form.querySelector("[name=age]");
  const genderEl = form.querySelector("[name=gender]");
  const weightEl = form.querySelector("[name=weight]");
  const heightEl = form.querySelector("[name=height]");
  const activityEl = form.querySelector("[name=activity]");
  const goalEl = form.querySelector("[name=goal]");

  if (!ageEl || !genderEl || !weightEl || !heightEl || !activityEl || !goalEl) return;

  const age = Number(ageEl.value);
  const gender = genderEl.value;
  const weight = Number(weightEl.value);
  const height = Number(heightEl.value);
  const activity = Number(activityEl.value);
  const goal = goalEl.value;

  if (!age || !weight || !height) return;

  const offset = gender === "female" ? -161 : 5;
  const bmr = Math.round(10 * weight + 6.25 * height - 5 * age + offset);
  const tdee = Math.round(bmr * activity);
  const adjustment = goal === "lose" ? -350 : goal === "gain" ? 300 : 0;
  const calorieFloor = gender === "female" ? 1200 : 1500;
  const calories = Math.max(calorieFloor, tdee + adjustment);

  const protein = Math.round(weight * (activity >= 1.55 || goal !== "maintain" ? 1.6 : 1.3));
  const fat = Math.max(Math.round(weight * 0.7), Math.round((calories * 0.25) / 9));
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));

  setTextContent("#liveCal", calories.toLocaleString());
  setTextContent("#liveProt", `${protein}g`);
  setTextContent("#liveCarbs", `${carbs}g`);
  setTextContent("#liveFat", `${fat}g`);
}

const planForm = $("#planForm");
if (planForm) {
  planForm.addEventListener("input", updateLiveTargets);
  planForm.addEventListener("change", updateLiveTargets);
  updateLiveTargets();
}

// SVG Progress Ring setting helper
function setProgressRing(selector, current, target) {
  const fgCircle = $(selector);
  if (!fgCircle) return;
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  fgCircle.style.strokeDashoffset = 100 - pct;
}

// Macro balance split visualizer (Critique #8)
function updateMacroBalance(proteinG, carbsG, fatG) {
  const pCal = proteinG * 4;
  const cCal = carbsG * 4;
  const fCal = fatG * 9;
  const totalCal = pCal + cCal + fCal;

  const pPct = totalCal > 0 ? Math.round((pCal / totalCal) * 100) : 0;
  const cPct = totalCal > 0 ? Math.round((cCal / totalCal) * 100) : 0;
  const fPct = totalCal > 0 ? Math.round((fCal / totalCal) * 100) : 0;

  const pSeg = $(".p-segment");
  const cSeg = $(".c-segment");
  const fSeg = $(".f-segment");

  if (pSeg && cSeg && fSeg) {
    pSeg.style.width = `${pPct}%`;
    cSeg.style.width = `${cPct}%`;
    fSeg.style.width = `${fPct}%`;
    
    setTextContent("#pctP", pPct);
    setTextContent("#pctC", cPct);
    setTextContent("#pctF", fPct);
  }
}

// Render dynamic elements for Generated Meal Plan
function renderPlan() {
  if (!state.plan) return;
  const { targets, plan } = state.plan;
  
  // Dashboard Hero display update
  setTextContent("#heroCalories", `${targets.calories.toLocaleString()} kcal`);

  // Render Plan detail on Planner workspace
  const planResult = $("#planResult");
  if (planResult) {
    planResult.className = "panel result-panel";
    planResult.innerHTML = `
      <div class="plan-head">
        <p class="eyebrow">PERSONAL PLAN</p>
        <h3>${targets.calories.toLocaleString()} calorie plan</h3>
        <p class="plan-summary">${escapeHtml(plan.summary)}</p>
      </div>
      <div class="plan-targets">
        <div><strong>${targets.protein}g</strong><small>PROTEIN</small></div>
        <div><strong>${targets.carbs}g</strong><small>CARBS</small></div>
        <div><strong>${targets.fat}g</strong><small>FAT</small></div>
        <div><strong>${targets.tdee}</strong><small>TDEE</small></div>
      </div>
      <div class="meal-plan-list">
        ${plan.meals.map((meal, index) => `
          <article class="meal">
            <div class="meal-title">
              <div>
                <h4>🌅 ${escapeHtml(meal.name)}</h4>
                <span>${meal.calories} kcal · ${meal.protein}g protein</span>
              </div>
            </div>
            <p>${escapeHtml(meal.foods)}</p>
            ${meal.whyFits ? `
              <div class="meal-explanation">
                <button type="button" class="explain-btn" data-index="${index}">Why this meal? ▾</button>
                <div class="explain-content" id="explain-${index}" style="display: none;">
                  ${escapeHtml(meal.whyFits)}
                </div>
              </div>
            ` : ''}
            <div class="meal-actions-footer">
              <a class="swap-meal-link" data-meal-index="${index}">Swap meal →</a>
              <button type="button" class="log-meal-btn" data-meal-index="${index}">Log Meal ✓</button>
            </div>
          </article>
        `).join("")}
      </div>
      <div class="tips">
        <h4>Coach notes</h4>
        <ul>
          ${plan.tips.map(tip => `<li>${escapeHtml(tip)}</li>`).join("")}
        </ul>
      </div>
      <p class="disclaimer">${escapeHtml(plan.disclaimer)}</p>
    `;
  }

  // Dynamic "Why this meal?" Toggle
  $$(".explain-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const idx = e.currentTarget.dataset.index;
      const content = $(`#explain-${idx}`);
      if (content) {
        const isHidden = content.style.display === "none";
        content.style.display = isHidden ? "block" : "none";
        e.currentTarget.textContent = isHidden ? "Why this meal? ▴" : "Why this meal? ▾";
      }
    });
  });

  // Action links for meal plan logging
  $$(".log-meal-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const idx = Number(e.currentTarget.dataset.mealIndex);
      logMealFromPlan(idx);
    });
  });

  // Swap meals listener linked to Coach
  $$(".swap-meal-link").forEach(link => {
    link.addEventListener("click", e => {
      const idx = Number(e.currentTarget.dataset.mealIndex);
      const meal = state.plan.plan.meals[idx];
      toggleCoach(true);
      const chatInput = $("#chatInput");
      if (chatInput) {
        chatInput.value = `I'd like to swap the meal "${meal.name}" (${meal.foods}) in my current plan. Can you suggest a healthy alternative?`;
      }
      const chatForm = $("#chatForm");
      if (chatForm) {
        chatForm.dispatchEvent(new Event("submit"));
      }
    });
  });

  renderTracker();
}

function logMealFromPlan(index) {
  if (!state.plan || !state.plan.plan.meals[index]) return;
  const meal = state.plan.plan.meals[index];
  const pCal = meal.protein * 4;
  const remCal = Math.max(0, meal.calories - pCal);
  const carbs = Math.round((remCal * 0.55) / 4);
  const fat = Math.round((remCal * 0.45) / 9);

  state.foods.push({
    name: meal.name.trim(),
    calories: Number(meal.calories),
    protein: Number(meal.protein),
    carbs: Number(carbs),
    fat: Number(fat)
  });
  saveFoods();
  toast(`Logged "${meal.name}" to tracker`);
}

// AI Planner Submit
const plannerForm = $("#planForm");
if (plannerForm) {
  plannerForm.addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = $("#submitPlan");
    const body = Object.fromEntries(new FormData(form));
    
    body.age = Number(body.age);
    body.weight = Number(body.weight);
    body.height = Number(body.height);
    body.meals = Number(body.meals);
    body.activity = Number(body.activity);

    setTextContent("#planError", "");
    if (button) button.textContent = "Creating plan…";
    form.classList.add("loading");
    try {
      state.plan = await api("/api/diet-plan", { method: "POST", body: JSON.stringify(body) });
      localStorage.setItem("vyantrah-plan", JSON.stringify(state.plan));
      renderPlan();
      toast("Your plan is ready!");
    } catch (error) {
      setTextContent("#planError", error.message);
    } finally {
      form.classList.remove("loading");
      if (button) button.innerHTML = "Generate Plan ✦";
      showStep(1); // reset stepper
    }
  });
}

function totals() {
  return state.foods.reduce((sum, food) => ({ calories: sum.calories + food.calories, protein: sum.protein + food.protein, carbs: sum.carbs + food.carbs, fat: sum.fat + food.fat }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

// Rerender tracker and overview stats
function renderTracker() {
  const used = totals();
  const targets = state.plan?.targets || { calories: 2000, protein: 120, carbs: 250, fat: 65 };
  
  const remCalories = Math.max(0, targets.calories - used.calories);
  const completionPct = Math.min(100, Math.round((used.calories / targets.calories) * 100));

  // 1. Update Personalized Sidebar Greeting progress (Critique #12)
  setTextContent("#sidebarProgressText", `Your plan is ${completionPct}% complete today`);

  // 2. Update Dashboard Page Elements (Critique #16)
  setTextContent("#dashCalCount", Math.round(used.calories).toLocaleString());
  setTextContent("#dashCalSub", `/ ${targets.calories.toLocaleString()} kcal`);
  setProgressRing("#balanceRingFg", used.calories, targets.calories);

  // Set macro progress on dashboard Overview card
  setTextContent("#dashTextP", `${Math.round(used.protein)} / ${targets.protein}g`);
  setTextContent("#dashTextC", `${Math.round(used.carbs)} / ${targets.carbs}g`);
  setTextContent("#dashTextF", `${Math.round(used.fat)} / ${targets.fat}g`);
  
  const pBar = $("#dashBarP"); if (pBar) pBar.style.width = `${Math.min(100, (used.protein / targets.protein) * 100)}%`;
  const cBar = $("#dashBarC"); if (cBar) cBar.style.width = `${Math.min(100, (used.carbs / targets.carbs) * 100)}%`;
  const fBar = $("#dashBarF"); if (fBar) fBar.style.width = `${Math.min(100, (used.fat / targets.fat) * 100)}%`;

  // Render macro split bar ratio distribution
  updateMacroBalance(
    used.protein || targets.protein,
    used.carbs || targets.carbs,
    used.fat || targets.fat
  );

  // Render Today's meal recommendations on Dashboard Overview
  const dashMealPlan = $("#dashMealPlan");
  if (dashMealPlan) {
    if (state.plan && state.plan.plan && state.plan.plan.meals) {
      dashMealPlan.innerHTML = state.plan.plan.meals.map((meal, index) => `
        <div class="dash-meal-row">
          <div class="meal-row-details">
            <span class="meal-row-tag">Meal ${index + 1}</span>
            <span class="meal-row-name">${escapeHtml(meal.name)}</span>
            <span class="meal-row-macros">${meal.calories} kcal · ${meal.protein}g P</span>
          </div>
          <button class="meal-row-action" data-meal-index="${index}">Log meal →</button>
        </div>
      `).join("");
      
      $$(".dash-meal-row .meal-row-action").forEach(btn => {
        btn.addEventListener("click", e => {
          const idx = Number(e.currentTarget.dataset.mealIndex);
          logMealFromPlan(idx);
        });
      });
    } else {
      dashMealPlan.innerHTML = `
        <div class="empty-state" style="padding: 20px 0;">
          <p>Build your personalized meal plan to see today's recommendations.</p>
          <button class="primary" data-go="planner" style="margin-top: 12px;">Create Plan</button>
        </div>
      `;
      $$('[data-go]').forEach(button => button.addEventListener("click", () => navigate(button.dataset.go)));
    }
  }

  // 3. Update Macro Tracker Tab Elements (Critique #3 & #4)
  setTextContent("#trackerCalBig", `${Math.round(used.calories).toLocaleString()} / ${targets.calories.toLocaleString()} kcal`);
  setTextContent("#trackerCalDetail", `${Math.round(remCalories).toLocaleString()} kcal remaining`);
  setProgressRing("#trackerCalRing", used.calories, targets.calories);

  // Set line stats for tracker page
  setTextContent("#trackerTextP", `${Math.round(used.protein)} / ${targets.protein}g`);
  setTextContent("#trackerSubP", used.protein >= targets.protein ? "Protein met" : `${Math.round(targets.protein - used.protein)}g remaining`);
  const tBarP = $("#trackerBarP"); if (tBarP) tBarP.style.width = `${Math.min(100, (used.protein / targets.protein) * 100)}%`;

  setTextContent("#trackerTextC", `${Math.round(used.carbs)} / ${targets.carbs}g`);
  setTextContent("#trackerSubC", used.carbs >= targets.carbs ? "Carbs met" : `${Math.round(targets.carbs - used.carbs)}g remaining`);
  const tBarC = $("#trackerBarC"); if (tBarC) tBarC.style.width = `${Math.min(100, (used.carbs / targets.carbs) * 100)}%`;

  setTextContent("#trackerTextF", `${Math.round(used.fat)} / ${targets.fat}g`);
  setTextContent("#trackerSubF", used.fat >= targets.fat ? "Fat met" : `${Math.round(targets.fat - used.fat)}g remaining`);
  const tBarF = $("#trackerBarF"); if (tBarF) tBarF.style.width = `${Math.min(100, (used.fat / targets.fat) * 100)}%`;

  // Render food logs list borderless cards
  const foodLogEl = $("#foodLog");
  if (foodLogEl) {
    foodLogEl.innerHTML = state.foods.length ? state.foods.map((food, index) => `
      <div class="food-item-row">
        <div class="food-item-info">
          <strong>${escapeHtml(food.name)}</strong>
          <p>${food.protein}g P · ${food.carbs}g C · ${food.fat}g F</p>
        </div>
        <div class="food-item-actions">
          <span>${food.calories} kcal</span>
          <button class="delete-food" data-index="${index}" aria-label="Remove ${escapeHtml(food.name)}">×</button>
        </div>
      </div>
    `).join("") : '<div class="empty-state" style="padding: 20px 0;"><p>No food logged today yet.</p></div>';
    
    $$(".delete-food").forEach(button => button.addEventListener("click", () => {
      state.foods.splice(Number(button.dataset.index), 1);
      saveFoods();
    }));
  }

  // Fetch macro suggestions dynamically from backend (Critique #15)
  const dietPref = state.plan?.profile?.diet || "balanced";
  updateRecommendations({
    calories: remCalories,
    protein: Math.max(0, targets.protein - used.protein),
    carbs: Math.max(0, targets.carbs - used.carbs),
    fat: Math.max(0, targets.fat - used.fat)
  }, dietPref);
}

async function updateRecommendations(remaining, diet) {
  try {
    const res = await api("/api/macro-recommendations", {
      method: "POST",
      body: JSON.stringify({ remaining, diet })
    });
    
    const container = $("#macroRecsContainer");
    if (!container) return;

    if (res && res.recommendations && res.recommendations.length > 0) {
      container.innerHTML = `
        <div class="macro-recs-grid-premium">
          ${res.recommendations.map((rec, index) => {
            const emoji = getRecEmoji(rec.name);
            return `
              <div class="rec-card-premium ${rec.isBestFit ? 'best-fit-card' : ''}">
                ${rec.isBestFit ? `<span class="card-best-fit-label">Best Fit</span>` : ''}
                <div class="rec-card-content">
                  <div class="rec-card-header">
                    <div class="rec-card-icon">${emoji}</div>
                    <strong class="rec-card-title">${escapeHtml(rec.name)}</strong>
                  </div>
                  <p class="rec-card-ingredients">${escapeHtml(rec.foods)}</p>
                </div>
                <div class="rec-card-footer">
                  <span class="rec-card-macros">${rec.calories} kcal · ${rec.protein}g protein</span>
                  <button type="button" class="rec-card-add-btn" data-index="${index}">+ Add</button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `;

      container.querySelectorAll(".rec-card-add-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const idx = Number(e.currentTarget.dataset.index);
          const rec = res.recommendations[idx];
          logRecommendation(rec);
        });
      });
    } else {
      container.innerHTML = `<div class="empty-state"><p>All targets met or no deficit remaining today!</p></div>`;
    }
  } catch (err) {
    console.error("Recommendations render error:", err.message);
  }
}

function getRecEmoji(name) {
  const n = name.toLowerCase();
  if (n.includes("soya")) return "🌱";
  if (n.includes("egg")) return "🥚";
  if (n.includes("paneer")) return "🧀";
  if (n.includes("curd") || n.includes("dahi")) return "🥣";
  if (n.includes("chana") || n.includes("nut")) return "🥜";
  if (n.includes("chicken")) return "🍗";
  if (n.includes("milk")) return "🥛";
  if (n.includes("banana")) return "🍌";
  return "🥣";
}

function logRecommendation(rec) {
  const pCal = rec.protein * 4;
  const remCal = Math.max(0, rec.calories - pCal);
  const carbs = Math.round((remCal * 0.55) / 4);
  const fat = Math.round((remCal * 0.45) / 9);

  state.foods.push({
    name: rec.name,
    calories: Number(rec.calories),
    protein: Number(rec.protein),
    carbs: Number(carbs),
    fat: Number(fat)
  });
  saveFoods();
  toast(`Logged "${rec.name}" to tracker`);
}

function saveFoods() {
  localStorage.setItem("vyantrah-foods", JSON.stringify(state.foods));
  renderTracker();
}

const clearLogBtn = $("#clearLog");
if (clearLogBtn) {
  clearLogBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all logged food for today?")) {
      state.foods = [];
      saveFoods();
      toast("Food log cleared.");
    }
  });
}


// Food log manual modal buttons (Critique #3)
const openLogFoodBtn = $("#openLogFoodBtn");
if (openLogFoodBtn) {
  openLogFoodBtn.addEventListener("click", () => {
    const foodLogModal = $("#foodLogModal");
    if (foodLogModal) {
      foodLogModal.style.display = "flex";
      const nameInput = $("#foodForm").querySelector("input[name=name]");
      if (nameInput) nameInput.focus();
    }
  });
}

function hideFoodLogModal() {
  const foodLogModal = $("#foodLogModal");
  if (foodLogModal) foodLogModal.style.display = "none";
}

const closeFoodLogModal = $("#closeFoodLogModal");
if (closeFoodLogModal) closeFoodLogModal.addEventListener("click", hideFoodLogModal);

const cancelFoodLog = $("#cancelFoodLog");
if (cancelFoodLog) cancelFoodLog.addEventListener("click", hideFoodLogModal);

const foodForm = $("#foodForm");
if (foodForm) {
  foodForm.addEventListener("submit", event => {
    event.preventDefault();
    const raw = Object.fromEntries(new FormData(event.currentTarget));
    state.foods.push({
      name: raw.name.trim(),
      calories: Number(raw.calories),
      protein: Number(raw.protein),
      carbs: Number(raw.carbs),
      fat: Number(raw.fat)
    });
    saveFoods();
    event.currentTarget.reset();
    hideFoodLogModal();
    toast("Food added successfully!");
  });
}

// AI Food Scanner frontend integration (Critique #1 & #10 & #19 & #20 & #21)
let scanState = {
  foods: [],
  additions: [],
  activeAddition: null,
  mealTotals: {},
  insight: ""
};

const foodImageInput = $("#foodImageInput");
if (foodImageInput) {
  foodImageInput.addEventListener("change", async event => {
    const file = event.target.files[0];
    if (!file) return;

    toast("Uploading and scanning plate with Gemini...");
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;
      try {
        const diet = state.plan?.profile?.diet || "balanced";
        const res = await api("/api/food-scan", {
          method: "POST",
          body: JSON.stringify({ image: base64Data, mimeType: file.type, diet })
        });

        if (res && res.resolvedFoods && res.resolvedFoods.length > 0) {
          showScanModal(base64Data, res);
        } else {
          toast("No food detected. Try another photo.");
        }
      } catch (err) {
        toast(err.message || "Failed to scan image.");
      } finally {
        event.target.value = ""; // clear selector
      }
    };
    reader.readAsDataURL(file);
  });
}

function showScanModal(imgSrc, res) {
  const previewEl = $("#scannedImagePreview");
  if (previewEl) previewEl.style.backgroundImage = `url(${imgSrc})`;

  scanState.foods = [...res.resolvedFoods];
  scanState.additions = [...res.additions];
  scanState.activeAddition = null;
  scanState.mealTotals = { ...res.mealTotals };
  scanState.insight = res.insight;

  renderScanModalContent();

  const scanModal = $("#scanModal");
  if (scanModal) scanModal.style.display = "flex";
}

function renderScanModalContent() {
  const listEl = $("#scannedItemsList");
  if (listEl) {
    listEl.innerHTML = scanState.foods.map((food, index) => `
      <div class="scan-item-row" data-index="${index}" style="display: flex; flex-direction: column; background: rgba(63, 91, 75, 0.02); padding: var(--space-12); border-radius: var(--radius-small); border: 1px solid var(--borders);">
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <strong style="font-size: 14px; color: var(--deep);">${escapeHtml(food.displayName)}</strong>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button type="button" class="portion-btn sub-portion" data-index="${index}" style="width:28px;height:28px;border-radius:50%;border:1px solid var(--borders);background:var(--card);color:var(--deep);cursor:pointer;font-weight:700;">-</button>
            <span style="font-weight:700;font-size:13px;min-width:40px;text-align:center;color:var(--deep);">${food.estimatedPortionG}g</span>
            <button type="button" class="portion-btn add-portion" data-index="${index}" style="width:28px;height:28px;border-radius:50%;border:1px solid var(--borders);background:var(--card);color:var(--deep);cursor:pointer;font-weight:700;">+</button>
          </div>
        </div>
        <div style="font-size:11.5px;color:var(--muted-text);margin-top:4px;font-weight:500;">
          Estimated: ${food.calories} kcal · ${food.protein}g P · ${food.carbs}g C · ${food.fat}g F
          ${food.confidence === 'low' ? '<span style="color:var(--accent);margin-left:6px;font-weight:700;">⚠️ low confidence</span>' : ''}
        </div>
      </div>
    `).join("");

    // Bind portion button actions
    listEl.querySelectorAll(".sub-portion").forEach(btn => {
      btn.addEventListener("click", e => {
        const idx = Number(e.currentTarget.dataset.index);
        const cur = scanState.foods[idx].estimatedPortionG;
        if (cur > 20) {
          scanState.foods[idx].estimatedPortionG = cur - 20;
          recalculateScan();
        }
      });
    });

    listEl.querySelectorAll(".add-portion").forEach(btn => {
      btn.addEventListener("click", e => {
        const idx = Number(e.currentTarget.dataset.index);
        const cur = scanState.foods[idx].estimatedPortionG;
        scanState.foods[idx].estimatedPortionG = cur + 20;
        recalculateScan();
      });
    });
  }

  // Display Insight
  const insightText = $("#scanInsightText");
  if (insightText) {
    insightText.textContent = scanState.insight;
  }

  // Display Additions as select chips (Critique #22)
  const additionsList = $("#scanMealAdditions");
  if (additionsList) {
    additionsList.innerHTML = scanState.additions.map((add, index) => `
      <button type="button" class="addition-chip" data-index="${index}" style="text-align: left; padding: var(--space-12) var(--space-16); width: 100%; border: 1px solid ${scanState.activeAddition === index ? 'var(--primary)' : 'var(--borders)'}; border-radius: var(--radius-small); background: ${scanState.activeAddition === index ? 'rgba(63, 91, 75, 0.05)' : 'var(--card)'}; cursor: pointer; transition: var(--transition); display: flex; align-items: center; justify-content: space-between; outline: none;">
        <div>
          <strong style="font-size:13.5px;color:var(--deep); display:block; text-align:left;">${escapeHtml(add.name)} (${add.portion})</strong>
          <span style="font-size:11.5px;color:var(--muted-text);margin-top:2px; display:block; text-align:left;">+${add.calories} kcal · +${add.protein}g protein · +${add.carbs}g carbs</span>
        </div>
        ${add.isBestFit ? `<span style="font-size: 9px; font-weight: 700; color: var(--accent); background: rgba(185, 130, 104, 0.1); padding: 2px 6px; border-radius: 4px;">BEST FIT</span>` : ''}
      </button>
    `).join("");

    additionsList.querySelectorAll(".addition-chip").forEach(btn => {
      btn.addEventListener("click", e => {
        const idx = Number(e.currentTarget.dataset.index);
        scanState.activeAddition = scanState.activeAddition === idx ? null : idx;
        renderScanModalContent(); // update active selections list visually
      });
    });
  }

  updatePreviewTotals();
}

async function recalculateScan() {
  try {
    const diet = state.plan?.profile?.diet || "balanced";
    const res = await api("/api/meal-analysis", {
      method: "POST",
      body: JSON.stringify({ foods: scanState.foods, diet })
    });
    scanState.foods = [...res.resolvedFoods];
    scanState.mealTotals = { ...res.mealTotals };
    scanState.insight = res.insight;
    scanState.additions = [...res.additions];
    renderScanModalContent();
  } catch (err) {
    console.error("Recalculate scan error:", err.message);
  }
}

function updatePreviewTotals() {
  let cal = Number(scanState.mealTotals.calories || 0);
  let prot = Number(scanState.mealTotals.protein || 0);
  let carbs = Number(scanState.mealTotals.carbs || 0);
  let fat = Number(scanState.mealTotals.fat || 0);

  if (scanState.activeAddition !== null) {
    const add = scanState.additions[scanState.activeAddition];
    cal += Number(add.calories || 0);
    prot += Number(add.protein || 0);
    carbs += Number(add.carbs || 0);
    fat += Number(add.fat || 0);
  }

  setTextContent("#previewCal", cal.toLocaleString());
  setTextContent("#previewProt", Math.round(prot * 10) / 10);
  setTextContent("#previewCarbs", Math.round(carbs * 10) / 10);
  setTextContent("#previewFat", Math.round(fat * 10) / 10);
}

function hideScanModal() {
  const scanModal = $("#scanModal");
  if (scanModal) scanModal.style.display = "none";
}

const closeScanModal = $("#closeScanModal");
if (closeScanModal) closeScanModal.addEventListener("click", hideScanModal);

const cancelScan = $("#cancelScan");
if (cancelScan) cancelScan.addEventListener("click", hideScanModal);

const confirmScanBtn = $("#confirmScan");
if (confirmScanBtn) {
  confirmScanBtn.addEventListener("click", () => {
    // 1. Log all main foods
    scanState.foods.forEach(food => {
      state.foods.push({
        name: food.displayName,
        calories: Number(food.calories),
        protein: Number(food.protein),
        carbs: Number(food.carbs),
        fat: Number(food.fat)
      });
    });

    // 2. Log addition if selected
    if (scanState.activeAddition !== null) {
      const add = scanState.additions[scanState.activeAddition];
      const pCal = add.protein * 4;
      const remCal = Math.max(0, add.calories - pCal);
      const carbs = Math.round((remCal * 0.55) / 4);
      const fat = Math.round((remCal * 0.45) / 9);

      state.foods.push({
        name: add.name,
        calories: Number(add.calories),
        protein: Number(add.protein),
        carbs: Number(carbs),
        fat: Number(fat)
      });
    }

    saveFoods();
    hideScanModal();
    toast("Meal added successfully!");
  });
}

// Coach panel interaction
function toggleCoach(open) {
  const coachPanel = $("#coachPanel");
  if (coachPanel) {
    coachPanel.classList.toggle("open", open);
    coachPanel.setAttribute("aria-hidden", String(!open));
  }
  const coachOverlay = $("#coachOverlay");
  if (coachOverlay) coachOverlay.hidden = !open;

  if (open) {
    setTimeout(() => {
      const chatInput = $("#chatInput");
      if (chatInput) chatInput.focus();
    }, 200);
  }
}

const openCoachBtn = $("#openCoach");
if (openCoachBtn) openCoachBtn.addEventListener("click", () => toggleCoach(true));

const closeCoachBtn = $("#closeCoach");
if (closeCoachBtn) closeCoachBtn.addEventListener("click", () => toggleCoach(false));

const coachOverlay = $("#coachOverlay");
if (coachOverlay) coachOverlay.addEventListener("click", () => toggleCoach(false));

function addMessage(role, text) {
  const node = document.createElement("div");
  node.className = `message ${role}`;
  node.textContent = text;
  const messagesEl = $("#chatMessages");
  if (messagesEl) {
    messagesEl.append(node);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  return node;
}

const chatForm = $("#chatForm");
if (chatForm) {
  chatForm.addEventListener("submit", async event => {
    event.preventDefault();
    const chatInput = $("#chatInput");
    if (!chatInput) return;
    const message = chatInput.value.trim();
    if (!message) return;
    
    addMessage("user", message);
    chatInput.value = "";
    const pending = addMessage("model", "Thinking…");
    try {
      const result = await api("/api/chat", { method: "POST", body: JSON.stringify({ message, history: state.history, context: state.plan ? { profile: state.plan.profile, targets: state.plan.targets } : null }) });
      pending.textContent = result.answer;
      state.history.push({ role: "user", text: message }, { role: "model", text: result.answer });
      state.history = state.history.slice(-10);
    } catch (error) {
      pending.textContent = error.message;
    }
  });
}

// Coach suggestion chips action
$$(".suggestion-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    const chatInput = $("#chatInput");
    if (chatInput) {
      chatInput.value = chip.textContent;
    }
    const chatForm = $("#chatForm");
    if (chatForm) {
      chatForm.dispatchEvent(new Event("submit"));
    }
  });
});

let toastTimer;
function toast(message) {
  clearTimeout(toastTimer);
  const toastEl = $("#toast");
  if (toastEl) {
    toastEl.textContent = message;
    toastEl.classList.add("show");
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2400);
  }
}

// Start views
renderPlan(); renderTracker();
showStep(1); // Set stepper wizard step to 1 initially
