document.addEventListener('DOMContentLoaded', () => {
    // 游戏元素
    const cat = document.getElementById('cat');
    const home = document.getElementById('home');
    const scoreElement = document.getElementById('score');
    const livesElement = document.getElementById('lives');
    const gameOverElement = document.getElementById('game-over');
    const finalScoreElement = document.getElementById('final-score');
    const restartButton = document.getElementById('restart');
    
    // 控制按钮
    const upButton = document.getElementById('up');
    const downButton = document.getElementById('down');
    const leftButton = document.getElementById('left');
    const rightButton = document.getElementById('right');
    
    // 游戏状态
    let score = 0;
    let lives = 3;
    let gameActive = true;
    let catPosition = { x: 50, y: 50 }; // 百分比位置
    
    // 音效对象（使用 Web Audio API 创建简单音效）
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    function playSound(frequency, duration, type = 'sine') {
        if (!audioContext) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }
    
    // 初始化猫咪位置到中心
    updateCatPosition();
    
    // 键盘控制
    document.addEventListener('keydown', (e) => {
        if (!gameActive) return;
        
        switch(e.key) {
            case 'ArrowUp':
                moveCat(0, -2);
                break;
            case 'ArrowDown':
                moveCat(0, 2);
                break;
            case 'ArrowLeft':
                moveCat(-2, 0);
                break;
            case 'ArrowRight':
                moveCat(2, 0);
                break;
        }
    });
    
    // 屏幕按钮控制
    upButton.addEventListener('click', () => moveCat(0, -2));
    downButton.addEventListener('click', () => moveCat(0, 2));
    leftButton.addEventListener('click', () => moveCat(-2, 0));
    rightButton.addEventListener('click', () => moveCat(2, 0));
    
    // 重启游戏
    restartButton.addEventListener('click', restartGame);
    
    // 移动猫咪
    function moveCat(deltaX, deltaY) {
        if (!gameActive) return;
        
        catPosition.x = Math.max(0, Math.min(100, catPosition.x + deltaX));
        catPosition.y = Math.max(0, Math.min(100, catPosition.y + deltaY));
        
        updateCatPosition();
        checkCollisions();
    }
    
    // 更新猫咪位置
    function updateCatPosition() {
        cat.style.left = `${catPosition.x}%`;
        cat.style.top = `${catPosition.y}%`;
    }
    
    // 检查碰撞
    function checkCollisions() {
        // 检查是否到达家
        if (isColliding(cat, home)) {
            score += 100;
            updateScore();
            playSound(523.25, 0.3); // 中C音符，表示成功
            // 将家移到新位置
            moveHome();
            // 随机移动障碍物
            moveObstacles();
            
            // 添加到达家的视觉效果
            home.style.transform = 'scale(1.2)';
            setTimeout(() => {
                home.style.transform = 'scale(1)';
            }, 300);
        }
        
        // 检查是否吃到食物
        document.querySelectorAll('.food').forEach(food => {
            if (isColliding(cat, food) && !food.classList.contains('collected')) {
                score += 10;
                updateScore();
                playSound(659.25, 0.15); // E音符，表示获得奖励
                food.classList.add('collected');
                food.style.opacity = '0';
                
                // 一段时间后重新生成食物
                setTimeout(() => {
                    food.classList.remove('collected');
                    food.style.opacity = '1';
                    resetFoodPosition(food);
                }, 3000);
            }
        });
        
        // 检查是否碰到障碍物
        document.querySelectorAll('.obstacle').forEach(obstacle => {
            if (isColliding(cat, obstacle)) {
                lives--;
                updateLives();
                playSound(220, 0.5, 'square'); // 低音，表示受伤
                
                if (lives <= 0) {
                    endGame();
                } else {
                    // 短暂闪烁效果
                    cat.style.transition = 'all 0.5s';
                    cat.style.backgroundColor = 'red';
                    setTimeout(() => {
                        cat.style.backgroundColor = '';
                        cat.style.transition = 'all 0.2s ease';
                    }, 500);
                }
            }
        });
    }
    
    // 检查两个元素是否碰撞
    function isColliding(element1, element2) {
        const rect1 = element1.getBoundingClientRect();
        const rect2 = element2.getBoundingClientRect();
        
        return !(
            rect1.bottom < rect2.top || 
            rect1.top > rect2.bottom || 
            rect1.right < rect2.left || 
            rect1.left > rect2.right
        );
    }
    
    // 更新分数
    function updateScore() {
        scoreElement.textContent = score;
    }
    
    // 更新生命值
    function updateLives() {
        livesElement.textContent = lives;
    }
    
    // 移动家到新位置
    function moveHome() {
        const newX = Math.random() * 80; // 0-80% 以避免贴边
        const newY = Math.random() * 80;
        home.style.left = `${newX}%`;
        home.style.top = `${newY}%`;
    }
    
    // 移动障碍物到新位置
    function moveObstacles() {
        document.querySelectorAll('.obstacle').forEach(obstacle => {
            const newX = Math.random() * 80;
            const newY = Math.random() * 80;
            obstacle.style.left = `${newX}%`;
            obstacle.style.top = `${newY}%`;
        });
    }
    
    // 重置食物位置
    function resetFoodPosition(food) {
        const newX = Math.random() * 80;
        const newY = Math.random() * 80;
        food.style.left = `${newX}%`;
        food.style.top = `${newY}%`;
    }
    
    // 结束游戏
    function endGame() {
        gameActive = false;
        playSound(220, 1, 'square'); // 低沉音符，表示游戏结束
        finalScoreElement.textContent = score;
        gameOverElement.classList.remove('hidden');
    }
    
    // 重启游戏
    function restartGame() {
        score = 0;
        lives = 3;
        catPosition = { x: 50, y: 50 };
        
        updateScore();
        updateLives();
        updateCatPosition();
        
        gameOverElement.classList.add('hidden');
        gameActive = true;
        
        // 重置家的位置
        home.style.left = '85%';
        home.style.top = '10%';
        
        // 重置障碍物位置
        const obstacles = document.querySelectorAll('.obstacle');
        obstacles[0].style.left = '30%'; obstacles[0].style.top = '20%';
        obstacles[1].style.left = '60%'; obstacles[1].style.top = '40%';
        obstacles[2].style.left = '20%'; obstacles[2].style.top = '70%';
        obstacles[3].style.left = '80%'; obstacles[3].style.top = '50%';
        
        // 重置食物位置和可见性
        document.querySelectorAll('.food').forEach((food, index) => {
            food.classList.remove('collected');
            food.style.opacity = '1';
        });
    }
    
    // 添加一些动画效果
    setInterval(() => {
        if (gameActive) {
            // 让家轻微摆动
            const floatAmount = Math.sin(Date.now() / 1000) * 5;
            home.style.transform = `translate(0, ${floatAmount}px)`;
        }
    }, 50);
});