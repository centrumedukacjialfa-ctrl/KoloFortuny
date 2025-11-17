// =========================
// KOŁO – konfiguracja
// =========================

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");

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

const segmentAngle = (2 * Math.PI) / segments.length;

// =========================
// RYSOWANIE KOŁA
// =========================

function drawWheel() {
    for (let i = 0; i < segments.length; i++) {
        ctx.beginPath();
        ctx.moveTo(250, 250);
        ctx.arc(250, 250, 250, i * segmentAngle, (i + 1) * segmentAngle);
        ctx.fillStyle = segments[i].color;
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 4;
        ctx.stroke();

        // Tekst punktów
        ctx.save();
        ctx.translate(250, 250);
        ctx.rotate(i * segmentAngle + segmentAngle / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "black";
        ctx.font = "bold 30px Arial";
        ctx.fillText(`${segments[i].points} pkt`, 230, 10);
        ctx.restore();
    }
}

drawWheel();

// =========================
// LOSOWE KRĘCENIE
// =========================

spinBtn.addEventListener("click", () => {
    if (spinning) return;
    spinning = true;

    const randomSpin = Math.random() * 4 + 4; // 4–8 obrotów
    const spinTime = 3000;
    const startTime = performance.now();

    function animateWheel(time) {
        const progress = (time - startTime) / spinTime;

        if (progress < 1) {
            angle = randomSpin * Math.PI * 2 * (1 - Math.pow(1 - progress, 3));
            drawRotatedWheel();
            requestAnimationFrame(animateWheel);
        } else {
            spinning = false;
            finalizeSpin();
        }
    }

    requestAnimationFrame(animateWheel);
});

function drawRotatedWheel() {
    ctx.save();
    ctx.translate(250, 250);
    ctx.rotate(angle);
    ctx.translate(-250, -250);
    ctx.clearRect(0, 0, 500, 500);
    drawWheel();
    ctx.restore();
}

// =========================
// USTALANIE SEGMENTU
// =========================

let chosenSegment = null;

function finalizeSpin() {
    const normalizedAngle = (angle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    const winningIndex = segments.length - 1 - Math.floor(normalizedAngle / segmentAngle);
    chosenSegment = segments[winningIndex];

    document.getElementById("taskBox").innerHTML =
        "<b>Kliknij koło, aby zobaczyć zadanie!</b>";
}

canvas.addEventListener("click", () => {
    if (!chosenSegment) return;

    showTask();
});

// =========================
// GENEROWANIE ZADAŃ
// =========================

function randomNumber() {
    return Math.floor(Math.random() * 10) + 1;
}

function showTask() {
    const a = randomNumber();
    const b = randomNumber();
    const add = Math.random() < 0.5;

    correctAnswer = add ? a + b : a - b;

    const symbol = add ? "+" : "-";

    document.getElementById("taskBox").innerHTML =
        `<b>${a} ${symbol} ${b} = ?</b><br><br>
         Za to zadanie możesz zdobyć <b>${chosenSegment.points}</b> punktów!`;

    document.getElementById("answerSection").style.display = "block";
}

// =========================
// SPRAWDZANIE ODPOWIEDZI
// =========================

let correctAnswer = 0;
let playerTurn = 1;
let scores = { p1: 0, p2: 0 };

document.getElementById("checkBtn").addEventListener("click", () => {
    const answer = Number(document.getElementById("answerInput").value);

    if (answer === correctAnswer) {
        document.getElementById("result").innerHTML =
            `✔ Poprawnie! Zdobywasz <b>${chosenSegment.points}</b> pkt!`;

        if (playerTurn === 1) scores.p1 += chosenSegment.points;
        else scores.p2 += chosenSegment.points;

        playerTurn = playerTurn === 1 ? 2 : 1;

    } else {
        document.getElementById("result").innerHTML =
            `✘ Błąd! Poprawna odpowiedź to: <b>${correctAnswer}</b>`;
    }

    updateScoreboard();
    chosenSegment = null;
});

function updateScoreboard() {
    document.getElementById("p1").innerText = scores.p1;
    document.getElementById("p2").innerText = scores.p2;
}
