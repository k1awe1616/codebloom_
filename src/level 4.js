// Go to next question
let correctCount = 0; // number of correct answers
function goToNextQuestion(currentQuestionId, nextQuestionId) {
  document.getElementById(currentQuestionId).style.display = "none";
  document.getElementById(nextQuestionId).style.display = "block";
}
// Stopwatch Timer (continuous)
let elapsedTime = 0;
const timerDisplay = document.getElementById("time");

// Mark answer with border color

// Helper to highlight answers
function markAnswer(button, isCorrect, currentId, nextId) {
  const skipQuestions = ["question11", "question12", "question13", "question14", "question15"];
  if (skipQuestions.includes(currentId)) {
    if (isCorrect) {
      correctCount++;
      
    } else {
      //do nothing
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
    console.log(correctCount);
    console.log(nextId)
    if (nextId == 'passed') {
      const username = localStorage.getItem("username");
      console.log(correctCount);
      console.log(username);
      fetch("/api/save_result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username:username,
          language: "cpp",
          score: correctCount,
          time: elapsedTime  // 👈 send raw correct answers
        })
      })
        .then(res => res.json())
        .then(data => console.log("Result saved:", data))
        .catch(err => console.log("Error saving result:", err));
    }
  }, 800);
}

// Correct answers
document.getElementById("answer1").onclick = () => markAnswer(document.getElementById("answer1"), true, "question1", "question2");
document.getElementById("answer2").onclick = () => markAnswer(document.getElementById("answer2"), true, "question2", "question3");
document.getElementById("answer3").onclick = () => markAnswer(document.getElementById("answer3"), true, "question3", "question4");
document.getElementById("answer4").onclick = () => markAnswer(document.getElementById("answer4"), true, "question4", "question5");
document.getElementById("answer5").onclick = () => markAnswer(document.getElementById("answer5"), true, "question5", "question6");
document.getElementById("answer6").onclick = () => markAnswer(document.getElementById("answer6"), true, "question6", "question7");
document.getElementById("answer7").onclick = () => markAnswer(document.getElementById("answer7"), true, "question7", "question8");
document.getElementById("answer8").onclick = () => markAnswer(document.getElementById("answer8"), true, "question8", "question9");
document.getElementById("answer9").onclick = () => markAnswer(document.getElementById("answer9"), true, "question9", "question10");
document.getElementById("answer10").onclick = () => markAnswer(document.getElementById("answer10"), true, "question10", "question11");

// Wrong answers (select all inputs with id starting with 'wrong')
let wrongBtns = document.querySelectorAll("input[id^='wrong']");
wrongBtns.forEach(btn => {
  btn.addEventListener("click", function() {
    let currentQ = this.closest(".question").id;
    let nextQ = "question" + (parseInt(currentQ.replace("question", "")) + 1);
    markAnswer(this, false, currentQ, nextQ);
  });
});


// Text-based Debugging (3 tries rule)
let attempts = {};


// Function to check text answers with max 3 tries
function checkTextAnswer(inputId, correctAnswer, currentId, nextId) {
  const userAnswer = document.getElementById(inputId).value.trim().toLowerCase();
  const feedback = document.getElementById("feedback" + inputId.replace("input", ""));
  const correct = correctAnswer.toLowerCase();

  // Initialize attempts counter if not set
  if (!attempts[inputId]) {
    attempts[inputId] = 0;
  }

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
      attempts[inputId] = 0; // reset for the next question
      setTimeout(() => {
        document.getElementById(currentId).style.display = "none";
        document.getElementById(nextId).style.display = "block";
      }, 1500);
      markAnswer(this, false, currentId, nextId);
    }
  }
}


const timer = setInterval(() => {
  elapsedTime++;
  timerDisplay.textContent = elapsedTime;
}, 1000);


