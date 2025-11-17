/* ============================================================
     GLOBALNE ZMIENNE
============================================================ */
let wheel, ctx;
let angle = 0;
let spinning = false;

let lives = 3;
let points = 0;
let combo = 0;
let correctAnswer = 0;
let currentMode = "math"; // math / it

let skipTurn = false;
let doubleTask = false;
let superMode = false;

let mistakes = [];

let tournamentActive = false;
let currentPlayer = 0;
let players = [];
let playerCount = 0;

let stats = {
    bestScore: 0,
    bestStreak: 0,
    gamesPlayed: 0,
    correct: 0,
    wrong: 0,
    achievements: []
};

/* ============================================================
     ŁADOWANIE STATYSTYK
============================================================ */
function loadStats() {
    let s = localStorage.getItem("wheelStats");
    if (s) stats = JSON.parse(s);

    document.getElementById("statBestScore").innerText = stats.bestScore;
    document.getElementById("statBestStreak").innerText = stats.bestStreak;
    document.getElementById("statGames").innerText = stats.gamesPlayed;
    document.getElementById("statCorrect").innerText = stats.correct;
    document.getElementById("statWrong").innerText = stats.wrong;

    updateAchievementsPanel();
}

function saveStats() {
    localStorage.setItem("wheelStats", JSON.stringify(stats));
}

function resetStats() {
    localStorage.removeItem("wheelStats");
    location.reload();
}

/* ============================================================
     OSIĄGNIĘCIA
============================================================ */
function grantAchievement(name) {
    if (!stats.achievements.includes(name)) {
        stats.achievements.push(name);
        updateAchievementsPanel();
    }
}

function updateAchievementsPanel() {
    document.getElementById("achievements").innerHTML =
        stats.achievements.length === 0
            ? "Brak osiągnięć."
            : stats.achievements.map(a => "🏅 " + a).join("<br>");
}

/* ============================================================
     SEGMENTY KOŁA TV
============================================================ */
const segments = [
    { text: "+2 pkt", color1: "#ff4747", color2: "#b80000", type: "points", value: 2 },
    { text: "Podwójne", color1: "#ffe266", color2: "#ffb300", type: "double" },
    { text: "+5 pkt", color1: "#5aff5a", color2: "#1c8f1c", type: "points", value: 5 },
    { text: "Zamrożenie", color1: "#6cd6ff", color2: "#0087c7", type: "freeze" },
    { text: "Tekstowe", color1: "#ffaaff", color2: "#d600d6", type: "text" },
    { text: "BOMBA", color1: "#000000", color2: "#333333", type: "bomb" },
    { text: "-5 pkt", color1: "#ff5050", color2: "#8a0000", type: "points", value: -5 },
    { text: "Cofnij turę", color1: "#cccccc", color2: "#7a7a7a", type: "back" },
    { text: "+10 pkt", color1: "#4cffc6", color2: "#009e7d", type: "points", value: 10 },
    { text: "Losowe", color1: "#ffff66", color2: "#d1d100", type: "random" },
    { text: "SUPER", color1: "#ff9f1c", color2: "#c36800", type: "super" }
];

/* ============================================================
     RYSOWANIE KOŁA TV
============================================================ */
window.onload = () => {
    wheel = document.getElementById("wheel");
    ctx = wheel.getContext("2d");
    loadStats();
    drawWheel();
};

function drawWheel() {
    let cx = 300, cy = 300;
    let radius = 280;
    let arc = (Math.PI * 2) / segments.length;

    ctx.clearRect(0, 0, 600, 600);

    for (let i = 0; i < segments.length; i++) {
        let startAngle = angle + i * arc;
        let endAngle = startAngle + arc;

        let grad = ctx.createLinearGradient(0, 0, 600, 600);
        grad.addColorStop(0, segments[i].color1);
        grad.addColorStop(1, segments[i].color2);

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(startAngle + arc / 2);
        ctx.textAlign = "center";
        ctx.fillStyle = "#fff";
        ctx.font = "bold 26px Arial";
        ctx.fillText(segments[i].text, radius * 0.65, 10);
        ctx.restore();
    }
}

/* ============================================================
     ANIMACJA PREMIUM
============================================================ */
document.getElementById("spinBtn").onclick = spinWheel;

function spinWheel() {
    if (spinning) return;
    spinning = true;

    let totalRotation = 360 * 5 + Math.random() * 360;
    let start = null;
    let duration = 3500;

    function animate(time) {
        if (!start) start = time;

        let t = (time - start) / duration;
        if (t > 1) t = 1;

        // easing OUT
        let ease = 1 - Math.pow(1 - t, 3);

        angle = ease * (totalRotation * Math.PI / 180);
        drawWheel();

        if (t < 1) {
            requestAnimationFrame(animate);
        } else {
            spinning = false;
            stopWheel();
        }
    }

    requestAnimationFrame(animate);
}

/* ============================================================
     ZATRZYMANIE KOŁA
============================================================ */
function stopWheel() {
    let arc = (Math.PI * 2) / segments.length;
    let index = Math.floor(((Math.PI * 1.5 - angle) % (Math.PI * 2)) / arc);

    if (index < 0) index += segments.length;
    let seg = segments[index];

    handleSegment(seg);
}

/* ============================================================
     LOGIKA POLA KOŁA
============================================================ */
function handleSegment(s) {

    if (s.type === "points") {
        points += s.value;
        updateScore();
        generateTaskMode();
        return;
    }

    if (s.type === "super") {
        superMode = true;
        generateSuperTask();
        return;
    }

    if (s.type === "double") {
        doubleTask = true;
        alert("🎯 Podwójne zadanie!");
        generateTaskMode();
        return;
    }

    if (s.type === "freeze") {
        skipTurn = true;
        alert("❄ Zamrożenie! Omijasz następną kolejkę.");
        generateTaskMode();
        return;
    }

    if (s.type === "bomb") {
        alert("💣 BOMBA! Tracisz 1 życie.");
        loseLife();
        generateTaskMode();
        return;
    }

    if (s.type === "back") {
        alert("↩ Cofnij turę!");
        if (tournamentActive) previousPlayer();
        generateTaskMode();
        return;
    }

    if (s.type === "random") {
        let list = ["points", "bomb", "freeze", "text", "super"];
        let chosen = list[Math.floor(Math.random() * list.length)];
        alert("🎁 Losowe pole: " + chosen.toUpperCase());

        if (chosen === "text") generateTextTask();
        if (chosen === "super") generateSuperTask();
        if (chosen === "bomb") loseLife();
        if (chosen === "freeze") skipTurn = true;
        if (chosen === "points") points += 3;

        updateScore();
        return;
    }

    if (s.type === "text") {
        generateTextTask();
        return;
    }
}

/* ============================================================
     ZADANIA MATEMATYCZNE
============================================================ */
function generateMathTask() {
    if (skipTurn) {
        alert("❄ Pominięto kolejkę!");
        skipTurn = false;
        return;
    }

    let a = Math.floor(Math.random() * 20 + 1);
    let b = Math.floor(Math.random() * 20 + 1);

    correctAnswer = a + b;
    document.getElementById("taskBox").innerHTML = `${a} + ${b}`;
}

/* SUPER ZADANIE */
function generateSuperTask() {
    let a = Math.floor(Math.random() * 100 + 50);
    let b = Math.floor(Math.random() * 100 + 20);
    correctAnswer = a + b;

    document.getElementById("taskBox").innerHTML =
        `⭐ SUPER: ${a} + ${b} ( +10 / -5 )`;
}

/* TEKSTOWE ZADANIA */
const names = ["Ala", "Ola", "Tomek", "Kuba", "Zosia", "Marek"];
const items = ["jabłka", "cukierki", "piłki", "klocki", "samochodziki", "ciastka"];

function generateTextTask() {
    let name = names[Math.floor(Math.random() * names.length)];
    let item = items[Math.floor(Math.random() * items.length)];

    let a = Math.floor(Math.random() * 10 + 3);
    let b = Math.floor(Math.random() * 5 + 1);

    let addOrSub = Math.random() < 0.5 ? "add" : "sub";

    if (addOrSub === "add") {
        correctAnswer = a + b;
        document.getElementById("taskBox").innerHTML =
            `${name} miał(a) ${a} ${item}. Dostał(a) ${b} więcej. Ile ma teraz?`;
    } else {
        correctAnswer = a - b;
        document.getElementById("taskBox").innerHTML =
            `${name} miał(a) ${a} ${item}. Oddał(a) ${b}. Ile zostało?`;
    }
}
/* ============================================================
     ZADANIA INFORMATYCZNE
============================================================ */
const itTasks = [
    { q: "Jak nazywa się urządzenie, którym piszemy litery?", a: "klawiatura" },
    { q: "Jak nazywa się urządzenie, którym poruszamy po ekranie?", a: "mysz" },
    { q: "Jak nazywa się obrazek na pulpicie?", a: "ikona" },
    { q: "Jak nazywa się program do rysowania w Windows?", a: "paint" },
    { q: "Gdzie zapisujemy pliki? W ...", a: "folderze" },
    { q: "Jak nazywa się przenośny komputer?", a: "laptop" },
    { q: "Jak nazywa się komputer w dużej obudowie?", a: "stacjonarny" },
    { q: "Czego używamy do słuchania dźwięków?", a: "głośników" },
    { q: "Czego używamy do mówienia do komputera?", a: "mikrofonu" },
    { q: "Program do pisania tekstu to ...?", a: "edytor tekstu" }
];

function generateITTask() {
    let t = itTasks[Math.floor(Math.random() * itTasks.length)];
    document.getElementById("taskBox").innerHTML =
        "🖥 Informatyka:<br><br>" + t.q;
    correctAnswer = t.a.toLowerCase();
}

/* ============================================================
     WYBÓR TRYBU: MATH / IT
============================================================ */
function generateTaskMode() {
    if (currentMode === "math") generateMathTask();
    else generateITTask();
}

/* ============================================================
     KOMBO
============================================================ */
function increaseCombo() {
    combo++;
    if (combo === 5) grantAchievement("5 poprawnych pod rząd");
    if (combo === 10) grantAchievement("10 poprawnych pod rząd");
}

function resetCombo() {
    combo = 0;
}

/* ============================================================
     ŻYCIA
============================================================ */
function loseLife() {
    lives--;
    document.getElementById("livesCount").innerText = lives;

    if (lives <= 0) {
        alert("❌ Koniec gry!");
        stats.gamesPlayed++;
        saveStats();
        location.reload();
    }
}

function resetLives() {
    lives = 3;
    document.getElementById("livesCount").innerText = lives;
}

/* ============================================================
     SPRAWDZANIE ODPOWIEDZI
============================================================ */
document.getElementById("checkBtn").onclick = checkAnswer;

function checkAnswer() {
    let user = document.getElementById("answerInput").value.trim().toLowerCase();

    if (tournamentActive) {
        checkTournamentAnswer(user);
        return;
    }

    // POPRAWNA
    if (user == correctAnswer) {
        points += superMode ? 10 : 1;
        stats.correct++;

        if (superMode) grantAchievement("SUPER zadanie rozwiązane");

        increaseCombo();
        superMode = false;

        if (combo > stats.bestStreak) stats.bestStreak = combo;

        updateScore();
        generateTaskMode();
    }
    // BŁĘDNA
    else {
        stats.wrong++;
        addMistake(document.getElementById("taskBox").innerText, correctAnswer);

        if (superMode) points -= 5;
        superMode = false;

        loseLife();
        resetCombo();
        updateScore();
        generateTaskMode();
    }

    if (points > stats.bestScore) stats.bestScore = points;

    saveStats();
}

/* ============================================================
     BŁĘDY / POWTÓRKI
============================================================ */
function addMistake(task, answer) {
    mistakes.push(`${task} = ${answer}`);
}

/* ============================================================
     TURNIEJ
============================================================ */
function startTournamentMode() {
    hideAllPanels();
    document.getElementById("tournamentSetup").classList.remove("hidden");
}

function createTournament() {
    playerCount = parseInt(document.getElementById("playerCount").value);
    players = [];

    for (let i = 0; i < playerCount; i++) {
        players.push({ score: 0, lives: 3, name: "Gracz " + (i + 1) });
    }

    tournamentActive = true;
    currentPlayer = 0;

    document.getElementById("tournamentSetup").classList.add("hidden");
    document.getElementById("tournamentBoard").classList.remove("hidden");

    updateTournamentPanel();
    generateTaskMode();
}

function updateTournamentPanel() {
    document.getElementById("turnInfo").innerHTML =
        `<h3>Tura: ${players[currentPlayer].name}</h3>`;

    let list = "";
    players.forEach(p => {
        list += `${p.name}: ${p.score} pkt • ❤️ ${p.lives}<br>`;
    });
    document.getElementById("playerScores").innerHTML = list;

    document.getElementById("livesCount").innerText = players[currentPlayer].lives;
}

function nextPlayer() {
    currentPlayer = (currentPlayer + 1) % playerCount;

    // pomijamy graczy martwych
    while (players[currentPlayer].lives <= 0) {
        currentPlayer = (currentPlayer + 1) % playerCount;
    }

    updateTournamentPanel();
}

function previousPlayer() {
    currentPlayer = (currentPlayer - 1 + playerCount) % playerCount;
    updateTournamentPanel();
}

function checkTournamentAnswer(user) {
    let p = players[currentPlayer];

    if (user == correctAnswer) {
        p.score += 3;
        alert("✔ Poprawnie!");
    } else {
        p.lives--;
        alert("❌ Źle!");
    }

    if (p.lives <= 0) {
        alert(`${p.name} odpada!`);
    }

    updateTournamentPanel();
    generateTaskMode();
    nextPlayer();
}

/* ============================================================
     TRYBY GRY
============================================================ */
function hideAllPanels() {
    document.getElementById("modePanel").classList.add("hidden");
    document.getElementById("missionPanel").classList.add("hidden");
    document.getElementById("timer").classList.add("hidden");
    document.getElementById("tournamentSetup").classList.add("hidden");
    document.getElementById("tournamentBoard").classList.add("hidden");
}

function startMissionMode() {
    hideAllPanels();
    resetLives();
    points = 0;
    currentMode = "math";
    document.getElementById("missionPanel").classList.remove("hidden");
}

function startMission() {
    resetLives();
    points = 0;
    currentMode = "math";
    generateTaskMode();
}

function startPointsMode() {
    hideAllPanels();
    resetLives();
    points = 0;
    currentMode = "math";
    generateTaskMode();
}

function startEndlessMode() {
    hideAllPanels();
    resetLives();
    points = 0;
    currentMode = "math";
    generateTaskMode();
}

function startITMode() {
    hideAllPanels();
    resetLives();
    points = 0;
    currentMode = "it";

    alert("🖥 Tryb INFORMATYKA – odpowiadaj na pytania o komputerach!");
    generateTaskMode();
}

/* ============================================================
     TRYB CZASOWY
============================================================ */
let timerInterval = null;

function startTimeMode() {
    hideAllPanels();
    document.getElementById("timer").classList.remove("hidden");

    resetLives();
    points = 0;
    currentMode = "math";

    startTimer();
    generateTaskMode();
}

function startTimer() {
    clearInterval(timerInterval);

    let timeLeft = 10;
    document.getElementById("timeLeft").innerText = timeLeft;

    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("timeLeft").innerText = timeLeft;

        if (timeLeft <= 0) {
            loseLife();
            startTimer();
            generateTaskMode();
        }
    }, 1000);
}

/* ============================================================
     WYNIKI
============================================================ */
function updateScore() {
    document.getElementById("p1").innerText = points;
}
