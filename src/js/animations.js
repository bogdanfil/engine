// Easing function for smooth falling animation
export function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// Animate the disappearance of the tiles (shrink and fade out)
export function animateTileDisappearance(tiles, tileSize, board, ctx, animationSpeed, drawTile, drawBoard, callback) {
    const startTime = Date.now();

    // Easing function (ease-out)
    function easeOutQuad(t) {
        return t * (2 - t);
    }

    // Function to generate particles for the "epic" effect
    function createParticles(x, y, color) {
        const particles = [];
        for (let i = 0; i < 10; i++) {
            particles.push({
                x: x + Math.random() * tileSize,
                y: y + Math.random() * tileSize,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 2,
                speedY: (Math.random() - 0.5) * 2,
                color: color,
                opacity: 1
            });
        }
        return particles;
    }

    const particles = tiles.map(({ row, col }) => {
        const x = col * tileSize;
        const y = row * tileSize;
        const tileData = board[row][col];
        return createParticles(x, y, tileData.color); // Assuming tileData has a color
    }).flat();

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / animationSpeed, 1); // Progress from 0 to 1
        const easedProgress = easeOutQuad(progress); // Apply easing for smoothness
        const scale = 1.1 - 0.4 * easedProgress; // Scale from 110% to 70%
        const opacity = 1 - easedProgress; // Fade out
        const rotation = (easedProgress * Math.PI) / 4; // Add slight rotation (45 degrees at max)

        drawBoard(); // Redraw the background

        // Draw tiles with scaling, opacity, and rotation
        tiles.forEach(({ row, col }) => {
            const x = col * tileSize + tileSize / 2;
            const y = row * tileSize + tileSize / 2;
            const tileData = board[row][col];

            ctx.save();
            ctx.translate(x, y); // Move to the center of the tile
            ctx.rotate(rotation); // Rotate the tile
            ctx.translate(-x, -y); // Move back
            drawTile(x - tileSize / 2, y - tileSize / 2, tileSize, tileData, scale, opacity);
            ctx.restore();
        });

        // Update and draw particles
        particles.forEach((particle, index) => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.opacity -= 0.03; // Gradually fade out particles

            if (particle.opacity > 0) {
                ctx.globalAlpha = particle.opacity;
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
                ctx.fill();
                ctx.globalAlpha = 1; // Reset opacity for other drawing
            } else {
                particles.splice(index, 1); // Remove the particle once it fades out
            }
        });

        // Continue animation if not yet finished
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            callback(); // Trigger the next step when animation is complete
        }
    }

    requestAnimationFrame(animate);
}

// Animate the falling tiles
export function animateTileFalling(tiles, tileSize, board, ctx, animationSpeed, drawTile, drawBoard, callback) {
    const startTime = Date.now();

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / animationSpeed, 1); // Progress from 0 to 1
        const easeProgress = easeOutCubic(progress);

        drawBoard();
        tiles.forEach(({ fromRow, toRow, col }) => {
            const x = col * tileSize;
            const yStart = fromRow * tileSize;
            const yEnd = toRow * tileSize;
            const y = yStart + (yEnd - yStart) * easeProgress;
            drawTile(x, y, tileSize, board[toRow][col]);
        });

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            callback(); // Trigger the next step (refill the board)
        }
    }

    requestAnimationFrame(animate);
}
