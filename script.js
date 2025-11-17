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

function sendMessage() {
    const input = document.getElementById("userInput");
    const chatbox = document.getElementById("chatbox");

    let message = input.value.trim();
    if (!message) return;

    chatbox.innerHTML += `<p><b>You:</b> ${message}</p>`;
    chatbox.innerHTML += `<p><b>Bot:</b> AI response coming soon...</p>`;

    input.value = "";
    chatbox.scrollTop = chatbox.scrollHeight;
}

function toggleChat() {
    const chatWindow = document.getElementById("chatWindow");
    chatWindow.style.display = chatWindow.style.display === "block" ? "none" : "block";
}
