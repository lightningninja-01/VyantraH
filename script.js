// wait for DOM to be ready for safety
document.addEventListener('DOMContentLoaded', () => {
  // elements
  const chatIcon = document.getElementById('chatIcon');
  const chatModal = document.getElementById('chatModal');
  const chatOverlay = document.getElementById('chatOverlay');
  const closeChat = document.getElementById('closeChat');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');

  // helper: safe-check element
  function isEl(el){ return !!el; }

  // open
  function openChat() {
    if(!isEl(chatModal) || !isEl(chatOverlay) || !isEl(chatInput)) return;

    // remove hidden (which has display:none !important)
    chatOverlay.classList.remove('hidden');
    chatModal.classList.remove('hidden');

    // show and animate
    chatOverlay.classList.add('visible');
    chatModal.classList.add('visible');

    // ensure display values for older browsers (just in case)
    chatOverlay.style.display = 'block';
    chatModal.style.display = 'flex';

    // focus input after small delay
    setTimeout(()=> chatInput.focus(), 120);
  }

  // close
  function closeChatWindow() {
    if(!isEl(chatModal) || !isEl(chatOverlay)) return;

    chatModal.classList.remove('visible');
    chatOverlay.classList.remove('visible');

    // after animation, hide completely using hidden class (which uses !important)
    setTimeout(()=> {
      chatModal.style.display = 'none';
      chatOverlay.style.display = 'none';
      chatModal.classList.add('hidden');
      chatOverlay.classList.add('hidden');
    }, 200);
  }

  // append message helper
  function appendMessage(sender, text){
    if(!isEl(chatMessages)) return;
    const d = document.createElement('div');
    d.className = 'msg ' + (sender === 'you' ? 'you' : 'bot');
    d.textContent = text;
    chatMessages.appendChild(d);
    // scroll smoothly
    chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
  }

  // wire events safely
  if(isEl(chatIcon)) chatIcon.addEventListener('click', openChat);
  if(isEl(closeChat)) closeChat.addEventListener('click', closeChatWindow);
  if(isEl(chatOverlay)) chatOverlay.addEventListener('click', closeChatWindow);
  document.addEventListener('keydown', (e)=> { if(e.key === 'Escape') closeChatWindow(); });

  // chat submit (enter or send)
  if(isEl(chatForm)){
    chatForm.addEventListener('submit', (ev)=>{
      ev.preventDefault();
      if(!isEl(chatInput)) return;
      const text = chatInput.value.trim();
      if(!text) return;
      appendMessage('you', text);
      chatInput.value = '';
      // placeholder bot reply
      setTimeout(()=> appendMessage('bot', 'Checking that — AI backend will reply soon.'), 300);
    });
  }

  // Diet plan function (unchanged)
  window.generatePlan = function() {
    let age = document.getElementById("age").value;
    let weight = document.getElementById("weight").value;
    let height = document.getElementById("height").value;
    let activity = parseFloat(document.getElementById("activity").value);
    let resultDiv = document.getElementById("result");

    if (!age || !weight || !height) {
        resultDiv.innerHTML = "<p>Please fill all the details.</p>";
        return;
    }

    let bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    let calories = Math.round(bmr * activity);

    resultDiv.innerHTML = `
        <h3>Your Estimated Calories: ${calories}</h3>
        <p>• Eat simple Indian homemade food.<br>
        • Add 1 fruit daily.<br>
        • Include dal, paneer, eggs or chana for protein.</p>
    `;
  };
});
