const mario = document.getElementById('mario');
const pipe = document.getElementById('pipe');
const coin = document.getElementById('coin');
const clouds = document.querySelectorAll('.clouds');
const overlay = document.getElementById('overlay');

const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const coinsElement = document.getElementById('coins');
const highCoinsElement = document.getElementById('highCoins');
const restartBtn = document.getElementById('restart');
const gameBoard = document.querySelector('.game-board');

let score = 0;
let coins = 0;
let highScore = localStorage.getItem('highScore') || 0;
let highCoins = localStorage.getItem('highCoins') || 0;

let isGameOver = false;
let speed = 1500;

// Função para formatar número em 4 dígitos (0005, 0123, etc.)
const formatNumber = (num) => num.toString().padStart(4, '0');

// Inicializa HUD
scoreElement.innerText = formatNumber(score);
highScoreElement.innerText = `HI ${formatNumber(highScore)}`;
coinsElement.innerText = `Moedas: ${coins}`;
highCoinsElement.innerText = `Recorde: ${highCoins}`;

// Função de pulo
const jump = () => {
  if (!mario.classList.contains('jump') && !isGameOver) {
    mario.classList.add('jump');
    setTimeout(() => mario.classList.remove('jump'), 500);
  }
};

// Atualiza score
const updateScore = (points = 1) => {
  if (!isGameOver) {
    score += points;
    scoreElement.innerText = formatNumber(score);
  }
};

// Atualiza moedas
const updateCoins = (points = 1) => {
  if (!isGameOver) {
    coins += points;
    coinsElement.innerText = `Moedas: ${coins}`;
  }
};

// Game Over
const gameOver = (pipePosition, marioPosition) => {
  console.log('Game Over triggered!');
  isGameOver = true;

  // parar pipe
  pipe.style.animation = 'none';
  pipe.style.left = `${pipePosition}px`;

  // parar mario
  mario.style.animation = 'none';
  mario.style.bottom = `${marioPosition}px`;
  mario.src = 'images/game-over.png';
  mario.style.width = '75px';
  mario.style.marginLeft = '50px';

  // parar moedas
  coin.style.animation = 'none';

  // parar nuvens
  // em vez de travar, desacelera e deixa terminar o ciclo
  clouds.forEach(cloud => {
    const style = window.getComputedStyle(cloud);
    const duration = parseFloat(style.animationDuration);
    const newDuration = Math.min(duration * 1.8, 90);
    cloud.style.animationDuration = `${newDuration}s`;
  });

  // chão não precisa parar (é estático no body::after)

  // salvar recordes
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore);
  }
  if (coins > highCoins) {
    highCoins = coins;
    localStorage.setItem('highCoins', highCoins);
  }

  // atualizar HUD
  highScoreElement.innerText = `HI ${formatNumber(highScore)}`;
  highCoinsElement.innerText = `Recorde: ${highCoins}`;

  restartBtn.style.display = 'block';
  overlay.style.display = 'flex';
  console.log('Overlay and restart button should be visible now');

  clearInterval(loop);
  clearInterval(scoreInterval);
  clearInterval(difficultyInterval);
  clearInterval(coinLoop);
};

// Restart
restartBtn.addEventListener('click', () => window.location.reload());

// Loop colisão pipe
const loop = setInterval(() => {
  const pipePosition = pipe.offsetLeft;
  const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');

  if (pipePosition <= 120 && pipePosition > 0 && marioPosition < 80) {
    gameOver(pipePosition, marioPosition);
  }
}, 10);

// Pontuação por tempo
const scoreInterval = setInterval(() => updateScore(1), 1000);

// Dificuldade progressiva
const difficultyInterval = setInterval(() => {
  if (!isGameOver && speed > 700) {
    speed -= 100;
    pipe.style.animation = `pipe-animation ${speed / 1000}s linear infinite`;
    // sincroniza duração do chão proporcional à velocidade do pipe
    const groundDurationSeconds = (speed / 1000) * (2 / 1.5);
    gameBoard.style.setProperty('--ground-duration', `${groundDurationSeconds}s`);
  }
}, 10000);

// Loop moedas
const coinLoop = setInterval(() => {
  const coinPosition = coin.offsetLeft;
  const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');
  const coinBottom = +window.getComputedStyle(coin).bottom.replace('px', '');

  if (coinPosition <= 120 && coinPosition > 0 &&
      marioPosition >= coinBottom - 40 && marioPosition <= coinBottom + 40) {
    updateCoins(1);
    coin.style.display = 'none';
    setTimeout(() => {
      if (!isGameOver) coin.style.display = 'block';
    }, 2000);
  }
}, 50);

document.addEventListener('keydown', jump);
