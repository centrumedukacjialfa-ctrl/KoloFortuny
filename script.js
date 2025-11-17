// =========================
// KOŁO 8 SEGMENTÓW
// =========================

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");

const spinBtn = document.getElementById("spinBtn");
const answerSection = document.getElementById("answerSection");
const answerInput = document.getElementById("answerInput");

let angle = 0;
let spinning = false;

const segments = [
    { color: "blue", points: 1 },
    { color: "green", points: 2 },
    { color: "yellow", points: 3 },
    { color: "red", points: 5 },
    { color: "blue", points: 1 },
    { color: "green", points: 2 },
    { color: "yellow", points: 3 },
    { color: "red", points: 5 }
];

const segmentAngle = (2 * Math.PI) / 8;

function drawWheel() {
    for (let i = 0; i < segments.length; i++) {
        ctx.beginPath();
        ctx.moveTo(250, 250);
        ctx.arc(250, 250, 250, i * segmentAngle, (i + 1) * segmentAngle);
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

// ==============================
// SPIN
// ==============================

spinBtn.addEventListener("click", () => {
    if (spinning) return;

    document.getElementById("taskBox").innerHTML = "";
    document.getElementById("result").innerHTML = "";
    answerSection.style.display = "none";
    answerInput.value = "";

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
    ctx.clearRect(0, 0, 500, 500);
    drawWheel();
    ctx.restore();
}

let chosenSegment = null;

function finishSpin() {
    const normalizedAngle = (angle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    const index = segments.length - 1 - Math.floor(normalizedAngle / segmentAngle);
    chosenSegment = segments[index];

    document.getElementById("taskBox").innerHTML =
        "<b>Kliknij koło, aby zobaczyć zadanie!</b>";
}

canvas.addEventListener("click", () => {
    if (!chosenSegment) return;
    showTask();
});

// ==============================
// GENEROWANIE ZADAŃ
// ==============================

let correctAnswer = "";
let expectedSymbol = "";
let expectedMissing = null;

function randomNum() {
    return Math.floor(Math.random() * 10) + 1;
}

const dotColors = ["🔵", "🟢", "🟡", "🔴"];

function makeDots(n) {
    let s = "";
    for (let i = 0; i < n; i++) s += dotColors[Math.floor(Math.random() * 4)];
    return s;
}

function generateStory() {
    const a = randomNum(), b = randomNum();
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
    const a = randomNum(), b = randomNum();
    const res = a + b;
    correctAnswer = a;

    return `__ + ${b} = ${res}`;
}

function generateCompare() {
    const a = randomNum(), b = randomNum();
    correctAnswer = a === b ? "=" : a > b ? ">" : "<";
    return `${a} ? ${b}`;
}

function showTask() {
    const style = document.getElementById("taskStyleSelect").value;

    answerSection.style.display = "block";

    let task = "";
    if (style === "mix") {
        const types = ["classic", "dots", "story", "missing", "compare"];
        return showTaskOfType(types[Math.floor(Math.random() * 5)]);
    } else {
        return showTaskOfType(style);
    }
}

function showTaskOfType(type) {
    let task = "";

    if (type === "classic") {
        const a = randomNum(), b = randomNum();
        const add = Math.random() < 0.5;
        correctAnswer = add ? a + b : a - b;
        task = `${a} ${add ? "+" : "-"} ${b} = ?`;

    } else if (type === "dots") {
        const a = randomNum(), b = randomNum();
        const add = Math.random() < 0.5;
        correctAnswer = add ? a + b : a - b;
        task = `${makeDots(a)} ${add ? "+" : "-"} ${makeDots(b)} = ?`;

    } else if (type === "story") {
        task = generateStory();

    } else if (type === "missing") {
        task = generateMissing();

    } else if (type === "compare") {
        task = generateCompare();
    }

    document.getElementById("taskBox").innerHTML =
        `<b>${task}</b><br><br>
         Za to zadanie: <b>${chosenSegment.points}</b> pkt`;
}


// ==============================
// SPRAWDZANIE ODPOWIEDZI
// ==============================

let scores = { p1: 0, p2: 0 };
let playerTurn = 1;

document.getElementById("checkBtn").addEventListener("click", () => {
    const user = answerInput.value.trim();
    const resultBox = document.getElementById("result");

    if (user == correctAnswer) {
        resultBox.style.color = "green";
        resultBox.innerHTML =
            `✔ Poprawnie! Zdobywasz <b>${chosenSegment.points}</b> pkt!`;

        if (playerTurn === 1) scores.p1 += chosenSegment.points;
        else scores.p2 += chosenSegment.points;

        playerTurn = playerTurn === 1 ? 2 : 1;

    } else {
        resultBox.style.color = "red";
        resultBox.innerHTML = `✘ Źle! Poprawna odpowiedź: <b>${correctAnswer}</b>`;
    }

    updateScoreboard();
    chosenSegment = null;
});

function updateScoreboard() {
    document.getElementById("p1").innerText = scores.p1;
    document.getElementById("p2").innerText = scores.p2;
}
