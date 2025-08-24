document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');

    if (!token || !username) {
        // If no token or username, redirect back to login
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('user-name').textContent = `Welcome, ${username}`;

    document.getElementById('edit-button').addEventListener('click', async () => {
        const newUsername = prompt('Enter a new username:');
        if (newUsername) {
            try {
                // We'll need a new backend endpoint for this
                const response = await axios.post('YOUR_KOYEB_API_URL/api/update-username', { newUsername }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                localStorage.setItem('username', newUsername); // Update local storage
                document.getElementById('user-name').textContent = `Welcome, ${newUsername}`;
                alert('Username updated successfully!');
            } catch (error) {
                alert('Failed to update username. It might already be taken.');
            }
        }
    });

    document.getElementById('play-button').addEventListener('click', () => {
        // This is where we'll start the WebSocket connection
        alert('Searching for a match...');
    });

    document.getElementById('leaderboard-button').addEventListener('click', () => {
        window.location.href = 'leaderboard.html';
    });
});
