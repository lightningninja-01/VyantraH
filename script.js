document.addEventListener('DOMContentLoaded', () => {

  const chatIcon = document.getElementById('chatIcon');
  const chatModal = document.getElementById('chatModal');
  const chatOverlay = document.getElementById('chatOverlay');
  const closeChat = document.getElementById('closeChat');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');

  const safeEl = (el) => !!el;

  function openChat() {
    if (!safeEl(chatModal) || !safeEl(chatOverlay) || !safeEl(chatInput) || !safeEl(chatIcon)) return;
    chatOverlay.classList.remove('hidden');
    chatModal.classList.remove('hidden');
    chatOverlay.classList.add('visible');
    chatModal.classList.add('visible');
    chatOverlay.style.display = "block";
    chatModal.style.display = "flex";
    chatOverlay.setAttribute('aria-hidden', 'false');
    chatModal.setAttribute('aria-hidden', 'false');
    chatIcon.setAttribute('aria-expanded', 'true');
    setTimeout(() => { try { chatInput.focus(); } catch (e) {} }, 120);
  }

  function closeChatWindow() {
    if (!safeEl(chatModal) || !safeEl(chatOverlay) || !safeEl(chatIcon)) return;
    chatModal.classList.remove('visible');
    chatOverlay.classList.remove('visible');
    chatOverlay.setAttribute('aria-hidden', 'true');
    chatModal.setAttribute('aria-hidden', 'true');
    chatIcon.setAttribute('aria-expanded', 'false');
    setTimeout(() => {
      chatModal.classList.add('hidden');
      chatOverlay.classList.add('hidden');
      chatModal.style.display = "none";
      chatOverlay.style.display = "none";
      try { chatIcon.focus(); } catch (e) {}
    }, 200);
  }

  function appendMessage(sender, text) {
    if (!safeEl(chatMessages)) return;
    const m = document.createElement('div');
    m.className = `msg ${sender}`;
    m.textContent = text;
    chatMessages.appendChild(m);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  if (safeEl(chatIcon)) chatIcon.addEventListener('click', openChat);
  if (safeEl(closeChat)) closeChat.addEventListener('click', closeChatWindow);
  if (safeEl(chatOverlay)) chatOverlay.addEventListener('click', closeChatWindow);
  document.addEventListener('keydown', e => { if (e.key === "Escape") closeChatWindow(); });

  if (safeEl(chatForm) && safeEl(chatInput)) {
    chatForm.addEventListener('submit', e => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;
      appendMessage('you', text);
      chatInput.value = '';
      setTimeout(() => appendMessage('bot', 'Working on your question…'), 300);
    });
  }

  // -------------------------
  // PERSONALIZED DIET GENERATOR (corrected + debug)
  // -------------------------
  window.generatePlan = function () {
    const ageEl = document.getElementById('age');
    const genderEl = document.getElementById('gender');
    const weightEl = document.getElementById('weight');
    const heightEl = document.getElementById('height');
    const activityEl = document.getElementById('activity');
    const goalEl = document.getElementById('goal');
    const resultDiv = document.getElementById('result');

    if (!ageEl || !weightEl || !heightEl || !resultDiv) {
      console.error("Missing required elements for generatePlan()");
      return;
    }

    // Read values (defensive)
    const age = Number(ageEl.value);
    const weight = Number(weightEl.value);
    const height = Number(heightEl.value);
    const gender = (genderEl?.value || 'male').toLowerCase();
    const activity = Number(activityEl?.value) || 1.2;
    const goal = goalEl?.value || 'maintain';

    // Debug info (open DevTools Console to inspect)
    console.log("generatePlan inputs:", { age, weight, height, gender, activity, goal });

    // Validation
    if (!age || age < 10 || age > 120) {
      resultDiv.innerHTML = "<p>Please enter a valid age (10–120).</p>";
      return;
    }
    if (!weight || weight < 20 || weight > 700) {
      resultDiv.innerHTML = "<p>Please enter a valid weight in kg (20–700).</p>";
      return;
    }
    if (!height || height < 80 || height > 300) {
      resultDiv.innerHTML = "<p>Please enter a valid height in cm (80–300).</p>";
      return;
    }

    // BMR (Mifflin-St Jeor) — correct formulas
    let bmr;
    if (gender === 'female' || gender === 'f') {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    }

    // Defensive: ensure bmr is sane
    if (Number.isNaN(bmr) || !isFinite(bmr)) {
      resultDiv.innerHTML = "<p>Calculation error — please check inputs.</p>";
      console.error("BMR NaN or infinite:", bmr);
      return;
    }

    const tdee = Math.round(bmr * activity);

    // Goals adjustments (safe)
    let calorieTarget = tdee;
    if (goal === 'lose') calorieTarget = Math.round(tdee - 300);
    else if (goal === 'lose_fast') calorieTarget = Math.round(tdee - 600);
    else if (goal === 'gain') calorieTarget = Math.round(tdee + 300);

    // Macronutrients (same approach as before)
    const proteinPerKg = activity >= 1.55 ? 1.6 : 1.2;
    const proteinG = Math.max(Math.round(proteinPerKg * weight), Math.round(1.2 * weight));
    const proteinCals = proteinG * 4;

    const fatCals = Math.round(calorieTarget * 0.25);
    const fatG = Math.max(Math.round(fatCals / 9), Math.round(0.7 * weight));

    const remainingCals = calorieTarget - (proteinCals + fatG * 9);
    const carbsG = Math.max(Math.round(remainingCals / 4), 0);

    const pctProtein = Math.round((proteinCals / calorieTarget) * 100);
    const pctFat = Math.round((fatG * 9 / calorieTarget) * 100);
    const pctCarb = Math.round((carbsG * 4 / calorieTarget) * 100);

    // Meal suggestions (same buckets)
    function sampleMeals(cal) {
      if (cal <= 1400) {
        return {
          breakfast: "1 bowl poha/upma + 1 boiled egg or 50g paneer",
          mid: "1 small banana + handful roasted chana",
          lunch: "1 chapati + 1 cup dal + 1 cup mixed veg + salad",
          eve: "buttermilk",
          dinner: "1 bowl khichdi or 1 chapati + sabzi",
          notes: "Prefer whole grains, limit fried snacks."
        };
      } else if (cal <= 1800) {
        return {
          breakfast: "2 light parathas or 2 slices bread + curd/egg",
          mid: "fruit + 10 almonds",
          lunch: "2 chapatis + dal + veg + small curd",
          eve: "tea (less sugar) + roasted peanuts",
          dinner: "1 cup rice + dal + sabzi or 2 chapatis + paneer sabzi",
          notes: "Control oil, include pulses."
        };
      } else if (cal <= 2200) {
        return {
          breakfast: "2 parathas or oats upma + 1 glass milk",
          mid: "fruit + peanuts",
          lunch: "2 chapatis + sabzi + rice + dal",
          eve: "sprouts chaat",
          dinner: "1.5 cups rice or 2 chapatis + protein (eggs/paneer)",
          notes: "Include protein every meal; add salad."
        };
      } else {
        return {
          breakfast: "Large paratha/poha + 2 eggs/paneer + milk",
          mid: "nuts + fruit",
          lunch: "3 chapatis + rice + dal + sabzi + curd",
          eve: "sprouts / chana + buttermilk",
          dinner: "Rice/roti + protein-heavy dish",
          notes: "Higher carbs; distribute across meals."
        };
      }
    }

    const meals = sampleMeals(calorieTarget);

    // supplements & tips
    const supplements = [];
    supplements.push("Roasted peanuts — good fats & protein.");
    supplements.push("Seasonal fruits for fiber & vitamins.");
    supplements.push("Sprouted moong/chana — cheap protein.");
    if (calorieTarget < tdee && goal.startsWith('lose')) supplements.push("Green tea (unsweetened) if desired.");
    else supplements.push("Roasted chana / peanut chikki for quick calories (homemade).");

    const tips = [
      "Eat protein (eggs/dal/paneer) every main meal.",
      "Prefer home-cooked food and control oil portion.",
      "Hydrate well (2–3L depending on activity)."
    ];
    if (activity >= 1.55) tips.push("If doing resistance training, increase protein slightly.");

    // Render result
    resultDiv.innerHTML = `
      <h3>Your Estimated Calories: ${calorieTarget.toLocaleString()}</h3>
      <p><strong>BMR:</strong> ${Math.round(bmr)} kcal/day &middot; <strong>TDEE:</strong> ${tdee} kcal/day</p>

      <h4>Macronutrients</h4>
      <ul>
        <li>Protein: ${proteinG} g/day (~${pctProtein}% of calories)</li>
        <li>Fat: ${fatG} g/day (~${pctFat}% of calories)</li>
        <li>Carbs: ${carbsG} g/day (~${pctCarb}% of calories)</li>
      </ul>

      <h4>Sample Meal Plan</h4>
      <p><strong>Breakfast:</strong> ${meals.breakfast}</p>
      <p><strong>Mid:</strong> ${meals.mid}</p>
      <p><strong>Lunch:</strong> ${meals.lunch}</p>
      <p><strong>Evening:</strong> ${meals.eve}</p>
      <p><strong>Dinner:</strong> ${meals.dinner}</p>
      <p style="font-size:.95em;color:#555"><em>${meals.notes}</em></p>

      <h4>Homemade Add-ons</h4>
      <ul>
        ${supplements.map(s => `<li>${s}</li>`).join('')}
      </ul>

      <h4>Trainer Tips</h4>
      <ul>${tips.map(t => `<li>${t}</li>`).join('')}</ul>

      <p style="font-size:0.9em;color:#666;margin-top:8px"><strong>Disclaimer:</strong> This is general guidance, not medical advice. Consult a professional for medical conditions.</p>
    `;

    // scroll into view
    resultDiv.scrollIntoView({ behavior: 'smooth' });

    // debug log final numbers
    console.log("generatePlan result:", { bmr: Math.round(bmr), tdee, calorieTarget, proteinG, fatG, carbsG });
  };

});
