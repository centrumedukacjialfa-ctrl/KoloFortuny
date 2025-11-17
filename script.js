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

let currentMode = "math"; // math / it / quiz

let skipTurn = false;
let doubleTask = false;
let superMode = false;

let mistakes = [];

let tournamentActive = false;
let currentPlayer = 0;
let players = [];
let playerCount = 0;

/* ============================================================
   STATYSTYKI UCZNIA
============================================================ */
let stats = {
    bestScore: 0,
    bestStreak: 0,
    gamesPlayed: 0,
    correct: 0,
    wrong: 0,
    achievements: []
};

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

function grantAchievement(name) {
    if (!stats.achievements.includes(name)) {
        stats.achievements.push(name);
        updateAchievementsPanel();
    }
}

function updateAchievementsPanel() {
    let box = document.getElementById("achievements");
    if (stats.achievements.length === 0) {
        box.innerHTML = "Brak osiągnięć.";
    } else {
        box.innerHTML = stats.achievements.map(a => `🏅 ${a}`).join("<br>");
    }
}

/* ============================================================
   SEGMENTY KOŁA – STYL TV
============================================================ */
const segments = [
    { text: "+2 pkt", color1: "#ff4747", color2: "#b80000", type: "points", value: 2 },
    { text: "Podwójne", color1: "#ffe266", color2: "#ffb300", type: "double" },
    { text: "+5 pkt", color1: "#5aff5a", color2: "#1c8f1c", type: "points", value: 5 },
    { text: "Zamrożenie", color1: "#6cd6ff", color2: "#0087c7", type: "freeze" },
    { text: "Tekstowe", color1: "#ffaaff", color2: "#d600d6", type: "text" },
    { text: "BOMBA", color1: "#000", color2: "#333", type: "bomb" },
    { text: "-5 pkt", color1: "#ff5050", color2: "#8a0000", type: "points", value: -5 },
    { text: "Cofnij turę", color1: "#cccccc", color2: "#7a7a7a", type: "back" },
    { text: "+10 pkt", color1: "#4cffc6", color2: "#009e7d", type: "points", value: 10 },
    { text: "Losowe", color1: "#ffff66", color2: "#d1d100", type: "random" },
    { text: "SUPER", color1: "#ff9f1c", color2: "#c36800", type: "super" }
];

/* ============================================================
   RYSOWANIE KOŁA
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
   ANIMACJA LOSOWANIA
============================================================ */
document.getElementById("spinBtn").onclick = spinWheel;

function spinWheel() {
    if (spinning) return;
    spinning = true;

    let totalRotation = 360 * 6 + Math.random() * 360;
    let start = null;
    let duration = 3500; // ms

    function animate(time) {
        if (!start) start = time;

        let t = (time - start) / duration;
        if (t > 1) t = 1;

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
   PO ZATRZYMANIU
============================================================ */
function stopWheel() {
    let arc = (Math.PI * 2) / segments.length;

    // strzałka na górze => 270° => 1.5π
    let index = Math.floor(((Math.PI * 1.5 - angle) % (Math.PI * 2)) / arc);
    if (index < 0) index += segments.length;

    handleSegment(segments[index]);
}

/* ============================================================
   OBSŁUGA POLA KOŁA
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
        alert("↩ Cofnięcie tury!");
        if (tournamentActive) previousPlayer();
        return;
    }

    if (s.type === "text") {
        generateTextTask();
        return;
    }

    if (s.type === "random") {
        let list = ["points", "bomb", "freeze", "text", "super"];
        let chosen = list[Math.floor(Math.random() * list.length)];

        alert("🎁 RANDOM: " + chosen.toUpperCase());
        
        if (chosen === "text") generateTextTask();
        if (chosen === "super") generateSuperTask();
        if (chosen === "bomb") loseLife();
        if (chosen === "freeze") skipTurn = true;
        if (chosen === "points") points += 3;

        updateScore();
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

    document.getElementById("taskBox").innerHTML =
        `🔢 ${a} + ${b}`;
}

/* SUPER ZADANIE */
function generateSuperTask() {
    let a = Math.floor(Math.random() * 100 + 50);
    let b = Math.floor(Math.random() * 100 + 20);

    correctAnswer = a + b;

    document.getElementById("taskBox").innerHTML =
        `⭐ SUPER: ${a} + ${b} ( +10pkt / -5pkt )`;

    superMode = true;
}

/* ============================================================
   ZADANIA TEKSTOWE
============================================================ */
const names = ["Ala", "Ola", "Tomek", "Kuba", "Zosia", "Marek"];
const items = ["jabłka", "cukierki", "piłki", "klocki", "ciastka"];

function generateTextTask() {
    let name = names[Math.floor(Math.random() * names.length)];
    let item = items[Math.floor(Math.random() * items.length)];

    let a = Math.floor(Math.random() * 10 + 5);
    let b = Math.floor(Math.random() * 5 + 1);

    if (Math.random() < 0.5) {
        correctAnswer = a + b;
        document.getElementById("taskBox").innerHTML =
            `📘 ${name} miał(a) ${a} ${item}. Dostał(a) ${b} więcej. Ile ma teraz?`;
    } else {
        correctAnswer = a - b;
        document.getElementById("taskBox").innerHTML =
            `📘 ${name} miał(a) ${a} ${item}. Oddał(a) ${b}. Ile zostało?`;
    }
}

/* ============================================================
   ZADANIA INFORMATYCZNE (prosta logika)
============================================================ */
const itTasks = [
    { q: "Urządzenie do pisania liter to…", a: "klawiatura" },
    { q: "Urządzenie wskazujące to…", a: "mysz" },
    { q: "Obrazek na pulpicie to…", a: "ikona" },
    { q: "Program do rysowania w Windows to…", a: "paint" },
    { q: "Pliki zapisujemy w…", a: "folderze" },
    { q: "Przenośny komputer to…", a: "laptop" },
    { q: "Duży komputer to komputer…", a: "stacjonarny" },
    { q: "Do słuchania służą…", a: "głośniki" },
    { q: "Do mówienia do komputera używamy…", a: "mikrofonu" },
    { q: "Program do pisania tekstu to…", a: "edytor tekstu" }
];

function generateITTask() {
    let t = itTasks[Math.floor(Math.random() * itTasks.length)];
    correctAnswer = t.a.toLowerCase();

    document.getElementById("taskBox").innerHTML =
        `🖥 Informatyka:<br><br>${t.q}`;
}

/* ============================================================
   TRYB: WYBÓR ZADAŃ (math / it)
============================================================ */
function generateTaskMode() {
    if (currentMode === "math") generateMathTask();
    else if (currentMode === "it") generateITTask();
    else return; // w trybie teleturnieju nie używamy tego
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
    if (currentMode === "quiz") return; // teleturniej ma osobną funkcję

    let user = document.getElementById("answerInput").value.trim().toLowerCase();

    // POPRAWNA
    if (user == correctAnswer) {
        points += superMode ? 10 : 1;
        stats.correct++;

        increaseCombo();

        if (combo > stats.bestStreak) stats.bestStreak = combo;

        if (superMode) {
            grantAchievement("SUPER zadanie rozwiązane");
        }

        superMode = false;

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
   BŁĘDY
============================================================ */
function addMistake(task, answer) {
    mistakes.push(task + " = " + answer);
}

/* ============================================================
   TRYBY GRY (misje / czasowy / nieskończony / do punktów)
============================================================ */
function hideAllPanels() {
    document.getElementById("modePanel").classList.add("hidden");
    document.getElementById("missionPanel").classList.add("hidden");
    document.getElementById("timer").classList.add("hidden");
    document.getElementById("tournamentSetup").classList.add("hidden");
    document.getElementById("tournamentBoard").classList.add("hidden");
    document.getElementById("quizAnswers").classList.add("hidden");
    document.getElementById("lifelines").classList.add("hidden");
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
    generateTaskMode();
}

function startTimeMode() {
    hideAllPanels();
    document.getElementById("timer").classList.remove("hidden");

    resetLives();
    points = 0;
    currentMode = "math";

    startTimer();
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

    alert("🖥 Tryb INFORMATYKA — odpowiadaj na pytania o komputerach!");
    generateTaskMode();
}

/* ============================================================
   TIMER
============================================================ */
let timerInterval = null;

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
   WYNIK
============================================================ */
function updateScore() {
    document.getElementById("p1").innerText = points;
}
/* ============================================================
   🔵 TELETURNIEJ INFORMATYCZNY
============================================================ */

let quizQuestions = [
    { q: "Urządzenie do pisania liter na komputerze to…", a: "Klawiatura", w1: "Mysz", w2: "Monitor" },
    { q: "Obrazki na pulpicie to…", a: "Ikony", w1: "Okna", w2: "Foldery" },
    { q: "Program do rysowania to…", a: "Paint", w1: "Word", w2: "Excel" },
    { q: "Urządzenie wskazujące to…", a: "Mysz", w1: "Głośnik", w2: "Klawiatura" },
    { q: "Gdzie zapisujemy pliki?", a: "W folderach", w1: "W internecie", w2: "W koszu" },
    { q: "Przenośny komputer to…", a: "Laptop", w1: "Tablet", w2: "Wieża" },
    { q: "Do mówienia do komputera używamy…", a: "Mikrofon", w1: "Głośnik", w2: "Router" },
    { q: "Do wyświetlania obrazu służy…", a: "Monitor", w1: "Procesor", w2: "Pamięć RAM" },
    { q: "Służy do nagrywania obrazu…", a: "Kamera", w1: "Mysz", w2: "Router" },
    { q: "Program do pisania tekstu to…", a: "Edytor tekstu", w1: "Paint", w2: "Galeria zdjęć" }
];

let quizIndex = 0;
let quizScore = 0;

let usedPhone = false;
let usedPublic = false;
let used5050 = false;


/* ============================================================
   START TELETURNIEJU
============================================================ */
function startITQuiz() {
    hideAllPanels();
    currentMode = "quiz";

    quizIndex = 0;
    quizScore = 0;
    usedPhone = false;
    usedPublic = false;
    used5050 = false;

    document.getElementById("quizAnswers").classList.remove("hidden");
    document.getElementById("lifelines").classList.remove("hidden");

    document.getElementById("phoneBtn").classList.remove("used");
    document.getElementById("publicBtn").classList.remove("used");
    document.getElementById("halfBtn").classList.remove("used");

    loadQuizQuestion();
}


/* ============================================================
   WCZYTANIE PYTANIA
============================================================ */
function loadQuizQuestion() {
    let q = quizQuestions[quizIndex];

    let answers = shuffle([q.a, q.w1, q.w2]);

    document.getElementById("taskBox").innerHTML =
        `🎤 Pytanie ${quizIndex + 1} / ${quizQuestions.length}<br><br>${q.q}`;

    let html = "";
    answers.forEach(ans => {
        html += `<button class="modeBtn" onclick="checkQuiz('${ans}')">${ans}</button><br>`;
    });

    document.getElementById("quizAnswers").innerHTML = html;
}


/* ============================================================
   SPRAWDZANIE ODPOWIEDZI
============================================================ */
function checkQuiz(answer) {
    let correct = quizQuestions[quizIndex].a;

    if (answer === correct) {
        quizScore++;
        alert("✔ Poprawna odpowiedź!");
    } else {
        alert("❌ Zła odpowiedź!");
    }

    quizIndex++;

    if (quizIndex >= quizQuestions.length) {
        endITQuiz();
    } else {
        loadQuizQuestion();
    }
}


/* ============================================================
   KONIEC TELETURNIEJU
============================================================ */
function endITQuiz() {
    document.getElementById("taskBox").innerHTML =
        `🎉 KONIEC TELETURNIEJU!<br><br>Twój wynik: <b>${quizScore} / ${quizQuestions.length}</b>`;

    document.getElementById("quizAnswers").classList.add("hidden");
    document.getElementById("lifelines").classList.add("hidden");

    if (quizScore === quizQuestions.length) {
        grantAchievement("MISTRZ INFORMATYKI");
    }
}


/* ============================================================
   KOŁA RATUNKOWE
============================================================ */

/* ---- 📞 TELEFON ---- */
function usePhone() {
    if (usedPhone) return;
    usedPhone = true;

    document.getElementById("phoneBtn").classList.add("used");

    let q = quizQuestions[quizIndex];

    let chance = Math.random() < 0.8 ? q.a : q.w1;

    alert("📞 Przyjaciel mówi: „Myślę, że to: " + chance + "”.");
}


/* ---- 👥 PUBLICZNOŚĆ ---- */
function usePublic() {
    if (usedPublic) return;
    usedPublic = true;

    document.getElementById("publicBtn").classList.add("used");

    let q = quizQuestions[quizIndex];

    let result = {
        [q.a]: 60 + Math.floor(Math.random() * 20),
        [q.w1]: 10 + Math.floor(Math.random() * 20),
        [q.w2]: 5 + Math.floor(Math.random() * 15)
    };

    alert(
        "👥 Głosowanie publiczności:\n\n" +
        `${q.a}: ${result[q.a]}%\n` +
        `${q.w1}: ${result[q.w1]}%\n` +
        `${q.w2}: ${result[q.w2]}%`
    );
}


/* ---- ➗ 50/50 ---- */
function use5050() {
    if (used5050) return;
    used5050 = true;

    document.getElementById("halfBtn").classList.add("used");

    let q = quizQuestions[quizIndex];
    let wrongs = [q.w1, q.w2];
    let removed = wrongs[Math.floor(Math.random() * 2)];

    let buttons = document.querySelectorAll("#quizAnswers button");

    buttons.forEach(btn => {
        if (btn.innerText === removed) {
            btn.style.display = "none";
        }
    });
}


/* ============================================================
   HELPER — LOSOWANIE
============================================================ */
function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
}
