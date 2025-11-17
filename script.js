document.addEventListener("DOMContentLoaded", () => {
  const chatIcon = document.getElementById("chatIcon");
  const chatModal = document.getElementById("chatModal");
  const chatOverlay = document.getElementById("chatOverlay");
  const closeChat = document.getElementById("closeChat");
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");
  const chatMessages = document.getElementById("chatMessages");

  console.log("VyantraH: script loaded", { chatIcon, chatModal, chatOverlay, closeChat, chatForm, chatInput });

  function showChat() {
    if (!chatModal || !chatOverlay) { console.warn("Missing chat elements"); return; }
    chatOverlay.classList.remove("hidden");
    chatModal.classList.add("visible");
    chatOverlay.classList.add("visible");
    // ensure displayed
    chatOverlay.style.display = "block";
    chatModal.style.display = "flex";
    // focus
    setTimeout(() => {
      if (chatInput) { chatInput.focus(); console.log("chat input focused"); }
    }, 120);
    console.log("Chat opened");
  }

  function hideChat() {
    if (!chatModal || !chatOverlay) { console.warn("Missing chat elements"); return; }
    chatModal.classList.remove("visible");
    chatOverlay.classList.remove("visible");
    // hide after short delay
    setTimeout(() => {
      chatModal.style.display = "none";
      chatOverlay.style.display = "none";
      chatOverlay.classList.add("hidden");
      console.log("Chat closed");
    }, 160);
  }

  if (chatIcon) chatIcon.addEventListener("click", showChat);
  if (closeChat) closeChat.addEventListener("click", hideChat);
  if (chatOverlay) chatOverlay.addEventListener("click", hideChat);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") hideChat(); });

  if (chatForm) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!chatInput) return;
      const text = chatInput.value.trim();
      if (!text) return;
      const div = document.createElement("div");
      div.className = "msg you";
      div.textContent = text;
      chatMessages.appendChild(div);
      chatInput.value = "";
      chatMessages.scrollTop = chatMessages.scrollHeight;
      // placeholder bot reply
      setTimeout(() => {
        const b = document.createElement("div");
        b.className = "msg bot";
        b.textContent = "Working on your question…";
        chatMessages.appendChild(b);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 400);
    });
  }

  // small helper used by form in HTML
  window.generatePlan = function () {
    const age = +document.getElementById("age").value;
    const weight = +document.getElementById("weight").value;
    const height = +document.getElementById("height").value;
    const activity = +document.getElementById("activity").value || 1.2;
    const result = document.getElementById("result");
    if (!age || !weight || !height) { result.innerHTML = "<p>Please fill all fields.</p>"; return; }
    const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    const calories = Math.round(bmr * activity);
    result.innerHTML = `<h3>${calories} daily calories</h3><p>Simple home-cooked suggestions.</p>`;
  };

  console.log("VyantraH: init complete");
});
