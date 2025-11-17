// =====================
//   ZMIENNE GLOBALNE
// =====================
let ctx;
let wheel;
let angle = 0;
let spinning = false;
let lives = 3;
let points = 0;
let combo = 0;
let superMode = false;
let activeMultiplier = 1;
let correctAnswer = 0;
let mistakes = [];


// =====================
//   SEGMENTY KOŁA
// =====================
const segments = [
    { color: "#ff9999", text: "+1 pkt", type: "normal", value: 1 },
    { color: "#99ff99", text: "+2 pkt", type: "normal", value: 2 },
    { color: "#9999ff", text: "+3 pkt", type: "normal", value: 3 },
    { color: "#ffff99", text: "BONUS 2×", type: "bonus", mult: 2 },
    { color: "#ffcc99", text: "-2 pkt", type: "penalty", value: -2 },
    { color: "#ff99ff", text: "ZMIANA", type: "reroll" },
    { color: "#66ccff", text: "TRUDNE", type: "hard" },
    { color: "#ccff66", text: "LOSOWE", type: "random" },
    { color: "#ff6666", text: "-5 pkt", type: "penalty", value: -5 },
    { color: "#66ffcc", text: "+5 pkt", type: "normal", value: 5 },
    { color: "#cccccc", text: "PUSTE", type: "nothing" },
    { color: "#ffcc66", text: "SUPER", type: "super" }
];


// =====================
//     RYSOWANIE KOŁA
// =====================
window.onload = () => {
    wheel = document.getElementById("wheel");
    ctx = wheel.getContext("2d");
    drawWheel();
};

function drawWheel() {
    let arc = Math.PI * 2 / segments.length;

    for (let i = 0; i < segments.length; i++) {
        let start = angle + i * arc;

        ctx.beginPath();
        ctx.fillStyle = segments[i].color;
        ctx.moveTo(250, 250);
        ctx.arc(250, 250, 250, start, start + arc);
        ctx.fill();
        ctx.save();

        ctx.translate(250, 250);
        ctx.rotate(start + arc / 2);
        ctx.textAlign = "center";
        ctx.fillStyle = "black";
        ctx.font = "20px Arial";
        ctx.fillText(segments[i].text, 150, 10);
        ctx.restore();
    }
}


// =====================
//     SPIN KOŁA
// =====================
document.getElementById("spinBtn").onclick = spinWheel;

function spinWheel() {
    if (spinning) return;
    spinning = true;

    let spinTime = 2000 + Math.random() * 1500;
    let start = Date.now();

    let spinInterval = setInterval(() => {
        angle += 0.15;
        drawWheel();

        if (Date.now() - start > spinTime) {
            clearInterval(spinInterval);
            spinning = false;
            stopWheel();
        }
    }, 20);
}

function stopWheel() {
    let arc = Math.PI * 2 / segments.length;
    let index = Math.floor(((Math.PI * 1.5 - angle) % (Math.PI * 2)) / arc);
    if (index < 0) index += segments.length;
    handleSegment(segments[index]);
}


// =====================
//      ŻYCIA
// =====================
function resetLives() {
    lives = 3;
    document.getElementById("livesCount").innerText = lives;
}

function loseLife() {
    lives--;
    document.getElementById("livesCount").innerText = lives;

    if (lives <= 0) {
        alert("❌ Koniec gry!");
        showMistakes();
        location.reload();
    }
}


// =====================
//    OBSŁUGA SEGMENTÓW
// =====================
function handleSegment(s) {
    switch(s.type) {

        case "normal":
            points += s.value;
            break;

        case "penalty":
            points += s.value;
            break;

        case "bonus":
            activeMultiplier = s.mult;
            alert("🎁 BONUS ×" + activeMultiplier);
            break;

        case "reroll":
            alert("🔄 ZMIANA ZADANIA!");
            generateTask();
            return;

        case "hard":
            alert("❓ TRUDNE ZADANIE!");
            generateHardTask();
            return;

        case "random":
            alert("🎲 LOSOWE ZADANIE!");
            generateRandomTask();
            return;

        case "nothing":
            alert("😐 NIC.");
            return;

        case "super":
            alert("💥 SUPER ZADANIE!");
            generateSuperTask();
            return;
    }

    updateScore();
    generateTask();
}


// =====================
//        ZADANIA
// =====================
function generateTask() {
    let a = Math.floor(Math.random() * 20) + 1;
    let b = Math.floor(Math.random() * 20) + 1;

    correctAnswer = a + b;
    document.getElementById("taskBox").innerHTML = `<b>${a} + ${b}</b>`;
}

function generateHardTask() {
    let a = Math.floor(Math.random() * 60) + 20;
    let b = Math.floor(Math.random() * 40) + 10;

    correctAnswer = a - b;
    document.getElementById("taskBox").innerHTML = `TRUDNE: <b>${a} - ${b}</b>`;
}

function generateSuperTask() {
    let a = Math.floor(Math.random() * 100) + 50;
    let b = Math.floor(Math.random() * 100) + 20;

    correctAnswer = a + b;
    document.getElementById("taskBox").innerHTML =
        `SUPER: <b>${a} + ${b}</b> ( +10 / −5 )`;

    superMode = true;
}

function generateRandomTask() {
    let r = Math.floor(Math.random() * 3);

    if (r === 0) generateTask();
    if (r === 1) generateHardTask();
    if (r === 2) generateSuperTask();
}


// =====================
//        KOMBO
// =====================
function increaseCombo() {
    combo++;

    if (combo === 2) { points += 1; alert("🔥 SERIA 2! +1"); }
    if (combo === 4) { points += 3; alert("🔥🔥 SERIA 4! +3"); }
    if (combo === 6) { points += 7; alert("🔥🔥🔥 SERIA 6! +7"); }
}

function resetCombo() {
    combo = 0;
}


// =====================
//       POWTÓRKI
// =====================
function addMistake(task, correct) {
    mistakes.push({ task: task, correct: correct });
}

function showMistakes() {
    if (mistakes.length === 0) return;

    let msg = "Zadania do powtórki:\n\n";
    mistakes.forEach(m => msg += m.task + " → " + m.correct + "\n");

    alert(msg);
}


// =====================
//     SPRAWDZANIE
// =====================
document.getElementById("checkBtn").onclick = function() {

    let user = document.getElementById("answerInput").value;

    if (user == correctAnswer) {

        if (superMode) {
            points += 10;
            alert("💥 SUPER +10!");
            superMode = false;
        }

        increaseCombo();
        updateScore();
        generateTask();
    }
    else {
        addMistake(document.getElementById("taskBox").innerText, correctAnswer);

        if (superMode) {
            points -= 5;
            alert("💀 SUPER –5!");
            superMode = false;
        }

        loseLife();
        resetCombo();
        updateScore();
        generateTask();
    }
};


// =====================
//     TRYBY GRY
// =====================
function hideAllPanels() {
    document.getElementById("modePanel").classList.add("hidden");
    document.getElementById("missionPanel").classList.add("hidden");
    document.getElementById("timer").classList.add("hidden");

    document.getElementById("wheel-container").classList.remove("hidden");
    document.getElementById("spinBtn").classList.remove("hidden");
    document.getElementById("answerSection").classList.remove("hidden");
}

function startMissionMode() {
    hideAllPanels();
    document.getElementById("missionPanel").classList.remove("hidden");
    resetLives();
    points = 0;
    updateScore();
    generateTask();
}

function startMission() {
    resetLives();
    points = 0;
    updateScore();
    generateTask();
}

function startTimeMode() {
    hideAllPanels();
    document.getElementById("timer").classList.remove("hidden");
    resetLives();
    points = 0;
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

function startTournamentMode() {
    alert("Tryb turniejowy będzie dodany później.");
}

function startPointsMode() {
    hideAllPanels();
    resetLives();
    points = 0;
    updateScore();
    generateTask();
}

function startEndlessMode() {
    hideAllPanels();
    resetLives();
    points = 0;
    updateScore();
    generateTask();
}


// =====================
//   AKTUALIZACJA
// =====================
function updateScore() {
    document.getElementById("p1").innerText = points;
}
