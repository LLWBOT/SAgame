document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    
    const playButton = document.getElementById('play-button');
    const leaderboardButton = document.getElementById('leaderboard-button');
    const logoutButton = document.getElementById('logout-button');
    const stopMatchmakingButton = document.getElementById('stop-matchmaking-button'); // Get the new button
    const loadingScreen = document.getElementById('loading-screen');
    const buttonGroup = document.querySelector('.button-group');

    if (!token || !username) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('user-name').textContent = `Welcome, ${username}`;

    const fetchScore = async () => {
        try {
            const response = await axios.get('https://above-barbette-primellw-ba50ce72.koyeb.app/api/user/score', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            document.getElementById('user-score').textContent = `Points: ${response.data.points}`;
        } catch (error) {
            console.error('Failed to fetch user score:', error);
            document.getElementById('user-score').textContent = 'Points: N/A';
        }
    };

    fetchScore();

    document.getElementById('edit-button').addEventListener('click', async () => {
        const newUsername = prompt('Enter a new username:');
        if (newUsername) {
            try {
                const response = await axios.post('https://above-barbette-primellw-ba50ce72.koyeb.app/api/update-username', { newUsername }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                localStorage.setItem('username', newUsername);
                document.getElementById('user-name').textContent = `Welcome, ${newUsername}`;
                alert('Username updated successfully!');
            } catch (error) {
                alert('Failed to update username. It might already be taken.');
            }
        }
    });

    playButton.addEventListener('click', () => {
        // Hide the main buttons and show the loading screen
        buttonGroup.classList.add('hidden');
        loadingScreen.classList.remove('hidden');

        const ws = new WebSocket('wss://above-barbette-primellw-ba50ce72.koyeb.app'); 
    
        ws.onopen = () => {
            ws.send(JSON.stringify({ type: 'authenticate', token }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'matchFound') {
                loadingScreen.innerHTML = `<p>Match found with ${data.opponent}! Starting game...</p>`;
                setTimeout(() => {
                    window.location.href = `game.html?opponent=${data.opponent}`;
                }, 2000);
            } else if (data.type === 'status') {
                loadingScreen.querySelector('p').textContent = data.message;
            }
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed.');
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            loadingScreen.innerHTML = '<p>Failed to connect to matchmaking service. Please try again.</p>';
            setTimeout(() => {
                window.location.reload(); 
            }, 3000);
        };

        // Add the stop matchmaking listener here
        stopMatchmakingButton.addEventListener('click', () => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close(); // Close the WebSocket connection
            }
            // Reset the UI
            loadingScreen.classList.add('hidden');
            buttonGroup.classList.remove('hidden');
            loadingScreen.innerHTML = `<p>Searching for an opponent...</p><div class="loader"></div><button id="stop-matchmaking-button" class="main-button" style="margin-top: 1em;">Cancel</button>`;
        }, { once: true });
    });

    leaderboardButton.addEventListener('click', () => {
        window.location.href = 'leaderboard.html';
    });

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = 'index.html';
    });
});
