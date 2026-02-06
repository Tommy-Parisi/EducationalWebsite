const themeToggle = document.getElementById('theme-toggle');

// Maze setup
const canvas = document.getElementById('maze-canvas');

// Maze grid settings
const cellSize = 50;
let mazeGrid = [];
let mazeWalls = [];
let startPos = {x: 0, y: 0};
let goalPos = {x: 0, y: 0};

function setupCanvas() {
  // Use full window size for canvas
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// Setup canvas before getting context
setupCanvas();
const ctx = canvas.getContext('2d');

function generateProperMaze() {
  const cols = Math.floor(canvas.width / cellSize);
  const rows = Math.floor(canvas.height / cellSize);
  
  // Initialize all cells as walls
  mazeGrid = Array(rows).fill().map(() => Array(cols).fill(true));
  
  // Recursive backtracking maze generation
  function carve(row, col) {
    mazeGrid[row][col] = false; // Mark as path
    
    // Directions: up, right, down, left
    const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];
    
    // Shuffle directions randomly
    for (let i = directions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [directions[i], directions[j]] = [directions[j], directions[i]];
    }
    
    // Try each direction
    for (let [dr, dc] of directions) {
      const newRow = row + dr * 2;
      const newCol = col + dc * 2;
      
      // Check if new position is within bounds and is still a wall
      if (newRow >= 1 && newRow < rows - 1 && newCol >= 1 && newCol < cols - 1 && mazeGrid[newRow][newCol]) {
        // Carve passage between current cell and new cell
        mazeGrid[row + dr][col + dc] = false;
        carve(newRow, newCol);
      }
    }
  }
  
  // Start carving from position (1, 1)
  carve(1, 1);
  
  // Find a random start position in a path cell
  let startFound = false;
  while (!startFound) {
    const row = Math.floor(Math.random() * (rows - 2)) + 1;
    const col = Math.floor(Math.random() * (cols - 2)) + 1;
    if (!mazeGrid[row][col]) {
      // Center the position in the cell (30 = boxWidth/boxHeight)
      startPos = {
        row, 
        col, 
        x: col * cellSize + (cellSize - 30) / 2, 
        y: row * cellSize + (cellSize - 30) / 2
      };
      startFound = true;
    }
  }
  
  // Find a random goal position far from start
  let goalFound = false;
  while (!goalFound) {
    const row = Math.floor(Math.random() * (rows - 2)) + 1;
    const col = Math.floor(Math.random() * (cols - 2)) + 1;
    const dist = Math.sqrt(Math.pow(row - startPos.row, 2) + Math.pow(col - startPos.col, 2));
    if (!mazeGrid[row][col] && dist > 10) {
      goalPos = {
        row, 
        col, 
        x: col * cellSize, 
        y: row * cellSize
      };
      goalFound = true;
    }
  }
  
  // Convert grid to wall objects
  mazeWalls = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (mazeGrid[row][col]) {
        mazeWalls.push({
          x: col * cellSize,
          y: row * cellSize,
          width: cellSize,
          height: cellSize
        });
      }
    }
  }
}

generateProperMaze();

function drawMaze() {
  // Clear and set background
  ctx.fillStyle = getComputedStyle(document.body).backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw walls directly from maze grid to ensure alignment with collision
  ctx.fillStyle = getComputedStyle(document.body).color;
  const cols = Math.floor(canvas.width / cellSize);
  const rows = Math.floor(canvas.height / cellSize);
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (mazeGrid[row][col]) {
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
  }
  
  // Draw start position (blue)
  ctx.fillStyle = '#2196F3';
  ctx.fillRect(startPos.x, startPos.y, 30, 30);
  ctx.fillStyle = 'white';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('S', startPos.x + 15, startPos.y + 15);
  
  // Draw goal position (green)
  ctx.fillStyle = '#4CAF50';
  ctx.fillRect(goalPos.x, goalPos.y, cellSize, cellSize);
  ctx.fillStyle = 'white';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('G', goalPos.x + cellSize / 2, goalPos.y + cellSize / 2);
}

// Collision detection - Check if position is in a valid maze path
function checkCollision(boxX, boxY, boxWidth, boxHeight) {
  const cols = Math.floor(canvas.width / cellSize);
  const rows = Math.floor(canvas.height / cellSize);
  
  // Check all four corners of the box (with small padding inward to avoid edge issues)
  const padding = 2;
  const points = [
    {x: boxX + padding, y: boxY + padding},                           // top-left
    {x: boxX + boxWidth - padding, y: boxY + padding},                // top-right
    {x: boxX + padding, y: boxY + boxHeight - padding},               // bottom-left
    {x: boxX + boxWidth - padding, y: boxY + boxHeight - padding},    // bottom-right
    {x: boxX + boxWidth / 2, y: boxY + boxHeight / 2}                 // center
  ];
  
  // If ANY point is in a wall, collision detected
  for (let point of points) {
    const col = Math.floor(point.x / cellSize);
    const row = Math.floor(point.y / cellSize);
    
    // If out of bounds or in a wall, collision detected
    if (col < 0 || col >= cols || row < 0 || row >= rows || mazeGrid[row][col]) {
      return true;
    }
  }
  
  return false;
}

// Handle window resize
window.addEventListener('resize', () => {
  setupCanvas();
  generateProperMaze();
  resetPlayerPosition();
  drawMaze();
});


// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
  document.body.classList.add('dark-mode');
  themeToggle.textContent = 'Light Mode';
}

// Listen for theme toggle button clicks
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  
  // Update button text and save preference
  if (document.body.classList.contains('dark-mode')) {
    themeToggle.textContent = 'Light Mode';
    localStorage.setItem('theme', 'dark');
  } else {
    themeToggle.textContent = 'Dark Mode';
    localStorage.setItem('theme', 'light');
  }
});

// Bouncing box animation
const bouncingBox = document.getElementById('bouncing-box');
let x = 0;
let y = 0;
let velocityX = 0;
let velocityY = 0;
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
const boxWidth = 30;
const boxHeight = 30;
let moveSpeed = 7.5; // Base speed
const acceleration = 0.6; // How quickly speed builds up
const friction = 0.85; // How quickly speed slows down (0-1, lower = more friction)

// Game variables
let score = 0;
let round = 1;
let timeRemaining = 15;
let gameOver = false;
let timerInterval = null;

// Keyboard input - Track multiple keys being pressed
const keys = {};

// Use window focus to ensure we capture events
window.addEventListener('focus', () => {
  console.log('Window focused');
});

document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  keys[key] = true;
  
  // Prevent default for arrow keys to avoid page scrolling
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
    e.preventDefault();
  }
});

document.addEventListener('keyup', (e) => {
  const key = e.key.toLowerCase();
  keys[key] = false;
});

// Update position based on keyboard input with momentum
function updatePlayerPosition() {
  if (gameOver) return;
  
  // Apply acceleration/deceleration based on input
  let maxVelocity = moveSpeed;
  
  // X-axis movement
  if (keys['arrowleft'] || keys['a'] || keys['A']) {
    velocityX = Math.max(velocityX - acceleration, -maxVelocity);
  } else if (keys['arrowright'] || keys['d'] || keys['D']) {
    velocityX = Math.min(velocityX + acceleration, maxVelocity);
  } else {
    // Apply friction when no key is pressed
    velocityX *= friction;
  }
  
  // Y-axis movement
  if (keys['arrowup'] || keys['w'] || keys['W']) {
    velocityY = Math.max(velocityY - acceleration, -maxVelocity);
  } else if (keys['arrowdown'] || keys['s'] || keys['S']) {
    velocityY = Math.min(velocityY + acceleration, maxVelocity);
  } else {
    // Apply friction when no key is pressed
    velocityY *= friction;
  }
  
  // Update position separately for X and Y to allow wall sliding
  let newX = x + velocityX;
  let newY = y + velocityY;
  
  // Keep in bounds, but allow using full window size
  newX = Math.max(0, Math.min(newX, canvas.width - boxWidth));
  newY = Math.max(0, Math.min(newY, canvas.height - boxHeight));
  
  // Check X-axis collision
  if (!checkCollision(newX, y, boxWidth, boxHeight)) {
    x = newX;
  } else {
    velocityX = 0; // Stop velocity when hitting wall
  }
  
  // Check Y-axis collision
  if (!checkCollision(x, newY, boxWidth, boxHeight)) {
    y = newY;
  } else {
    velocityY = 0; // Stop velocity when hitting wall
  }
  
  bouncingBox.style.left = x + 'px';
  bouncingBox.style.top = y + 'px';
}

// Check if reached goal
function checkGoalReached() {
  // More responsive: box reaches goal if any part touches the goal cell
  return x < goalPos.x + cellSize && x + boxWidth > goalPos.x &&
         y < goalPos.y + cellSize && y + boxHeight > goalPos.y;
}

// Start timer
function startTimer() {
  timerInterval = setInterval(() => {
    timeRemaining--;
    document.getElementById('timer-display').textContent = `Time: ${timeRemaining}s`;
    
    if (timeRemaining <= 0) {
      endGame(false);
    }
  }, 1000);
}

// End game
function endGame(won) {
  gameOver = true;
  clearInterval(timerInterval);
  
  const gameOverScreen = document.getElementById('game-over-screen');
  document.getElementById('final-score').textContent = `Final Score: ${score}`;
  gameOverScreen.classList.remove('hidden');
}

// Restart game
function restartGame() {
  score = 0;
  round = 1;
  timeRemaining = 15;
  gameOver = false;
  moveSpeed = 7.5;
  
  document.getElementById('score-display').textContent = `Score: ${score}`;
  document.getElementById('timer-display').textContent = `Time: ${timeRemaining}s`;
  document.getElementById('game-over-screen').classList.add('hidden');
  
  generateProperMaze();
  resetPlayerPosition();
  window.focus();
  startTimer();
}

// Reset player to start
function resetPlayerPosition() {
  x = startPos.x;
  y = startPos.y;
  bouncingBox.style.left = x + 'px';
  bouncingBox.style.top = y + 'px';
}

// Setup restart button
document.getElementById('restart-button').addEventListener('click', restartGame);

// Initialize game - Generate maze first, then position player
generateProperMaze();
resetPlayerPosition();
window.focus();
startTimer();

function animate() {
  if (!gameOver) {
    updatePlayerPosition();
    
    // Check if goal reached
    if (checkGoalReached()) {
      score++;
      round++;
      
      // Increase speed slightly each round
      moveSpeed += 0.3;
      
      // Add remaining time to next round's 10 seconds
      // If you had 2 seconds left, next round is 10 + 2 = 12 seconds
      timeRemaining = 15 + timeRemaining;
      
      document.getElementById('score-display').textContent = `Score: ${score}`;
      document.getElementById('timer-display').textContent = `Time: ${timeRemaining}s`;
      
      generateProperMaze();
      resetPlayerPosition();
    }
  }
  
  drawMaze();
  requestAnimationFrame(animate);
}

animate();
