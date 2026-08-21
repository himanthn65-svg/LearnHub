// ============================================================
// LEARNHUB - ADMIN USER MANAGEMENT
// ============================================================

const API_URL = "http://127.0.0.1:8000";


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    loadUsers();

});


// ============================================================
// LOAD ALL USERS
// ============================================================

async function loadUsers() {

    const usersTable = document.getElementById("usersTable");
    const totalUsers = document.getElementById("totalUsers");

    try {

        const response = await fetch(
            `${API_URL}/admin/users`
        );

        if (!response.ok) {

            throw new Error("Unable to load users");

        }

        const users = await response.json();

        // Update total users
        totalUsers.textContent = users.length;

        // Clear table
        usersTable.innerHTML = "";

        if (users.length === 0) {

            usersTable.innerHTML = `
                <tr>
                    <td colspan="5" class="empty">
                        No users found
                    </td>
                </tr>
            `;

            return;
        }

        // Display users
        users.forEach(user => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${user.id}</td>

                <td>${escapeHTML(user.username)}</td>

                <td>${escapeHTML(user.email)}</td>

                <td>
                    ${
                        user.profile_picture
                        ? "Added"
                        : "Not added"
                    }
                </td>

                <td>
                    <button
                        class="delete-btn"
                        onclick="deleteUser(${user.id}, '${escapeAttribute(user.username)}')"
                    >
                        Delete
                    </button>
                </td>
            `;

            usersTable.appendChild(row);

        });

    } catch (error) {

        console.error(error);

        usersTable.innerHTML = `
            <tr>
                <td colspan="5" class="error">
                    Unable to connect to LearnHub server.
                </td>
            </tr>
        `;

        totalUsers.textContent = "0";

    }

}


// ============================================================
// ADD USER
// ============================================================

async function addUser() {

    const username =
        document.getElementById("username").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value.trim();

    const message =
        document.getElementById("message");


    // Validation
    if (!username || !email || !password) {

        showMessage(
            "Please fill all fields.",
            "error"
        );

        return;

    }


    try {

        const response = await fetch(
            `${API_URL}/admin/users/add`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    username: username,
                    email: email,
                    password: password

                })

            }
        );


        const data = await response.json();


        if (!response.ok) {

            showMessage(
                data.detail || "Unable to create user.",
                "error"
            );

            return;

        }


        showMessage(
            "User added successfully.",
            "success"
        );


        // Clear form
        document.getElementById("username").value = "";
        document.getElementById("email").value = "";
        document.getElementById("password").value = "";


        // Refresh user list
        loadUsers();


    } catch (error) {

        console.error(error);

        showMessage(
            "Unable to connect to LearnHub server.",
            "error"
        );

    }

}


// ============================================================
// DELETE USER
// ============================================================

async function deleteUser(userId, username) {

    const confirmed = confirm(
        `Are you sure you want to delete user "${username}"?`
    );


    if (!confirmed) {

        return;

    }


    try {

        const response = await fetch(
            `${API_URL}/admin/users/${userId}`,
            {
                method: "DELETE"
            }
        );


        const data = await response.json();


        if (!response.ok) {

            showMessage(
                data.detail || "Unable to delete user.",
                "error"
            );

            return;

        }


        showMessage(
            "User deleted successfully.",
            "success"
        );


        // Refresh users
        loadUsers();


    } catch (error) {

        console.error(error);

        showMessage(
            "Unable to connect to LearnHub server.",
            "error"
        );

    }

}


// ============================================================
// SHOW MESSAGE
// ============================================================

function showMessage(text, type) {

    const message =
        document.getElementById("message");

    message.textContent = text;

    message.className = `message ${type}`;


    setTimeout(() => {

        message.textContent = "";
        message.className = "message";

    }, 3000);

}


// ============================================================
// SECURITY HELPERS
// ============================================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function escapeAttribute(value) {

    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");

}