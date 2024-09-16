// Game.js - core game logic

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game variables
let gameRunning = true;

// Main game loop
function gameLoop() {
    if (!gameRunning) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update game elements
    updateGame();

    // Draw game elements
    drawGame();

    // Continue the loop
    requestAnimationFrame(gameLoop);
}

// Game update logic
function updateGame() {
    // Add game update logic here
}

// Game drawing logic
function drawGame() {
    // Add drawing logic here, e.g. ctx.fillRect()
}

// Start the game loop
gameLoop();
