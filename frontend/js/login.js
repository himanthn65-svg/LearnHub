// ============================================================
// LearnHub - Login JavaScript
// ============================================================

const API_BASE_URL = "http://127.0.0.1:8000";

// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    setupLoginForm();
    setupPasswordToggle();

});


// ============================================================
// LOGIN FORM
// ============================================================

function setupLoginForm() {

    const loginForm =
        document.getElementById("loginForm");

    if (!loginForm) {
        return;
    }


    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        await loginUser();

    });

}


// ============================================================
// LOGIN USER
// ============================================================

async function loginUser() {

    const usernameInput =
        document.getElementById("username");

    const passwordInput =
        document.getElementById("password");

    const messageElement =
        document.getElementById("loginMessage");


    if (!usernameInput || !passwordInput) {
        return;
    }


    const username =
        usernameInput.value.trim();

    const password =
        passwordInput.value;


    // Clear previous message
    if (messageElement) {

        messageElement.textContent = "";
        messageElement.className = "form-message";

    }


    // Basic validation
    if (!username || !password) {

        showMessage(
            "Please enter your username and password.",
            "error"
        );

        return;

    }


    try {

        showMessage(
            "Logging in...",
            "info"
        );


        // FastAPI currently accepts these as query parameters
        const url =
            `${API_BASE_URL}/users/login` +
            `?username=${encodeURIComponent(username)}` +
            `&password=${encodeURIComponent(password)}`;


        const response =
            await fetch(url, {
                method: "POST"
            });


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data?.detail ||
                "Invalid username or password."
            );

        }


        // ====================================================
        // LOGIN SUCCESS
        // ====================================================

        localStorage.setItem(
            "username",
            data.username
        );

        localStorage.setItem(
            "email",
            data.email
        );


        // Remove old quiz data if any
        localStorage.removeItem("quizResult");
        localStorage.removeItem("quizCategory");
        localStorage.removeItem("quizSubject");
        localStorage.removeItem("quizLevel");


        showMessage(
            "Login successful. Redirecting...",
            "success"
        );


        // Go to dashboard
        setTimeout(() => {

            window.location.href =
                "dashboard.html";

        }, 500);


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to connect to LearnHub server.",
            "error"
        );

    }

}


// ============================================================
// SHOW MESSAGE
// ============================================================

function showMessage(message, type) {

    const messageElement =
        document.getElementById("loginMessage");


    if (!messageElement) {
        return;
    }


    messageElement.textContent =
        message;


    messageElement.className =
        `form-message ${type}`;

}


// ============================================================
// PASSWORD TOGGLE
// ============================================================

function setupPasswordToggle() {

    const passwordToggle =
        document.getElementById("passwordToggle");

    const passwordInput =
        document.getElementById("password");


    if (!passwordToggle || !passwordInput) {
        return;
    }


    passwordToggle.addEventListener("click", () => {

        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            passwordToggle.textContent =
                "Hide";

            passwordToggle.setAttribute(
                "aria-label",
                "Hide password"
            );

        } else {

            passwordInput.type = "password";

            passwordToggle.textContent =
                "Show";

            passwordToggle.setAttribute(
                "aria-label",
                "Show password"
            );

        }

    });

}