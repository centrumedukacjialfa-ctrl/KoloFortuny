/* ============================================================
   🌀 GLOBALNE ZMIENNE KLAWIATURA GRY
============================================================ */

let wheel, ctx;
let angle = 0;                 // aktualny kąt koła
let spinning = false;          // czy koło się kręci
let currentSegment = null;     // na którym polu się zatrzyma
let lives = 3;
let points = 0;
let combo = 0;
let correctAnswer = "";
let currentMode = "math";      // math / it / mission / quiz
let tournamentActive = false;

let doubleTask = false;
let skipTurn = false;
let superMode = false;

/* ============================================================
   🎨 DEFINICJA SEGMENTÓW KOŁA (11 pól)
============================================================ */

const segments = [
    { text: "+2 pkt", color1: "#ff4747", color2: "#b80000", type: "points", value: 2 },
    { text: "Podwójne", color1: "#ffe266", color2: "#ffb300", type: "double" },
    { text: "+5 pkt", color1: "#5aff5a", color2: "#1c8f1c", type: "points", value: 5 },
    { text: "Zamrożenie", color1: "#6cd6ff", color2: "#0087c7", type: "freeze" },
    { text: "Tekstowe", color1: "#ffaaff", color2: "#d600d6", type: "text" },
    { text: "BOMBA", color1: "#000000", color2: "#444444", type: "bomb" },
    { text: "-5 pkt", color1: "#ff5050", color2: "#8a0000", type: "points", value: -5 },
    { text: "Cofnij turę", color1: "#cccccc", color2: "#7a7a7a", type: "back" },
    { text: "+10 pkt", color1: "#4cffc6", color2: "#009e7d", type: "points", value: 10 },
    { text: "Losowe", color1: "#ffff66", color2: "#d1d100", type: "random" },
    { text: "SUPER", color1: "#ff9f1c", color2: "#c36800", type: "super" }
];

/* ============================================================
   🖌 RYSOWANIE KOŁA FORTUNY
============================================================ */
window.onload = () => {
    wheel = document.getElementById("wheel");
    ctx = wheel.getContext("2d");
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

        // gradient segmentu
        let grad = ctx.createLinearGradient(0, 0, 600, 600);
        grad.addColorStop(0, segments[i].color1);
        grad.addColorStop(1, segments[i].color2);

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, start, end);
        ctx.fillStyle = grad;
        ctx.fill();

        // tekst segmentu
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
   🔄 ANIMACJA KRĘCENIA KOŁA
============================================================ */

document.getElementById("spinBtn").onclick = spinWheel;

function spinWheel() {
    if (spinning) return;
    spinning = true;

    let totalRotation = 360 * 4 + Math.random() * 360; // 4 obroty + losowa końcówka
    let start = null;
    let duration = 3500; // czas animacji

    function animate(time) {
        if (!start) start = time;
        let progress = (time - start) / duration;

        if (progress > 1) progress = 1;

        // efekt zwalniania
        let ease = 1 - Math.pow(1 - progress, 3);

        angle = ease * (totalRotation * Math.PI / 180);

        drawWheel();

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            spinning = false;
            stopWheel();
        }
    }

    requestAnimationFrame(animate);
}

/* ============================================================
   🎯 ZATRZYMANIE KOŁA – WYBÓR SEGMENTU
============================================================ */

function stopWheel() {

    let arc = (Math.PI * 2) / segments.length;
    let index = Math.floor(((Math.PI * 1.5 - angle) % (Math.PI * 2)) / arc);

    if (index < 0) index += segments.length;

    currentSegment = segments[index];

    console.log("Wylosowano segment:", currentSegment);

    handleSegment(currentSegment);
}

/* ============================================================
   🎁 OBSŁUGA SEGMENTÓW – wybór działania
   (dalsze funkcje będą w JS 2–6)
============================================================ */

function handleSegment(seg) {
    // Logika segmentów zostanie kontynuowana w JS2
    // tutaj tylko przekierowanie zależne od trybu gry

    if (currentMode === "math" || currentMode === "it") {
        processSegmentForNormalGame(seg);
    }

    if (currentMode === "mission") {
        processSegmentForMission(seg);
    }

    if (tournamentActive) {
        handleSegmentTournament(seg);
    }
}
/* ============================================================
   📘 ZADANIA MATEMATYCZNE
============================================================ */

function generateMathTask() {
    let a = Math.floor(Math.random() * 20 + 1);
    let b = Math.floor(Math.random() * 20 + 1);

    correctAnswer = (a + b).toString();

    document.getElementById("taskBox").innerHTML =
        `🔢 <b>Oblicz:</b><br><br>
         <span style='font-size: 36px;'>${a} + ${b}</span>`;
    
    showAnswerBox();
}

/* ============================================================
   ⭐ SUPER ZADANIE
============================================================ */

function generateSuperTask() {
    let a = Math.floor(Math.random() * 100 + 50);
    let b = Math.floor(Math.random() * 100 + 50);

    correctAnswer = (a + b).toString();
    superMode = true;

    document.getElementById("taskBox").innerHTML =
        `⭐ <b>SUPER ZADANIE!</b><br><br>
         <span style='font-size: 40px;'>${a} + ${b}</span><br><br>
         ✔ Poprawna: +10 pkt<br>
         ❌ Błędna: -5 pkt`;

    showAnswerBox();
}

/* ============================================================
   📖 ZADANIA TEKSTOWE
============================================================ */

const names = ["Ala", "Ola", "Zosia", "Kuba", "Marek", "Tomek", "Igor"];
const items = ["jabłka", "ciastka", "cukierki", "klocki", "piłki", "kwiatki"];

function generateTextTask() {
    let name = names[Math.floor(Math.random() * names.length)];
    let item = items[Math.floor(Math.random() * items.length)];
    let a = Math.floor(Math.random() * 10 + 4);
    let b = Math.floor(Math.random() * 5 + 1);

    if (Math.random() < 0.5) {
        correctAnswer = (a + b).toString();
        document.getElementById("taskBox").innerHTML =
            `📗 <b>Zadanie tekstowe</b><br><br>
             ${name} miał(a) ${a} ${item}.<br>
             Dostał(a) jeszcze ${b}.<br><br>
             Ile ma razem?`;
    } else {
        correctAnswer = (a - b).toString();
        document.getElementById("taskBox").innerHTML =
            `📘 <b>Zadanie tekstowe</b><br><br>
             ${name} miał(a) ${a} ${item}.<br>
             Oddał(a) ${b}.<br><br>
             Ile mu zostało?`;
    }

    showAnswerBox();
}

/* ============================================================
   🖥 ZADANIA INFORMATYCZNE (do zwykłego trybu)
============================================================ */

const itTasks = [
    { q: "Urządzenie do pisania tekstu to…", a: "klawiatura" },
    { q: "Urządzenie wskazujące to…", a: "mysz" },
    { q: "Co wyświetla obraz?", a: "monitor" },
    { q: "Program do rysowania to…", a: "paint" },
    { q: "Przenośny komputer to…", a: "laptop" },
    { q: "Duży komputer to komputer…", a: "stacjonarny" },
    { q: "Obrazki na pulpicie to…", a: "ikony" },
    { q: "Do słuchania służą…", a: "głośniki" },
    { q: "Do mówienia służy…", a: "mikrofon" },
    { q: "Pliki zapisujemy w…", a: "folderach" }
];

function generateITTask() {
    let t = itTasks[Math.floor(Math.random() * itTasks.length)];
    correctAnswer = t.a.toLowerCase();

    document.getElementById("taskBox").innerHTML =
        `🖥 <b>Pytanie informatyczne</b><br><br>${t.q}`;

    showAnswerBox();
}

/* ============================================================
   🎮 WYBÓR ZADANIA W ZALEŻNOŚCI OD TRYBU
============================================================ */

function generateTaskMode() {
    if (currentMode === "math") generateMathTask();
    else if (currentMode === "it") generateITTask();
    else if (currentMode === "mission") generateMathTask(); 
}

/* ============================================================
   📥 POKAŻ OKNO ODPOWIEDZI
============================================================ */

function showAnswerBox() {
    document.getElementById("answerSection").classList.remove("hidden");
    document.getElementById("answerInput").value = "";
    document.getElementById("answerInput").focus();
}

/* ============================================================
   🧠 SPRAWDZANIE ODPOWIEDZI
============================================================ */

document.getElementById("checkBtn").onclick = checkAnswer;

function checkAnswer() {
    if (currentMode === "quiz") return; // teleturniej ma inną logikę

    let user = document.getElementById("answerInput").value.trim().toLowerCase();

    if (user === "") return;

    /* ====== POPRAWNA ODPOWIEDŹ ====== */
    if (user === correctAnswer.toString().toLowerCase()) {

        if (superMode) {
            points += 10;
            superMode = false;
        } else if (doubleTask) {
            points += 2;
            doubleTask = false;
        } else {
            points += 1;
        }

        combo++;
        updateScore();

        generateTaskMode();
    }

    /* ====== BŁĄD ====== */
    else {
        if (superMode) {
            points -= 5;
            superMode = false;
        }

        lives--;
        combo = 0;

        document.getElementById("livesCount").innerText = lives;

        if (lives <= 0) {
            alert("❌ Koniec gry!");
            location.reload();
            return;
        }

        updateScore();
        generateTaskMode();
    }
}

/* ============================================================
   🧮 AKTUALIZACJA WYNIKU
============================================================ */

function updateScore() {
    document.getElementById("p1").innerText = points;
}
/* ============================================================
   🧽 CZYSZCZENIE PANELI
============================================================ */
function hideAllPanels() {
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
   ❤️ ŻYCIA
============================================================ */
function resetLives() {
    lives = 3;
    document.getElementById("livesCount").innerText = lives;
}

/* ============================================================
   🔢 TRYB MATEMATYCZNY
============================================================ */
function startMathMode() {
    hideAllPanels();
    resetLives();
    points = 0;

    currentMode = "math";

    document.getElementById("spinBtn").classList.remove("hidden");
    document.getElementById("taskBox").classList.remove("hidden");

    generateTaskMode();
}

/* ============================================================
   🖥 TRYB INFORMATYKA (normalny)
============================================================ */
function startITMode() {
    hideAllPanels();
    resetLives();
    points = 0;

    currentMode = "it";

    document.getElementById("spinBtn").classList.remove("hidden");
    document.getElementById("taskBox").classList.remove("hidden");

    alert("🖥 Tryb INFORMATYKA — pytania komputerowe!");

    generateTaskMode();
}

/* ============================================================
   🗺 TRYB MISJI
============================================================ */

let mission = 1;
let missionGoal = 5;

function startMissionMode() {
    hideAllPanels();
    resetLives();
    points = 0;
    combo = 0;

    mission = 1;
    currentMode = "mission";

    document.getElementById("missionDesc").innerHTML =
        `W misji <b>${mission}</b> wykonaj <b>${missionGoal}</b> poprawnych odpowiedzi!`;

    document.getElementById("missionPanel").classList.remove("hidden");
}

function startMission() {
    points = 0;
    hideAllPanels();
    document.getElementById("spinBtn").classList.remove("hidden");
    generateTaskMode();
}

function processSegmentForMission(seg) {
    if (seg.type === "points") points += seg.value;
    if (seg.type === "super") generateSuperTask();
    else generateTaskMode();

    updateScore();

    if (points >= missionGoal) {
        alert(`🎉 Misja ${mission} ukończona!`);

        mission++;
        points = 0;

        if (mission > 6) {
            alert("🏆 Wszystkie misje ukończone!");
            location.reload();
            return;
        }

        hideAllPanels();

        document.getElementById("missionDesc").innerHTML =
            `Misja <b>${mission}</b>: zrób <b>${missionGoal}</b> poprawnych odpowiedzi.`;

        document.getElementById("missionPanel").classList.remove("hidden");
    }
}

/* ============================================================
   ⏱ TRYB CZASOWY
============================================================ */

let timerInterval = null;

function startTimeMode() {
    hideAllPanels();
    resetLives();
    points = 0;

    currentMode = "math";

    document.getElementById("spinBtn").classList.remove("hidden");
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

        if (timeLeft === 0) {
            loseLife();
            startTimer();
            generateTaskMode();
        }
    }, 1000);
}

/* ============================================================
   ⭐ TRYB „DO X PUNKTÓW”
============================================================ */

function startPointsMode() {
    let goal = prompt("Do ilu punktów gramy?", "10");
    if (!goal) return;

    hideAllPanels();
    resetLives();
    points = 0;

    currentMode = "math";
    pointGoal = parseInt(goal);

    document.getElementById("spinBtn").classList.remove("hidden");
    generateTaskMode();
}

let pointGoal = 10;

function checkPointGoal() {
    if (points >= pointGoal) {
        alert(`🏆 Zdobyłeś ${points} punktów!`);
        location.reload();
    }
}

/* ============================================================
   ♾ TRYB NIESKOŃCZONY
============================================================ */

function startEndlessMode() {
    hideAllPanels();
    resetLives();
    points = 0;

    currentMode = "math";

    document.getElementById("spinBtn").classList.remove("hidden");

    generateTaskMode();
}
/* ============================================================
   👥 TURNIEJ MATEMATYCZNY – WIELE GRACZY
============================================================ */

let players = [];
let currentPlayer = 0;
let tournamentPointsGoal = 20;

function startTournamentMode() {
    hideAllPanels();

    document.getElementById("tournamentSetup").classList.remove("hidden");
}

function createTournament() {
    let count = parseInt(document.getElementById("playerCount").value);

    if (count < 2 || count > 10) {
        alert("W turnieju może brać udział 2–10 graczy.");
        return;
    }

    players = [];

    for (let i = 0; i < count; i++) {
        let name = prompt(`Podaj imię gracza ${i + 1}:`);
        if (!name || name.trim() === "") name = `Gracz ${i + 1}`;

        players.push({
            name: name,
            points: 0,
            lives: 3
        });
    }

    currentPlayer = 0;
    tournamentActive = true;

    document.getElementById("tournamentSetup").classList.add("hidden");
    document.getElementById("tournamentBoard").classList.remove("hidden");
    document.getElementById("spinBtn").classList.remove("hidden");
    document.getElementById("taskBox").classList.remove("hidden");

    updateTournamentBoard();
    generateTaskMode();
}

/* ============================================================
   📝 AKTUALIZACJA TABLICY WYNIKÓW
============================================================ */

function updateTournamentBoard() {
    let board = "";

    for (let i = 0; i < players.length; i++) {
        board += `<b>${players[i].name}</b>: 
                  ${players[i].points} pkt | ❤️ ${players[i].lives}<br>`;
    }

    document.getElementById("playerScores").innerHTML = board;
    document.getElementById("turnInfo").innerHTML =
        `Tura gracza: <b>${players[currentPlayer].name}</b>`;
}

/* ============================================================
   🎯 OBSŁUGA SEGMENTU W TRYBIE TURNIEJOWYM
============================================================ */

function handleSegmentTournament(seg) {
    let p = players[currentPlayer];

    if (seg.type === "points") {
        p.points += seg.value;
    }

    else if (seg.type === "double") {
        doubleTask = true;
    }

    else if (seg.type === "freeze") {
        alert("❄ Tura zamrożona – kolejny gracz!");
        nextPlayer();
        return;
    }

    else if (seg.type === "random") {
        alert("🔀 Losowe zadanie!");
    }

    else if (seg.type === "bomb") {
        p.lives--;
        alert(`💣 ${p.name} traci 1 życie!`);

        if (p.lives <= 0) {
            alert(`☠ ${p.name} odpada z gry!`);
            players.splice(currentPlayer, 1);

            if (players.length === 1) {
                alert(`🏆 Zwycięzca: ${players[0].name}!`);
                location.reload();
                return;
            }

            if (currentPlayer >= players.length) currentPlayer = 0;
            updateTournamentBoard();
            return;
        }
    }

    else if (seg.type === "super") {
        generateSuperTask();
    }

    else if (seg.type === "text") {
        generateTextTask();
    }

    else {
        generateTaskMode();
    }

    updateTournamentBoard();
}

/* ============================================================
   🧠 SPRAWDZANIE ODPOWIEDZI W TURNIEJU
============================================================ */

function checkAnswerTournament() {
    let p = players[currentPlayer];
    let user = document.getElementById("answerInput").value.trim().toLowerCase();

    if (user === correctAnswer.toString().toLowerCase()) {

        if (superMode) {
            p.points += 10;
            superMode = false;
        } else if (doubleTask) {
            p.points += 2;
            doubleTask = false;
        } else {
            p.points += 1;
        }

        updateTournamentBoard();

        if (p.points >= tournamentPointsGoal) {
            alert(`🏆 ${p.name} wygrał turniej!`);
            location.reload();
            return;
        }

        generateTaskMode();
    }

    else {
        p.lives--;
        combo = 0;

        if (p.lives <= 0) {
            alert(`❌ ${p.name} odpada!`);
            players.splice(currentPlayer, 1);

            if (players.length === 1) {
                alert(`🏆 Zwycięzca: ${players[0].name}!`);
                location.reload();
                return;
            }
        }

        updateTournamentBoard();
        nextPlayer();
        generateTaskMode();
    }
}

/* ============================================================
   🔄 ZMIANA GRACZA
============================================================ */

function nextPlayer() {
    currentPlayer++;

    if (currentPlayer >= players.length) currentPlayer = 0;

    updateTournamentBoard();
}
/* ============================================================
   🎤 TELETURNIEJ ABC – WIELE GRACZY
============================================================ */

let quizPlayers = [];
let quizCurrent = 0;

function startQuizTournament() {
    hideAllPanels();
    document.getElementById("quizTournamentSetup").classList.remove("hidden");
}

function startQuizTournamentGame() {
    let count = parseInt(document.getElementById("quizTournamentCount").value);

    if (count < 2 || count > 10) {
        alert("Teleturniej: 2–10 graczy!");
        return;
    }

    quizPlayers = [];

    for (let i = 0; i < count; i++) {
        let name = prompt(`Imię gracza ${i + 1}:`);
        if (!name) name = "Gracz " + (i + 1);

        quizPlayers.push({
            name: name,
            points: 0,
            lifes: 3
        });
    }

    quizCurrent = 0;
    currentMode = "quiz";

    document.getElementById("quizTournamentSetup").classList.add("hidden");
    document.getElementById("quizTournamentBoard").classList.remove("hidden");
    document.getElementById("quizAnswers").classList.remove("hidden");

    document.getElementById("spinBtn").classList.add("hidden");
    document.getElementById("taskBox").classList.remove("hidden");

    resetLifelines();
    updateQuizBoard();
    generateQuizQuestion();
}

/* ============================================================
   🧩 PYTANIA ABC (INFORMATYKA)
============================================================ */
/* ============================================================
   🧩 PYTANIA ABC (INFORMATYKA – 180+ pytań)
============================================================ */
const quizQuestions = [

/* === SPRZĘT KOMPUTEROWY === */
{ q: "Co wyświetla obraz?", a: "Monitor", w1: "Mysz", w2: "Głośnik" },
{ q: "Co służy do wpisywania tekstu?", a: "Klawiatura", w1: "Mysz", w2: "Router" },
{ q: "Czym przesuwamy kursor?", a: "Mysz", w1: "Kamera", w2: "Głośniki" },
{ q: "Co drukuje dokumenty?", a: "Drukarka", w1: "Monitor", w2: "Pendrive" },
{ q: "Co nagrywa głos?", a: "Mikrofon", w1: "Głośniki", w2: "Kamera" },
{ q: "Gdzie są głośniki?", a: "Po bokach monitora", w1: "W kablach", w2: "W koszu" },
{ q: "Co przechowuje dane?", a: "Dysk", w1: "Monitor", w2: "Głośnik" },
{ q: "Laptop to komputer…", a: "Przenośny", w1: "Stacjonarny", w2: "Do gier retro" },
{ q: "Komputer na biurku to…", a: "Stacjonarny", w1: "Telefon", w2: "Smartwatch" },
{ q: "Co łączy komputer z prądem?", a: "Zasilacz", w1: "Router", w2: "Głośnik" },

/* === PLIKI, FOLDERY, SYSTEM === */
{ q: "Co usuwa pliki?", a: "Kosz", w1: "Router", w2: "Paint" },
{ q: "Pliki zapisujemy w…", a: "Folderach", w1: "Tapecie", w2: "YouTube" },
{ q: "Co robi CTRL+C?", a: "Kopiuje", w1: "Usuwa", w2: "Drukuje" },
{ q: "Co robi CTRL+V?", a: "Wkleja", w1: "Zamyka", w2: "Wyłącza komputer" },
{ q: "Co robi CTRL+S?", a: "Zapisuje", w1: "Maluję", w2: "Wycina" },
{ q: "Ikony znajdują się na…", a: "Pulpicie", w1: "YouTube", w2: "Koszu" },
{ q: "Folder to…", a: "Miejsce na pliki", w1: "Program", w2: "Obrazek" },
{ q: "Usunięte pliki trafiają do…", a: "Kosza", w1: "Internetu", w2: "Kalkulatora" },

/* === INTERNET === */
{ q: "Do czego służy przeglądarka?", a: "Do internetu", w1: "Do pisania", w2: "Do filmów offline" },
{ q: "Co to Google?", a: "Wyszukiwarka", w1: "Gra", w2: "Program antywirusowy" },
{ q: "Strona z filmami to…", a: "YouTube", w1: "Word", w2: "Paint" },
{ q: "Bezpieczna strona zaczyna się od…", a: "https://", w1: "http://", w2: "www." },
{ q: "Co zapewnia dostęp do internetu?", a: "Router", w1: "Mysz", w2: "Drukarka" },
{ q: "E-mail to…", a: "Poczta elektroniczna", w1: "Folder", w2: "Gra" },
{ q: "Adres wpisujemy w…", a: "Pasku adresu", w1: "Koszu", w2: "Excelu" },
{ q: "Link to…", a: "Odnośnik", w1: "Tapeta", w2: "Plik muzyczny" },

/* === BEZPIECZEŃSTWO W SIECI === */
{ q: "Hasło powinno być…", a: "Tajne", w1: "Udostępniane", w2: "Krótkie" },
{ q: "Czy podajemy hasło obcym?", a: "Nie", w1: "Tak", w2: "Tylko czasem" },
{ q: "Ikona kłódki oznacza…", a: "Bezpieczną stronę", w1: "Błąd", w2: "Reklamę" },
{ q: "Co chroni komputer?", a: "Antywirus", w1: "Paint", w2: "Word" },
{ q: "Co to wirus?", a: "Szkodliwy program", w1: "Zdjęcie", w2: "Gra" },
{ q: "Podejrzany link należy…", a: "Ignorować", w1: "Kliknąć", w2: "Wysłać dalej" },
{ q: "Silne hasło ma…", a: "Cyfry i litery", w1: "Jedną literę", w2: "1234" },
{ q: "Co to phishing?", a: "Oszustwo", w1: "Zdjęcie", w2: "Program" },

/* === PROGRAMY === */
{ q: "Program do pisania to…", a: "Word", w1: "Paint", w2: "Galeria" },
{ q: "Program do rysowania to…", a: "Paint", w1: "Excel", w2: "YouTube" },
{ q: "Do prezentacji używamy…", a: "PowerPoint", w1: "Word", w2: "Kalkulator" },
{ q: "Do obliczeń używamy…", a: "Kalkulatora", w1: "Kamyka", w2: "Drukarki" },
{ q: "Excel służy do…", a: "Tabel", w1: "Filmów", w2: "Nagrywania dźwięku" },

/* === SMARTFON / TABLET === */
{ q: "Mały komputer to…", a: "Smartfon", w1: "Router", w2: "Monitor" },
{ q: "Do robienia zdjęć służy…", a: "Aparat", w1: "Głośnik", w2: "Pendrive" },
{ q: "Do rozmów służy…", a: "Telefon", w1: "Router", w2: "Mysz" },

/* === ŁATWE / DLA SZKOŁY SPECJALNEJ === */
{ q: "Tapeta to…", a: "Tło pulpitu", w1: "Program", w2: "Folder" },
{ q: "Ikona to…", a: "Mały obrazek", w1: "Hasło", w2: "Router" },
{ q: "Pulpit to…", a: "Ekran główny", w1: "Internet", w2: "Kosz" },
{ q: "Menu Start służy do…", a: "Uruchamiania programów", w1: "Rysowania", w2: "Wyłączania głośników" },

/* === TRUDNIEJSZE – LOGIKA KOMPUTERA === */
{ q: "CPU to…", a: "Procesor", w1: "Głośnik", w2: "Drukarka" },
{ q: "GPU to…", a: "Karta graficzna", w1: "Mysz", w2: "Kamera" },
{ q: "Co chłodzi komputer?", a: "Wentylator", w1: "Mysz", w2: "Router" },
{ q: "Co trzeba czasem restartować?", a: "Komputer", w1: "Zeszyt", w2: "Monitor" },
{ q: "Co może mieć wirusa?", a: "Komputer", w1: "Buty", w2: "Piórnik" }
];


/* ============================================================
   🎤 GENEROWANIE PYTANIA ABC
============================================================ */

function generateQuizQuestion() {
    let q = quizQuestions[Math.floor(Math.random() * quizQuestions.length)];

    correctAnswer = q.a;

    document.getElementById("taskBox").innerHTML =
        `<b style='font-size: 30px;'>${q.q}</b>`;

    let answers = shuffle([q.a, q.w1, q.w2]);

    document.getElementById("quizAnswers").innerHTML = `
        <button onclick="quizAnswer('${answers[0]}')">A: ${answers[0]}</button><br>
        <button onclick="quizAnswer('${answers[1]}')">B: ${answers[1]}</button><br>
        <button onclick="quizAnswer('${answers[2]}')">C: ${answers[2]}</button><br>
    `;
}

function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

/* ============================================================
   👉 WYBÓR ODPOWIEDZI W TELETURNIEJU
============================================================ */

function quizAnswer(ans) {
    let p = quizPlayers[quizCurrent];

    if (ans === correctAnswer) {
        p.points += 2;
    } else {
        p.lifes--;
        if (p.lifes <= 0) {
            alert(`☠ ${p.name} odpada z teleturnieju!`);
            quizPlayers.splice(quizCurrent, 1);

            if (quizPlayers.length === 1) {
                alert(`🏆 Zwycięzca: ${quizPlayers[0].name}!`);
                location.reload();
                return;
            }
        }
    }

    nextQuizPlayer();
    updateQuizBoard();
    resetLifelines();
    generateQuizQuestion();
}

/* ============================================================
   🔄 ZMIANA GRACZA W TELETURNIEJU
============================================================ */

function nextQuizPlayer() {
    quizCurrent++;
    if (quizCurrent >= quizPlayers.length) quizCurrent = 0;
}

/* ============================================================
   📊 AKTUALIZACJA TABLICY
============================================================ */

function updateQuizBoard() {
    let html = "<h3>Wyniki:</h3>";
    for (let p of quizPlayers) {
        html += `${p.name}: ${p.points} pkt | ❤️ ${p.lifes}<br>`;
    }
    document.getElementById("quizPlayersBoard").innerHTML = html;

    document.getElementById("quizTurnInfo").innerHTML =
        `Tura: <b>${quizPlayers[quizCurrent].name}</b>`;
}

/* ============================================================
   ❤️ KOŁA RATUNKOWE
============================================================ */

function resetLifelines() {
    document.getElementById("lifelines").classList.remove("hidden");

    document.querySelectorAll(".lifeBtn").forEach(btn => {
        btn.classList.remove("used");
    });
}

/* === 📞 Telefon do przyjaciela === */
function usePhone() {
    if (document.getElementById("phoneBtn").classList.contains("used")) return;

    document.getElementById("phoneBtn").classList.add("used");

    alert("📞 Przyjaciel mówi: 'Myślę, że odpowiedź to: " + correctAnswer + "'");
}

/* === 👥 Pytanie do publiczności === */
function usePublic() {
    if (document.getElementById("publicBtn").classList.contains("used")) return;

    document.getElementById("publicBtn").classList.add("used");

    let msg = `👥 Publiczność głosowała:\n`;

    msg += `${correctAnswer}: 70%\n`;

    let wrong = quizQuestions.find(q => q.a === correctAnswer);
    msg += `${wrong.w1}: 20%\n`;
    msg += `${wrong.w2}: 10%`;

    alert(msg);
}

/* === ➗ 50/50 === */
function use5050() {
    if (document.getElementById("halfBtn").classList.contains("used")) return;

    document.getElementById("halfBtn").classList.add("used");

    let wrong = quizQuestions.find(q => q.a === correctAnswer);

    let buttons = document.querySelectorAll("#quizAnswers button");

    let removed = 0;

    buttons.forEach(btn => {
        if (removed < 2 && !btn.innerText.includes(correctAnswer)) {
            btn.style.visibility = "hidden";
            removed++;
        }
    });
}
/* ============================================================
   🧨 OBSŁUGA SEGMENTÓW W TRYBIE NORMALNYM (math / it)
============================================================ */

function processSegmentForNormalGame(seg) {

    if (seg.type === "points") {
        points += seg.value;
        updateScore();
        generateTaskMode();
    }

    else if (seg.type === "text") {
        generateTextTask();
    }

    else if (seg.type === "bomb") {
        lives--;
        alert("💣 BOMBA! Tracisz 1 życie!");
        document.getElementById("livesCount").innerText = lives;

        if (lives <= 0) {
            alert("❌ Koniec gry!");
            location.reload();
            return;
        }

        generateTaskMode();
    }

    else if (seg.type === "double") {
        alert("✨ Kolejne zadanie za podwójne punkty!");
        doubleTask = true;
        generateTaskMode();
    }

    else if (seg.type === "freeze") {
        alert("❄ Zamrożenie — nic się nie dzieje!");
        generateTaskMode();
    }

    else if (seg.type === "back") {
        points -= 2;
        if (points < 0) points = 0;
        updateScore();
        alert("↩ Cofnięcie — tracisz 2 punkty!");
        generateTaskMode();
    }

    else if (seg.type === "super") {
        generateSuperTask();
    }

    else if (seg.type === "random") {
        let r = Math.random();
        if (r < 0.33) generateTextTask();
        else if (r < 0.66) generateITTask();
        else generateMathTask();
    }
}

/* ============================================================
   ❌ STRATA ŻYCIA (czasówka)
============================================================ */
function loseLife() {
    lives--;
    document.getElementById("livesCount").innerText = lives;

    if (lives <= 0) {
        alert("❌ Koniec gry!");
        location.reload();
    }
}

/* ============================================================
   🔧 BLOKOWANIE PRZYCISKÓW W CZASIE KRĘCENIA
============================================================ */

function lockUI() {
    document.getElementById("spinBtn").disabled = true;
}
function unlockUI() {
    document.getElementById("spinBtn").disabled = false;
}

/* ============================================================
   🔄 GLOBALNY HANDLER – SPRAWDZANIE W KTÓRYM TRYBIE JESTEŚ
============================================================ */

document.getElementById("checkBtn").onclick = () => {
    if (currentMode === "quiz") return; // teleturniej obsługuje własną logikę

    if (tournamentActive) {
        checkAnswerTournament();
    } else {
        checkAnswer();
    }
};

/* ============================================================
   📌 BEZPIECZEŃSTWO — BLOKADA PUSTEGO INPUTA
============================================================ */

document.getElementById("answerInput").addEventListener("keydown", e => {
    if (e.key === "Enter") {
        document.getElementById("checkBtn").click();
    }
});

/* ============================================================
   🔚 OSTATECZNE ODNOWIENIE INTERFEJSU
============================================================ */

function initGame() {
    document.getElementById("taskBox").classList.add("hidden");
    document.getElementById("answerSection").classList.add("hidden");
    document.getElementById("spinBtn").classList.add("hidden");
}
initGame();
