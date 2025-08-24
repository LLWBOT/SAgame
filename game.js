document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const playerName = document.getElementById('player-name');
    const opponentName = document.getElementById('opponent-name');
    const playerHp = document.getElementById('player-hp');
    const opponentHp = document.getElementById('opponent-hp');
    const playerHpText = document.getElementById('player-hp-text'); // <-- Add this
    const opponentHpText = document.getElementById('opponent-hp-text'); // <-- Add this
    const gameOverScreen = document.getElementById('game-over-screen');
    const gameOverMessage = document.getElementById('game-over-message');
    const backToHomeButton = document.getElementById('back-to-home-button');
    const leaveButton = document.getElementById('leave-button');

    // Make the canvas full screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const token = localStorage.getItem('token');
    const currentUser = localStorage.getItem('username');
    const opponent = new URLSearchParams(window.location.search).get('opponent');

    if (!token || !currentUser || !opponent) {
        window.location.href = 'index.html';
        return;
    }

    playerName.textContent = currentUser;
    opponentName.textContent = opponent;

    // Game state variables
    const player = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 10,
        color: '#5e5',
        speed: 5,
        hp: 100,
        projectiles: []
    };

    const opponentPlayer = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 10,
        color: '#e55',
        hp: 100
    };

    let opponentProjectiles = [];
    let keys = {};
    let isGameOver = false;

    // WebSocket connection
    const ws = new WebSocket('wss://above-barbette-primellw-ba50ce72.koyeb.app');

    ws.onopen = () => {
        console.log('Connected to WebSocket server.');
        ws.send(JSON.stringify({ type: 'authenticate', token }));
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        switch (data.type) {
            case 'gameUpdate':
                // Update opponent's position and health from the server
                opponentPlayer.x = data.x;
                opponentPlayer.y = data.y;
                opponentPlayer.hp = data.hp;
                opponentProjectiles = data.projectiles;
                break;
            case 'finalResult':
                isGameOver = true;
                gameOverMessage.textContent = data.status;
                gameOverScreen.classList.remove('hidden');
                break;
        }
    };
    
    // Handle leave and back to home
    leaveButton.addEventListener('click', () => {
        ws.send(JSON.stringify({ type: 'leave' }));
        ws.close();
        window.location.href = 'homepage.html';
    });

    backToHomeButton.addEventListener('click', () => {
        window.location.href = 'homepage.html';
    });

    // Handle user input
    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;
    });

    window.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    // Handle touch input
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        if (!isGameOver) {
            shoot(x, y);
        }
    });

    // Player shooting
    function shoot(targetX, targetY) {
        const angle = Math.atan2(targetY - player.y, targetX - player.x);
        player.projectiles.push({
            x: player.x,
            y: player.y,
            radius: 5,
            color: '#fff',
            velocity: {
                x: Math.cos(angle) * 7,
                y: Math.sin(angle) * 7
            }
        });
    }

    // Game loop
    function animate() {
        if (isGameOver) {
            return;
        }

        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Player movement
        if (keys['ArrowUp'] || keys['w']) player.y -= player.speed;
        if (keys['ArrowDown'] || keys['s']) player.y += player.speed;
        if (keys['ArrowLeft'] || keys['a']) player.x -= player.speed;
        if (keys['ArrowRight'] || keys['d']) player.x += player.speed;

        // Draw players
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fillStyle = player.color;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(opponentPlayer.x, opponentPlayer.y, opponentPlayer.radius, 0, Math.PI * 2);
        ctx.fillStyle = opponentPlayer.color;
        ctx.fill();

        // Update and draw projectiles
        player.projectiles.forEach((projectile, index) => {
            projectile.x += projectile.velocity.x;
            projectile.y += projectile.velocity.y;
            ctx.beginPath();
            ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
            ctx.fillStyle = projectile.color;
            ctx.fill();

            // Collision detection with opponent
            const dist = Math.hypot(projectile.x - opponentPlayer.x, projectile.y - opponentPlayer.y);
            if (dist - projectile.radius - opponentPlayer.radius < 1) {
                player.projectiles.splice(index, 1);
                player.hp -= 10;
                // Send an update to the server
                ws.send(JSON.stringify({
                    type: 'gameUpdate',
                    x: player.x,
                    y: player.y,
                    hp: player.hp,
                    projectiles: player.projectiles
                }));
            }
        });

        // Update and draw opponent's projectiles
        opponentProjectiles.forEach((projectile) => {
            ctx.beginPath();
            ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
            ctx.fillStyle = projectile.color;
            ctx.fill();
        });

        // Update health bars and health text
        playerHp.style.width = `${Math.max(0, player.hp)}%`;
        opponentHp.style.width = `${Math.max(0, opponentPlayer.hp)}%`;
        playerHpText.textContent = Math.max(0, player.hp); // <-- Add this
        opponentHpText.textContent = Math.max(0, opponentPlayer.hp); // <-- Add this

        // Check for game over
        if (player.hp <= 0) {
            isGameOver = true;
            ws.send(JSON.stringify({ type: 'gameover', winner: opponent, loser: currentUser }));
            gameOverMessage.textContent = 'You were defeated.';
            gameOverScreen.classList.remove('hidden');
        }
    }

    animate();
});
