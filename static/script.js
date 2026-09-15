const passwordInput = document.getElementById("password");

const togglePassword = document.getElementById("togglePassword");

const strengthText = document.getElementById("strength");

const strengthFill = document.getElementById("strengthFill");

const strengthMessage = document.getElementById("strengthMessage");


/* =========================
   SHOW / HIDE PASSWORD
========================= */

togglePassword.addEventListener("click", function () {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        togglePassword.textContent = "🙈";

    } else {

        passwordInput.type = "password";

        togglePassword.textContent = "👁";

    }

});
/* =========================
   RESET WHEN INPUT IS EMPTY
========================= */

passwordInput.addEventListener("input", function () {

    if (passwordInput.value.length === 0) {

        resetChecker();

    }

});
passwordInput.addEventListener("input", async function () {

    const password = passwordInput.value;

    // Empty input → reset everything
    if (password.length === 0) {
        resetChecker();
        return;
    }

    // Update requirements
    updateRequirement(
        "length",
        password.length >= 8
    );

    updateRequirement(
        "uppercase",
        /[A-Z]/.test(password)
    );

    updateRequirement(
        "lowercase",
        /[a-z]/.test(password)
    );

    updateRequirement(
        "number",
        /[0-9]/.test(password)
    );

    updateRequirement(
        "special",
        /[^A-Za-z0-9]/.test(password)
    );

    // Check password strength
    try {

        const response = await fetch("/check-password", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                password: password
            })

        });

        const data = await response.json();

        updateStrength(
            data.score,
            data.strength
        );

    } catch (error) {

        console.error("Error:", error);

    }

});

/* =========================
   REQUIREMENT FUNCTION
========================= */

function updateRequirement(id, valid) {

    const element = document.getElementById(id);

    if (valid) {

        element.classList.add("valid");

    } else {

        element.classList.remove("valid");

    }

}


/* =========================
   STRENGTH UI
========================= */

function updateStrength(score, strength) {

    let percentage = score * 20;

    strengthFill.style.width = percentage + "%";

    strengthText.textContent = strength;


    if (strength === "Weak") {

        strengthText.style.color = "#ff3333";

        strengthFill.style.background = "#e50914";

        strengthMessage.textContent =
            "This password is easy to guess.";

        strengthMessage.style.color = "#ff5555";

    }

    else if (strength === "Medium") {

        strengthText.style.color = "#ff8c00";

        strengthFill.style.background = "#ff6a00";

        strengthMessage.textContent =
            "Your password could be stronger.";

        strengthMessage.style.color = "#ff8c00";

    }

    else {

        strengthText.style.color = "#00d26a";

        strengthFill.style.background = "#00b85c";

        strengthMessage.textContent =
            "Strong password. Good job.";

        strengthMessage.style.color = "#00c968";

    }

}


/* =========================
   RESET
========================= */

function resetChecker() {

    strengthText.textContent = "Waiting...";

    strengthText.style.color = "#777";

    strengthFill.style.width = "0%";

    strengthMessage.textContent =
        "Enter a password to begin the security check.";

    strengthMessage.style.color = "#777";


    const requirements = document.querySelectorAll(".requirement");

    requirements.forEach(function (element) {

        element.classList.remove("valid");

    });

}
/* =========================
   PASSWORD REQUIREMENTS INFO
========================= */

const infoButton = document.getElementById("infoButton");

const requirements = document.getElementById("requirements");
infoButton.addEventListener("click", function () {

    requirements.classList.toggle("hidden");

});


let passwordChecked = false;

passwordInput.addEventListener("input", async function () {

    const password = passwordInput.value;

    // If box is completely empty, return to initial state
    if (password.length === 0) {
        passwordChecked = false;
        resetChecker();
        return;
    }

    // Don't check dynamically until the user has clicked
    // "Check Password" at least once
    if (!passwordChecked) {
        return;
    }

    // Update requirements dynamically
    updateRequirement(
        "length",
        password.length >= 8
    );

    updateRequirement(
        "uppercase",
        /[A-Z]/.test(password)
    );

    updateRequirement(
        "lowercase",
        /[a-z]/.test(password)
    );

    updateRequirement(
        "number",
        /[0-9]/.test(password)
    );

    updateRequirement(
        "special",
        /[^A-Za-z0-9]/.test(password)
    );

    // Check updated password
    try {

        const response = await fetch("/check-password", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                password: password
            })

        });

        const data = await response.json();

        updateStrength(
            data.score,
            data.strength
        );

    } catch (error) {
        console.error("Error:", error);
    }

});
/* =========================
   THEME MENU
========================= */

const themeButton = document.getElementById("themeButton");

const themeMenu = document.getElementById("themeMenu");

const themeOptions = document.querySelectorAll(".theme-option");


/* Open / close menu */

themeButton.addEventListener("click", function (event) {

    event.stopPropagation();

    themeMenu.classList.toggle("show");

});


/* Prevent menu click from reaching document */

themeMenu.addEventListener("click", function (event) {

    event.stopPropagation();

});


/* Close when clicking outside */

document.addEventListener("click", function () {

    themeMenu.classList.remove("show");

});


/* =========================
   APPLY THEME
========================= */

function applyTheme(theme) {

    document.body.classList.remove(
        "dark",
        "light",
        "system"
    );

    document.body.classList.add(theme);


    /* Change main icon */

    if (theme === "dark") {

        themeButton.textContent = "☾";

    }

    else if (theme === "light") {

        themeButton.textContent = "☀";

    }

    else {

        themeButton.textContent = "◐";

    }


    /* Mark selected option */

    themeOptions.forEach(function (option) {

        option.classList.remove("active");

        if (option.dataset.theme === theme) {

            option.classList.add("active");

        }

    });
}


/* =========================
   THEME SELECTION
========================= */

themeOptions.forEach(function (option) {

    option.addEventListener("click", function () {

        const selectedTheme = option.dataset.theme;

        applyTheme(selectedTheme);

        themeMenu.classList.remove("show");

    });

});


/* =========================
   DEFAULT THEME
========================= */

applyTheme("system");