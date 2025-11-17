document.addEventListener('DOMContentLoaded', () => {

  const chatIcon = document.getElementById('chatIcon');
  const chatModal = document.getElementById('chatModal');
  const chatOverlay = document.getElementById('chatOverlay');
  const closeChat = document.getElementById('closeChat');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');

  function openChat() {
    if (!chatModal || !chatOverlay) return;
    chatOverlay.classList.remove('hidden');
    chatModal.classList.remove('hidden');
    chatOverlay.classList.add('visible');
    chatModal.classList.add('visible');
    chatOverlay.style.display = "block";
    chatModal.style.display = "flex";
    setTimeout(() => chatInput && chatInput.focus(), 120);
  }

  function closeChatWindow() {
    if (!chatModal || !chatOverlay) return;
    chatModal.classList.remove('visible');
    chatOverlay.classList.remove('visible');
    setTimeout(() => {
      chatModal.classList.add('hidden');
      chatOverlay.classList.add('hidden');
      chatModal.style.display = "none";
      chatOverlay.style.display = "none";
    }, 200);
  }

  function appendMessage(sender, text) {
    if (!chatMessages) return;
    const m = document.createElement('div');
    m.className = `msg ${sender}`;
    m.textContent = text;
    chatMessages.appendChild(m);
    chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
  }

  if (chatIcon) chatIcon.addEventListener('click', openChat);
  if (closeChat) closeChat.addEventListener('click', closeChatWindow);
  if (chatOverlay) chatOverlay.addEventListener('click', closeChatWindow);
  document.addEventListener('keydown', e => { if (e.key === "Escape") closeChatWindow(); });

  if (chatForm) {
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
    const age = document.getElementById("age").value;
    const weight = document.getElementById("weight").value;
    const height = document.getElementById("height").value;
    const activity = parseFloat(document.getElementById("activity").value || "1.2");
    const resultDiv = document.getElementById("result");

    if (!age || !weight || !height) {
      resultDiv.innerHTML = "<p>Please fill all the details.</p>";
      return;
    }

    const bmr = 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age) + 5;
    const calories = Math.round(bmr * activity);

    resultDiv.innerHTML = `
      <h3>Your Estimated Calories: ${calories}</h3>
      <p>• Eat homemade Indian food.<br>• Add fruits.<br>• Include dal, paneer, eggs or chana.</p>
    `;
  };

});
