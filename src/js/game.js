import { animateTileDisappearance, animateTileFalling } from './animations.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const tileSize = 40; // Size of each tile
const rows = 10;     // Number of rows
const cols = 10;     // Number of columns
let board = [];

const animationSpeed = 300; // Animation duration in ms

// Define the gradient stops for tiles
const gradientDefinitions = [
    ['#FF5733', '#FF8D33'], // Red-Orange Gradient
    ['#33FF57', '#33FFAA'], // Green Gradient
    ['#3357FF', '#33AAFF'], // Blue Gradient
    ['#FF33A8', '#FF66D9'], // Pink Gradient
    ['#FFD433', '#FFF433']  // Yellow Gradient
];

// Goals
const goals = {
    matchCount: 3, // Number of tiles to match
    description: "Match 3 tiles of the same color!"
};

// Display goals on the panel
function updateGoals() {
    const goalsText = document.getElementById('goalsText');
    goalsText.textContent = goals.description; // Set the goal description
}

// Create gradient based on tile position and size
function createTileGradient(ctx, x, y, size, gradientDefinition) {
    const gradient = ctx.createLinearGradient(x, y, x + size, y + size); // Linear gradient
    gradient.addColorStop(0, gradientDefinition[0]);  // Start color
    gradient.addColorStop(1, gradientDefinition[1]);  // End color
    return gradient;
}

// Initialize the board with random gradient indices
function initializeBoard() {
    board = []; // Clear board on initialization
    for (let row = 0; row < rows; row++) {
        const rowArray = [];
        for (let col = 0; col < cols; col++) {
            const randomGradientIndex = Math.floor(Math.random() * gradientDefinitions.length);
            rowArray.push(randomGradientIndex); // Store the gradient index
        }
        board.push(rowArray);
    }
    drawBoard();
}

// Draw the board on the canvas
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before each redraw
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const tileGradientIndex = board[row][col];
            if (tileGradientIndex !== null) {
                drawTile(col * tileSize, row * tileSize, tileSize, tileGradientIndex);
            }
        }
    }
}

// Draw a single tile (with gradient, animation if necessary)
function drawTile(x, y, size, colorIndex, scale = 1, opacity = 1) {
    const gradientDefinition = gradientDefinitions[colorIndex]; // Fetch the corresponding gradient stops
    const gradient = createTileGradient(ctx, x, y, size, gradientDefinition); // Create the gradient

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = gradient; // Use gradient as the fill style
    ctx.translate(x + size / 2, y + size / 2); // Translate to the center of the tile
    ctx.scale(scale, scale); // Apply scaling
    ctx.fillRect(-size / 2, -size / 2, size, size); // Draw the tile centered
    ctx.restore();
}

// Get the tile coordinates based on mouse click
function getTileCoordinates(x, y) {
    const col = Math.floor(x / tileSize);
    const row = Math.floor(y / tileSize);
    return { row, col };
}

// Event listener for canvas clicks
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const { row, col } = getTileCoordinates(x, y);
    handleTileClick(row, col);
});

// Handle the tile click and find matching tiles
function handleTileClick(row, col) {
    // Check if the clicked tile is within the valid bounds of the grid
    if (row < 0 || row >= rows || col < 0 || col >= cols) {
        console.log('Clicked outside of the board.');
        return; // Exit the function if the click is outside the board
    }

    const clickedTileIndex = board[row][col];

    // Ensure the clicked tile is valid (not null or undefined)
    if (clickedTileIndex === null) {
        console.log('Invalid tile clicked.');
        return;
    }

    const matchingTiles = findMatchingTiles(row, col, clickedTileIndex);

    if (matchingTiles.length >= goals.matchCount) {
        animateTileDisappearance(matchingTiles, tileSize, board, ctx, animationSpeed, drawTile, drawBoard, () => {
            clearTiles(matchingTiles);
            applyGravity();
        });
    }
}

// Find all tiles in a cluster (recursive flood fill)
function findMatchingTiles(row, col, colorIndex, visited = new Set()) {
    if (row < 0 || row >= rows || col < 0 || col >= cols) return [];
    const key = `${row},${col}`;
    if (visited.has(key) || board[row][col] !== colorIndex) return [];

    visited.add(key);

    const matchingTiles = [{ row, col }];
    matchingTiles.push(...findMatchingTiles(row - 1, col, colorIndex, visited)); // Up
    matchingTiles.push(...findMatchingTiles(row + 1, col, colorIndex, visited)); // Down
    matchingTiles.push(...findMatchingTiles(row, col - 1, colorIndex, visited)); // Left
    matchingTiles.push(...findMatchingTiles(row, col + 1, colorIndex, visited)); // Right

    return matchingTiles;
}

// Clear the matching tiles
function clearTiles(tiles) {
    tiles.forEach(({ row, col }) => {
        board[row][col] = null; // Clear the tile
    });
}

// Apply gravity to make tiles fall down after clearing
function applyGravity() {
    let hasFalling = false;

    // Animate falling tiles
    const fallingTiles = [];
    for (let col = 0; col < cols; col++) {
        for (let row = rows - 1; row >= 0; row--) {
            if (board[row][col] === null) {
                // Move tiles above down
                for (let r = row - 1; r >= 0; r--) {
                    if (board[r][col] !== null) {
                        hasFalling = true;
                        fallingTiles.push({ fromRow: r, toRow: row, col });
                        board[row][col] = board[r][col];
                        board[r][col] = null;
                        break;
                    }
                }
            }
        }
    }

    if (hasFalling) {
        animateTileFalling(fallingTiles, tileSize, board, ctx, animationSpeed, drawTile, drawBoard, refillBoard);
    } else {
        refillBoard();
    }
}

// Refill the empty spaces with new tiles
function refillBoard() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (board[row][col] === null) {
                const randomGradientIndex = Math.floor(Math.random() * gradientDefinitions.length);
                board[row][col] = randomGradientIndex;
            }
        }
    }
    drawBoard();
}

// Initialize and display the goals
initializeBoard();
updateGoals();
