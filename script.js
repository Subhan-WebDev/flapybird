const canvas = document.getElementById('flappyBirdCanvas');
const ctx = canvas.getContext('2d');

// Bird properties
const bird = {
    x: 50,
    y: 150,
    width: 20,
    height: 20,
    gravity: 0.3,
    lift: -10,
    velocity: 0,
    jumpCooldown: 0, // Cooldown timer for jumping
    maxUpwardVelocity: -7 // Cap the upward velocity
};

// Pipe properties
const pipes = [];
const pipeWidth = 50;
const pipeGap = 150;
let pipeFrequency = 90;
let frameCount = 0;

// Game properties
let score = 0;
let isGameOver = false;
const jumpCooldownTime = 15; // Increased number of frames between allowed jumps

function handleJump() {
    if (!isGameOver && bird.jumpCooldown === 0) {
        bird.velocity = Math.max(bird.velocity + bird.lift, bird.maxUpwardVelocity); // Cap the upward velocity
        bird.jumpCooldown = jumpCooldownTime; // Set the cooldown
    } else if (isGameOver) {
        resetGame();
    }
}

// Adjust event listener based on window width
function setupInput() {
    if (window.innerWidth < 780) {
        document.removeEventListener('keydown', handleJump);
        canvas.addEventListener('click', handleJump);
    } else {
        canvas.removeEventListener('click', handleJump);
        document.addEventListener('keydown', handleJump);
    }
}

// Initialize input handling
setupInput();

// Re-adjust input handling when the window is resized
window.addEventListener('resize', setupInput);

function resetGame() {
    bird.y = 150;
    bird.velocity = 0;
    bird.jumpCooldown = 0;
    pipes.length = 0;
    score = 0;
    frameCount = 0;
    isGameOver = false;
}

function createPipe() {
    const topHeight = Math.floor(Math.random() * (canvas.height - pipeGap));
    pipes.push({
        x: canvas.width,
        top: topHeight,
        bottom: canvas.height - topHeight - pipeGap
    });
}

function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.jumpCooldown > 0) {
        bird.jumpCooldown--; // Decrease the cooldown timer
    }

    if (bird.y + bird.height >= canvas.height || bird.y <= 0) {
        isGameOver = true;
    }
}

function updatePipes() {
    if (frameCount % pipeFrequency === 0) {
        createPipe();
    }

    pipes.forEach((pipe, index) => {
        pipe.x -= 2;

        // Collision detection
        if (
            bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            (bird.y < pipe.top || bird.y + bird.height > canvas.height - pipe.bottom)
        ) {
            isGameOver = true;
        }

        // Score update
        if (pipe.x + pipeWidth < bird.x && !pipe.passed) {
            score++;
            pipe.passed = true;
        }

        // Remove offscreen pipes
        if (pipe.x + pipeWidth < 0) {
            pipes.splice(index, 1);
        }
    });
}

function drawBird() {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

function drawPipes() {
    ctx.fillStyle = 'green';
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
        ctx.fillRect(pipe.x, canvas.height - pipe.bottom, pipeWidth, pipe.bottom);
    });
}

function drawScore() {
    ctx.fillStyle = '#000';
    ctx.font = '24px sans-serif';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function drawGameOver() {
    ctx.fillStyle = 'red';
    ctx.font = '30px sans-serif';
    ctx.fillText('Game Over!', canvas.width / 2 - 80, canvas.height / 2 - 20);
    ctx.font = '16px sans-serif';
    ctx.fillText('Press any key to restart', canvas.width / 2 - 100, canvas.height / 2 + 20);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isGameOver) {
        updateBird();
        updatePipes();
        drawBird();
        drawPipes();
        drawScore();
        frameCount++;
    } else {
        drawGameOver();
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();
