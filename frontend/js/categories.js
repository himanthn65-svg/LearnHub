// ============================================================
// LearnHub - Categories JavaScript
// ============================================================

const API_BASE_URL = "http://127.0.0.1:8000";

// Current selections
let selectedCategory = "";
let selectedSubject = "";


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    setupCategoryButtons();
    setupLevelButtons();
    setupLogout();

});


// ============================================================
// CATEGORY BUTTONS
// ============================================================

function setupCategoryButtons() {

    const categoryButtons = document.querySelectorAll(
        ".category-select-btn"
    );

    categoryButtons.forEach(button => {

        button.addEventListener("click", async () => {

            const category = button.dataset.category;

            await selectCategory(category);

        });

    });

}


// ============================================================
// SELECT CATEGORY
// ============================================================

async function selectCategory(category) {

    selectedCategory = category;
    selectedSubject = "";

    try {

        const response = await fetch(
            `${API_BASE_URL}/categories/${encodeURIComponent(category)}`
        );

        if (!response.ok) {

            throw new Error("Unable to load category");

        }

        const data = await response.json();

        showSubjects(data);

    } catch (error) {

        console.error("Category error:", error);

        alert(
            "Unable to connect to LearnHub server.\n\n" +
            "Make sure FastAPI is running."
        );

    }

}


// ============================================================
// SHOW SUBJECTS
// ============================================================

function showSubjects(data) {

    let subjectSection = document.getElementById(
        "subjectSelection"
    );

    // Create subject section if it doesn't already exist
    if (!subjectSection) {

        subjectSection = document.createElement("section");

        subjectSection.id = "subjectSelection";
        subjectSection.className = "level-selection";

        const levelSection = document.getElementById(
            "levelSelection"
        );

        levelSection.parentNode.insertBefore(
            subjectSection,
            levelSection
        );

    }


    subjectSection.hidden = false;


    subjectSection.innerHTML = `
        <div class="section-heading">

            <span class="section-label">
                SUBJECT
            </span>

            <h2>
                Choose Your Subject
            </h2>

            <p>
                Select a subject from ${escapeHTML(data.category)}.
            </p>

        </div>

        <div class="level-grid">

            ${data.subjects.map(subject => `
                <button
                    type="button"
                    class="level-card subject-card"
                    data-subject="${escapeHTML(subject)}"
                >

                    <span class="level-number">
                        ${getSubjectNumber(subject)}
                    </span>

                    <div>

                        <h3>
                            ${escapeHTML(subject)}
                        </h3>

                        <p>
                            Start practicing ${escapeHTML(subject)}.
                        </p>

                    </div>

                    <span class="level-arrow">
                        →
                    </span>

                </button>
            `).join("")}

        </div>
    `;


    // Add subject click events
    const subjectButtons = subjectSection.querySelectorAll(
        ".subject-card"
    );

    subjectButtons.forEach(button => {

        button.addEventListener("click", () => {

            selectedSubject = button.dataset.subject;

            showLevels();

        });

    });


    // Scroll to subject section
    subjectSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// ============================================================
// SHOW LEVELS
// ============================================================

function showLevels() {

    const levelSection = document.getElementById(
        "levelSelection"
    );

    const selectedCategoryText = document.getElementById(
        "selectedCategoryText"
    );

    if (!levelSection) {
        return;
    }


    selectedCategoryText.textContent =
        `${selectedCategory} → ${selectedSubject}`;


    levelSection.hidden = false;


    levelSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// ============================================================
// LEVEL BUTTONS
// ============================================================

function setupLevelButtons() {

    const levelButtons = document.querySelectorAll(
        ".level-card[data-level]"
    );

    levelButtons.forEach(button => {

        button.addEventListener("click", () => {

            const level = button.dataset.level;

            startQuiz(level);

        });

    });

}


// ============================================================
// START QUIZ
// ============================================================

function startQuiz(level) {

    if (!selectedCategory) {

        alert("Please select a category first.");

        return;

    }


    if (!selectedSubject) {

        alert("Please select a subject first.");

        return;

    }


    // Build quiz URL
    const quizURL =
        `quiz.html?category=${encodeURIComponent(selectedCategory)}` +
        `&subject=${encodeURIComponent(selectedSubject)}` +
        `&level=${encodeURIComponent(level)}`;


    // Open quiz page
    window.location.href = quizURL;

}


// ============================================================
// LOGOUT
// ============================================================

function setupLogout() {

    const logoutButton = document.getElementById("logoutBtn");

    if (!logoutButton) {
        return;
    }


    logoutButton.addEventListener("click", () => {

        // Remove logged-in user information
        localStorage.removeItem("username");
        localStorage.removeItem("email");

        // Go to login page
        window.location.href = "login.html";

    });

}


// ============================================================
// SUBJECT NUMBER
// ============================================================

function getSubjectNumber(subject) {

    const numbers = {
        "C": "01",
        "Java": "02",
        "Python": "03",

        "HTML": "01",
        "CSS": "02",
        "JavaScript": "03",
        "React": "04",

        "Machine Learning": "01",
        "Deep Learning": "02",
        "NLP": "03",

        "MySQL": "01",
        "MongoDB": "02",

        "Aptitude": "01"
    };


    return numbers[subject] || "01";

}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;

}