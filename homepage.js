document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');

    if (!token || !username) {
        // If no token or username, redirect back to login
        window.location.href = 'index.html';
        return;
    }

    // Display the user's name on the page
    document.getElementById('user-name').textContent = `Welcome, ${username}`;

    document.getElementById('edit-button').addEventListener('click', async () => {
        const newUsername = prompt('Enter a new username:');
        if (newUsername) {
            try {
                // This call requires Axios to be included in the homepage.html file
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
        // This is where the matchmaking logic will go
        // It will initiate a WebSocket connection to the backend
        alert('Searching for a match...');
    });

    document.getElementById('leaderboard-button').addEventListener('click', () => {
        window.location.href = 'leaderboard.html';
    });
});
