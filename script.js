// 获取画布和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 游戏配置
const GRID_SIZE = 20;
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

// 速度配置 (毫秒，数值越小速度越快)
const SPEED_SETTINGS = {
    1: 400,  // 最慢
    2: 350,
    3: 300,
    4: 250,
    5: 200,  // 默认
    6: 150,
    7: 120,
    8: 100,
    9: 80,
    10: 60   // 最快
};

// 游戏状态
let snake = [{ x: 200, y: 200 }];
let direction = { x: 0, y: 0 };
let food = {};
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gamePaused = false;
let gameLoop;
let currentSpeed = 5; // 默认速度

// DOM 元素
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');
const pauseBtn = document.getElementById('pauseBtn');
const speedRange = document.getElementById('speedRange');
const speedValue = document.getElementById('speedValue');

// 初始化游戏
function initGame() {
    snake = [{ x: 200, y: 200 }];
    direction = { x: 0, y: 0 };
    score = 0;
    gameRunning = false;
    gamePaused = false;
    
    updateScore();
    updateHighScore();
    generateFood();
    draw();
    
    // 隐藏游戏结束界面
    gameOverElement.classList.add('hidden');
}

// 生成食物
function generateFood() {
    do {
        food = {
            x: Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE)) * GRID_SIZE,
            y: Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE)) * GRID_SIZE
        };
    } while (isSnakePosition(food.x, food.y));
}

// 检查位置是否是蛇身
function isSnakePosition(x, y) {
    return snake.some(segment => segment.x === x && segment.y === y);
}

// 移动蛇
function moveSnake() {
    if (!gameRunning || gamePaused) return;
    
    const head = { ...snake[0] };
    head.x += direction.x;
    head.y += direction.y;
    
    // 检查碰撞
    if (checkCollision(head)) {
        gameOver();
        return;
    }
    
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        updateScore();
        generateFood();
        
        // 检查是否创造新纪录
        if (score > highScore) {
            highScore = score;
            updateHighScore();
            localStorage.setItem('snakeHighScore', highScore);
        }
    } else {
        snake.pop();
    }
}

// 检查碰撞
function checkCollision(head) {
    // 撞墙
    if (head.x < 0 || head.x >= CANVAS_WIDTH || head.y < 0 || head.y >= CANVAS_HEIGHT) {
        return true;
    }
    
    // 撞自己
    return snake.some(segment => segment.x === head.x && segment.y === head.y);
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // 绘制蛇
    ctx.fillStyle = '#4CAF50';
    snake.forEach((segment, index) => {
        if (index === 0) {
            // 蛇头
            ctx.fillStyle = '#66BB6A';
        } else {
            ctx.fillStyle = '#4CAF50';
        }
        ctx.fillRect(segment.x, segment.y, GRID_SIZE - 2, GRID_SIZE - 2);
    });
    
    // 绘制食物
    ctx.fillStyle = '#FF5722';
    ctx.fillRect(food.x, food.y, GRID_SIZE - 2, GRID_SIZE - 2);
    
    // 绘制网格线（可选）
    drawGrid();
}

// 绘制网格线
function drawGrid() {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    
    for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
    }
    
    for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
    }
}

// 游戏主循环
function gameStep() {
    moveSnake();
    draw();
}

// 开始游戏
function startGame() {
    if (!gameRunning && !gamePaused) {
        gameRunning = true;
        gameLoop = setInterval(gameStep, SPEED_SETTINGS[currentSpeed]);
    }
}

// 更新游戏速度
function updateGameSpeed() {
    if (gameRunning && !gamePaused) {
        clearInterval(gameLoop);
        gameLoop = setInterval(gameStep, SPEED_SETTINGS[currentSpeed]);
    }
}

// 暂停/继续游戏
function togglePause() {
    if (!gameRunning) return;
    
    if (gamePaused) {
        gamePaused = false;
        gameLoop = setInterval(gameStep, SPEED_SETTINGS[currentSpeed]);
        pauseBtn.textContent = '暂停';
    } else {
        gamePaused = true;
        clearInterval(gameLoop);
        pauseBtn.textContent = '继续';
    }
}

// 游戏结束
function gameOver() {
    gameRunning = false;
    gamePaused = false;
    clearInterval(gameLoop);
    
    finalScoreElement.textContent = score;
    gameOverElement.classList.remove('hidden');
    pauseBtn.textContent = '暂停';
}

// 重新开始游戏
function restartGame() {
    clearInterval(gameLoop);
    initGame();
}

// 更新分数显示
function updateScore() {
    scoreElement.textContent = score;
}

// 更新最高分显示
function updateHighScore() {
    highScoreElement.textContent = highScore;
}

// 速度控制事件
speedRange.addEventListener('input', (e) => {
    currentSpeed = parseInt(e.target.value);
    speedValue.textContent = currentSpeed;
    updateGameSpeed();
});

// 键盘事件处理
document.addEventListener('keydown', (e) => {
    if (!gameRunning && direction.x === 0 && direction.y === 0) {
        startGame();
    }
    
    switch (e.key) {
        case 'ArrowUp':
            if (direction.y === 0) {
                direction = { x: 0, y: -GRID_SIZE };
            }
            break;
        case 'ArrowDown':
            if (direction.y === 0) {
                direction = { x: 0, y: GRID_SIZE };
            }
            break;
        case 'ArrowLeft':
            if (direction.x === 0) {
                direction = { x: -GRID_SIZE, y: 0 };
            }
            break;
        case 'ArrowRight':
            if (direction.x === 0) {
                direction = { x: GRID_SIZE, y: 0 };
            }
            break;
        case ' ':
            e.preventDefault();
            togglePause();
            break;
    }
});

// 按钮事件
restartBtn.addEventListener('click', restartGame);
pauseBtn.addEventListener('click', togglePause);

// 触摸控制（移动设备）
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (!gameRunning && direction.x === 0 && direction.y === 0) {
        startGame();
        return;
    }
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 水平滑动
        if (deltaX > 30 && direction.x === 0) {
            direction = { x: GRID_SIZE, y: 0 }; // 右
        } else if (deltaX < -30 && direction.x === 0) {
            direction = { x: -GRID_SIZE, y: 0 }; // 左
        }
    } else {
        // 垂直滑动
        if (deltaY > 30 && direction.y === 0) {
            direction = { x: 0, y: GRID_SIZE }; // 下
        } else if (deltaY < -30 && direction.y === 0) {
            direction = { x: 0, y: -GRID_SIZE }; // 上
        }
    }
});

// 初始化游戏
initGame();