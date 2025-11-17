// elements
const chatIcon = document.getElementById('chatIcon');
const chatModal = document.getElementById('chatModal');
const chatOverlay = document.getElementById('chatOverlay');
const closeChat = document.getElementById('closeChat');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');

// open
function openChat() {
  chatOverlay.classList.add('visible');
  chatModal.classList.add('visible');
  chatOverlay.style.display = 'block';
  chatModal.style.display = 'flex';
  // focus
  setTimeout(()=> chatInput.focus(), 120);
}

// close
function closeChatWindow() {
  chatModal.classList.remove('visible');
  chatOverlay.classList.remove('visible');

  setTimeout(()=> {
    chatModal.style.display = 'none';
    chatOverlay.style.display = 'none';
  }, 200);
}

// event wiring (safe guards if elements missing)
if(chatIcon) chatIcon.addEventListener('click', openChat);
if(closeChat) closeChat.addEventListener('click', closeChatWindow);
if(chatOverlay) chatOverlay.addEventListener('click', closeChatWindow);
document.addEventListener('keydown', (e)=> { if(e.key === 'Escape') closeChatWindow(); });

// append message helper
function appendMessage(sender, text){
  const d = document.createElement('div');
  d.className = 'msg ' + (sender === 'you' ? 'you' : 'bot');
  d.textContent = text;
  chatMessages.appendChild(d);
  chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
}

// form submit (Enter or Send)
if(chatForm){
  chatForm.addEventListener('submit', (ev)=>{
    ev.preventDefault();
    const text = chatInput.value.trim();
    if(!text) return;
    appendMessage('you', text);
    chatInput.value = '';
    // placeholder bot reply
    setTimeout(()=> appendMessage('bot', 'Checking that — AI backend will reply soon.'), 300);
  });
}

// Diet plan code (unchanged)
function generatePlan() {
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
}
