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

let currentMode = "math"; 
let skipTurn = false;
let doubleTask = false;
let superMode = false;

let mistakes = [];

let tournamentActive = false;
let currentPlayer = 0;
let players = [];
let playerCount = 0;

/* ============================================================
   STATYSTYKI GRACZA
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
   SEGMENTY KOŁA (11 pól)
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
        let start = angle + i * arc;
        let end = start + arc;

        let grad = ctx.createLinearGradient(0, 0, 600, 600);
        grad.addColorStop(0, segments[i].color1);
        grad.addColorStop(1, segments[i].color2);

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, start, end);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(start + arc / 2);
        ctx.textAlign = "center";
        ctx.fillStyle = "#fff";
        ctx.font = "bold 26px Arial";
        ctx.fillText(segments[i].text, radius * 0.65, 10);
        ctx.restore();
    }
}

/* ============================================================
   KLIKNIĘCIE – ZAKRĘĆ KOŁEM
============================================================ */

document.getElementById("spinBtn").onclick = spinWheel;

function spinWheel() {
    if (spinning) return;
    spinning = true;

    let totalRotation = 360 * 6 + Math.random() * 360;
    let start = null;
    let duration = 3500;

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
   PO ZATRZYMANIU – OD CZEGO ZALEŻY WYNIK
============================================================ */

function stopWheel() {
    let arc = (Math.PI * 2) / segments.length;

    let index = Math.floor(((Math.PI * 1.5 - angle) % (Math.PI * 2)) / arc);
    if (index < 0) index += segments.length;

    handleSegment(segments[index]);
}
/* ============================================================
   ZADANIA MATEMATYCZNE
============================================================ */

function generateMathTask() {
    if (skipTurn) {
        alert("❄ Pomijasz kolejkę!");
        skipTurn = false;
        return;
    }

    let a = Math.floor(Math.random() * 20 + 1);
    let b = Math.floor(Math.random() * 20 + 1);

    correctAnswer = a + b;

    document.getElementById("taskBox").innerHTML =
        `🔢 Ile to: <b>${a} + ${b}</b>?`;
}


/* ============================================================
   SUPER ZADANIE
============================================================ */
function generateSuperTask() {
    let a = Math.floor(Math.random() * 100 + 20);
    let b = Math.floor(Math.random() * 100 + 20);

    correctAnswer = a + b;

    document.getElementById("taskBox").innerHTML =
        `⭐ <b>SUPER ZADANIE!</b><br><br>
         Oblicz: <b>${a} + ${b}</b><br>
         ✔ Poprawna: <b>+10 pkt</b><br>
         ❌ Błędna: <b>-5 pkt</b>`;

    superMode = true;
}


/* ============================================================
   ZADANIA TEKSTOWE
============================================================ */

const names = ["Ala", "Ola", "Kuba", "Tomek", "Marek", "Zosia"];
const items = ["jabłka", "cukierki", "ciastka", "klocki", "piłki"];

function generateTextTask() {
    let name = names[Math.floor(Math.random() * names.length)];
    let item = items[Math.floor(Math.random() * items.length)];

    let a = Math.floor(Math.random() * 10 + 5);
    let b = Math.floor(Math.random() * 5 + 1);

    if (Math.random() < 0.5) {
        correctAnswer = a + b;
        document.getElementById("taskBox").innerHTML =
            `📘 <b>Zadanie tekstowe</b><br><br>
             ${name} miał(a) ${a} ${item}.<br>
             Dostał(a) ${b} więcej.<br>
             Ile ma teraz?`;
    } else {
        correctAnswer = a - b;
        document.getElementById("taskBox").innerHTML =
            `📘 <b>Zadanie tekstowe</b><br><br>
             ${name} miał(a) ${a} ${item}.<br>
             Oddał(a) ${b}.<br>
             Ile zostało?`;
    }
}


/* ============================================================
   ZADANIA INFORMATYCZNE
============================================================ */

const itTasks = [
    { q: "Urządzenie do pisania liter to…", a: "klawiatura" },
    { q: "Urządzenie wskazujące to…", a: "mysz" },
    { q: "Obrazki na pulpicie to…", a: "ikony" },
    { q: "Program do rysowania w Windows to…", a: "paint" },
    { q: "Pliki zapisujemy w…", a: "folderach" },
    { q: "Przenośny komputer to…", a: "laptop" },
    { q: "Duży komputer to komputer…", a: "stacjonarny" },
    { q: "Do słuchania służą…", a: "głośniki" },
    { q: "Do mówienia używamy…", a: "mikrofonu" },
    { q: "Program do pisania tekstu to…", a: "edytor tekstu" }
];

function generateITTask() {
    let t = itTasks[Math.floor(Math.random() * itTasks.length)];
    correctAnswer = t.a.toLowerCase();

    document.getElementById("taskBox").innerHTML =
        `🖥 <b>ZADANIE INFORMATYCZNE</b><br><br>${t.q}`;
}


/* ============================================================
   WYBÓR TYPU ZADANIA W ZALEŻNOŚCI OD TRYBU
============================================================ */

function generateTaskMode() {
    if (currentMode === "math") generateMathTask();
    else if (currentMode === "it") generateITTask();
    else return; // teleturniej używa innego systemu
}


/* ============================================================
   CZĘŚĆ: SERIA / KOMBO
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
   CZĘŚĆ: ŻYCIA
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
   SPRAWDZANIE ODPOWIEDZI (dla matematyki/informatyki)
============================================================ */

document.getElementById("checkBtn").onclick = checkAnswer;

function checkAnswer() {

    if (currentMode === "quiz") return; // teleturniej osobno

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
   REJESTR BŁĘDÓW
============================================================ */

function addMistake(task, answer) {
    mistakes.push(task + " = " + answer);
}


/* ============================================================
   AKTUALIZACJA WYNIKU
============================================================ */

function updateScore() {
    document.getElementById("p1").innerText = points;
}
/* ============================================================
   PANELE — UKRYWANIE / POKAZYWANIE
============================================================ */
function hideAllPanels() {
    document.getElementById("modePanel").classList.add("hidden");
    document.getElementById("missionPanel").classList.add("hidden");
    document.getElementById("timer").classList.add("hidden");
    document.getElementById("tournamentSetup").classList.add("hidden");
    document.getElementById("tournamentBoard").classList.add("hidden");
    document.getElementById("quizTournamentSetup").classList.add("hidden");
    document.getElementById("quizTournamentBoard").classList.add("hidden");
    document.getElementById("quizAnswers").classList.add("hidden");
    document.getElementById("lifelines").classList.add("hidden");
}

/* ============================================================
   TRYB: MISJE
============================================================ */

function startMissionMode() {
    hideAllPanels();
    resetLives();
    points = 0;

    currentMode = "math";

    document.getElementById("missionDesc").innerText =
        "Wykonaj 5 zadań poprawnie, aby przejść misję.";
    document.getElementById("missionPanel").classList.remove("hidden");
}

function startMission() {
    resetLives();
    points = 0;
    generateTaskMode();
}

/* ============================================================
   TRYB CZASOWY (10 s)
============================================================ */

let timerInterval = null;

function startTimeMode() {
    hideAllPanels();
    resetLives();

    currentMode = "math";
    points = 0;

    document.getElementById("timer").classList.remove("hidden");
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
   TRYB DO X PUNKTÓW
============================================================ */

function startPointsMode() {
    hideAllPanels();
    resetLives();
    points = 0;

    currentMode = "math";
    generateTaskMode();
}

/* ============================================================
   TRYB NIESKOŃCZONY
============================================================ */

function startEndlessMode() {
    hideAllPanels();
    resetLives();
    points = 0;

    currentMode = "math";
    generateTaskMode();
}

/* ============================================================
   TRYB INFORMATYKA (zwykły)
============================================================ */

function startITMode() {
    hideAllPanels();
    resetLives();
    points = 0;

    currentMode = "it";
    alert("🖥 Tryb INFORMATYKA — odpowiadaj na pytania o komputerach!");
    generateTaskMode();
}

/* ============================================================
   TURNIEJ MATEMATYCZNY – USTAWIENIA
============================================================ */

function startTournamentMode() {
    hideAllPanels();
    document.getElementById("tournamentSetup").classList.remove("hidden");
}

function createTournament() {
    playerCount = parseInt(document.getElementById("playerCount").value);

    players = [];
    for (let i = 0; i < playerCount; i++) {
        players.push({
            name: "Gracz " + (i + 1),
            score: 0,
            lives: 3
        });
    }

    currentPlayer = 0;
    tournamentActive = true;
    points = 0;

    hideAllPanels();
    document.getElementById("tournamentBoard").classList.remove("hidden");

    updateTournamentBoard();
    generateTaskMode();
}

/* ============================================================
   TURNIEJ MATEMATYCZNY – PRZEBIEG GRY
============================================================ */

function updateTournamentBoard() {
    let current = players[currentPlayer];

    document.getElementById("turnInfo").innerHTML =
        `<h3>Runda gracza: ${current.name}</h3>
         ❤️ Życia: ${current.lives} &nbsp;&nbsp;
         ⭐ Punkty: ${current.score}`;

    let list = "";
    players.forEach(p => {
        if (p.lives <= 0) {
            list += `<span style="opacity:0.4;">${p.name}: ❌ Odpadł</span><br>`;
        } else {
            list += `${p.name}: ⭐ ${p.score} pkt • ❤️ ${p.lives}<br>`;
        }
    });

    document.getElementById("playerScores").innerHTML = list;
}

/* ============================================================
   PRZESUWANIE TURY W TURNIEJU MATEMATYCZNYM
============================================================ */

function nextTournamentPlayer() {
    let startIndex = currentPlayer;

    do {
        currentPlayer = (currentPlayer + 1) % players.length;
    } while (players[currentPlayer].lives <= 0 && currentPlayer !== startIndex);
}

function previousPlayer() {
    do {
        currentPlayer--;
        if (currentPlayer < 0) currentPlayer = players.length - 1;
    } while (players[currentPlayer].lives <= 0);
}

/* ============================================================
   KONSEKWENCJE POLA KOŁA W TURNIEJU MATEMATYCZNYM
============================================================ */

function handleSegmentTournament(seg) {
    let p = players[currentPlayer];

    if (seg.type === "points") {
        p.score += seg.value;
        updateTournamentBoard();
        generateTaskMode();
        return;
    }

    if (seg.type === "bomb") {
        p.lives--;
        alert("💣 BOMBA! Gracz traci 1 życie.");
        if (p.lives <= 0) alert(p.name + " odpadł!");
        updateTournamentBoard();
        nextTournamentPlayer();
        return;
    }

    if (seg.type === "freeze") {
        alert("❄ Pominięcie następnej tury!");
        nextTournamentPlayer();
        return;
    }

    if (seg.type === "back") {
        alert("↩ Cofasz się o jednego gracza!");
        previousPlayer();
        updateTournamentBoard();
        return;
    }

    if (seg.type === "text") {
        generateTextTask();
        return;
    }

    if (seg.type === "super") {
        generateSuperTask();
        return;
    }

    if (seg.type === "double") {
        doubleTask = true;
        alert("🎯 Podwójne zadanie!");
        generateTaskMode();
        return;
    }

    if (seg.type === "random") {
        let list = ["points", "bomb", "freeze", "text", "super"];
        let chosen = list[Math.floor(Math.random() * list.length)];
        alert("🎁 RANDOM: " + chosen.toUpperCase());

        handleSegmentTournament({ type: chosen, value: 3 });
        return;
    }
}
/* ============================================================
   🎤 TELETURNIEJ INFORMATYCZNY – WIELU GRACZY
============================================================ */

let quizPlayers = [];
let quizPlayerIndex = 0;
let quizTournamentRunning = false;

let quizQuestions = [
    { q: "Urządzenie do pisania liter to…", a: "Klawiatura", w1: "Mysz", w2: "Monitor" },
    { q: "Obrazki na pulpicie to…", a: "Ikony", w1: "Okna", w2: "Pliki" },
    { q: "Program do rysowania to…", a: "Paint", w1: "Word", w2: "Excel" },
    { q: "Urządzenie wskazujące to…", a: "Mysz", w1: "Głośnik", w2: "RAM" },
    { q: "Gdzie zapisujemy pliki?", a: "W folderach", w1: "W koszu", w2: "Na pulpicie" },
    { q: "Przenośny komputer to…", a: "Laptop", w1: "Wieża", w2: "Router" },
    { q: "Służy do nagrywania obrazu…", a: "Kamera", w1: "Mysz", w2: "Monitor" },
    { q: "Program do pisania tekstu to…", a: "Edytor tekstu", w1: "Paint", w2: "Kalkulator" }
];

let usedPhone = false;
let usedPublic = false;
let used5050 = false;


/* ============================================================
   START PANELU TURNIEJU
============================================================ */

function startQuizTournament() {
    hideAllPanels();
    document.getElementById("quizTournamentSetup").classList.remove("hidden");
}


/* ============================================================
   ROZPOCZĘCIE GRY TURNIEJOWEJ
============================================================ */

function startQuizTournamentGame() {

    let count = parseInt(document.getElementById("quizTournamentCount").value);
    quizPlayers = [];

    for (let i = 0; i < count; i++) {
        quizPlayers.push({
            name: "Gracz " + (i + 1),
            score: 0,
            lives: 3,
            phone: false,
            public: false,
            half: false
        });
    }

    quizTournamentRunning = true;
    quizPlayerIndex = 0;
    quizIndex = 0;

    hideAllPanels();

    document.getElementById("quizTournamentBoard").classList.remove("hidden");
    document.getElementById("quizAnswers").classList.remove("hidden");
    document.getElementById("lifelines").classList.remove("hidden");

    updateQuizTournamentPanel();
    loadQuizQuestionTournament();
}


/* ============================================================
   WYŚWIETLANIE AKTUALNEGO GRACZA I TABLICY GRACZY
============================================================ */

function updateQuizTournamentPanel() {

    let p = quizPlayers[quizPlayerIndex];

    document.getElementById("quizTurnInfo").innerHTML =
        `<h3>Tura gracza: ${p.name}</h3>
         ❤️ Życia: ${p.lives} &nbsp;&nbsp;
         ⭐ Punkty: ${p.score}`;

    let list = "";
    quizPlayers.forEach(pl => {
        if (pl.lives <= 0) {
            list += `<span style="opacity:0.3;">${pl.name}: ❌ odpadł</span><br>`;
        } else {
            list += `${pl.name}: ❤️ ${pl.lives} • ⭐ ${pl.score}<br>`;
        }
    });

    document.getElementById("quizPlayersBoard").innerHTML = list;

    // aktualizacja ikon kół ratunkowych
    document.getElementById("phoneBtn").classList.toggle("used", p.phone);
    document.getElementById("publicBtn").classList.toggle("used", p.public);
    document.getElementById("halfBtn").classList.toggle("used", p.half);
}


/* ============================================================
   WCZYTYWANIE PYTANIA ABC
============================================================ */

function loadQuizQuestionTournament() {

    let q = quizQuestions[quizIndex];
    let answers = shuffle([q.a, q.w1, q.w2]);

    document.getElementById("taskBox").innerHTML =
        `🎤 <b>Pytanie ${quizIndex + 1} / ${quizQuestions.length}</b><br><br>${q.q}`;

    let html = "";
    answers.forEach(a => {
        html += `<button class="modeBtn" onclick="checkQuizTournament('${a}')">${a}</button><br>`;
    });

    document.getElementById("quizAnswers").innerHTML = html;
}


/* ============================================================
   SPRAWDZANIE ODPOWIEDZI W TELETURNIEJU
============================================================ */

function checkQuizTournament(answer) {

    let current = quizPlayers[quizPlayerIndex];
    let correct = quizQuestions[quizIndex].a;

    if (answer === correct) {
        current.score++;
        alert("✔ Poprawna odpowiedź!");
    } else {
        current.lives--;
        alert("❌ Błędna odpowiedź!");
    }

    if (current.lives <= 0) {
        alert(current.name + " odpada z teleturnieju!");
    }

    quizIndex++;
    if (quizIndex >= quizQuestions.length) quizIndex = 0;

    nextQuizTournamentPlayer();
    checkQuizTournamentWinner();

    updateQuizTournamentPanel();
    loadQuizQuestionTournament();
}


/* ============================================================
   KOŁA RATUNKOWE
============================================================ */

function usePhone() {
    let p = quizPlayers[quizPlayerIndex];
    if (p.phone) return;
    p.phone = true;

    let q = quizQuestions[quizIndex];
    let hint = Math.random() < 0.85 ? q.a : q.w1;

    alert("📞 Przyjaciel mówi: „Chyba to: " + hint + "”.");
    updateQuizTournamentPanel();
}

function usePublic() {
    let p = quizPlayers[quizPlayerIndex];
    if (p.public) return;
    p.public = true;

    let q = quizQuestions[quizIndex];

    let votes = {
        [q.a]: 60 + Math.floor(Math.random() * 20),
        [q.w1]: 10 + Math.floor(Math.random() * 20),
        [q.w2]: 5 + Math.floor(Math.random() * 10)
    };

    alert(
        "👥 Wyniki publiczności:\n\n" +
        `${q.a}: ${votes[q.a]}%\n` +
        `${q.w1}: ${votes[q.w1]}%\n` +
        `${q.w2}: ${votes[q.w2]}%`
    );

    updateQuizTournamentPanel();
}

function use5050() {
    let p = quizPlayers[quizPlayerIndex];
    if (p.half) return;
    p.half = true;

    let q = quizQuestions[quizIndex];
    let wrong = [q.w1, q.w2];
    let removed = wrong[Math.floor(Math.random() * 2)];

    let buttons = document.querySelectorAll("#quizAnswers button");
    buttons.forEach(btn => {
        if (btn.innerText === removed) btn.style.display = "none";
    });

    updateQuizTournamentPanel();
}


/* ============================================================
   PRZECHODZENIE DO NASTĘPNEGO ŻYJĄCEGO GRACZA
============================================================ */

function nextQuizTournamentPlayer() {

    let start = quizPlayerIndex;

    do {
        quizPlayerIndex = (quizPlayerIndex + 1) % quizPlayers.length;
    } while (quizPlayers[quizPlayerIndex].lives <= 0
          && quizPlayerIndex !== start);
}


/* ============================================================
   SPRAWDZENIE, CZY JEST ZWYCIĘZCA
============================================================ */

function checkQuizTournamentWinner() {

    let alive = quizPlayers.filter(p => p.lives > 0);

    if (alive.length === 1) {

        hideAllPanels();
        document.getElementById("taskBox").innerHTML =
            `🏆 <b>Zwycięzca teleturnieju:</b><br><br>
             <h2>${alive[0].name}</h2>
             Punkty: <b>${alive[0].score}</b>`;

        document.getElementById("quizAnswers").classList.add("hidden");
        document.getElementById("lifelines").classList.add("hidden");

        grantAchievement("Wygrana w turnieju informatycznym");
    }
}


/* ============================================================
   FUNKCJE POMOCNICZE
============================================================ */

function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
}
