// ============================================================
// LearnHub - Profile JavaScript
// Matches current profile.html + users.py
// ============================================================

const API_BASE_URL = "http://127.0.0.1:8000";

let currentUsername = "";
let selectedProfileImage = null;


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    currentUsername = localStorage.getItem("username");

    if (!currentUsername) {

        alert("Please login first.");

        window.location.href = "login.html";

        return;
    }

    loadProfile();

    setupProfileForm();

    setupProfileImage();

    setupRemoveProfileImage();

    setupLogout();

});


// ============================================================
// LOAD PROFILE
// ============================================================

async function loadProfile() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/users/profile/${encodeURIComponent(currentUsername)}`
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data?.detail || "Unable to load profile."
            );

        }

        displayProfile(data);

    } catch (error) {

        console.error("Profile loading error:", error);

        showMessage(
            "Unable to load profile: " + error.message,
            "error"
        );

    }

}


// ============================================================
// DISPLAY PROFILE
// ============================================================

function displayProfile(data) {

    const usernameInput =
        document.getElementById("profileUsername");

    const emailInput =
        document.getElementById("profileEmail");

    const aboutInput =
        document.getElementById("profileAbout");


    // Username - editable
    if (usernameInput) {

        usernameInput.value =
            data.username || "";

    }


    // Email - ALWAYS READ ONLY
    if (emailInput) {

        emailInput.value =
            data.email || "";

    }


    // About
    if (aboutInput) {

        aboutInput.value =
            data.about || "";

    }


    // Profile picture
    updateProfilePicture(
        data.profile_picture,
        data.username
    );

}


// ============================================================
// UPDATE PROFILE PICTURE DISPLAY
// ============================================================

function updateProfilePicture(
    profilePicture,
    username
) {

    const image =
        document.getElementById("profileImage");

    const fallback =
        document.getElementById("profileImageFallback");


    if (!image || !fallback) {

        return;

    }


    if (profilePicture) {

        image.src =
            profilePicture;

        image.style.display =
            "block";

        fallback.style.display =
            "none";


        image.onerror = () => {

            image.style.display =
                "none";

            fallback.style.display =
                "flex";

            fallback.textContent =
                getInitial(username);

        };

    } else {

        image.removeAttribute("src");

        image.style.display =
            "none";

        fallback.style.display =
            "flex";

        fallback.textContent =
            getInitial(username);

    }

}


// ============================================================
// PROFILE IMAGE SELECTION
// ============================================================

function setupProfileImage() {

    const input =
        document.getElementById("profileImageInput");


    if (!input) {

        return;

    }


    input.addEventListener(
        "change",
        (event) => {

            const file =
                event.target.files[0];


            if (!file) {

                return;

            }


            // Must be an image
            if (!file.type.startsWith("image/")) {

                alert(
                    "Please select a valid image file."
                );

                input.value = "";

                return;

            }


            // Maximum 5 MB
            if (file.size > 5 * 1024 * 1024) {

                alert(
                    "Profile picture must be smaller than 5 MB."
                );

                input.value = "";

                return;

            }


            selectedProfileImage =
                file;


            // Preview
            const reader =
                new FileReader();


            reader.onload = () => {

                const image =
                    document.getElementById(
                        "profileImage"
                    );

                const fallback =
                    document.getElementById(
                        "profileImageFallback"
                    );


                if (image) {

                    image.src =
                        reader.result;

                    image.style.display =
                        "block";

                }


                if (fallback) {

                    fallback.style.display =
                        "none";

                }

            };


            reader.readAsDataURL(file);

        }
    );

}


// ============================================================
// REMOVE PROFILE PICTURE
// ============================================================

function setupRemoveProfileImage() {

    const removeButton =
        document.getElementById(
            "removeProfileImage"
        );


    if (!removeButton) {

        return;

    }


    removeButton.addEventListener(
        "click",
        async () => {

            const usernameInput =
                document.getElementById(
                    "profileUsername"
                );

            const aboutInput =
                document.getElementById(
                    "profileAbout"
                );


            const newUsername =
                usernameInput
                    ? usernameInput.value.trim()
                    : currentUsername;


            const about =
                aboutInput
                    ? aboutInput.value.trim()
                    : "";


            if (!newUsername) {

                showMessage(
                    "Username cannot be empty.",
                    "error"
                );

                return;

            }


            const formData =
                new FormData();


            formData.append(
                "new_username",
                newUsername
            );


            formData.append(
                "about",
                about
            );


            formData.append(
                "remove_profile_picture",
                "true"
            );


            try {

                removeButton.disabled =
                    true;


                const response =
                    await fetch(
                        `${API_BASE_URL}/users/profile/${encodeURIComponent(currentUsername)}`,
                        {
                            method: "PUT",
                            body: formData
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data?.detail ||
                        "Unable to remove profile picture."
                    );

                }


                // Update local session
                currentUsername =
                    data.username;

                localStorage.setItem(
                    "username",
                    data.username
                );

                localStorage.setItem(
                    "email",
                    data.email
                );


                selectedProfileImage =
                    null;


                const input =
                    document.getElementById(
                        "profileImageInput"
                    );

                if (input) {

                    input.value = "";

                }


                displayProfile(data);


                showMessage(
                    "Profile picture removed successfully.",
                    "success"
                );


            } catch (error) {

                console.error(
                    "Remove profile picture error:",
                    error
                );


                showMessage(
                    error.message,
                    "error"
                );


            } finally {

                removeButton.disabled =
                    false;

            }

        }
    );

}


// ============================================================
// PROFILE FORM
// ============================================================

function setupProfileForm() {

    const form =
        document.getElementById(
            "profileForm"
        );


    if (!form) {

        return;

    }


    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            await saveProfile();

        }
    );

}


// ============================================================
// SAVE PROFILE
// ============================================================

async function saveProfile() {

    const usernameInput =
        document.getElementById(
            "profileUsername"
        );

    const aboutInput =
        document.getElementById(
            "profileAbout"
        );


    const newUsername =
        usernameInput
            ? usernameInput.value.trim()
            : "";


    const about =
        aboutInput
            ? aboutInput.value.trim()
            : "";


    // Username required
    if (!newUsername) {

        showMessage(
            "Username cannot be empty.",
            "error"
        );

        return;

    }


    // ========================================================
    // IMPORTANT:
    // Use FormData because users.py expects Form(...)
    // and File(...)
    // ========================================================

    const formData =
        new FormData();


    formData.append(
        "new_username",
        newUsername
    );


    formData.append(
        "about",
        about
    );


    formData.append(
        "remove_profile_picture",
        "false"
    );


    // Add image only if user selected one
    if (selectedProfileImage) {

        formData.append(
            "profile_picture",
            selectedProfileImage
        );

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/users/profile/${encodeURIComponent(currentUsername)}`,
                {
                    method: "PUT",
                    body: formData
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data?.detail ||
                "Profile update failed."
            );

        }


        // ====================================================
        // UPDATE LOCAL STORAGE
        // ====================================================

        currentUsername =
            data.username;


        localStorage.setItem(
            "username",
            data.username
        );


        localStorage.setItem(
            "email",
            data.email
        );


        // Clear selected image
        selectedProfileImage =
            null;


        const imageInput =
            document.getElementById(
                "profileImageInput"
            );


        if (imageInput) {

            imageInput.value = "";

        }


        // Display saved profile
        displayProfile(data);


        showMessage(
            "Profile saved successfully!",
            "success"
        );


    } catch (error) {

        console.error(
            "Profile save error:",
            error
        );


        showMessage(
            "Unable to save profile: " +
            error.message,
            "error"
        );

    }

}


// ============================================================
// LOGOUT
// ============================================================

function setupLogout() {

    const logoutButton =
        document.getElementById(
            "logoutBtn"
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
// MESSAGE
// ============================================================

function showMessage(
    message,
    type
) {

    const messageElement =
        document.getElementById(
            "profileMessage"
        );


    if (!messageElement) {

        return;

    }


    messageElement.textContent =
        message;


    messageElement.className =
        `form-message ${type}`;

}


// ============================================================
// GET USER INITIAL
// ============================================================

function getInitial(username) {

    if (!username) {

        return "U";

    }


    return username
        .trim()
        .charAt(0)
        .toUpperCase();

}