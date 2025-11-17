/* ============================================
   USTAWIENIA GLOBALNE
============================================ */

let correctAnswer = 0;
let currentPlayer = 1;
let scores = { p1: 0, p2: 0 };
let timer;

// Punkty zależne od koloru
let segmentPoints = {
    blue: 1,
    green: 2,
    yellow: 3,
    red: 5
};

let chosenSegmentColor = null;

/* ============================================
   USTAWIENIA NAUCZYCIELA
============================================ */

let settings = {
    difficulty: "easy",
    taskType: "mix",
    gameMode: "single"
};

document.getElementById("saveSettings").addEventListener("click", () => {
    settings.difficulty = document.getElementById("difficulty").value;
    settings.taskType = document.getElementById("taskType").value;
    settings.gameMode = document.getElementById("gameMode").value;

    alert("Ustawienia zapisane!");
});

/* ============================================
   FUNKCJE POMOCNICZE
============================================ */

function getNumber() {
    if (settings.difficulty === "easy") return Math.floor(Math.random() * 10) + 1;
    if (settings.difficulty === "medium") return Math.floor(Math.random() * 20) + 1;
    if (settings.difficulty === "hard") return Math.floor(Math.random() * 50) + 1;
}

function generateTask() {
    let a = getNumber();
    let b = getNumber();

    let type = settings.taskType;
    if (type === "mix") type = Math.random() < 0.5 ? "add" : "sub";

    if (type === "add") {
        correctAnswer = a + b;
        return `${a} + ${b} = ?`;
    }

    if (type === "sub") {
        let big = Math.max(a, b);
        let small = Math.min(a, b);
        correctAnswer = big - small;
        return `${big} - ${small} = ?`;
    }
}

/* ============================================
   KRĘCENIE KOŁEM
============================================ */

function spinWheel() {
    chosenSegmentColor = null;
    document.getElementById("taskBox").innerHTML = "";
    document.getElementById("result").innerHTML = "";
    document.getElementById("answerSection").style.display = "none";

    const wheel = document.getElementById("wheel");
    const randomSpin = 720 + Math.floor(Math.random() * 1080);

    wheel.style.transform = `rotate(${randomSpin}deg)`;

    setTimeout(() => {
        document.getElementById("taskBox").innerHTML =
            "<b>Kliknij w segment koła, aby zobaczyć zadanie!</b>";
    }, 4000);
}

/* ============================================
   KLIKNIĘCIE SEGMENTU → WYBÓR KOLORU
============================================ */

document.getElementById("wheel").addEventListener("click", () => {
    if (!document.getElementById("taskBox").innerHTML.includes("Kliknij")) return;

    let colors = ["blue", "green", "yellow", "red"];
    chosenSegmentColor = colors[Math.floor(Math.random() * 4)];

    showTask();
});

/* ============================================
   POKAZANIE ZADANIA + PUNKTY ZA SEGMENT
============================================ */

function showTask() {
    let task = generateTask();
    let points = segmentPoints[chosenSegmentColor];

    document.getElementById("taskBox").innerHTML =
        `<b>${task}</b><br><br>Punkty za to zadanie: <b>${points}</b>`;

    document.getElementById("answerSection").style.display = "block";
}

/* ============================================
   SPRAWDZANIE ODPOWIEDZI
============================================ */

function checkAnswer() {
    let userAns = Number(document.getElementById("answer").value);
    let result = document.getElementById("result");

    if (userAns === correctAnswer) {
        let points = segmentPoints[chosenSegmentColor];
        result.style.color = "green";
        result.innerHTML = `✔ Poprawnie! Zdobywasz <b>${points}</b> punkt(y)!`;
        givePoints(points);
    } else {
        result.style.color = "red";
        result.innerHTML = `✘ Błąd! Poprawna odpowiedź: <b>${correctAnswer}</b>`;
    }
}

/* ============================================
   SYSTEM PUNKTÓW
============================================ */

function givePoints(points) {
    if (settings.gameMode === "vs" || settings.gameMode === "to5") {
        if (currentPlayer === 1) {
            scores.p1 += points;
            currentPlayer = 2;
        } else {
            scores.p2 += points;
            currentPlayer = 1;
        }
    } else {
        scores.p1 += points;
    }

    updateScoreboard();

    if (settings.gameMode === "to5") {
        if (scores.p1 >= 5) alert("🏆 Gracz 1 wygrał!");
        if (scores.p2 >= 5) alert("🏆 Gracz 2 wygrał!");
    }
}

function updateScoreboard() {
    document.getElementById("p1").innerText = scores.p1;
    document.getElementById("p2").innerText = scores.p2;
}

/* ============================================
   TRYB ĆWICZEŃ
============================================ */

document.getElementById("exerciseBtn").addEventListener("click", () => {
    document.getElementById("exercisePanel").style.display = "block";
    newExercise();
});

function newExercise() {
    let task = generateTask();
    document.getElementById("exerciseTask").innerHTML = task;
}

function checkExercise() {
    let ans = Number(document.getElementById("exerciseAnswer").value);
    let box = document.getElementById("exerciseResult");

    if (ans === correctAnswer) {
        box.style.color = "green";
        box.innerHTML = "✔ Dobrze!";
    } else {
        box.style.color = "red";
        box.innerHTML = `✘ Źle – poprawna odpowiedź: ${correctAnswer}`;
    }

    setTimeout(() => {
        box.innerHTML = "";
        document.getElementById("exerciseAnswer").value = "";
        newExercise();
    }, 2000);
}
