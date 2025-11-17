//---------------------------------------------------------
//                 ZMIENNE GLOBALNE
//---------------------------------------------------------
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

let tournamentActive = false;
let currentPlayer = 0;
let playerCount = 2;
let players = [];

//---------------------------------------------------------
//              SEGMENTY KOŁA FORTUNY
//---------------------------------------------------------
const segments = [
    { color: "#ff9999", text: "+1 pkt", type: "normal", value: 1 },
    { color: "#99ff99", text: "+2 pkt", type: "normal", value: 2 },
    { color: "#9999ff", text: "+3 pkt", type: "normal", value: 3 },
    { color: "#ffff99", text: "BONUS ×2", type: "bonus", mult: 2 },
    { color: "#ffcc99", text: "-2 pkt", type: "penalty", value: -2 },
    { color: "#ff99ff", text: "ZMIANA", type: "reroll" },
    { color: "#66ccff", text: "TRUDNE", type: "hard" },
    { color: "#ccff66", text: "LOSOWE", type: "random" },
    { color: "#ff6666", text: "-5 pkt", type: "penalty", value: -5 },
    { color: "#66ffcc", text: "+5 pkt", type: "normal", value: 5 },
    { color: "#cccccc", text: "PUSTE", type: "nothing" },
    { color: "#ffcc66", text: "SUPER", type: "super" }
];

//---------------------------------------------------------
//              RYSOWANIE KOŁA
//---------------------------------------------------------
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

        ctx.fillStyle = "black";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText(segments[i].text, 150, 10);

        ctx.restore();
    }
}

//---------------------------------------------------------
//              ANIMACJA KOŁA
//---------------------------------------------------------
document.getElementById("spinBtn").onclick = spinWheel;

function spinWheel() {
    if (spinning) return;
    spinning = true;

    let totalRotation = 360 * 5 + Math.random() * 360;
    let start = null;
    let duration = 3000;

    function animate(timestamp) {
        if (!start) start = timestamp;

        let progress = timestamp - start;
        let t = Math.min(progress / duration, 1);

        let ease = (--t) * t * t + 1;

        angle = ease * (totalRotation * Math.PI / 180);
        drawWheel();

        if (progress < duration) {
            requestAnimationFrame(animate);
        } else {
            spinning = false;
            stopWheel();
        }
    }

    requestAnimationFrame(animate);
}

//---------------------------------------------------------
//               STOP KOŁA
//---------------------------------------------------------
function stopWheel() {
    let arc = Math.PI * 2 / segments.length;
    let index = Math.floor(((Math.PI * 1.5 - angle) % (Math.PI * 2)) / arc);
    if (index < 0) index += segments.length;
    handleSegment(segments[index]);
}

//---------------------------------------------------------
//                     ŻYCIA
//---------------------------------------------------------
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

//---------------------------------------------------------
//               OBSŁUGA SEGMENTÓW
//---------------------------------------------------------
function handleSegment(s) {

    if (s.type === "normal") {
        points += s.value;
    }

    if (s.type === "penalty") {
        points += s.value;
    }

    if (s.type === "bonus") {
        activeMultiplier = s.mult;
        alert("🎁 BONUS ×" + activeMultiplier);
        generateTask();
        updateScore();
        return;
    }

    if (s.type === "reroll") {
        alert("🔄 ZMIANA!");
        generateTask();
        return;
    }

    if (s.type === "hard") {
        alert("❓ TRUDNE!");
        generateHardTask();
        return;
    }

    if (s.type === "random") {
        alert("🎲 LOSOWE!");
        generateRandomTask();
        return;
    }

    if (s.type === "nothing") {
        alert("😐 NIC.");
        generateTask();
        return;
    }

    if (s.type === "super") {
        alert("💥 SUPER!");
        generateSuperTask();
        return;
    }

    updateScore();
    generateTask();
}

//---------------------------------------------------------
//               ZADANIA
//---------------------------------------------------------
function generateTask() {
    let a = Math.floor(Math.random() * 20) + 1;
    let b = Math.floor(Math.random() * 20) + 1;

    correctAnswer = a + b;
    document.getElementById("taskBox").innerHTML = `${a} + ${b}`;
}

function generateHardTask() {
    let a = Math.floor(Math.random() * 60) + 20;
    let b = Math.floor(Math.random() * 40) + 10;

    correctAnswer = a - b;
    document.getElementById("taskBox").innerHTML = `TRUDNE: ${a} - ${b}`;
}

function generateSuperTask() {
    let a = Math.floor(Math.random() * 100) + 50;
    let b = Math.floor(Math.random() * 100) + 20;

    correctAnswer = a + b;
    superMode = true;
    document.getElementById("taskBox").innerHTML =
        `SUPER: ${a} + ${b} ( +10 / −5 )`;
}

function generateRandomTask() {
    let r = Math.floor(Math.random() * 3);
    if (r === 0) generateTask();
    if (r === 1) generateHardTask();
    if (r === 2) generateSuperTask();
}

//---------------------------------------------------------
//                   KOMBO
//---------------------------------------------------------
function increaseCombo() {
    combo++;

    if (combo === 2) points += 1;
    if (combo === 4) points += 3;
    if (combo === 6) points += 7;
}

function resetCombo() {
    combo = 0;
}

//---------------------------------------------------------
//                POWTÓRKI BŁĘDÓW
//---------------------------------------------------------
function addMistake(task, correct) {
    mistakes.push({ task: task, correct: correct });
}

function showMistakes() {
    if (!mistakes.length) return;

    let msg = "Zadania do powtórki:\n\n";
    mistakes.forEach(m => msg += m.task + " → " + m.correct + "\n");
    alert(msg);
}

//---------------------------------------------------------
//               SPRAWDZANIE ODPOWIEDZI
//---------------------------------------------------------
document.getElementById("checkBtn").onclick = function() {

    let user = document.getElementById("answerInput").value;

    if (tournamentActive) {
        checkTournamentAnswer(user);
        return;
    }

    if (user == correctAnswer) {

        if (superMode) {
            points += 10;
            superMode = false;
        }

        increaseCombo();
        updateScore();
        generateTask();
    } else {
        addMistake(document.getElementById("taskBox").innerText, correctAnswer);

        if (superMode) {
            points -= 5;
            superMode = false;
        }

        loseLife();
        resetCombo();
        updateScore();
        generateTask();
    }
};

//---------------------------------------------------------
//                 TRYBY GRY
//---------------------------------------------------------
function hideAllPanels() {
    document.getElementById("modePanel").classList.add("hidden");
    document.getElementById("missionPanel").classList.add("hidden");
    document.getElementById("timer").classList.add("hidden");
    document.getElementById("tournamentSetup").classList.add("hidden");
    document.getElementById("tournamentBoard").classList.add("hidden");
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
    hideAllPanels();
    document.getElementById("tournamentSetup").classList.remove("hidden");
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

//---------------------------------------------------------
//                TRYB TURNIEJOWY
//---------------------------------------------------------
function createTournament() {
    playerCount = parseInt(document.getElementById("playerCount").value);
    players = [];

    for (let i = 0; i < playerCount; i++) {
        players.push({
            score: 0,
            lives: 3,
            name: "Gracz " + (i + 1)
        });
    }

    currentPlayer = 0;
    tournamentActive = true;

    document.getElementById("tournamentSetup").classList.add("hidden");
    document.getElementById("tournamentBoard").classList.remove("hidden");

    updateTournamentBoard();
    generateTask();
}

function updateTournamentBoard() {
    let info = `<h3>Tura: ${players[currentPlayer].name}</h3>`;
    document.getElementById("turnInfo").innerHTML = info;

    let scoreList = "";
    players.forEach(p => {
        scoreList += `${p.name}: ${p.score} pkt • ❤️ ${p.lives}<br>`;
    });
    document.getElementById("playerScores").innerHTML = scoreList;

    document.getElementById("livesCount").innerText = players[currentPlayer].lives;
}

function nextPlayer() {
    currentPlayer = (currentPlayer + 1) % playerCount;

    while (players[currentPlayer].lives <= 0) {
        currentPlayer = (currentPlayer + 1) % playerCount;
    }

    updateTournamentBoard();
}

function checkTournamentAnswer(user) {
    let p = players[currentPlayer];

    if (user == correctAnswer) {
        p.score += 3;
        alert("🎉 Poprawnie!");
    } else {
        p.lives--;
        alert("❌ Źle!");
    }

    if (p.lives <= 0) {
        alert(`${p.name} odpada!`);
    }

    updateTournamentBoard();
    generateTask();
    nextPlayer();
}

//---------------------------------------------------------
//                AKTUALIZACJA WYNIKU
//---------------------------------------------------------
function updateScore() {
    document.getElementById("p1").innerText = points;
}
