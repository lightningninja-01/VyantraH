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

    setTimeout(() => {
      try { chatInput.focus(); } catch (e) {}
    }, 120);
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
  // PERSONALIZED DIET GENERATOR
  // -------------------------
  // Uses Mifflin-St Jeor BMR formula:
  //   BMR_male   = 10*weight + 6.25*height - 5*age + 5
  //   BMR_female = 10*weight + 6.25*height - 5*age - 161
  //
  // activity multipliers (same as UI): 1.2, 1.375, 1.55, 1.725, 1.9
  // Goals:
  //   - maintain: TDEE (calorie_target = TDEE)
  //   - lose (slow): TDEE - 300
  //   - lose_fast: TDEE - 600
  //   - gain: TDEE + 300
  //
  // Macronutrient strategy (sensible defaults, adjustable later):
  //   - Protein: 1.6 g/kg (active) or 1.2 g/kg (sedentary) — we pick 1.6 if activity >=1.55
  //   - Fat: 25% of calories (min ~0.7 g/kg)
  //   - Carbs: remaining calories
  //
  // Sample Indian meal suggestions are mapped to calorie bands.
  // Disclaimer included in the result for safety.

  window.generatePlan = function () {
    const age = Number(document.getElementById('age')?.value);
    const gender = document.getElementById('gender')?.value || 'male';
    const weight = Number(document.getElementById('weight')?.value);
    const height = Number(document.getElementById('height')?.value);
    const activity = Number(document.getElementById('activity')?.value) || 1.2;
    const goal = document.getElementById('goal')?.value || 'maintain';
    const resultDiv = document.getElementById('result');

    // basic validation
    if (!age || !weight || !height) {
      resultDiv.innerHTML = '<p>Please fill age, weight and height correctly.</p>';
      return;
    }

    // BMR
    let bmr;
    if (gender === 'female') {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    }

    // TDEE
    const tdee = Math.round(bmr * activity);

    // goal adjustments
    let calorieTarget = tdee;
    if (goal === 'lose') calorieTarget = Math.round(tdee - 300);
    if (goal === 'lose_fast') calorieTarget = Math.round(tdee - 600);
    if (goal === 'gain') calorieTarget = Math.round(tdee + 300);

    // macronutrients
    const proteinPerKg = activity >= 1.55 ? 1.6 : 1.2; // g/kg
    const proteinG = Math.max(Math.round(proteinPerKg * weight), Math.round(1.2 * weight));
    const proteinCals = proteinG * 4;

    // fat: 25% calories, but ensure min fat grams ~0.7 g/kg
    const fatCals = Math.round(calorieTarget * 0.25);
    const fatG = Math.max(Math.round(fatCals / 9), Math.round(0.7 * weight));

    // carbs: remainder
    const remainingCals = calorieTarget - (proteinCals + fatG * 9);
    const carbsG = Math.max(Math.round(remainingCals / 4), 0);

    // quick nutrient percentages
    const pctProtein = Math.round((proteinCals / calorieTarget) * 100);
    const pctFat = Math.round((fatG * 9 / calorieTarget) * 100);
    const pctCarb = Math.round((carbsG * 4 / calorieTarget) * 100);

    // meal suggestions based on calorieTarget range
    function sampleMeals(cal) {
      // rough buckets
      if (cal <= 1400) {
        return {
          breakfast: "1 large bowl of poha/upma + 1 boiled egg or 50g paneer",
          mid: "1 small banana + handful roasted chana",
          lunch: "1 medium chapati + 1 cup dal + 1 cup mixed vegetables (homemade) + salad",
          eve: "buttermilk or chaas",
          dinner: "1 medium bowl khichdi or 1 chapati + sabzi",
          notes: "Prefer whole grains, limit fried snacks."
        };
      } else if (cal <= 1800) {
        return {
          breakfast: "2 parathas (light) or 2 slices bread + 1 egg/curd",
          mid: "fruit (apple/banana) + 10 almonds",
          lunch: "2 chapatis + 1 cup dal + veg + small bowl curd",
          eve: "tea (less sugar) + roasted peanuts",
          dinner: "1 cup rice + dal + sabzi or 2 chapatis + paneer sabzi",
          notes: "Add pulses and veggies; watch oil portion."
        };
      } else if (cal <= 2200) {
        return {
          breakfast: "2 stuffed parathas (light) or oats upma + 1 glass milk",
          mid: "fruit + handful peanuts",
          lunch: "2 chapatis + 1 bowl sabzi + 1 bowl rice + dal",
          eve: "sprouts chaat or chana chaat",
          dinner: "1.5 cups rice / 2 chapatis + protein (eggs/paneer/chicken)",
          notes: "Include protein source every meal; add salad."
        };
      } else {
        return {
          breakfast: "Large paratha / poha + 2 eggs or paneer bhurji + milk",
          mid: "nuts + fruit",
          lunch: "3 chapatis + rice + 1 cup dal + sabzi + curd",
          eve: "sprouts / chana + buttermilk",
          dinner: "Rice/roti + protein-heavy dish (dal/paneer/chicken/fish)",
          notes: "Higher carbs for energy; distribute across meals."
        };
      }
    }

    const meals = sampleMeals(calorieTarget);

    // homemade supplement / add-on suggestions (cheap + local)
    const supplements = [];
    supplements.push("Roasted peanuts – affordable, good fats & protein.");
    supplements.push("Ghee in small amounts for energy and taste (homemade).");
    supplements.push("Seasonal fruits (banana, guava, papaya) for fiber & vitamins.");
    supplements.push("Sprouted moong / chana — great protein & cheap.");
    if (calorieTarget < tdee && goal.startsWith('lose')) {
      supplements.push("Green tea (unsweetened) for hydration and mild metabolic boost.");
    } else {
      supplements.push("Roasted chana or peanut chikki for quick calories (homemade).");
    }

    // trainer tips (quick)
    const tips = [];
    tips.push("Eat protein (eggs/dal/paneer) with every main meal.");
    tips.push("Prefer home-cooked meals; control oil portions.");
    tips.push("Hydrate: 2–3L water daily depending on activity.");
    if (activity >= 1.55) tips.push("Increase protein slightly if doing resistance training.");
    if (goal.startsWith('lose')) tips.push("Aim for slow consistent loss (0.25–0.5 kg/week).");

    // build result HTML
    resultDiv.innerHTML = `
      <h3>Personalized Summary</h3>
      <p><strong>BMR:</strong> ${Math.round(bmr)} kcal/day &middot; <strong>TDEE:</strong> ${tdee} kcal/day</p>
      <p><strong>Target Calories (${goal.replace('_',' ')}):</strong> <strong>${calorieTarget}</strong> kcal/day</p>

      <h4>Macronutrients</h4>
      <ul>
        <li>Protein: ${proteinG} g/day (~${pctProtein}% of calories)</li>
        <li>Fat: ${fatG} g/day (~${pctFat}% of calories)</li>
        <li>Carbs: ${carbsG} g/day (~${pctCarb}% of calories)</li>
      </ul>

      <h4>Sample Meal Plan (Indian-style)</h4>
      <p><strong>Breakfast:</strong> ${meals.breakfast}</p>
      <p><strong>Mid:</strong> ${meals.mid}</p>
      <p><strong>Lunch:</strong> ${meals.lunch}</p>
      <p><strong>Evening:</strong> ${meals.eve}</p>
      <p><strong>Dinner:</strong> ${meals.dinner}</p>
      <p style="font-size:.95em;color:#555"><em>${meals.notes}</em></p>

      <h4>Handy Supplements / Add-ons (homemade & cheap)</h4>
      <ul>
        ${supplements.map(s => `<li>${s}</li>`).join('')}
      </ul>

      <h4>Trainer Tips</h4>
      <ul>
        ${tips.map(t => `<li>${t}</li>`).join('')}
      </ul>

      <p style="font-size:0.9em;color:#666;margin-top:10px">
      <strong>Disclaimer:</strong> This is a general guideline only — not medical advice. For health conditions or personalized clinical plans consult a registered dietitian/doctor.
      </p>
    `;

    // small UX: scroll to result
    resultDiv.scrollIntoView({ behavior: 'smooth' });
  };

});
