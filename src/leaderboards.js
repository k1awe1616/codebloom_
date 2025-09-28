const API_BASE = "https://codebloom-thesis.onrender.com"; // Render backend URL

// Load leaderboard for a specific language
async function loadLeaderboard(language = "html") {
  const tbody = document.getElementById("leaderboard-body");
  tbody.innerHTML = ""; // Clear old rows

  try {
    // Call backend API
    const res = await fetch(`${API_BASE}/api/leaderboard/${language}`);
    const data = await res.json(); // Array of { name, score, time }

    data.forEach((student, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="rank">${index + 1}</td>
        <td>${student.name}</td>
        <td>${student.score}</td>
        <td>${student.time} sec</td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Error loading leaderboard:", err);
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="4" style="color:red;">Failed to load leaderboard</td>`;
    tbody.appendChild(row);
  }
}

// Load leaderboard on page load (default = HTML)
document.addEventListener("DOMContentLoaded", () => loadLeaderboard("html"));

// Change leaderboard when dropdown changes
document.getElementById("language").addEventListener("change", function () {
  loadLeaderboard(this.value);
});
