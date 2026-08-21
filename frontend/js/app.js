// ============================================================
// LearnHub - Global App JavaScript
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    setupGlobalLogout();
    protectPages();

});


// ============================================================
// GLOBAL LOGOUT
// ============================================================

function setupGlobalLogout() {

    const logoutButtons = document.querySelectorAll(
        "#logoutBtn, #logout-button"
    );

    logoutButtons.forEach(button => {

        button.addEventListener("click", () => {

            localStorage.removeItem("username");
            localStorage.removeItem("email");

            localStorage.removeItem("quizResult");
            localStorage.removeItem("quizCategory");
            localStorage.removeItem("quizSubject");
            localStorage.removeItem("quizLevel");

            window.location.href = "login.html";

        });

    });

}


// ============================================================
// PAGE PROTECTION
// ============================================================

function protectPages() {

    const publicPages = [
        "login.html",
        "register.html",
        "index.html"
    ];

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();

    if (
        publicPages.includes(currentPage) ||
        currentPage === ""
    ) {

        return;

    }


    const username =
        localStorage.getItem("username");


    if (!username) {

        window.location.href =
            "login.html";

    }

}