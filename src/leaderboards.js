// Sample leaderboard data
// Fetch registered accounts from backend
async function getAccounts() {
  try {
    const res = await fetch("/api/accounts");
    const data = await res.json();
    return data; // Array of { fullname }
  } catch (err) {
    console.error("Error fetching accounts:", err);
    return [];
  }
}
// Load leaderboard for a specific language
async function loadLeaderboard(language = "html") {
  const tbody = document.getElementById("leaderboard-body");
  const fragment = document.createDocumentFragment();

  // Clear old rows
  tbody.innerHTML = "";

  try {
    // Call your backend API
    const res = await fetch(`/api/leaderboard/${language}`);
    const data = await res.json(); // Array of { name, score, time }

    data.forEach((student, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="rank">${index + 1}</td>
        <td>${student.name}</td>
        <td>${student.score}</td>
        <td>${student.time} sec</td>
      `;
      fragment.appendChild(row);
    });

    tbody.appendChild(fragment);
  } catch (err) {
    console.error("Error loading leaderboard:", err);
  }
}

// Load leaderboard on page load (default = HTML)
document.addEventListener("DOMContentLoaded", () => loadLeaderboard("html"));

// Change leaderboard when dropdown changes
document.getElementById("language").addEventListener("change", function () {
  loadLeaderboard(this.value);
});
