/* =========================================================
   LEARNHUB - GLOBAL FRONTEND APPLICATION
   File: app.js
   Purpose: Common frontend functionality
   ========================================================= */

"use strict";

/* =========================================================
   CONFIGURATION
   ========================================================= */

const LearnHubApp = {

    /* Backend URL
       Change this later when we deploy the FastAPI backend.
    */
    API_BASE_URL: "http://127.0.0.1:8000",

    /* Pages that require login */
    protectedPages: [
        "dashboard.html",
        "categories.html",
        "quiz.html",
        "result.html",
        "history.html",
        "profile.html",
        "admin.html"
    ],

    /* Pages available without login */
    publicPages: [
        "index.html",
        "login.html",
        "register.html"
    ]
};


/* =========================================================
   PAGE INFORMATION
   ========================================================= */

function getCurrentPage() {

    const path = window.location.pathname;

    const page = path.substring(
        path.lastIndexOf("/") + 1
    );

    return page || "index.html";
}


/* =========================================================
   LOCAL STORAGE HELPERS
   ========================================================= */

function getLoggedInUser() {

    const user = localStorage.getItem("learnhub_user");

    if (!user) {
        return null;
    }

    try {
        return JSON.parse(user);
    } catch (error) {

        console.error(
            "Invalid LearnHub user data:",
            error
        );

        localStorage.removeItem("learnhub_user");

        return null;
    }
}


function setLoggedInUser(user) {

    localStorage.setItem(
        "learnhub_user",
        JSON.stringify(user)
    );
}


function clearLoggedInUser() {

    localStorage.removeItem("learnhub_user");

    localStorage.removeItem(
        "learnhub_token"
    );
}


/* =========================================================
   AUTHENTICATION CHECK
   ========================================================= */

function isLoggedIn() {

    return getLoggedInUser() !== null;
}


/* =========================================================
   PROTECTED PAGE CHECK
   ========================================================= */

function protectPage() {

    const currentPage = getCurrentPage();

    const isProtected =
        LearnHubApp.protectedPages.includes(
            currentPage
        );

    if (
        isProtected &&
        !isLoggedIn()
    ) {

        window.location.href =
            "login.html";

        return false;
    }

    return true;
}


/* =========================================================
   LOGIN PAGE REDIRECT
   ========================================================= */

function redirectLoggedInUser() {

    const currentPage = getCurrentPage();

    const isAuthPage =
        currentPage === "login.html" ||
        currentPage === "register.html";

    if (
        isAuthPage &&
        isLoggedIn()
    ) {

        window.location.href =
            "dashboard.html";
    }
}


/* =========================================================
   LOGOUT
   ========================================================= */

function logoutUser() {

    clearLoggedInUser();

    window.location.href =
        "login.html";
}


/* =========================================================
   LOGOUT BUTTONS
   ========================================================= */

function initializeLogoutButtons() {

    const logoutButtons =
        document.querySelectorAll(
            "#logoutBtn, #logout-button"
        );

    logoutButtons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();

                    const confirmed =
                        window.confirm(
                            "Are you sure you want to logout?"
                        );

                    if (confirmed) {

                        logoutUser();
                    }
                }
            );
        }
    );
}


/* =========================================================
   USERNAME DISPLAY
   ========================================================= */

function displayLoggedInUser() {

    const user =
        getLoggedInUser();

    if (!user) {
        return;
    }


    const usernameElements =
        document.querySelectorAll(
            "#dashboardUsername, #profileUsernameDisplay"
        );


    usernameElements.forEach(
        function(element) {

            element.textContent =
                user.username || "Student";
        }
    );
}


/* =========================================================
   PROFILE FALLBACK INITIAL
   ========================================================= */

function getUserInitial(username) {

    if (
        !username ||
        typeof username !== "string"
    ) {

        return "U";
    }

    return username
        .trim()
        .charAt(0)
        .toUpperCase();
}


function displayUserInitial() {

    const user =
        getLoggedInUser();

    if (!user) {
        return;
    }

    const initial =
        getUserInitial(
            user.username
        );


    const fallbackElements =
        document.querySelectorAll(
            "#dashboardAvatarFallback, #profileImageFallback"
        );


    fallbackElements.forEach(
        function(element) {

            element.textContent =
                initial;
        }
    );
}


/* =========================================================
   NAVIGATION ACTIVE STATE
   ========================================================= */

function setActiveNavigation() {

    const currentPage =
        getCurrentPage();

    const navLinks =
        document.querySelectorAll(
            ".nav-links a"
        );


    navLinks.forEach(
        function(link) {

            const href =
                link.getAttribute("href");

            if (!href) {
                return;
            }


            const linkPage =
                href.split("#")[0];


            if (
                linkPage === currentPage
            ) {

                link.classList.add(
                    "active"
                );

            } else {

                link.classList.remove(
                    "active"
                );
            }
        }
    );
}


/* =========================================================
   SMOOTH SCROLLING
   ========================================================= */

function initializeSmoothScrolling() {

    const links =
        document.querySelectorAll(
            'a[href^="#"]'
        );


    links.forEach(
        function(link) {

            link.addEventListener(
                "click",
                function(event) {

                    const targetId =
                        link.getAttribute(
                            "href"
                        );

                    if (
                        !targetId ||
                        targetId === "#"
                    ) {
                        return;
                    }


                    const target =
                        document.querySelector(
                            targetId
                        );


                    if (target) {

                        event.preventDefault();

                        target.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });
                    }
                }
            );
        }
    );
}


/* =========================================================
   BUTTON LOADING STATE
   ========================================================= */

function setButtonLoading(
    button,
    loadingText = "Please wait..."
) {

    if (!button) {
        return;
    }


    if (
        !button.dataset.originalText
    ) {

        button.dataset.originalText =
            button.textContent;
    }


    button.disabled = true;

    button.textContent =
        loadingText;

    button.classList.add(
        "loading"
    );
}


function removeButtonLoading(button) {

    if (!button) {
        return;
    }


    button.disabled = false;

    if (
        button.dataset.originalText
    ) {

        button.textContent =
            button.dataset.originalText;
    }


    button.classList.remove(
        "loading"
    );
}


/* =========================================================
   FORM MESSAGE HELPER
   ========================================================= */

function showMessage(
    element,
    message,
    type = "info"
) {

    if (!element) {
        return;
    }


    element.textContent =
        message;

    element.className =
        "form-message " + type;
}


function clearMessage(element) {

    if (!element) {
        return;
    }


    element.textContent = "";

    element.className =
        "form-message";
}


/* =========================================================
   API HELPER
   ========================================================= */

async function apiRequest(
    endpoint,
    options = {}
) {

    const url =
        LearnHubApp.API_BASE_URL +
        endpoint;


    const defaultHeaders = {
        "Content-Type":
            "application/json"
    };


    const token =
        localStorage.getItem(
            "learnhub_token"
        );


    if (token) {

        defaultHeaders[
            "Authorization"
        ] =
            `Bearer ${token}`;
    }


    const requestOptions = {

        ...options,

        headers: {

            ...defaultHeaders,

            ...(options.headers || {})
        }
    };


    try {

        const response =
            await fetch(
                url,
                requestOptions
            );


        if (
            response.status === 401
        ) {

            clearLoggedInUser();

            window.location.href =
                "login.html";

            return null;
        }


        const contentType =
            response.headers.get(
                "content-type"
            );


        let data;


        if (
            contentType &&
            contentType.includes(
                "application/json"
            )
        ) {

            data =
                await response.json();

        } else {

            data =
                await response.text();
        }


        if (!response.ok) {

            throw new Error(
                data?.detail ||
                "Request failed."
            );
        }


        return data;

    } catch (error) {

        console.error(
            "LearnHub API Error:",
            error
        );

        throw error;
    }
}


/* =========================================================
   PAGE INITIALIZATION
   ========================================================= */

function initializeLearnHub() {

    /* Protect private pages */
    if (!protectPage()) {
        return;
    }


    /* Redirect already logged-in users */
    redirectLoggedInUser();


    /* Logout */
    initializeLogoutButtons();


    /* Username */
    displayLoggedInUser();


    /* Profile initial */
    displayUserInitial();


    /* Navigation */
    setActiveNavigation();


    /* Smooth scrolling */
    initializeSmoothScrolling();
}


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initializeLearnHub();

    }
);


/* =========================================================
   GLOBAL EXPORT
   ========================================================= */

window.LearnHubApp =
    LearnHubApp;

window.getLoggedInUser =
    getLoggedInUser;

window.setLoggedInUser =
    setLoggedInUser;

window.clearLoggedInUser =
    clearLoggedInUser;

window.isLoggedIn =
    isLoggedIn;

window.logoutUser =
    logoutUser;

window.apiRequest =
    apiRequest;

window.showMessage =
    showMessage;

window.clearMessage =
    clearMessage;

window.setButtonLoading =
    setButtonLoading;

window.removeButtonLoading =
    removeButtonLoading;