// ============================================================
// LearnHub - History JavaScript
// ============================================================

const API_BASE_URL = "http://127.0.0.1:8000";

let allHistory = [];


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    loadHistory();
    setupLogout();
    setupFilter();

});


// ============================================================
// LOAD HISTORY
// ============================================================

async function loadHistory() {

    const username =
        localStorage.getItem("username");


    if (!username) {

        alert(
            "Your login session was not found. Please login again."
        );

        window.location.href =
            "login.html";

        return;

    }


    try {

        const response = await fetch(
            `${API_BASE_URL}/history/${encodeURIComponent(username)}`
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data?.detail ||
                "Unable to load quiz history."
            );

        }


        allHistory = data.history || [];


        displaySummary(allHistory);
        displayHistory(allHistory);


    } catch (error) {

        console.error(
            "History loading error:",
            error
        );


        const tableBody =
            document.getElementById(
                "history-table-body"
            );


        if (tableBody) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="7">
                        Unable to load quiz history.
                        Make sure FastAPI is running.
                    </td>
                </tr>
            `;

        }

    }

}


// ============================================================
// DISPLAY SUMMARY
// ============================================================

function displaySummary(history) {

    const totalAttemptsElement =
        document.getElementById(
            "total-attempts"
        );


    const averageScoreElement =
        document.getElementById(
            "average-score"
        );


    const bestScoreElement =
        document.getElementById(
            "best-score"
        );


    const totalPointsElement =
        document.getElementById(
            "total-points"
        );


    // No attempts
    if (!history.length) {

        if (totalAttemptsElement) {
            totalAttemptsElement.textContent = "0";
        }

        if (averageScoreElement) {
            averageScoreElement.textContent = "0%";
        }

        if (bestScoreElement) {
            bestScoreElement.textContent = "0%";
        }

        if (totalPointsElement) {
            totalPointsElement.textContent = "0";
        }

        return;

    }


    // Total attempts
    const totalAttempts =
        history.length;


    // Average score
    const totalScore =
        history.reduce(
            (sum, attempt) =>
                sum + Number(attempt.score || 0),
            0
        );


    const averageScore =
        totalScore / totalAttempts;


    // Best score
    const bestScore =
        Math.max(
            ...history.map(
                attempt =>
                    Number(attempt.score || 0)
            )
        );


    // Total points
    const totalPoints =
        history.reduce(
            (sum, attempt) =>
                sum + Number(attempt.points || 0),
            0
        );


    if (totalAttemptsElement) {

        totalAttemptsElement.textContent =
            totalAttempts;

    }


    if (averageScoreElement) {

        averageScoreElement.textContent =
            `${averageScore.toFixed(2)}%`;

    }


    if (bestScoreElement) {

        bestScoreElement.textContent =
            `${bestScore}%`;

    }


    if (totalPointsElement) {

        totalPointsElement.textContent =
            totalPoints;

    }

}


// ============================================================
// DISPLAY HISTORY TABLE
// ============================================================

function displayHistory(history) {

    const tableBody =
        document.getElementById(
            "history-table-body"
        );


    const emptyState =
        document.getElementById(
            "history-empty"
        );


    if (!tableBody) {

        return;

    }


    tableBody.innerHTML = "";


    // No history
    if (!history.length) {

        if (emptyState) {

            emptyState.style.display =
                "block";

        }


        tableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    No quiz attempts found.
                </td>
            </tr>
        `;

        return;

    }


    if (emptyState) {

        emptyState.style.display =
            "none";

    }


    // Create rows
    history.forEach(attempt => {

        const row =
            document.createElement("tr");


        const wrongAnswers =
            Number(attempt.total_questions || 0) -
            Number(attempt.correct_answers || 0);


        row.innerHTML = `

            <td>
                ${escapeHTML(
                    attempt.category || "—"
                )}
            </td>

            <td>
                ${escapeHTML(
                    attempt.subject || "—"
                )}
            </td>

            <td>
                ${escapeHTML(
                    attempt.level || "—"
                )}
            </td>

            <td>
                ${attempt.total_questions || 0}
            </td>

            <td>
                ${attempt.correct_answers || 0}
                /
                ${attempt.total_questions || 0}
            </td>

            <td>
                <strong>
                    ${attempt.score || 0}%
                </strong>
            </td>

            <td>
                ${attempt.points || 0}
            </td>

        `;


        tableBody.appendChild(row);

    });

}


// ============================================================
// FILTER SETUP
// ============================================================

function setupFilter() {

    const filterButton =
        document.getElementById(
            "filter-history-button"
        );


    if (!filterButton) {

        return;

    }


    filterButton.addEventListener(
        "click",
        applyFilter
    );

}


// ============================================================
// APPLY FILTER
// ============================================================

function applyFilter() {

    const categorySelect =
        document.getElementById(
            "history-category"
        );


    const levelSelect =
        document.getElementById(
            "history-level"
        );


    const selectedCategory =
        categorySelect
            ? categorySelect.value
            : "";


    const selectedLevel =
        levelSelect
            ? levelSelect.value
            : "";


    const filteredHistory =
        allHistory.filter(attempt => {

            const categoryMatches =
                !selectedCategory ||
                attempt.category ===
                    selectedCategory;


            const levelMatches =
                !selectedLevel ||
                attempt.level ===
                    selectedLevel;


            return (
                categoryMatches &&
                levelMatches
            );

        });


    displayHistory(filteredHistory);


    // Summary should represent filtered results
    displaySummary(filteredHistory);

}


// ============================================================
// LOGOUT
// ============================================================

function setupLogout() {

    const logoutButton =
        document.getElementById(
            "logout-button"
        );


    if (!logoutButton) {

        return;

    }


    logoutButton.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "username"
            );

            localStorage.removeItem(
                "email"
            );

            localStorage.removeItem(
                "quizResult"
            );

            localStorage.removeItem(
                "quizCategory"
            );

            localStorage.removeItem(
                "quizSubject"
            );

            localStorage.removeItem(
                "quizLevel"
            );


            window.location.href =
                "login.html";

        }
    );

}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHTML(value) {

    const div =
        document.createElement("div");


    div.textContent =
        value;


    return div.innerHTML;

}