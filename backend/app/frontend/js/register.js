"use strict";

/* =========================================================
   LEARNHUB - REGISTRATION
   File: register.js
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const registerForm =
        document.getElementById("registerForm");

    const usernameInput =
        document.getElementById("username");

    const emailInput =
        document.getElementById("email");

    const passwordInput =
        document.getElementById("password");

    const confirmPasswordInput =
        document.getElementById("confirmPassword");

    const termsInput =
        document.getElementById("terms");

    const messageElement =
        document.getElementById("registerMessage");


    /* ---------------------------------------------------------
       Check form
       --------------------------------------------------------- */

    if (!registerForm) {
        return;
    }


    /* ---------------------------------------------------------
       Password visibility
       --------------------------------------------------------- */

    const passwordToggle =
        document.getElementById("passwordToggle");

    const confirmPasswordToggle =
        document.getElementById(
            "confirmPasswordToggle"
        );


    if (passwordToggle) {

        passwordToggle.addEventListener(
            "click",
            function () {

                if (
                    passwordInput.type ===
                    "password"
                ) {

                    passwordInput.type =
                        "text";

                    passwordToggle.textContent =
                        "Hide";

                } else {

                    passwordInput.type =
                        "password";

                    passwordToggle.textContent =
                        "Show";
                }
            }
        );
    }


    if (confirmPasswordToggle) {

        confirmPasswordToggle.addEventListener(
            "click",
            function () {

                if (
                    confirmPasswordInput.type ===
                    "password"
                ) {

                    confirmPasswordInput.type =
                        "text";

                    confirmPasswordToggle.textContent =
                        "Hide";

                } else {

                    confirmPasswordInput.type =
                        "password";

                    confirmPasswordToggle.textContent =
                        "Show";
                }
            }
        );
    }


    /* ---------------------------------------------------------
       Message helper
       --------------------------------------------------------- */

    function showRegisterMessage(
        message,
        type
    ) {

        if (!messageElement) {
            return;
        }

        messageElement.textContent =
            message;

        messageElement.className =
            "form-message " + type;
    }


    function clearRegisterMessage() {

        if (!messageElement) {
            return;
        }

        messageElement.textContent = "";

        messageElement.className =
            "form-message";
    }


    /* ---------------------------------------------------------
       Username validation
       --------------------------------------------------------- */

    function validateUsername(username) {

        if (username.length < 3) {

            return {
                valid: false,
                message:
                    "Username must contain at least 3 characters."
            };
        }


        if (username.length > 30) {

            return {
                valid: false,
                message:
                    "Username cannot exceed 30 characters."
            };
        }


        const usernamePattern =
            /^[A-Za-z0-9_]+$/;


        if (
            !usernamePattern.test(
                username
            )
        ) {

            return {
                valid: false,
                message:
                    "Username can contain only letters, numbers and underscores."
            };
        }


        return {
            valid: true
        };
    }


    /* ---------------------------------------------------------
       Password validation
       --------------------------------------------------------- */

    function validatePassword(password) {

        if (password.length < 8) {

            return {
                valid: false,
                message:
                    "Password must contain at least 8 characters."
            };
        }


        if (password.length > 128) {

            return {
                valid: false,
                message:
                    "Password is too long."
            };
        }


        return {
            valid: true
        };
    }


    /* ---------------------------------------------------------
       Registration
       --------------------------------------------------------- */

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            clearRegisterMessage();


            /* Get values */

            const username =
                usernameInput.value.trim();

            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;

            const confirmPassword =
                confirmPasswordInput.value;

            const termsAccepted =
                termsInput.checked;


            /* -------------------------------------------------
               Required fields
               ------------------------------------------------- */

            if (
                !username ||
                !email ||
                !password ||
                !confirmPassword
            ) {

                showRegisterMessage(
                    "Please fill in all required fields.",
                    "error"
                );

                return;
            }


            /* -------------------------------------------------
               Username
               ------------------------------------------------- */

            const usernameValidation =
                validateUsername(username);


            if (
                !usernameValidation.valid
            ) {

                showRegisterMessage(
                    usernameValidation.message,
                    "error"
                );

                return;
            }


            /* -------------------------------------------------
               Email
               ------------------------------------------------- */

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailPattern.test(email)
            ) {

                showRegisterMessage(
                    "Please enter a valid email address.",
                    "error"
                );

                return;
            }


            /* -------------------------------------------------
               Password
               ------------------------------------------------- */

            const passwordValidation =
                validatePassword(password);


            if (
                !passwordValidation.valid
            ) {

                showRegisterMessage(
                    passwordValidation.message,
                    "error"
                );

                return;
            }


            /* -------------------------------------------------
               Confirm password
               ------------------------------------------------- */

            if (
                password !==
                confirmPassword
            ) {

                showRegisterMessage(
                    "Passwords do not match.",
                    "error"
                );

                return;
            }


            /* -------------------------------------------------
               Terms
               ------------------------------------------------- */

            if (!termsAccepted) {

                showRegisterMessage(
                    "Please accept the terms and conditions.",
                    "error"
                );

                return;
            }


            /* -------------------------------------------------
               Loading state
               ------------------------------------------------- */

            const submitButton =
                registerForm.querySelector(
                    'button[type="submit"]'
                );


            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "Creating Account...";
            }


            try {

                /* ---------------------------------------------
                   Send data to FastAPI
                   --------------------------------------------- */

                const response =
                    await fetch(
                        "http://127.0.0.1:8000/auth/register",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                username: username,
                                email: email,
                                password: password
                            })
                        }
                    );


                /* ---------------------------------------------
                   Read response
                   --------------------------------------------- */

                const data =
                    await response.json();


                /* ---------------------------------------------
                   Backend error
                   --------------------------------------------- */

                if (!response.ok) {

                    let errorMessage =
                        "Registration failed.";


                    if (
                        data &&
                        data.detail
                    ) {

                        if (
                            Array.isArray(
                                data.detail
                            )
                        ) {

                            errorMessage =
                                data.detail
                                    .map(
                                        function (error) {
                                            return (
                                                error.msg ||
                                                "Invalid input."
                                            );
                                        }
                                    )
                                    .join(", ");

                        } else {

                            errorMessage =
                                data.detail;
                        }
                    }


                    showRegisterMessage(
                        errorMessage,
                        "error"
                    );

                    return;
                }


                /* ---------------------------------------------
                   Success
                   --------------------------------------------- */

                showRegisterMessage(
                    "Account created successfully! You can now login.",
                    "success"
                );


                /* Clear password fields */

                passwordInput.value = "";

                confirmPasswordInput.value = "";

                termsInput.checked = false;


                /* ---------------------------------------------
                   Redirect to login
                   --------------------------------------------- */

                setTimeout(
                    function () {

                        window.location.href =
                            "login.html";

                    },
                    1500
                );


            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );


                showRegisterMessage(
                    "Unable to connect to the LearnHub server. Please make sure FastAPI is running.",
                    "error"
                );


            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Create Account";
                }
            }

        }
    );

});