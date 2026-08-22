document.addEventListener("DOMContentLoaded", () => {

    const registerForm = document.getElementById("registerForm");

    const usernameInput = document.getElementById("username");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");

    const passwordToggle = document.getElementById("passwordToggle");
    const confirmPasswordToggle = document.getElementById("confirmPasswordToggle");

    const messageBox = document.getElementById("registerMessage");


    // ==============================
    // API URL
    // ==============================

    const API_URL = "https://learnhub-ivo0.onrender.com";


    // ==============================
    // SHOW / HIDE PASSWORD
    // ==============================

    passwordToggle.addEventListener("click", () => {

        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            passwordToggle.textContent = "Hide";
        } else {
            passwordInput.type = "password";
            passwordToggle.textContent = "Show";
        }

    });


    confirmPasswordToggle.addEventListener("click", () => {

        if (confirmPasswordInput.type === "password") {
            confirmPasswordInput.type = "text";
            confirmPasswordToggle.textContent = "Hide";
        } else {
            confirmPasswordInput.type = "password";
            confirmPasswordToggle.textContent = "Show";
        }

    });


    // ==============================
    // MESSAGE FUNCTION
    // ==============================

    function showMessage(message, type) {

        messageBox.textContent = message;

        messageBox.className = "form-message";

        if (type === "success") {
            messageBox.classList.add("success");
        } else {
            messageBox.classList.add("error");
        }

    }


    // ==============================
    // REGISTER USER
    // ==============================

    registerForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;


        // ------------------------------
        // Basic validation
        // ------------------------------

        if (!username || !email || !password || !confirmPassword) {

            showMessage(
                "Please fill in all required fields.",
                "error"
            );

            return;
        }


        // ------------------------------
        // Password match
        // ------------------------------

        if (password !== confirmPassword) {

            showMessage(
                "Passwords do not match.",
                "error"
            );

            return;
        }


        // ------------------------------
        // Password length
        // ------------------------------

        if (password.length < 6) {

            showMessage(
                "Password must contain at least 6 characters.",
                "error"
            );

            return;
        }


        // ------------------------------
        // Disable button
        // ------------------------------

        const submitButton =
            registerForm.querySelector("button[type='submit']");

        submitButton.disabled = true;
        submitButton.textContent = "Creating Account...";


        try {

            // FastAPI expects query parameters
            const url =
                `${API_URL}/users/register` +
                `?username=${encodeURIComponent(username)}` +
                `&email=${encodeURIComponent(email)}` +
                `&password=${encodeURIComponent(password)}`;


            const response = await fetch(url, {
                method: "POST"
            });


            const data = await response.json();


            // ------------------------------
            // Backend error
            // ------------------------------

            if (!response.ok) {

                showMessage(
                    data.detail || "Registration failed.",
                    "error"
                );

                return;
            }


            // ------------------------------
            // Registration successful
            // ------------------------------

            showMessage(
                "Account created successfully! Redirecting to login...",
                "success"
            );


            registerForm.reset();


            // Redirect to login
            setTimeout(() => {

                window.location.href = "login.html";

            }, 1500);


        } catch (error) {

            console.error("Registration error:", error);

            showMessage(
                "Unable to connect to LearnHub server. Please make sure FastAPI is running.",
                "error"
            );

        } finally {

            submitButton.disabled = false;
            submitButton.textContent = "Create Account";

        }

    });

});