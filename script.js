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
        • Add 1 fruit a day.<br>
        • Keep protein sources like dal, paneer, eggs.</p>
    `;
}

function sendMessage() {
    const input = document.getElementById("userInput");
    const chatbox = document.getElementById("chatbox");

    let message = input.value.trim();
    if (!message) return;

    chatbox.innerHTML += `<p><b>You:</b> ${message}</p>`;

    
    let reply = "I’ll answer better once AI backend is added!";
    chatbox.innerHTML += `<p><b>Bot:</b> ${reply}</p>`;

    input.value = "";
    chatbox.scrollTop = chatbox.scrollHeight;
}
