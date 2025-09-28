const problems = {
  cpp: {
    title: "C++ Debugging",
    code: `#include <iostream>
using namespace std;

int main() {
    int x = 10
    cout << "Value of x is: " << x << endl;
    return 0;
}`,
    choices: [
      "Missing semicolon after int x = 10",
      "cout should be printf",
      "main should return void"
    ],
    answer: "Missing semicolon after int x = 10"
  },
  python: {
    title: "Python Debugging",
    code: `x = 5
if x = 10:
    print("X is 10")
else:
    print("X is not 10")`,
    choices: [
      "Use '==' instead of '=' in if statement",
      "print should be Print",
      "Missing colon at else"
    ],
    answer: "Use '==' instead of '=' in if statement"
  },
  csharp: {
    title: "C# Debugging",
    code: `using System;

class Program {
    static void Main() {
        int x = "Hello";
        Console.WriteLine(x);
    }
}`,
    choices: [
      "Cannot assign string to int variable",
      "Missing namespace keyword",
      "Console.WriteLine should be print"
    ],
    answer: "Cannot assign string to int variable"
  }
};

const languageSelect = document.getElementById("language");
const codeBlock = document.getElementById("code-block");
const choicesDiv = document.getElementById("choices");
const feedback = document.getElementById("feedback");
const title = document.getElementById("problem-title");

let currentProblem = problems.cpp;

function loadProblem(lang) {
  currentProblem = problems[lang];
  title.textContent = currentProblem.title;
  codeBlock.textContent = currentProblem.code;
  choicesDiv.innerHTML = "";
  currentProblem.choices.forEach(choice => {
    let btn = document.createElement("button");
    btn.textContent = choice;
    btn.onclick = () => checkAnswer(choice);
    choicesDiv.appendChild(btn);
  });
  feedback.textContent = "";
}

function checkAnswer(choice) {
  if (choice === currentProblem.answer) {
    feedback.textContent = "✅ Correct! You found the bug!";
    feedback.style.color = "green";
  } else {
    feedback.textContent = "❌ Incorrect. Try again.";
    feedback.style.color = "red";
  }
}

document.getElementById("show-solution").addEventListener("click", () => {
  feedback.textContent = "💡 Solution: " + currentProblem.answer;
  feedback.style.color = "blue";
});

languageSelect.addEventListener("change", (e) => {
  loadProblem(e.target.value);
});

// Load first problem
loadProblem("cpp");
