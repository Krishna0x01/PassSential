const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const strengthText = document.getElementById("strength");
const strengthFill = document.getElementById("strengthFill");
const strengthMessage = document.getElementById("strengthMessage");
const crackTime = document.getElementById("crackTime");


/* =========================
   PASSWORD HISTORY
========================= */

const historyButton = document.getElementById("historyButton");
const historySidebar = document.getElementById("historySidebar");
const closeHistory = document.getElementById("closeHistory");
const historyOverlay = document.getElementById("historyOverlay");
const historyList = document.getElementById("historyList");
const historyEmpty = document.getElementById("historyEmpty");
const clearHistory = document.getElementById("clearHistory");

const passwordHistory = [];
let historyTimer = null;
let lastHistoryPassword = "";


function maskPassword(password) {

    const visibleLength = Math.min(password.length, 16);

    return "•".repeat(visibleLength) +
        (password.length > 16 ? "…" : "");

}


function addHistoryItem(password, strength, score, crackTimeValue) {

    if (!password || password === lastHistoryPassword) {
        return;
    }

    lastHistoryPassword = password;

    passwordHistory.unshift({
        password: password,
        preview: maskPassword(password),
        length: password.length,
        strength: strength,
        score: score,
        crackTime: crackTimeValue || "Unknown"
    });

    renderHistory();

}


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

        const strengthClass = item.strength.toLowerCase();

        historyItem.innerHTML = `
            <div class="history-item-top">
                <span class="history-password">${item.preview}</span>
                <span class="history-number">#${passwordHistory.length - index}</span>
            </div>
            <div class="history-item-details">
                <span class="history-strength ${strengthClass}">${item.strength}</span>
                <span>${item.length} characters</span>
            </div>
            <div class="history-crack">
                Crack time: ${item.crackTime}
            </div>
        `;

        historyItem.addEventListener("click", function () {
            showHistoryResult(item);
            closeHistorySidebar();
        });

        historyList.appendChild(historyItem);

    });

}


function showHistoryResult(item) {

    /* Restore the actual password into the password box.
       The password is kept only in page memory and disappears
       when the page is closed or refreshed. */
    passwordInput.value = item.password;

    updateStrength(item.score, item.strength, item.crackTime);

}


function openHistorySidebar() {

    historySidebar.classList.add("open");
    historyOverlay.classList.add("show");
    historySidebar.setAttribute("aria-hidden", "false");

}


function closeHistorySidebar() {

    historySidebar.classList.remove("open");
    historyOverlay.classList.remove("show");
    historySidebar.setAttribute("aria-hidden", "true");

}


historyButton.addEventListener("click", function (event) {
    event.stopPropagation();
    openHistorySidebar();
});

closeHistory.addEventListener("click", closeHistorySidebar);
historyOverlay.addEventListener("click", closeHistorySidebar);

clearHistory.addEventListener("click", function () {

    passwordHistory.length = 0;
    lastHistoryPassword = "";
    renderHistory();

});

document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {
        closeHistorySidebar();
    }

});


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

    if (password.length === 0) {

        clearTimeout(historyTimer);
        lastHistoryPassword = "";
        resetChecker();
        return;

    }

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
            data.strength,
            data.crack_time
        );

        /* Add only after the user pauses typing.
           This prevents one history entry per keystroke. */
        clearTimeout(historyTimer);

        historyTimer = setTimeout(function () {

            addHistoryItem(
                password,
                data.strength,
                data.score,
                data.crack_time
            );

        }, 800);

    } catch (error) {

        console.error("Error:", error);

    }

});


/* =========================
   STRENGTH UI
========================= */

function updateStrength(score, strength, crackTimeValue) {

    const percentage = score * 20;

    strengthFill.style.width = percentage + "%";
    strengthText.textContent = strength;
    crackTime.textContent = crackTimeValue || "Unknown";

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

    strengthText.textContent = "";
    strengthText.style.color = "#777";
    strengthFill.style.width = "0%";
    crackTime.textContent = "0";

    strengthMessage.textContent =
        "Enter a password to begin the security check.";

    strengthMessage.style.color = "#777";

}


/* =========================
   THEME MENU
========================= */

const themeButton = document.getElementById("themeButton");
const themeMenu = document.getElementById("themeMenu");
const themeOptions = document.querySelectorAll(".theme-option");


themeButton.addEventListener("click", function (event) {

    event.stopPropagation();
    themeMenu.classList.toggle("show");

});


themeMenu.addEventListener("click", function (event) {
    event.stopPropagation();
});


document.addEventListener("click", function () {
    themeMenu.classList.remove("show");
});


function applyTheme(theme) {

    document.body.classList.remove(
        "dark",
        "light",
        "system"
    );

    document.body.classList.add(theme);

    if (theme === "dark") {
        themeButton.textContent = "☾";
    }
    else if (theme === "light") {
        themeButton.textContent = "☀";
    }
    else {
        themeButton.textContent = "◐";
    }

    themeOptions.forEach(function (option) {

        option.classList.remove("active");

        if (option.dataset.theme === theme) {
            option.classList.add("active");
        }

    });

}


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
renderHistory();
