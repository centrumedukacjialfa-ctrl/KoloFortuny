//// ==== POCZĄTEK SEGMENTU 1 ====

// ===========================================
// GLOBALNE ZMIENNE I STRUKTURA GRY
// ===========================================
// Dźwięki
const sndSpin = document.getElementById("sndSpin");
const sndCorrect = document.getElementById("sndCorrect");
const sndWrong = document.getElementById("sndWrong");
const sndBeep = document.getElementById("sndBeep");
const sndAlarm = document.getElementById("sndAlarm");
// FUNKCJE ANIMACJI
function animateWheel() {
    canvas.classList.remove("wheel-shake");
    void canvas.offsetWidth;
    canvas.classList.add("wheel-shake");
}

function animateCorrect() {
    const box = document.getElementById("result");
    box.classList.remove("correct-flash");
    void box.offsetWidth;
    box.classList.add("correct-flash");
}

function animateWrong() {
    const box = document.getElementById("result");
    box.classList.remove("wrong-shake");
    void box.offsetWidth;
    box.classList.add("wrong-shake");
}

function animateTask() {
    const box = document.getElementById("taskBox");
    box.classList.remove("task-fade");
    void box.offsetWidth;
    box.classList.add("task-fade");
}

function animateStar(starElement) {
    starElement.classList.add("mission-star-animate");
}

let gameMode = null;       
// "mission", "time", "tournament", "points", "endless"

let currentMission = 1;
let missionProgress = 0;
let missionTasksNeeded = 0;

let timerInterval = null;
let timeLeft = 10;

let tournamentPlayers = 0;
let tournamentScores = [];
let tournamentTurn = 0;

let pointsGoal = 0;
let endlessDifficulty = 1;

let chosenSegment = null;
let correctAnswer = null;

// Wybrane typy zadań w grze:
const dotColors = ["🔵", "🟢", "🟡", "🔴"];

// ===========================================
// RYSOWANIE KOŁA
// ===========================================

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");

let angle = 0;
let spinning = false;

const segments = [
    { color: "blue",   points: 1 },
    { color: "green",  points: 2 },
    { color: "yellow", points: 3 },
    { color: "red",    points: 5 },
    { color: "blue",   points: 1 },
    { color: "green",  points: 2 },
    { color: "yellow", points: 3 },
    { color: "red",    points: 5 }
];

const segmentAngle = (2 * Math.PI) / 8;

// Rysowanie koła
function drawWheel() {
    ctx.clearRect(0, 0, 500, 500);

    for (let i = 0; i < segments.length; i++) {
        ctx.beginPath();
        ctx.moveTo(250, 250);
        ctx.arc(
            250, 250,
            250,
            i * segmentAngle,
            (i + 1) * segmentAngle
        );
        ctx.fillStyle = segments[i].color;
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.save();
        ctx.translate(250, 250);
        ctx.rotate(i * segmentAngle + segmentAngle / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "black";
        ctx.font = "bold 26px Arial";
        ctx.fillText(`${segments[i].points} pkt`, 220, 10);
        ctx.restore();
    }
}

drawWheel();

// ===========================================
// SPIN KOŁA
// ===========================================

document.getElementById("spinBtn").addEventListener("click", () => {
    if (spinning) return;

    document.getElementById("taskBox").innerHTML = "";
    document.getElementById("result").innerHTML = "";
    document.getElementById("answerSection").classList.add("hidden");

    spinning = true;

    const randomSpin = Math.random() * 4 + 4;
    const spinTime = 3000;
    const startTime = performance.now();

    function animate(time) {
        const progress = (time - startTime) / spinTime;

        if (progress < 1) {
            angle = randomSpin * Math.PI * 2 * (1 - Math.pow(1 - progress, 3));
            drawRotated();
            requestAnimationFrame(animate);
        } else {
            spinning = false;
            finishSpin();
        }
    }

    requestAnimationFrame(animate);
});

function drawRotated() {
    ctx.save();
    ctx.translate(250, 250);
    ctx.rotate(angle);
    ctx.translate(-250, -250);
    drawWheel();
    ctx.restore();
}

function finishSpin() {
    const normalizedAngle =
        (angle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);

    const index =
        segments.length -
        1 -
        Math.floor(normalizedAngle / segmentAngle);

    chosenSegment = segments[index];

    document.getElementById("taskBox").innerHTML =
        "<b>Kliknij koło, aby zobaczyć zadanie!</b>";
}

// po kliknięciu w koło — zadanie
canvas.addEventListener("click", () => {
    if (!chosenSegment) return;
    showTask();
});

// ===========================================
// GENERATORY LICZB / KROPEK
// ===========================================

function rand(n = 10) {
    return Math.floor(Math.random() * n) + 1;
}

function makeDots(n) {
    let s = "";
    for (let i = 0; i < n; i++)
        s += dotColors[Math.floor(Math.random() * dotColors.length)];
    return s;
}

// ===========================================
// GENERATORY ZADAŃ
// ===========================================

function generateClassic() {
    const a = rand(), b = rand();
    const add = Math.random() < 0.5;
    correctAnswer = add ? a + b : a - b;
    return `${a} ${add ? "+" : "-"} ${b} = ?`;
}

function generateDots() {
    const a = rand(), b = rand();
    const add = Math.random() < 0.5;
    correctAnswer = add ? a + b : a - b;
    return `${makeDots(a)} ${add ? "+" : "-"} ${makeDots(b)} = ?`;
}

function generateStory() {
    const a = rand(), b = rand();
    const add = Math.random() < 0.5;

    if (add) {
        correctAnswer = a + b;
        return `Kuba miał ${a} klocków. Mama dała mu ${b}. Ile ma teraz razem?`;
    } else {
        const big = Math.max(a, b);
        const small = Math.min(a, b);
        correctAnswer = big - small;
        return `Ala miała ${big} cukierki. Dała koledze ${small}. Ile jej zostało?`;
    }
}

function generateMissing() {
    const a = rand(), b = rand();
    const res = a + b;
    correctAnswer = a;
    return `__ + ${b} = ${res}`;
}

function generateCompare() {
    const a = rand(), b = rand();
    correctAnswer = a === b ? "=" : a > b ? ">" : "<";
    return `${a} ? ${b}`;
}

// Typy zadań dla "mixu"
const allTypes = ["classic", "dots", "story", "missing", "compare"];

//// ==== KONIEC SEGMENTU 1 ====
//// ==== POCZĄTEK SEGMENTU 2 ====

// ===========================================
// START TRYBÓW GRY
// ===========================================

function startMissionMode() {
    gameMode = "mission";
    document.getElementById("modePanel").classList.add("hidden");
    document.getElementById("missionPanel").classList.remove("hidden");

    currentMission = 1;
    missionProgress = 0;
    updateMissionStars();
}

function startTimeMode() {
    gameMode = "time";
    document.getElementById("modePanel").classList.add("hidden");
    document.getElementById("spinBtn").classList.remove("hidden");
    document.getElementById("timer").classList.remove("hidden");
}

function startPointsMode() {
    gameMode = "points";
    document.getElementById("modePanel").classList.add("hidden");
    document.getElementById("pointsSetup").classList.remove("hidden");
}

function startEndlessMode() {
    gameMode = "endless";
    endlessDifficulty = 1;

    document.getElementById("modePanel").classList.add("hidden");
    document.getElementById("spinBtn").classList.remove("hidden");
}


// ===========================================
// TRYB DO X PUNKTÓW
// ===========================================

function beginPointsGame() {
    pointsGoal = Number(document.getElementById("pointsGoal").value);

    document.getElementById("pointsSetup").classList.add("hidden");
    document.getElementById("spinBtn").classList.remove("hidden");
    document.getElementById("scoreBoard").classList.remove("hidden");
}


// ===========================================
// MISJE (6 poziomów)
// ===========================================

// Każda misja ma inną ilość zadań i trudność
const missionConfig = {
    1: { tasks: 5, type: "classic", range: 5 },
    2: { tasks: 5, type: "classic", range: 10 },
    3: { tasks: 6, type: "story",   range: 10 },
    4: { tasks: 5, type: "dots",    range: 10 },
    5: { tasks: 8, type: "mix",     range: 20 },
    6: { tasks: 10, type: "mix",    range: 50 }
};

function updateMissionStars() {
    let stars = "";
    const total = 6;

    for (let i = 1; i <= total; i++) {
        stars += i <= currentMission ? "⭐ " : "☆ ";
    }

    document.getElementById("missionStars").innerHTML = stars;
    document.getElementById("missionNumber").innerText = currentMission;
}

function startMission() {
    document.getElementById("missionPanel").classList.add("hidden");
    document.getElementById("spinBtn").classList.remove("hidden");

    missionProgress = 0;
    missionTasksNeeded = missionConfig[currentMission].tasks;
}

function nextMission() {
    currentMission++;

    if (currentMission > 6) {
        alert("🎉 Ukończyłeś wszystkie misje! Brawo!");
        location.reload();
        return;
    }

    updateMissionStars();
    document.getElementById("missionPanel").classList.remove("hidden");
}


// ===========================================
// TRYB CZASOWY (10 sekund)
// ===========================================

function startTimer() {
    timeLeft = 10;
    document.getElementById("timeLeft").innerText = timeLeft;

    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("timeLeft").innerText = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            blockAnswerTimeOut();
        }
    }, 1000);
}

function blockAnswerTimeOut() {
    document.getElementById("result").style.color = "red";
    document.getElementById("result").innerHTML =
        "⏱ Czas minął! 0 punktów.";

    document.getElementById("answerSection").classList.add("hidden");
    chosenSegment = null;
}


// ===========================================
// TRYB NIESKOŃCZONY (rośnie trudność)
// ===========================================

function generateEndlessTask() {
    let t = allTypes[Math.floor(Math.random() * allTypes.length)];

    // zwiększamy trudność: liczby rosną
    let max = 10 + endlessDifficulty * 5;
    if (max > 50) max = 50;

    function r() { return Math.floor(Math.random() * max) + 1; }

    if (t === "classic") {
        const a = r(), b = r();
        const add = Math.random() < 0.5;
        correctAnswer = add ? a + b : a - b;
        return `${a} ${add ? "+" : "-"} ${b} = ?`;

    } else if (t === "dots") {
        const a = r(), b = r();
        const add = Math.random() < 0.5;
        correctAnswer = add ? a + b : a - b;
        return `${makeDots(a)} ${add ? "+" : "-"} ${makeDots(b)} = ?`;

    } else if (t === "story") {
        const a = r(), b = r();
        const add = Math.random() < 0.5;

        if (add) {
            correctAnswer = a + b;
            return `Kuba miał ${a} klocków. Mama dała mu ${b}. Ile ma teraz razem?`;
        } else {
            const big = Math.max(a, b);
            const small = Math.min(a, b);
            correctAnswer = big - small;
            return `Ala miała ${big} cukierki. Dała koledze ${small}. Ile jej zostało?`;
        }

    } else if (t === "missing") {
        const a = r(), b = r();
        const res = a + b;
        correctAnswer = a;
        return `__ + ${b} = ${res}`;

    } else if (t === "compare") {
        const a = r(), b = r();
        correctAnswer = a === b ? "=" : a > b ? ">" : "<";
        return `${a} ? ${b}`;
    }
}

//// ==== KONIEC SEGMENTU 2 ====
//// ==== POCZĄTEK SEGMENTU 3 ====

// ===========================================
// TRYB TURNIEJOWY (2–10 GRACZY)
// ===========================================

function startTournamentMode() {
    gameMode = "tournament";

    document.getElementById("modePanel").classList.add("hidden");
    document.getElementById("tournamentSetup").classList.remove("hidden");
}

function beginTournament() {
    tournamentPlayers = Number(document.getElementById("tournamentPlayers").value);

    tournamentScores = Array(tournamentPlayers).fill(0);
    tournamentTurn = 0;

    document.getElementById("tournamentSetup").classList.add("hidden");
    document.getElementById("spinBtn").classList.remove("hidden");
    document.getElementById("tournamentTable").classList.remove("hidden");

    updateTournamentTable();
}

function updateTournamentTable() {
    let html = "";

    for (let i = 0; i < tournamentPlayers; i++) {
        const turnMark = i === tournamentTurn ? "➡ " : "";
        html += `<p>${turnMark}Gracz ${i + 1}: ${tournamentScores[i]} pkt</p>`;
    }

    document.getElementById("tournamentList").innerHTML = html;
}

function nextTournamentTurn() {
    tournamentTurn++;
    if (tournamentTurn >= tournamentPlayers) tournamentTurn = 0;
    updateTournamentTable();
}

// ===========================================
// WYBÓR ZADANIA WG TRYBU
// ===========================================

function showTask() {
    let type = "";

    if (gameMode === "mission") {
        type = missionConfig[currentMission].type;
    } else if (gameMode === "endless") {
        document.getElementById("taskBox").innerHTML = generateEndlessTask();
        document.getElementById("answerSection").classList.remove("hidden");
        return;
    } else {
        type = allTypes[Math.floor(Math.random() * allTypes.length)];
    }

    document.getElementById("answerSection").classList.remove("hidden");

    let task = "";
    if (type === "classic")      task = generateClassic();
    if (type === "dots")         task = generateDots();
    if (type === "story")        task = generateStory();
    if (type === "missing")      task = generateMissing();
    if (type === "compare")      task = generateCompare();
    if (type === "mix") {
        const t = allTypes[Math.floor(Math.random() * allTypes.length)];
        return showTaskOfType(t);
    }

    document.getElementById("taskBox").innerHTML =
        `${task}<br><br>🎯 Za to zadanie: <b>${chosenSegment.points}</b> pkt`;

    if (gameMode === "time") startTimer();
}

function showTaskOfType(type) {
    let t = "";

    if (type === "classic") t = generateClassic();
    if (type === "dots")    t = generateDots();
    if (type === "story")   t = generateStory();
    if (type === "missing") t = generateMissing();
    if (type === "compare") t = generateCompare();

    document.getElementById("answerSection").classList.remove("hidden");

    document.getElementById("taskBox").innerHTML =
        `${t}<br><br>🎯 Za to zadanie: <b>${chosenSegment.points}</b> pkt`;

    if (gameMode === "time") startTimer();
}

// ===========================================
// SPRAWDZANIE ODPOWIEDZI
// ===========================================

document.getElementById("checkBtn").addEventListener("click", () => {
    const user = document.getElementById("answerInput").value.trim();
    const resultBox = document.getElementById("result");

    clearInterval(timerInterval);

    if (user == correctAnswer) {
        resultBox.style.color = "green";
        resultBox.innerHTML =
            `✔ Poprawnie! Zdobywasz <b>${chosenSegment.points}</b> punktów!`;

        applyScoreGain(chosenSegment.points);

    } else {
        resultBox.style.color = "red";
        resultBox.innerHTML =
            `❌ Źle! Poprawna odpowiedź to <b>${correctAnswer}</b>`;

        if (gameMode === "endless") {
            alert("Gra zakończona! Popełniłeś błąd.");
            location.reload();
        }
    }

    document.getElementById("answerSection").classList.add("hidden");
    chosenSegment = null;
    document.getElementById("answerInput").value = "";
});

// ===========================================
// PRZYDZIELANIE PUNKTÓW WG TRYBU
// ===========================================

let p1 = 0;
let p2 = 0;
let turn = 1;

function applyScoreGain(points) {

    // TRYB MISJI
    if (gameMode === "mission") {
        missionProgress++;
        if (missionProgress >= missionTasksNeeded) {
            alert("🎉 Misja ukończona!");
            nextMission();
        }
        return;
    }

    // TRYB CZASOWY → nic szczególnego, tylko wynik
    if (gameMode === "time") return;

    // TRYB TURNIEJOWY
    if (gameMode === "tournament") {
        tournamentScores[tournamentTurn] += points;
        updateTournamentTable();
        nextTournamentTurn();
        return;
    }

    // TRYB DO X PUNKTÓW
    if (gameMode === "points") {
        if (turn === 1) p1 += points;
        else p2 += points;

        document.getElementById("p1").innerText = p1;
        document.getElementById("p2").innerText = p2;

        if (p1 >= pointsGoal) {
            alert("🎉 Gracz 1 wygrywa grę!");
            location.reload();
        }
        if (p2 >= pointsGoal) {
            alert("🎉 Gracz 2 wygrywa grę!");
            location.reload();
        }

        turn = turn === 1 ? 2 : 1;
        return;
    }

    // TRYB NIESKOŃCZONY — rośnie trudność
    if (gameMode === "endless") {
        endlessDifficulty++;
        return;
    }
}

//// ==== KONIEC SEGMENTU 3 ====
//// ==== POCZĄTEK STATYSTYK ====

// STRUKTURA STATYSTYK
let stats = {
    missionsCompleted: 0,
    bestScore: 0,
    bestStreak: 0,
    correct: 0,
    wrong: 0
};

// ŁADOWANIE STATYSTYK Z LOCALSTORAGE
function loadStats() {
    const s = localStorage.getItem("mathWheelStats");
    if (s) stats = JSON.parse(s);

    // aktualizacja panelu
    document.getElementById("statMissions").innerText = stats.missionsCompleted;
    document.getElementById("statBestScore").innerText = stats.bestScore;
    document.getElementById("statBestStreak").innerText = stats.bestStreak;
    document.getElementById("statCorrect").innerText = stats.correct;
    document.getElementById("statWrong").innerText = stats.wrong;
}

// ZAPIS STATYSTYK
function saveStats() {
    localStorage.setItem("mathWheelStats", JSON.stringify(stats));
}

// RESET STATYSTYK
function resetStats() {
    if (!confirm("Czy na pewno chcesz skasować statystyki?")) return;

    stats = {
        missionsCompleted: 0,
        bestScore: 0,
        bestStreak: 0,
        correct: 0,
        wrong: 0
    };

    saveStats();
    loadStats();
    alert("Statystyki wyczyszczone!");
}

// =============================================
// AKTUALIZACJE STATYSTYK W CZASIE GRY
// =============================================

// zliczanie poprawnych i błędnych
function recordCorrect() {
    stats.correct++;
    saveStats();
}

function recordWrong() {
    stats.wrong++;
    saveStats();
}

// misje
function recordMissionComplete() {
    stats.missionsCompleted++;
    saveStats();
}

// endless – seria
let currentStreak = 0;

function recordStreak(correct) {
    if (correct) {
        currentStreak++;
        if (currentStreak > stats.bestStreak) {
            stats.bestStreak = currentStreak;
            saveStats();
        }
    } else {
        currentStreak = 0;
    }
}

// najlepszy wynik ogólny
function recordBestScore(score) {
    if (score > stats.bestScore) {
        stats.bestScore = score;
        saveStats();
    }
}

//// ==== KONIEC STATYSTYK ====

// PRZY STARTCIE STRONY ŁADUJ STATYSTYKI
window.onload = loadStats;
