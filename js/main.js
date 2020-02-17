const canvas = document.getElementById('snake');
const context = canvas.getContext('2d');
const canvasOverlay = document.getElementsByClassName("canvas-overlay")[0];
const scoreElement = document.getElementsByClassName("score")[0];
const highScoreElement = document.getElementsByClassName("high-score")[0];

let cellSize = 16;
let fpsCount = 0;
let loopCount = 0;
let foodSecondsCount = 0;
let foodTimeout = 0;
let gamePaused = false;
let score = 0;
let highScore = 0;
const apple = { x: 0,y: 0 };
const snake = { x: 0, y: 0, dx: 0, dy: 0, cells: [], length: 0 };

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

const gameLoop = () => {
  if (gamePaused) {
    return;
  }

  verifyFoodTimeout();
  requestAnimationFrame(gameLoop);

  if (fpsCount++ < 4) {
    return;
  }
  fpsCount = 0;

  countSeconds();
  moveSnake();
  drawApple();
  paintSnake();
};

const countSeconds = () => {
  if (loopCount++ == 15) {
    loopCount = 0;
    foodSecondsCount++;
  }
};

const moveSnake = () => {
  context.clearRect(0,0,canvas.width,canvas.height);
  snake.x += snake.dx;
  snake.y += snake.dy;

  if (snake.x < 0 || snake.x >= canvas.width || snake.y < 0 || snake.y >= canvas.height) {
    reverseSnake();
  } else {
    snake.cells.unshift({x: snake.x, y: snake.y});
  }

  if (snake.cells.length > snake.length) {
    snake.cells.pop();
  }
};

const paintSnake = () => {
  for (let i = 0; i < snake.cells.length; i++) {
    const cell = snake.cells[i];
    context.fillRect(cell.x, cell.y, cellSize - 1, cellSize - 1);

    if (cell.x === apple.x && cell.y === apple.y) {
      eatApple();
    }

    verifyCollision(i, cell);
  };
};

const verifyCollision = (i, cell) => {
  for (let j = i + 1; j < snake.cells.length; j++) {
    if (cell.x === snake.cells[j].x && cell.y === snake.cells[j].y) {
      pauseGame();
    }
  }
};

const drawApple = () => {
  context.fillStyle = 'red';
  context.fillRect(apple.x, apple.y, cellSize-1, cellSize-1);
  context.fillStyle = 'green';
};

const moveApple = () => {
  foodSecondsCount = 0;
  foodTimeout = getRandomInt(4, 10);
  const availableCells = Math.floor(canvas.width / cellSize);
  apple.x = getRandomInt(0, availableCells) * cellSize;
  apple.y = getRandomInt(0, availableCells) * cellSize;
  drawApple();
};

const eatApple = () => {
  score++;
  setScore();
  highScoreElement.innerHTML = highScore;
  snake.length++;
  moveApple();
};

const verifyFoodTimeout = () => {
  if (foodTimeout === 0 || foodSecondsCount >= foodTimeout) {
    moveApple();
  }
};

const setScore = () => {
  if (score > highScore) {
    highScore = score;
    scoreElement.style.color = "#ffff00";
  } else {
    scoreElement.style.color = "#231fd2";
  }
  scoreElement.innerHTML = score;
};

const startGame = () => {
  initialSetup();
  gamePaused = false;
  canvasOverlay.style.display = "none";
  requestAnimationFrame(gameLoop);
};

const pauseGame = () => {
  gamePaused = true;
  canvasOverlay.style.display = "block";
};

const initialSetup = () => {
  fpsCount = 0;
  loopCount = 0;
  foodSecondsCount = 0;
  foodTimeout = 0;
  gamePaused = false;
  score = 0;
  snake.x = 160;
  snake.y = 160;
  snake.dx = cellSize;
  snake.dy = 0;
  snake.cells = [];
  snake.length = 4;
  canvas.width = 800;
  canvas.height = 800;
  moveApple();
  setScore();
};

const reverseSnake = () => {
  reduceCanvasSize();
  const lastCell = snake.cells[snake.cells.length - 1];
  const penultimateCell = snake.cells[snake.cells.length - 2];
  if (lastCell.x === penultimateCell.x) {
    snake.dx = 0;
    snake.dy = lastCell.y < penultimateCell.y ? -cellSize : cellSize;
  } else {
    snake.dy = 0;
    snake.dx = lastCell.x < penultimateCell.x ? -cellSize : cellSize;
  }
  snake.x = lastCell.x;
  snake.y = lastCell.y;
  snake.cells = snake.cells.reverse();
  if (verifySnakeOutOfBounds(true)){
    pauseGame();
  }
};

const reduceCanvasSize = () => {
  if (verifySnakeOutOfBounds()) {
    snake.cells.forEach(function(cell) {
      if (cell.x >= 112) {
        cell.x -= 112;
      }
      if (cell.y >= 112) {
        cell.y -= 112;
      }
    });
  }
  canvas.width -= 112;
  canvas.height -= 112;
  moveApple();
};

const verifySnakeOutOfBounds = (reduced = false) => {
  const newDimension = reduced ? canvas.width : canvas.width - 112;
  let snakeOutOfBounds = false;
  for (let i = 0; i < snake.cells.length && !snakeOutOfBounds; i++) {
    const cell = snake.cells[i];
    if (cell.x > newDimension || cell.y > newDimension){
      snakeOutOfBounds = true;
    }
  }
  return snakeOutOfBounds;
};

document.addEventListener('keydown', handleMovement);

function handleMovement(e) {
  if (e.which === 37 && snake.dx === 0) {
    snake.dx = -cellSize;
    snake.dy = 0;
  } else if (e.which === 38 && snake.dy === 0) {
    snake.dy = -cellSize;
    snake.dx = 0;
  } else if (e.which === 39 && snake.dx === 0) {
    snake.dx = cellSize;
    snake.dy = 0;
  } else if (e.which === 40 && snake.dy === 0) {
    snake.dy = cellSize;
    snake.dx = 0;
  }
}

startGame();