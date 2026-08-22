// ============================================================
// LearnHub - Dashboard JavaScript
// ============================================================

const API_BASE_URL = "https://learnhub-ivo0.onrender.com";


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    checkLogin();

    loadDashboard();

    setupLogout();

});


// ============================================================
// CHECK LOGIN
// ============================================================

function checkLogin() {

    const username =
        localStorage.getItem("username");

    if (!username) {

        alert("Please login to continue.");

        window.location.href =
            "login.html";

        return false;
    }

    return true;
}


// ============================================================
// LOAD DASHBOARD
// ============================================================

async function loadDashboard() {

    const username =
        localStorage.getItem("username");


    if (!username) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/dashboard/${encodeURIComponent(username)}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data?.detail ||
                "Unable to load dashboard."
            );

        }


        displayDashboard(data);


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );


        showDashboardError(
            error.message
        );

    }

}


// ============================================================
// DISPLAY DASHBOARD
// ============================================================

function displayDashboard(data) {

    // Username
    setText(
        "username",
        data.username
    );

    setText(
        "dashboard-username",
        data.username
    );


    // Email
    setText(
        "email",
        data.email
    );

    setText(
        "dashboard-email",
        data.email
    );


    // About
    setText(
        "about",
        data.about || "No bio added yet."
    );


    // Profile picture
    const profileImages =
        document.querySelectorAll(
            "#profile-picture, .profile-picture"
        );


    profileImages.forEach(image => {

        if (data.profile_picture) {

            image.src =
                data.profile_picture;

        }

    });


    // Statistics
    setText(
        "total-quizzes",
        data.total_quizzes_attempted
    );

    setText(
        "total-quizzes-attempted",
        data.total_quizzes_attempted
    );


    setText(
        "average-score",
        `${data.average_score}%`
    );


    setText(
        "best-score",
        `${data.best_score}%`
    );


    setText(
        "accuracy",
        `${data.accuracy}%`
    );


    setText(
        "total-points",
        data.total_points
    );

}


// ============================================================
// SET TEXT SAFELY
// ============================================================

function setText(id, value) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value ?? "";

    }

}


// ============================================================
// SHOW DASHBOARD ERROR
// ============================================================

function showDashboardError(message) {

    const errorElement =
        document.getElementById(
            "dashboardMessage"
        );


    if (errorElement) {

        errorElement.textContent =
            message;

        errorElement.className =
            "form-message error";

    } else {

        console.error(
            "Dashboard:",
            message
        );

    }

}


// ============================================================
// LOGOUT
// ============================================================

function setupLogout() {

    const logoutButtons =
        document.querySelectorAll(
            "#logoutBtn, #logout-button"
        );


    logoutButtons.forEach(button => {

        button.addEventListener(
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

    });

}