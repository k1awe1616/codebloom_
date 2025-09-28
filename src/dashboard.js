const contentDiv = document.getElementById("content");
const scoresBtn = document.getElementById("scoresBtn");
const namesBtn = document.getElementById("namesBtn");

// Fetch accounts from backend
async function getStudents() {
    try {
        const res = await fetch("/api/accounts");
        return await res.json();
    } catch (err) {
        console.error("Error fetching students:", err);
        contentDiv.innerHTML = `<p class="loading">Failed to fetch student names.</p>`;
        return [];
    }
}

// Render Student Scores
async function renderScores() {
    scoresBtn.classList.add("active");
    namesBtn.classList.remove("active");

    contentDiv.innerHTML = `<p class="loading">Loading scores...</p>`;

    try {
        const res = await fetch("/api/overall-scores");
        const students = await res.json();

        if (!students.length) {
            contentDiv.innerHTML = `<p class="loading">No student data available.</p>`;
            return;
        }

        let tableHtml = `
            <h2>Student Scores</h2>
            <table>
                <thead>
                    <tr>
                        <th>Full Name</th>
                        <th>Overall Score</th>
                        <th>Status</th>
                        <th>Areas For Improvement</th>
                        <th>Programming Skills Level</th>
                    </tr>
                </thead>
                <tbody>
        `;

        students.forEach(student => {
            let areas = [];
            if (student.scores) {
                for (const [lang, score] of Object.entries(student.scores)) {
                    if (score < 6) areas.push(lang.toUpperCase());
                }
            }

            let skillLevel = "";
            const score = student.totalScore || 0;
            if (score < 50) skillLevel = "BASIC";
            else if (score <= 70) skillLevel = "MODERATE";
            else if (score <= 105) skillLevel = "ADVANCE";
            else skillLevel = "EXPERT";

            tableHtml += `
                <tr>
                    <td>${student.name}</td>
                    <td>${score}</td>
                    <td>${score >= 50 ? "Pass" : "Fail"}</td>
                    <td>${areas.length ? areas.join(", ") : "None"}</td>
                    <td>${skillLevel}</td>
                </tr>
            `;
        });

        tableHtml += `</tbody></table>`;
        contentDiv.innerHTML = tableHtml;

    } catch (err) {
        console.error("Error loading scores:", err);
        contentDiv.innerHTML = `<p class="loading">Error loading student scores.</p>`;
    }
}

// Render Student Names
async function renderNames() {
    namesBtn.classList.add("active");
    scoresBtn.classList.remove("active");

    contentDiv.innerHTML = `<p class="loading">Loading student names...</p>`;
    const students = await getStudents();

    if (!students.length) {
        contentDiv.innerHTML = `<p class="loading">No student names found.</p>`;
        return;
    }

    let listHtml = `<h2>Student Names</h2><ul>`;
    students.forEach(student => listHtml += `<li>${student.fullname}</li>`);
    listHtml += `</ul>`;
    contentDiv.innerHTML = listHtml;
}

// Event Listeners
scoresBtn.addEventListener("click", renderScores);
namesBtn.addEventListener("click", renderNames);

// Default view
document.addEventListener("DOMContentLoaded", () => {
    renderScores();
});
