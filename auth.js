document.addEventListener('DOMContentLoaded', () => {
    // Check for a token. If it exists, skip to the homepage.
    const token = localStorage.getItem('token');
    if (token) {
        // In a real app, you'd verify the token first. For now, we'll assume it's valid.
        window.location.href = 'homepage.html';
    }

    const signupBtn = document.getElementById('signup-btn');
    const loginBtn = document.getElementById('login-btn');
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');
    const authBtns = document.getElementById('auth-buttons');
    const signupMessage = document.getElementById('signup-message');
    const loginMessage = document.getElementById('login-message');

    signupBtn.addEventListener('click', () => {
        authBtns.classList.add('hidden');
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    });

    loginBtn.addEventListener('click', () => {
        authBtns.classList.add('hidden');
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    });

    // Handle Signup Form Submission
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('signup-username').value;
        const password = document.getElementById('signup-password').value;
        
        try {
            const response = await axios.post('YOUR_KOYEB_API_URL/api/signup', { username, password });
            signupMessage.textContent = 'Account created successfully! You can now log in.';
            signupMessage.style.color = '#5e5';
            setTimeout(() => {
                window.location.reload(); // Reloads the page to show the login buttons again
            }, 2000);
        } catch (error) {
            signupMessage.textContent = error.response.data || 'Error creating account.';
            signupMessage.style.color = '#e55';
        }
    });

    // Handle Login Form Submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await axios.post('YOUR_KOYEB_API_URL/api/login', { username, password });
            const token = response.data.token;
            localStorage.setItem('token', token);
            localStorage.setItem('username', username);
            window.location.href = 'homepage.html'; // Redirect to the game homepage
        } catch (error) {
            loginMessage.textContent = error.response.data || 'Invalid username or password.';
            loginMessage.style.color = '#e55';
        }
    });
});
