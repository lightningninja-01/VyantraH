document.addEventListener("DOMContentLoaded", () => {
  const chatIcon = document.getElementById("chatIcon");
  const chatModal = document.getElementById("chatModal");
  const chatOverlay = document.getElementById("chatOverlay");
  const closeChat = document.getElementById("closeChat");
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");
  const chatMessages = document.getElementById("chatMessages");

  function openChat() {
    chatModal.style.display = "flex";
    chatOverlay.classList.remove("hidden");
    chatInput.focus();
  }

  function closeChatWindow() {
    chatModal.style.display = "none";
    chatOverlay.classList.add("hidden");
  }

  chatIcon.addEventListener("click", openChat);
  closeChat.addEventListener("click", closeChatWindow);
  chatOverlay.addEventListener("click", closeChatWindow);

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = chatInput.value.trim();
    if (!value) return;

    addMessage("you", value);
    chatInput.value = "";

    setTimeout(() => {
      addMessage("bot", "Working on your question…");
    }, 400);
  });

  function addMessage(sender, text) {
    const div = document.createElement("div");
    div.className = `msg ${sender}`;
    div.textContent = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Diet plan
  window.generatePlan = function () {
    const age = +document.getElementById("age").value;
    const weight = +document.getElementById("weight").value;
    const height = +document.getElementById("height").value;
    const activity = +document.getElementById("activity").value;

    const result = document.getElementById("result");

    if (!age || !weight || !height) {
      result.innerHTML = "<p>Please fill all fields.</p>";
      return;
    }

    const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    const calories = Math.round(bmr * activity);

    result.innerHTML = `
      <h3>${calories} daily calories</h3>
      <p>Simple homemade plan recommended.</p>
    `;
  };
});
