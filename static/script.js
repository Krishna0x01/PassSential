const passwordInput = document.getElementById("password");

const togglePassword = document.getElementById("togglePassword");

const strengthText = document.getElementById("strength");

const strengthFill = document.getElementById("strengthFill");

const strengthMessage = document.getElementById("strengthMessage");

const crackTime = document.getElementById("crackTime");

const breachSection = document.getElementById("breachSection");

const breachIcon = document.getElementById("breachIcon");

const breachTitle = document.getElementById("breachTitle");

const breachMessage = document.getElementById("breachMessage");

const breachButton = document.getElementById("breachButton");


/* =========================
   SHOW / HIDE PASSWORD
========================= */

togglePassword.addEventListener("click", function () {

    const showingPassword = passwordInput.type === "text";

    passwordInput.type = showingPassword ? "password" : "text";

    togglePassword.classList.toggle("showing", !showingPassword);

    togglePassword.setAttribute(
        "aria-label",
        showingPassword ? "Show password" : "Hide password"
    );

    togglePassword.setAttribute(
        "title",
        showingPassword ? "Show password" : "Hide password"
    );

});


/* =========================
   PASSWORD STRENGTH CHECK
========================= */

let passwordCheckController = null;
let passwordCheckRequestId = 0;
let lastCheckedPassword = "";

passwordInput.addEventListener("input", async function () {

    const password = passwordInput.value;

    resetBreach();

    if (password.length === 0) {
        lastCheckedPassword = "";
        resetChecker();
        return;
    }

    /*
     * Cancel the previous request.
     * This prevents an older response from
     * overwriting the latest password result.
     */
    if (passwordCheckController) {
        passwordCheckController.abort();
    }

    passwordCheckController = new AbortController();

    const requestId = ++passwordCheckRequestId;

    try {

        const response = await fetch("/check-password", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                password: password
            }),

            signal: passwordCheckController.signal

        });

        if (!response.ok) {
            throw new Error("Password check failed.");
        }

        const data = await response.json();

        /*
         * Ignore stale responses.
         */
        if (requestId !== passwordCheckRequestId) {
            return;
        }

        updateStrength(
            data.score,
            data.strength
        );

        lastCheckedPassword = password;

        if (
            crackTime &&
            data.crack_time !== undefined
        ) {
            crackTime.textContent = data.crack_time;
        }

    } catch (error) {

        if (error.name === "AbortError") {
            return;
        }

        console.error(
            "Password strength error:",
            error
        );

    }

});

/* =========================
   MANUAL BREACH CHECK
========================= */

breachButton.addEventListener("click", async function () {

    const password = passwordInput.value;


    /* No password entered */

    if (!password) {

        breachSection.className = "breach error";

        breachIcon.textContent = "";

        breachTitle.textContent = "Enter a password to check.";

        breachMessage.textContent =
            "Please enter a password before starting the breach check.";

        return;

    }


    /* Disable button while checking */

    breachButton.disabled = true;

    breachButton.textContent = "Checking...";


    breachSection.className = "breach";

    breachIcon.textContent = "";

    breachTitle.textContent = "Checking breach data...";

    breachMessage.textContent =
        "Checking the Pwned Passwords data...";


    try {

        const response = await fetch("/check-breach", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                password: password
            })

        });


        const data = await response.json();


        /* Server returned an error */

        if (!response.ok) {

            throw new Error(
                data.error || "Breach check failed."
            );

        }


        /* =========================
           PASSWORD WAS BREACHED
        ========================= */

        if (data.breached) {

            breachSection.className = "breach danger";

            breachIcon.textContent = "⚠";

            breachTitle.textContent = "Oh no — password found!";

            breachMessage.innerHTML =
                `This password has been seen <strong>${data.count.toLocaleString()}</strong> times before in known data breaches.<br><br>` +
                "This password has previously appeared in a data breach and should not be used. " +
                "If you've used it on any account before, change it immediately.";

        }


        /* =========================
           PASSWORD NOT FOUND
        ========================= */

        else {

            breachSection.className = "breach safe";

            breachIcon.textContent = "✓";

            breachTitle.textContent = "Good news — no breach found!";

            breachMessage.textContent =
                "This password wasn't found in the Pwned Passwords data checked. " +
                "That doesn't necessarily mean it's a strong password; it simply means no matching record was found.";

        }


    } catch (error) {

        console.error("Breach check error:", error);


        breachSection.className = "breach error";

        breachIcon.textContent = "";

        breachTitle.textContent = "Breach check unavailable.";

        breachMessage.textContent =
            error.message || "The breach service could not be reached. Please try again.";

    }


    /* Enable button again */

    finally {

        breachButton.disabled = false;

        breachButton.textContent = "Check for Breach";

    }

});


/* =========================
   RESET BREACH
========================= */

function resetBreach() {

    breachSection.className = "breach";

    /* No warning by default */
    breachIcon.textContent = "";

    breachTitle.textContent = "";

    breachMessage.textContent =
        "Check whether this password has appeared in known data breaches.";

    breachButton.disabled = false;

    breachButton.textContent = "Check for Breach";

}

/* =========================
   STRENGTH UI
========================= */

function updateStrength(score, strength) {

    const percentage = score * 20;


    /* Update progress bar */

    strengthFill.style.width = percentage + "%";


    /* Update strength text */

    strengthText.textContent = strength;


    /* =========================
       WEAK
    ========================= */

    if (strength === "Weak") {

        strengthText.style.color = "#ff3333";

        strengthFill.style.background = "#e50914";

        strengthMessage.textContent =
            "This password is easy to guess.";

        strengthMessage.style.color = "#ff5555";

    }


    /* =========================
       MEDIUM
    ========================= */

    else if (strength === "Medium") {

        strengthText.style.color = "#ff8c00";

        strengthFill.style.background = "#ff6a00";

        strengthMessage.textContent =
            "Your password could be stronger.";

        strengthMessage.style.color = "#ff8c00";

    }


    /* =========================
       STRONG
    ========================= */

    else {

        strengthText.style.color = "#00d26a";

        strengthFill.style.background = "#00b85c";

        strengthMessage.textContent =
            "Strong password. Good job.";

        strengthMessage.style.color = "#00c968";

    }

}


/* =========================
   RESET STRENGTH
========================= */

function resetChecker() {

    strengthText.textContent = "";

    strengthText.style.color = "#777";


    strengthFill.style.width = "0%";


    strengthMessage.textContent =
        "Enter a password to begin the security check.";

    strengthMessage.style.color = "#777";


    if (crackTime) {

        crackTime.textContent = "0";

    }

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
/* =====================================================
   PASSWORD HISTORY
===================================================== */

const historyButton = document.getElementById("historyButton");
const historySidebar = document.getElementById("historySidebar");
const closeHistory = document.getElementById("closeHistory");
const historyOverlay = document.getElementById("historyOverlay");
const historyList = document.getElementById("historyList");
const historyEmpty = document.getElementById("historyEmpty");
const clearHistory = document.getElementById("clearHistory");

let passwordHistory = [];

let historyTimer = null;


/* =========================
   OPEN HISTORY
========================= */

historyButton.addEventListener("click", function () {

    historySidebar.classList.add("open");

    historyOverlay.classList.add("show");

    historySidebar.setAttribute("aria-hidden", "false");

});


/* =========================
   CLOSE HISTORY
========================= */

function closeHistorySidebar() {

    historySidebar.classList.remove("open");

    historyOverlay.classList.remove("show");

    historySidebar.setAttribute("aria-hidden", "true");

}


closeHistory.addEventListener("click", closeHistorySidebar);

historyOverlay.addEventListener("click", closeHistorySidebar);


/* =========================
   SAVE PASSWORD TO HISTORY
========================= */

function addToHistory(password, strength, crackTimeValue) {

    if (!password) {
        return;
    }


    const existingIndex = passwordHistory.findIndex(
        item => item.password === password
    );


    /* Remove old copy if it already exists */

    if (existingIndex !== -1) {

        passwordHistory.splice(existingIndex, 1);

    }


    /* Add newest check to the beginning */

    passwordHistory.unshift({

        password: password,

        strength: strength,

        crackTime: crackTimeValue

    });


    /* Keep maximum 20 entries */

    if (passwordHistory.length > 20) {

        passwordHistory.pop();

    }


    renderHistory();

}


/* =========================
   DISPLAY HISTORY
========================= */

function renderHistory() {

    historyList.innerHTML = "";


    if (passwordHistory.length === 0) {

        historyList.appendChild(historyEmpty);

        return;

    }


    passwordHistory.forEach(function (item, index) {

        const historyItem = document.createElement("button");

        historyItem.type = "button";

        historyItem.className = "history-item";


        let strengthClass = "strong";

        if (item.strength === "Weak") {

            strengthClass = "weak";

        } else if (item.strength === "Medium") {

            strengthClass = "medium";

        }


        historyItem.innerHTML = `
            <div class="history-item-top">

              <span class="history-password">
                ${"•".repeat(item.password.length)}
               </span>

                <span class="history-number">
                    #${index + 1}
                </span>

            </div>

            <div class="history-item-details">

                <span class="history-strength ${strengthClass}">
                    ${escapeHTML(item.strength)}
                </span>

                <span>
                    Checked
                </span>

            </div>

            <div class="history-crack">
                Crack time: ${escapeHTML(String(item.crackTime))}
            </div>
        `;


        historyItem.addEventListener("click", function () {

            restoreHistoryItem(item);

        });


        historyList.appendChild(historyItem);

    });

}


/* =========================
   RESTORE HISTORY ITEM
========================= */

function restoreHistoryItem(item) {

    passwordInput.value = item.password;

    passwordInput.type = "password";

    togglePassword.classList.remove("showing");

    togglePassword.setAttribute("aria-label", "Show password");

    togglePassword.setAttribute("title", "Show password");


    /* Restore strength */

    updateStrength(
        item.strength === "Weak"
            ? 1
            : item.strength === "Medium"
                ? 3
                : 5,
        item.strength
    );


    /* Restore crack time */

    if (crackTime) {

        crackTime.textContent = item.crackTime;

    }


    /* Reset breach result */

    resetBreach();


    closeHistorySidebar();

}


/* =========================
   CLEAR HISTORY
========================= */

clearHistory.addEventListener("click", function () {

    passwordHistory = [];

    renderHistory();

});


/* =========================
   AUTO SAVE AFTER TYPING
========================= */

passwordInput.addEventListener("input", function () {

    clearTimeout(historyTimer);


    const password = passwordInput.value;


    if (!password) {

        return;

    }


    historyTimer = setTimeout(function () {

        const currentStrength =
            strengthText.textContent;

        const currentCrackTime =
            crackTime.textContent;


        if (
            currentStrength &&
            currentStrength !== "" &&
            password === lastCheckedPassword
        ) {

            addToHistory(
                password,
                currentStrength,
                currentCrackTime
            );

        }

    }, 800);

});


/* =========================
   ESCAPE HTML
========================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}