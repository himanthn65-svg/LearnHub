// ============================================================
// LearnHub - Result JavaScript
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    loadQuizResult();
    setupLogout();
    setupResultButtons();

});


// ============================================================
// LOAD QUIZ RESULT
// ============================================================

function loadQuizResult() {

    const resultData =
        localStorage.getItem("quizResult");


    if (!resultData) {

        alert("Quiz result not found.");

        window.location.href =
            "categories.html";

        return;

    }


    let result;

    try {

        result =
            JSON.parse(resultData);

    } catch (error) {

        console.error(
            "Result parsing error:",
            error
        );

        alert("Invalid quiz result.");

        window.location.href =
            "categories.html";

        return;

    }


    // Quiz information
    const category =
        localStorage.getItem("quizCategory") || "";

    const subject =
        localStorage.getItem("quizSubject") || "Quiz";

    const level =
        localStorage.getItem("quizLevel") || "Level";


    // ========================================================
    // SCORE
    // ========================================================

    const scoreElement =
        document.getElementById("score");


    if (scoreElement) {

        scoreElement.textContent =
            `${result.score}%`;

    }


    // ========================================================
    // SUBJECT
    // ========================================================

    const subjectElement =
        document.getElementById("result-subject");


    if (subjectElement) {

        subjectElement.textContent =
            subject;

    }


    // ========================================================
    // LEVEL
    // ========================================================

    const levelElement =
        document.getElementById("result-level");


    if (levelElement) {

        levelElement.textContent =
            `${category} • ${level}`;

    }


    // ========================================================
    // RESULT MESSAGE
    // ========================================================

    const messageElement =
        document.getElementById("result-message");


    if (messageElement) {

        messageElement.textContent =
            getResultMessage(result.score);

    }


    // ========================================================
    // TOTAL QUESTIONS
    // ========================================================

    const totalQuestionsElement =
        document.getElementById("total-questions");


    if (totalQuestionsElement) {

        totalQuestionsElement.textContent =
            result.total_questions;

    }


    // ========================================================
    // CORRECT ANSWERS
    // ========================================================

    const correctAnswersElement =
        document.getElementById("correct-answers");


    if (correctAnswersElement) {

        correctAnswersElement.textContent =
            result.correct_answers;

    }


    // ========================================================
    // WRONG ANSWERS
    // ========================================================

    const wrongAnswersElement =
        document.getElementById("wrong-answers");


    if (wrongAnswersElement) {

        const wrongAnswers =
            result.total_questions -
            result.correct_answers;


        wrongAnswersElement.textContent =
            wrongAnswers;

    }


    // ========================================================
    // POINTS
    // ========================================================

    const pointsElement =
        document.getElementById("points-earned");


    if (pointsElement) {

        pointsElement.textContent =
            result.points;

    }


    // ========================================================
    // ANSWER REVIEW
    // ========================================================

    displayAnswerReview(
        result.results || []
    );

}


// ============================================================
// RESULT MESSAGE
// ============================================================

function getResultMessage(score) {

    if (score === 100) {

        return "Perfect score! Excellent work!";

    }

    if (score >= 80) {

        return "Great job! You have a strong understanding.";

    }

    if (score >= 60) {

        return "Good work! Keep practicing to improve further.";

    }

    if (score >= 40) {

        return "Nice attempt! Review your mistakes and try again.";

    }

    return "Keep learning and practicing. You can improve!";

}


// ============================================================
// ANSWER REVIEW
// ============================================================

function displayAnswerReview(results) {

    const reviewContainer =
        document.getElementById("answer-review");


    if (!reviewContainer) {

        return;

    }


    reviewContainer.innerHTML = "";


    if (!results.length) {

        reviewContainer.innerHTML = `
            <p>
                No answer review is available.
            </p>
        `;

        return;

    }


    results.forEach((item, index) => {

        const reviewCard =
            document.createElement("div");


        reviewCard.className =
            "answer-review-item";


        const yourAnswer =
            item.your_answer || "Not answered";


        const correctAnswer =
            item.correct_answer || "-";


        const status =
            item.is_correct;


        reviewCard.innerHTML = `

            <div class="review-question">

                <strong>
                    Question ${index + 1}
                </strong>

            </div>


            <div class="review-answer">

                <p>
                    <strong>Your Answer:</strong>
                    ${escapeHTML(yourAnswer)}
                </p>


                <p>
                    <strong>Correct Answer:</strong>
                    ${escapeHTML(correctAnswer)}
                </p>

            </div>


            <div class="review-status ${status ? "correct" : "wrong"}">

                ${
                    status
                        ? "✓ Correct"
                        : "✗ Incorrect"
                }

            </div>


            ${
                item.explanation
                    ? `
                        <div class="review-explanation">

                            <strong>
                                Explanation:
                            </strong>

                            <p>
                                ${escapeHTML(item.explanation)}
                            </p>

                        </div>
                    `
                    : ""
            }

        `;


        reviewContainer.appendChild(
            reviewCard
        );

    });

}


// ============================================================
// LOGOUT
// ============================================================

function setupLogout() {

    const logoutButton =
        document.getElementById("logout-button");


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
// RESULT PAGE BUTTONS
// ============================================================

function setupResultButtons() {

    const tryAgainButton =
        document.getElementById(
            "try-again-button"
        );


    if (tryAgainButton) {

        tryAgainButton.addEventListener(
            "click",
            () => {

                // Remove previous result
                localStorage.removeItem(
                    "quizResult"
                );

            }
        );

    }


    const historyButton =
        document.getElementById(
            "history-button"
        );


    if (historyButton) {

        historyButton.addEventListener(
            "click",
            () => {

                // History page will load
                // the user's saved attempts
                window.location.href =
                    "history.html";

            }
        );

    }


    const dashboardButton =
        document.getElementById(
            "dashboard-button"
        );


    if (dashboardButton) {

        dashboardButton.addEventListener(
            "click",
            () => {

                window.location.href =
                    "dashboard.html";

            }
        );

    }

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