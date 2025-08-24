document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');

    if (!token || !username) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('user-name').textContent = `Welcome, ${username}`;

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

    document.getElementById('play-button').addEventListener('click', () => {
        // These two lines hide the buttons and show the loading screen
        const buttonGroup = document.querySelector('.button-group');
        const loadingScreen = document.getElementById('loading-screen');

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
    });

    document.getElementById('leaderboard-button').addEventListener('click', () => {
        window.location.href = 'leaderboard.html';
    });

    document.getElementById('logout-button').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = 'index.html';
    });
});
