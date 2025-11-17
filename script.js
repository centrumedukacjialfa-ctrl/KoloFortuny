// ==========================================
//      FUNKCJE TRYBÓW GRY (WYMAGANE!)
// ==========================================

// ukrywa wszystkie panele
function hideAllPanels() {
    document.getElementById("modePanel").classList.add("hidden");
    document.getElementById("missionPanel").classList.add("hidden");
    document.getElementById("timer").classList.add("hidden");
    document.getElementById("scoreBoard").classList.add("hidden");
    document.getElementById("lifePanel").classList.add("hidden");

    document.getElementById("spinBtn").classList.remove("hidden");
    document.getElementById("answerSection").classList.remove("hidden");
}

// ----------------------------
//       TRYB MISJI
// ----------------------------
function startMissionMode() {
    hideAllPanels();
    document.getElementById("missionPanel").classList.remove("hidden");
    document.getElementById("lifePanel").classList.remove("hidden");

    points = 0;
    resetLives();
    updateScore();
    generateTask();
}

function startMission() {
    points = 0;
    resetLives();
    updateScore();
    generateTask();
}


// ----------------------------
//      TRYB CZASOWY
// ----------------------------
function startTimeMode() {
    hideAllPanels();
    document.getElementById("timer").classList.remove("hidden");
    document.getElementById("lifePanel").classList.remove("hidden");

    points = 0;
    resetLives();
    updateScore();
    startTimer();
    generateTask();
}

let timerInterval;

function startTimer() {
    clearInterval(timerInterval);
    let timeLeft = 10;
    document.getElementById("timeLeft").innerText = timeLeft;

    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("timeLeft").innerText = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert("⏱ Czas minął!");
            loseLife();
            startTimer();
            generateTask();
        }
    }, 1000);
}


// ----------------------------
//      TRYB TURNIEJOWY
// ----------------------------
function startTournamentMode() {
    alert("Tryb turniejowy zostanie dodany w kolejnej aktualizacji.");
}


// ----------------------------
//      GRA DO X PUNKTÓW
// ----------------------------
function startPointsMode() {
    hideAllPanels();
    document.getElementById("lifePanel").classList.remove("hidden");

    points = 0;
    resetLives();
    updateScore();
    generateTask();
}


// ----------------------------
//      TRYB NIESKOŃCZONY
// ----------------------------
function startEndlessMode() {
    hideAllPanels();
    document.getElementById("lifePanel").classList.remove("hidden");

    points = 0;
    resetLives();
    updateScore();
    generateTask();
}
