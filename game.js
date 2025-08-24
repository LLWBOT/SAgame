document.addEventListener('DOMContentLoaded', () => {
    const playerName = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    
    // Get opponent's name from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const opponentName = urlParams.get('opponent');

    if (!playerName || !token || !opponentName) {
        alert('Could not start game. Please log in again.');
        window.location.href = 'index.html';
        return;
    }

    // Display player names on the UI
    document.getElementById('player-name').textContent = playerName;
    document.getElementById('opponent-name').textContent = opponentName;

    // Connect to WebSocket Server
    const ws = new WebSocket('ws://YOUR_KOYEB_API_URL'); 

    ws.onopen = () => {
        // Authenticate the user
        ws.send(JSON.stringify({ type: 'authenticate', token }));
        // Let the server know we're ready for the game
        ws.send(JSON.stringify({ type: 'ready', opponent: opponentName }));
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        // ... Existing authentication and matchmaking logic ...

        if (data.type === 'gameStart') {
            // Placeholder for starting the Phaser game
            console.log('Game starting! Both players are ready.');
            // This is where you would initialize your Phaser game instance
            // and pass the WebSocket connection to it.
        }

        // Handle a player's attack from the opponent
        if (data.type === 'attack') {
            const damage = data.damage;
            // TODO: Decrease the player's HP here
            // This is where your Phaser game would receive the message
            // and update the health bar.
        }

        // Handle the final game result
        if (data.type === 'finalResult') {
            const gameOverScreen = document.getElementById('game-over-screen');
            const resultMessage = document.getElementById('result-message');
            
            gameOverScreen.classList.remove('hidden');
            resultMessage.textContent = data.status;

            // Wait for the user to click the home button to redirect
            document.getElementById('home-button').addEventListener('click', () => {
                window.location.href = 'homepage.html';
            });
        }
    };
});
