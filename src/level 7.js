// Go to next question
let correctCount = 0; // number of correct answers
function goToNextQuestion(currentId, nextId) {
  document.getElementById(currentId).style.display = "none";
  document.getElementById(nextId).style.display = "block";
}

// Stopwatch Timer (continuous)
let elapsedTime = 0;
const timerDisplay = document.getElementById("time");

// Backend URL (replace with your actual Render backend URL)
const backendUrl = "https://your-backend.onrender.com/api/save_result";

// Helper to highlight answers
function markAnswer(button, isCorrect, currentId, nextId) {
  const skipQuestions = ["question11", "question12", "question13", "question14", "question15"];
  
  if (skipQuestions.includes(currentId)) {
    if (isCorrect) {
      correctCount++;
    }
  } else {
    if (isCorrect) {
      correctCount++;
      button.classList.add("correct");
    } else {
      button.classList.add("wrong");
    }
  }

  setTimeout(() => {
    goToNextQuestion(currentId, nextId);
    console.log("Correct count:", correctCount);
    console.log("Next question:", nextId);

    if (nextId === 'passed') {
      const username = localStorage.getItem("username");
      console.log("Saving result for user:", username);

      fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          language: "sql",
          score: correctCount,
          time: elapsedTime
        })
      })
      .then(res => res.json())
      .then(data => console.log("Result saved:", data))
      .catch(err => console.error("Error saving result:", err));
    }
  }, 800);
}

// ==================== CORRECT ANSWERS Q1–Q10 ====================
for (let i = 1; i <= 10; i++) {
  const btn = document.getElementById("answer" + i);
  if (btn) {
    const currentQ = "question" + i;
    const nextQ = i === 10 ? "question11" : "question" + (i + 1);
    btn.addEventListener("click", () => markAnswer(btn, true, currentQ, nextQ));
  }
}

// ==================== WRONG ANSWERS ====================
const wrongBtns = document.querySelectorAll("input[id^='wrong']");
wrongBtns.forEach(btn => {
  btn.addEventListener("click", function() {
    const currentQ = this.closest(".question").id;
    const nextQ = "question" + (parseInt(currentQ.replace("question", "")) + 1);
    markAnswer(this, false, currentQ, nextQ);
  });
});

// ==================== DEBUGGING CHALLENGES ====================
let attempts = {};

// Function to check text answers with max 3 tries
function checkTextAnswer(inputId, correctAnswer, currentId, nextId) {
  const userAnswer = document.getElementById(inputId).value.trim().toLowerCase();
  const feedback = document.getElementById("feedback" + inputId.replace("input", ""));
  const correct = correctAnswer.toLowerCase();

  if (!attempts[inputId]) attempts[inputId] = 0;

  if (userAnswer.includes(correct)) {
    feedback.textContent = "✅ Correct! Moving on...✅";
    feedback.style.color = "white";
    attempts[inputId] = 0; // reset counter if correct
    setTimeout(() => {
      document.getElementById(currentId).style.display = "none";
      document.getElementById(nextId).style.display = "block";
    }, 1200);
    markAnswer(this, true, currentId, nextId);
  } else {
    attempts[inputId]++;

    if (attempts[inputId] === 1) {
      feedback.textContent = "❌ Wrong! You have 2 more attempts.";
      feedback.style.color = "red";
    } else if (attempts[inputId] === 2) {
      feedback.textContent = "❌ Wrong! You have 1 more attempt.";
      feedback.style.color = "red";
    } else if (attempts[inputId] >= 3) {
      feedback.textContent = "❌ Wrong 3 times! Moving on to the next question...";
      feedback.style.color = "orange";
      attempts[inputId] = 0;
      setTimeout(() => {
        document.getElementById(currentId).style.display = "none";
        document.getElementById(nextId).style.display = "block";
      }, 1500);
      markAnswer(this, false, currentId, nextId);
    }
  }
}

// ==================== TIMER ====================
const timer = setInterval(() => {
  elapsedTime++;
  timerDisplay.textContent = elapsedTime;
}, 1000);
