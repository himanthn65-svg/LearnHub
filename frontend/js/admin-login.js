// ============================================================
// LearnHub - Admin Login
// ============================================================

const API_BASE_URL = "https://learnhub-ivo0.onrender.com";

const ADMIN_USERNAME = "Lohitha14";


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    const form =
        document.getElementById("admin-login-form");

    if (!form) {
        return;
    }

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        await adminLogin();

    });

});


// ============================================================
// ADMIN LOGIN
// ============================================================

async function adminLogin() {

    const username =
        document.getElementById(
            "admin-username"
        ).value.trim();

    const password =
        document.getElementById(
            "admin-password"
        ).value;


    // --------------------------------------------------------
    // Basic validation
    // --------------------------------------------------------

    if (!username || !password) {

        showMessage(
            "Please enter username and password.",
            true
        );

        return;

    }


    // --------------------------------------------------------
    // Only the correct admin username can enter
    // --------------------------------------------------------

    if (username !== ADMIN_USERNAME) {

        showMessage(
            "Invalid admin username or password.",
            true
        );

        return;

    }


    try {

        // ----------------------------------------------------
        // Send login request to existing FastAPI login API
        // ----------------------------------------------------

        const params =
            new URLSearchParams();

        params.append(
            "username",
            username
        );

        params.append(
            "password",
            password
        );


        const response =
            await fetch(
                `${API_BASE_URL}/users/login?${params.toString()}`,
                {
                    method: "POST"
                }
            );


        const data =
            await response.json();


        // ----------------------------------------------------
        // Login failed
        // ----------------------------------------------------

        if (!response.ok) {

            throw new Error(
                data?.detail ||
                "Invalid admin username or password."
            );

        }


        // ----------------------------------------------------
        // Make absolutely sure the logged-in account is admin
        // ----------------------------------------------------

        if (
            data.username !== ADMIN_USERNAME
        ) {

            throw new Error(
                "Admin access denied."
            );

        }


        // ----------------------------------------------------
        // Save admin session
        // ----------------------------------------------------

        localStorage.setItem(
            "username",
            data.username
        );

        localStorage.setItem(
            "email",
            data.email || ""
        );

        localStorage.setItem(
            "isAdmin",
            "true"
        );


        // ----------------------------------------------------
        // Success
        // ----------------------------------------------------

        showMessage(
            "Admin login successful. Opening dashboard...",
            false
        );


        setTimeout(() => {

            window.location.href =
                "admin.html";

        }, 500);


    } catch (error) {

        console.error(
            "Admin login error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to connect to LearnHub server.",
            true
        );

    }

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
            "admin-login-message"
        );


    if (!messageElement) {

        alert(message);

        return;

    }


    messageElement.textContent =
        message;


    messageElement.className =
        isError
            ? "form-message error"
            : "form-message success";

}