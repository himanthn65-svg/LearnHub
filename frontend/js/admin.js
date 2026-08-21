// ============================================================
// LearnHub - Admin JavaScript
// ============================================================

const API_BASE_URL = "http://127.0.0.1:8000";


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    checkAdminAccess();

    setupQuestionForm();

    setupFilters();

    setupLogout();

    loadAdminStats();

    loadQuestions();

});


// ============================================================
// ADMIN ACCESS
// ============================================================

function checkAdminAccess() {

    const username =
        localStorage.getItem("username");

    if (!username) {

        alert("Please login first.");

        window.location.href = "login.html";

        return false;
    }

    // Admin username
    if (username !== "Lohitha14") {

        alert("Access denied. Admin access only.");

        window.location.href = "dashboard.html";

        return false;
    }

    return true;
}


// ============================================================
// ADD QUESTION FORM
// ============================================================

function setupQuestionForm() {

    const form =
        document.getElementById("add-question-form");

    if (!form) {
        return;
    }

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        await addQuestion();

    });

}


// ============================================================
// ADD QUESTION
// ============================================================

async function addQuestion() {

    const category =
        getValue("category");

    const subject =
        getValue("subject");

    const level =
        getValue("level");

    const question =
        getValue("question");

    const optionA =
        getValue("option-a");

    const optionB =
        getValue("option-b");

    const optionC =
        getValue("option-c");

    const optionD =
        getValue("option-d");

    const correctAnswer =
        getValue("correct-answer").toUpperCase();

    const explanation =
        getValue("explanation");


    if (
        !category ||
        !subject ||
        !level ||
        !question ||
        !optionA ||
        !optionB ||
        !optionC ||
        !optionD ||
        !correctAnswer
    ) {

        showMessage(
            "Please fill all required fields.",
            true
        );

        return;
    }


    if (!["A", "B", "C", "D"].includes(correctAnswer)) {

        showMessage(
            "Correct answer must be A, B, C, or D.",
            true
        );

        return;
    }


    try {

        const params = new URLSearchParams();

        params.append("category", category);
        params.append("subject", subject);
        params.append("level", level);
        params.append("question", question);
        params.append("option_a", optionA);
        params.append("option_b", optionB);
        params.append("option_c", optionC);
        params.append("option_d", optionD);
        params.append("correct_answer", correctAnswer);

        if (explanation) {

            params.append(
                "explanation",
                explanation
            );

        }


        const response = await fetch(
            `${API_BASE_URL}/quiz/questions?${params.toString()}`,
            {
                method: "POST"
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data?.detail ||
                "Unable to add question."
            );

        }


        showMessage(
            "Question added successfully!",
            false
        );


        const form =
            document.getElementById(
                "add-question-form"
            );

        if (form) {
            form.reset();
        }


        await loadAdminStats();

        await loadQuestions();

    } catch (error) {

        console.error(
            "Add question error:",
            error
        );

        showMessage(
            error.message ||
            "Unable to add question.",
            true
        );

    }

}


// ============================================================
// ADMIN STATISTICS
// ============================================================

async function loadAdminStats() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/admin/stats`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data?.detail ||
                "Unable to load statistics."
            );

        }


        const totalQuestions =
            document.getElementById(
                "total-questions"
            );

        const basicQuestions =
            document.getElementById(
                "basic-questions"
            );

        const intermediateQuestions =
            document.getElementById(
                "intermediate-questions"
            );

        const advancedQuestions =
            document.getElementById(
                "advanced-questions"
            );


        if (totalQuestions) {

            totalQuestions.textContent =
                data.total_questions ?? 0;

        }


        if (
            basicQuestions &&
            intermediateQuestions &&
            advancedQuestions
        ) {

            const questionsResponse =
                await fetch(
                    `${API_BASE_URL}/admin/questions`
                );


            const questions =
                await questionsResponse.json();


            if (questionsResponse.ok) {

                let basic = 0;
                let intermediate = 0;
                let advanced = 0;


                questions.forEach(question => {

                    const level =
                        String(
                            question.level || ""
                        ).toLowerCase();


                    if (level === "basic") {
                        basic++;
                    }

                    else if (
                        level === "intermediate"
                    ) {
                        intermediate++;
                    }

                    else if (
                        level === "advanced"
                    ) {
                        advanced++;
                    }

                });


                basicQuestions.textContent =
                    basic;

                intermediateQuestions.textContent =
                    intermediate;

                advancedQuestions.textContent =
                    advanced;

            }

        }

    } catch (error) {

        console.error(
            "Admin statistics error:",
            error
        );

    }

}


// ============================================================
// FILTERS
// ============================================================

function setupFilters() {

    const loadButton =
        document.getElementById(
            "load-questions-button"
        );


    if (loadButton) {

        loadButton.addEventListener(
            "click",
            () => {

                loadQuestions();

            }
        );

    }

}


// ============================================================
// LOAD QUESTIONS
// ============================================================

async function loadQuestions() {

    const questionList =
        document.getElementById(
            "question-list"
        );


    if (!questionList) {
        return;
    }


    questionList.innerHTML = `
        <p>Loading questions...</p>
    `;


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/admin/questions`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data?.detail ||
                "Unable to load questions."
            );

        }


        displayQuestions(data);

    } catch (error) {

        console.error(
            "Load questions error:",
            error
        );


        questionList.innerHTML = `
            <p>
                Unable to load questions.
            </p>
        `;

    }

}


// ============================================================
// DISPLAY QUESTIONS
// ============================================================

function displayQuestions(questions) {

    const questionList =
        document.getElementById(
            "question-list"
        );


    if (!questionList) {
        return;
    }


    const filterCategory =
        getValue("filter-category");

    const filterLevel =
        getValue("filter-level");


    let filteredQuestions =
        questions.filter(question => {

            const categoryMatches =
                !filterCategory ||
                question.category === filterCategory;


            const levelMatches =
                !filterLevel ||
                question.level === filterLevel;


            return (
                categoryMatches &&
                levelMatches
            );

        });


    if (!filteredQuestions.length) {

        questionList.innerHTML = `
            <p>
                No questions found.
            </p>
        `;

        return;

    }


    questionList.innerHTML = "";


    filteredQuestions.forEach(
        (question, index) => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "admin-question-item";


            card.innerHTML = `

                <div>

                    <strong>
                        ${index + 1}. 
                        ${escapeHTML(question.question)}
                    </strong>

                    <p>
                        Category:
                        ${escapeHTML(question.category)}
                    </p>

                    <p>
                        Subject:
                        ${escapeHTML(question.subject)}
                    </p>

                    <p>
                        Level:
                        ${escapeHTML(question.level)}
                    </p>

                    <p>
                        Correct Answer:
                        ${escapeHTML(question.correct_answer)}
                    </p>

                    <p>
                        ID:
                        ${question.id}
                    </p>

                </div>

                <button
                    type="button"
                    class="delete-question-button"
                    data-id="${question.id}"
                >
                    Delete
                </button>

            `;


            questionList.appendChild(card);

        }
    );


    setupDeleteButtons();

}


// ============================================================
// DELETE QUESTION
// ============================================================

function setupDeleteButtons() {

    const buttons =
        document.querySelectorAll(
            ".delete-question-button"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            async () => {

                const questionId =
                    button.dataset.id;


                const confirmed =
                    confirm(
                        "Are you sure you want to delete this question?"
                    );


                if (!confirmed) {
                    return;
                }


                await deleteQuestion(
                    questionId
                );

            }
        );

    });

}


// ============================================================
// DELETE QUESTION API
// ============================================================

async function deleteQuestion(
    questionId
) {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/admin/questions/${questionId}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data?.detail ||
                "Unable to delete question."
            );

        }


        showMessage(
            "Question deleted successfully.",
            false
        );


        await loadAdminStats();

        await loadQuestions();

    } catch (error) {

        console.error(
            "Delete question error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to delete question.",
            true
        );

    }

}


// ============================================================
// GET INPUT VALUE
// ============================================================

function getValue(id) {

    const element =
        document.getElementById(id);


    if (!element) {
        return "";
    }


    return element.value.trim();

}


// ============================================================
// SHOW MESSAGE
// ============================================================

function showMessage(
    message,
    isError
) {

    const messageElement =
        document.getElementById(
            "admin-message"
        );


    if (!messageElement) {

        alert(message);

        return;
    }


    messageElement.textContent =
        message;


    messageElement.className =
        isError
            ? "admin-message error"
            : "admin-message success";

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

            localStorage.clear();

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
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}