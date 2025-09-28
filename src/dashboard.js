const contentDiv = document.getElementById("content");
const scoresBtn = document.getElementById("scoresBtn");
const namesBtn = document.getElementById("namesBtn");

// Fetch accounts from backend
async function getStudents() {
    try {
        const res = await fetch("/api/accounts");
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Error fetching students:", err);
        return [];
    }
}
//NEWNEWNEWNEW
async function renderScores() {
    scoresBtn.classList.add("active");
    namesBtn.classList.remove("active");

    try {
        const res = await fetch("/api/overall-scores");
        const students = await res.json();

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
            // Collect languages where score < 6
            let areas = [];
            if (student.scores) {
                for (const [lang, score] of Object.entries(student.scores)) {
                    if (score < 6) {
                        areas.push(lang.toUpperCase());
                    }
                }
            }

            // Determine programming skill level
            let skillLevel = "";
            if (student.totalScore < 50) {
                skillLevel = "BASIC";
            } else if (student.totalScore >= 51 && student.totalScore <= 70) {
                skillLevel = "MODERATE";
            } else if (student.totalScore >= 71 && student.totalScore <= 105) {
                skillLevel = "ADVANCE";
            } else {
                skillLevel = "EXPERT"; // optional fallback if higher than 105
            }

            tableHtml += `
                <tr>
                    <td>${student.name}</td>
                    <td>${student.totalScore}</td>
                    <td>${student.totalScore >= 50 ? "Pass" : "Fail"}</td>
                    <td>${areas.length > 0 ? areas.join(", ") : "None"}</td>
                    <td>${skillLevel}</td>
                </tr>
            `;
        });

        tableHtml += `</tbody></table>`;
        contentDiv.innerHTML = tableHtml;
    } catch (err) {
        console.error("Error loading scores:", err);
    }
}



async function renderNames() {
    namesBtn.classList.add("active");
    scoresBtn.classList.remove("active");

    const students = await getStudents();

    let listHtml = `<h2>Student Names</h2><ul>`;
    students.forEach(student => {
        listHtml += `<li>${student.fullname}</li>`;
    });
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
