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

    // show elements
    chatOverlay.classList.remove('hidden');
    chatModal.classList.remove('hidden');

    chatOverlay.classList.add('visible');
    chatModal.classList.add('visible');

    chatOverlay.style.display = "block";
    chatModal.style.display = "flex";

    // accessibility attrs
    chatOverlay.setAttribute('aria-hidden', 'false');
    chatModal.setAttribute('aria-hidden', 'false');
    chatIcon.setAttribute('aria-expanded', 'true');

    // focus input
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

    // wait for CSS transition to finish then hide
    setTimeout(() => {
      chatModal.classList.add('hidden');
      chatOverlay.classList.add('hidden');
      chatModal.style.display = "none";
      chatOverlay.style.display = "none";
      // restore focus to icon
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

  // wire up events safely
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

  // DIET PLAN (basic)
  window.generatePlan = function () {
    const ageEl = document.getElementById("age");
    const weightEl = document.getElementById("weight");
    const heightEl = document.getElementById("height");
    const activityEl = document.getElementById("activity");
    const resultDiv = document.getElementById("result");

    if (!ageEl || !weightEl || !heightEl || !resultDiv) return;

    const age = Number(ageEl.value);
    const weight = Number(weightEl.value);
    const height = Number(heightEl.value);
    const activity = Number(activityEl?.value) || 1.2;

    if (!age || !weight || !height || Number.isNaN(activity)) {
      resultDiv.innerHTML = "<p>Please fill all the details.</p>";
      return;
    }

    const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    const calories = Math.round(bmr * activity);

    resultDiv.innerHTML = `
      <h3>Your Estimated Calories: ${calories}</h3>
      <p>• Eat homemade Indian food.<br>• Add fruits.<br>• Include dal, paneer, eggs or chana.</p>
    `;
  };

});
