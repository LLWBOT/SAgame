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
        // Here's the WebSocket matchmaking logic
        const loadingScreen = document.getElementById('loading-screen');
        const buttonGroup = document.querySelector('.button-group');

        buttonGroup.classList.add('hidden');
        loadingScreen.classList.remove('hidden');

        // Connect to your backend's WebSocket server
        const ws = new WebSocket('wss://above-barbette-primellw-ba50ce72.koyeb.app'); 
    
        ws.onopen = () => {
            // Send the user's authentication token to the backend
            ws.send(JSON.stringify({ type: 'authenticate', token }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'matchFound') {
                // When a match is found, redirect to the game page
                loadingScreen.innerHTML = `<p>Match found with ${data.opponent}! Starting game...</p>`;
                setTimeout(() => {
                    window.location.href = `game.html?opponent=${data.opponent}`;
                }, 2000);
            } else if (data.type === 'status') {
                // Update the loading screen with a status message
                loadingScreen.querySelector('p').textContent = data.message;
            }
        };

        ws.onclose = () => {
            // Handle disconnection
            console.log('WebSocket connection closed.');
        };

        ws.onerror = (error) => {
            // Handle errors and show a message
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
});
