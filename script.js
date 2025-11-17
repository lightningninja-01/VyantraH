// Elements
const chatIcon = document.getElementById('chatIcon');
const chatModal = document.getElementById('chatModal');
const chatOverlay = document.getElementById('chatOverlay');
const closeChat = document.getElementById('closeChat');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');

// Toggle modal visibility
function openChat() {
  chatOverlay.classList.add('visible');
  chatModal.classList.add('visible');
  chatOverlay.classList.remove('hidden');
  chatModal.classList.remove('hidden');
  // focus input
  setTimeout(()=> chatInput.focus(), 160);
}
function closeChatWindow() {
  chatOverlay.classList.remove('visible');
  chatModal.classList.remove('visible');
  // after animation hide with hidden class to prevent tab focus
  setTimeout(()=> {
    chatOverlay.classList.add('hidden');
    chatModal.classList.add('hidden');
  }, 180);
}

// attach events
chatIcon.addEventListener('click', openChat);
closeChat.addEventListener('click', closeChatWindow);
chatOverlay.addEventListener('click', closeChatWindow);
document.addEventListener('keydown', (e)=> { if(e.key === 'Escape') closeChatWindow(); });

// chat submit
function submitChat(){
  const text = chatInput.value.trim();
  if(!text) return;
  appendMessage('you', text);
  chatInput.value = '';
  // fake bot response placeholder
  appendMessage('bot', 'Let me check that for you — AI backend will answer this soon.');
  // scroll
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// helper to create message nodes
function appendMessage(who, text){
  const div = document.createElement('div');
  div.className = 'msg ' + (who === 'you' ? 'you':'bot');
  div.textContent = text;
  chatMessages.appendChild(div);
  // smooth scroll
  chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
}

// wire up form
chatForm.addEventListener('submit', (e)=>{ e.preventDefault(); submitChat(); });

// Diet calculator (unchanged, simple)
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

  // BMR (Mifflin-St Jeor) simple
  let bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  let calories = Math.round(bmr * activity);

  resultDiv.innerHTML = `
      <h3>Your Estimated Calories: ${calories}</h3>
      <p>• Eat simple Indian homemade food.<br>
      • Add 1 fruit daily.<br>
      • Include dal, paneer, eggs or chana for protein.</p>
  `;
}
