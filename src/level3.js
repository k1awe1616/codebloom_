// Function to move to the next question
let correctCount = 0; // number of correct answers

function goToNextQuestion(currentQuestionId, nextQuestionId) {
  document.getElementById(currentQuestionId).style.display = "none";
  document.getElementById(nextQuestionId).style.display = "block";
}

// Stopwatch Timer (continuous)
let elapsedTime = 0;
const timerDisplay = document.getElementById("time");

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
          language: "java",
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


// ✅ Correct answers
document.getElementById("answer1").addEventListener("click", function() {
  markAnswer(this, true, "question1", "question2");
});
document.getElementById("answer2").addEventListener("click", function() {
  markAnswer(this, true, "question2", "question3");
});
document.getElementById("answer3").addEventListener("click", function() {
  markAnswer(this, true, "question3", "question4");
});
document.getElementById("answer4").addEventListener("click", function() {
  markAnswer(this, true, "question4", "question5");
});
document.getElementById("answer5").addEventListener("click", function() {
  markAnswer(this, true, "question5", "question6");
});
document.getElementById("answer6").addEventListener("click", function() {
  markAnswer(this, true, "question6", "question7");
});
document.getElementById("answer7").addEventListener("click", function() {
  markAnswer(this, true, "question7", "question8");
});
document.getElementById("answer8").addEventListener("click", function() {
  markAnswer(this, true, "question8", "question9");
});
document.getElementById("answer9").addEventListener("click", function() {
  markAnswer(this, true, "question9", "question10");
});
document.getElementById("answer10").addEventListener("click", function() {
  markAnswer(this, true, "question10", "question11"); // move to debugging challenge
});

// ❌ Wrong answers
let wrongQuestions = [
  { current: "question1", next: "question2" },
  { current: "question2", next: "question3" },
  { current: "question3", next: "question4" },
  { current: "question4", next: "question5" },
  { current: "question5", next: "question6" },
  { current: "question6", next: "question7" },
  { current: "question7", next: "question8" },
  { current: "question8", next: "question9" },
  { current: "question9", next: "question10" },
  { current: "question10", next: "question11" }
];

// Attach all wrong buttons
wrongQuestions.forEach(item => {
  let wrongBtns = document.querySelectorAll(`#${item.current} .wrongChoice`);
  wrongBtns.forEach(btn => {
    btn.addEventListener("click", function() {
      markAnswer(this, false, item.current, item.next);
    });
  });
});

// Track attempts for text-based debugging questions
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



