const menuScreen = document.getElementById("menuScreen");
const startButton = document.getElementById("startButton");
const gameArea = document.getElementById("gameArea");
const macaco = document.getElementById("macaco");
const timerElement = document.getElementById("timer");
const music = document.getElementById("backgroundMusic");
let dir = 0;
const velocidade = 8;
let vidas = 5;
let tempo = 120;
let gameOver = false;
let victory = false;

// MENU
function showMenu() {
    menuScreen.style.display = "flex";
    gameArea.style.display = "none";
}
function startGame() {
    menuScreen.style.display = "none";
    gameArea.style.display = "block";
    if (music.paused) music.play();
    iniciarJogo();
}
startButton.addEventListener("click", startGame);

// MOVIMENTO MACACO
document.addEventListener("keydown", (e) => {
    if (e.key === "a" || e.key === "A") dir = -velocidade;
    if (e.key === "d" || e.key === "D") dir = velocidade;
});
document.addEventListener("keyup", (e) => {
    if (e.key === "a" || e.key === "A" || e.key === "d" || e.key === "D") dir = 0;
});
function moverMacaco() {
    if (!macaco || gameOver || victory) return;
    let left = parseInt(getComputedStyle(macaco).left);
    left += dir;
    if (left < 0) left = 0;
    if (left > 1280 - 128) left = 1280 - 128;
    macaco.style.left = left + "px";
    requestAnimationFrame(moverMacaco);
}

// VIDAS
function criarVidas() {
    const vidasContainer = document.getElementById("vidasContainer");
    vidasContainer.innerHTML = "";
    for (let i = 0; i < 5; i++) {
        const coracao = document.createElement("img");
        coracao.src = "img/vida.png";
        coracao.classList.add("vida");
        coracao.id = "vida" + i;
        vidasContainer.appendChild(coracao);
    }
}

// INIMIGOS
const posicoesInimigos = [
    { top: 90, left: 590 }, { top: 90, left: 510 }, { top: 90, left: 430 },
    { top: 90, left: 350 }, { top: 90, left: 670 }, { top: 90, left: 270 },
    { top: 90, left: 750 }, { top: 90, left: 830 }, { top: 90, left: 910 },
    { top: 80, left: 990 }, { top: 80, left: 1070 }, { top: 75, left: 1150 },
    { top: 80, left: 190 }, { top: 80, left: 110 }, { top: 75, left: 30 },
];

function criarInimigos() {
    posicoesInimigos.forEach((pos, index) => {
        const inim = document.createElement("img");
        inim.src = "img/Inimigo.png";
        inim.id = "inimigo" + index;
        inim.classList.add("inimigo");
        inim.style.position = "absolute";
        inim.style.top = pos.top + "px";
        inim.style.left = pos.left + "px";
        inim.style.width = "110px";
        inim.style.height = "110px";
        gameArea.appendChild(inim);
        iniciarTiroInimigo(inim);
    });
}

// PROJÉTEIS DO JOGADOR
function spawnProjetil() {
    if (!macaco || gameOver || victory) return;

    const proj = document.createElement("img");
    proj.src = "img/bosta.png";
    proj.style.position = "absolute";
    proj.style.left = macaco.offsetLeft + macaco.offsetWidth / 2 - 20 + "px";
    proj.style.top = macaco.offsetTop - 20 + "px";
    proj.style.width = "40px";
    proj.style.height = "40px";
    proj.dataset.top = macaco.offsetTop - 20;
    gameArea.appendChild(proj);

    function mover() {
        if (gameOver || victory) { proj.remove(); return; }

        const novaTop = parseFloat(proj.dataset.top) - 5;
        if (novaTop + 40 < 0) { proj.remove(); return; }

        proj.dataset.top = novaTop;
        proj.style.top = novaTop + "px";

        document.querySelectorAll(".inimigo").forEach((inimigo) => {
            const projRect = proj.getBoundingClientRect();
            const inimRect = inimigo.getBoundingClientRect();

            if (
                projRect.left < inimRect.right &&
                projRect.right > inimRect.left &&
                projRect.top < inimRect.bottom &&
                projRect.bottom > inimRect.top
            ) {
                proj.remove();
                inimigo.remove();
                verificarVitoria();
            }
        });

        requestAnimationFrame(mover);
    }

    mover();
}

// PROJÉTEIS DOS INIMIGOS
function inimigoAtira(inimigo) {
    if (!inimigo.isConnected || gameOver || victory) return;

    const rand = Math.random();
    let tipoImg;
    if (rand < 0.6) tipoImg = "img/lixo1.png";
    else if (rand < 0.9) tipoImg = "img/banana.png";
    else tipoImg = "img/lixo2.png";

    const proj = document.createElement("img");
    proj.src = tipoImg;
    proj.style.position = "absolute";
    proj.style.left = inimigo.offsetLeft + inimigo.offsetWidth / 2 - 20 + "px";
    proj.dataset.top = inimigo.offsetTop + inimigo.offsetHeight;
    proj.style.top = proj.dataset.top + "px";
    proj.style.width = "40px";
    proj.style.height = "40px";
    gameArea.appendChild(proj);

    function mover() {
        if (gameOver || victory) { proj.remove(); return; }

        const novaTop = parseFloat(proj.dataset.top) + 4;
        if (novaTop + 40 > 700) { proj.remove(); return; }

        proj.dataset.top = novaTop;
        proj.style.top = novaTop + "px";

        const projRect = proj.getBoundingClientRect();
        const macRect = macaco.getBoundingClientRect();

        if (
            projRect.left < macRect.right &&
            projRect.right > macRect.left &&
            projRect.top < macRect.bottom &&
            projRect.bottom > macRect.top
        ) {
            if (tipoImg === "img/lixo1.png" || tipoImg === "img/lixo2.png") {
                for (let i = vidas - 1; i >= 0; i--) {
                    const cor = document.getElementById("vida" + i);
                    if (cor && cor.src.includes("vida.png")) {
                        cor.src = "img/dano.png";
                        vidas--;
                        break;
                    }
                }
                if (vidas <= 0 && macaco) {
                    macaco.remove();
                    gameOverScreen();
                }
            } else if (tipoImg === "img/banana.png") {
                for (let i = 0; i < 5; i++) {
                    const cor = document.getElementById("vida" + i);
                    if (cor && cor.src.includes("dano.png")) {
                        cor.src = "img/vida.png";
                        if (vidas < 5) vidas++;
                        break;
                    }
                }
            }

            proj.remove();
            return;
        }

        requestAnimationFrame(mover);
    }

    mover();
}

function iniciarTiroInimigo(inimigo) {
    const intervalo = setInterval(() => {
        if (!inimigo.isConnected || gameOver || victory) {
            clearInterval(intervalo);
            return;
        }
        inimigoAtira(inimigo);
    }, 2000 + Math.random() * 2000);
}

// TIMER
function atualizarTimer() {
    if (gameOver || victory) return;
    const minutos = Math.floor(tempo / 60);
    const segundos = tempo % 60;
    timerElement.textContent =
        `${minutos.toString().padStart(2, "0")}:${segundos.toString().padStart(2, "0")}`;

    if (tempo <= 0) {
        gameOverScreen();
        return;
    }

    tempo--;
    setTimeout(atualizarTimer, 1000);
}

// GAME OVER
function gameOverScreen() {
    if (gameOver || victory) return;
    gameOver = true;

    const overlay = document.createElement("div");
    overlay.classList.add("overlay");
    overlay.style.backgroundImage = "url('img/gameOver1.png')";

    const btn = document.createElement("button");
    btn.classList.add("reloadButton");
    btn.innerHTML = `<img src="img/voltar.png" alt="Reiniciar">`;
    btn.addEventListener("click", () => location.reload());

    overlay.appendChild(btn);
    document.body.appendChild(overlay);
}

// VITÓRIA
function verificarVitoria() {
    const inimigosRestantes = document.querySelectorAll(".inimigo").length;
    if (inimigosRestantes === 0 && !victory && !gameOver) {
        victory = true;

        const overlay = document.createElement("div");
        overlay.classList.add("overlay");
        overlay.style.backgroundImage = "url('img/vitoria.png')";

        const btn = document.createElement("button");
        btn.classList.add("reloadButton");
        btn.innerHTML = `<img src="img/voltar.png" alt="Reiniciar">`;
        btn.addEventListener("click", () => location.reload());

        overlay.appendChild(btn);
        document.body.appendChild(overlay);
    }
}

// GRADE
function adicionarGrade() {
    const grade = document.createElement("img");
    grade.src = "img/grade.png";
    grade.id = "grade";
    grade.style.position = "absolute";
    grade.style.top = "0px";
    grade.style.left = "0px";
    grade.style.width = "1280px";
    grade.style.height = "720px";
    grade.style.pointerEvents = "none";
    grade.style.zIndex = "500";
    gameArea.appendChild(grade);
}

// JOGO 
function iniciarJogo() {
    vidas = 5;
    tempo = 60;
    gameOver = false;
    victory = false;
    criarVidas();
    criarInimigos();
    adicionarGrade();
    moverMacaco();
    setInterval(spawnProjetil, 2000);
    atualizarTimer();
}