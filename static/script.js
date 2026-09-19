const passwordInput = document.getElementById("password");

const togglePassword = document.getElementById("togglePassword");

const strengthText = document.getElementById("strength");

const strengthFill = document.getElementById("strengthFill");

const strengthMessage = document.getElementById("strengthMessage");
const crackTime = document.getElementById("crackTime");


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
   PASSWORD STRENGTH CHECK
========================= */

passwordInput.addEventListener("input", async function () {

    const password = passwordInput.value;


    /* Empty input → reset */

    if (password.length === 0) {

        resetChecker();

        return;

    }


    /* Send password to Flask */

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


        /* Update strength */

        updateStrength(
            data.score,
            data.strength,
            data.crack_time
        );


    } catch (error) {

        console.error("Error:", error);

    }

});


/* =========================
   STRENGTH UI
========================= */

function updateStrength(score, strength, crackTimeValue) {

    const percentage = score * 20;

    /* Update progress bar */
    strengthFill.style.width = percentage + "%";

    /* Update strength text */
    strengthText.textContent = strength;

    /* Update estimated crack time */
    crackTime.textContent = crackTimeValue || "Unknown";

    /* Weak */
    if (strength === "Weak") {

        strengthText.style.color = "#ff3333";
        strengthFill.style.background = "#e50914";
        strengthMessage.style.color = "#ff5555";
    }

    /* Medium */
    else if (strength === "Medium") {

        strengthText.style.color = "#ff8c00";
        strengthFill.style.background = "#ff6a00";
        strengthMessage.style.color = "#ff8c00";
    }

    /* Strong */
    else {

        strengthText.style.color = "#00d26a";
        strengthFill.style.background = "#00b85c";
        strengthMessage.style.color = "#00c968";
    }
}


/* =========================
   RESET
========================= */

function resetChecker() {

    strengthText.textContent = "";

    strengthText.style.color = "#777";


    strengthFill.style.width = "0%";


    crackTime.textContent = "0";

    strengthMessage.style.color = "#777";

}


/* =========================
   THEME MENU
========================= */

const themeButton = document.getElementById("themeButton");

const themeMenu = document.getElementById("themeMenu");

const themeOptions = document.querySelectorAll(".theme-option");


/* =========================
   OPEN / CLOSE THEME MENU
========================= */

themeButton.addEventListener("click", function (event) {

    event.stopPropagation();

    themeMenu.classList.toggle("show");

});


/* Prevent menu click from closing */

themeMenu.addEventListener("click", function (event) {

    event.stopPropagation();

});


/* Close menu when clicking outside */

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


    /* Change theme button icon */

    if (theme === "dark") {

        themeButton.textContent = "☾";

    }

    else if (theme === "light") {

        themeButton.textContent = "☀";

    }

    else {

        themeButton.textContent = "◐";

    }


    /* Mark selected theme */

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
crackTime.textContent = "0";