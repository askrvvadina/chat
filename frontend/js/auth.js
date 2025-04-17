const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const toggleLinks = document.querySelectorAll('.toggle-link');
const loginButton = document.getElementById('login-button');
const registerButton = document.getElementById('register-button');
const sendCodeButton = document.getElementById('send-code');
const messageElement = document.getElementById('message');

// Toggle between login and register forms (only on mobile)
toggleLinks.forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        if (window.innerWidth <= 768) {
            loginForm.style.display = loginForm.style.display === 'none' ? 'block' : 'none';
            registerForm.style.display = registerForm.style.display === 'none' ? 'block' : 'none';
        }
    });
});

// Handle login
loginButton.addEventListener('click', async function () {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = 'chat.html';
            }, 1000);
        } else {
            showMessage(data.detail || 'Error during login', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Server is unavailable', 'error');
    }
});

// ✅ Handle registration with JSON
registerButton.addEventListener('click', async function () {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const verificationCode = document.getElementById('verification-code').value;

    if (!name || !email || !password || !verificationCode) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: name,
                email: email,
                password: password,
                verificationCode: verificationCode
            })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Registration successful!', 'success');
            setTimeout(() => {
                window.location.href = 'chat.html';
            }, 1000);
        } else {
            showMessage(data.detail || 'Error during registration', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Server is unavailable', 'error');
    }
});

// Send verification code
sendCodeButton.addEventListener('click', async function (e) {
    e.preventDefault();
    const email = document.getElementById('register-email').value;

    if (!email) {
        showMessage('Please enter your email address first', 'error');
        return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }

    sendCodeButton.textContent = 'Sending...';
    sendCodeButton.style.opacity = '0.7';
    sendCodeButton.style.pointerEvents = 'none';

    try {
        const response = await fetch('http://localhost:8000/send-verification-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Verification code sent to ' + email, 'success');
            document.getElementById('verification-code').focus();

            let countdown = 60;
            const countdownInterval = setInterval(() => {
                sendCodeButton.textContent = `Resend in ${countdown}s`;
                countdown--;

                if (countdown < 0) {
                    clearInterval(countdownInterval);
                    sendCodeButton.textContent = 'Send the code';
                    sendCodeButton.style.opacity = '1';
                    sendCodeButton.style.pointerEvents = 'auto';
                }
            }, 1000);
        } else {
            showMessage(data.detail || 'Error sending verification code', 'error');
            resetSendCodeButton();
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Server is unavailable', 'error');
        resetSendCodeButton();
    }
});

function resetSendCodeButton() {
    sendCodeButton.textContent = 'Send the code';
    sendCodeButton.style.opacity = '1';
    sendCodeButton.style.pointerEvents = 'auto';
}

function showMessage(text, type) {
    messageElement.textContent = text;
    messageElement.style.display = 'block';
    messageElement.style.backgroundColor = type === 'success' ? 'rgba(76, 175, 80, 0.8)' : 'rgba(244, 67, 54, 0.8)';
    messageElement.style.color = 'white';

    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 3000);
}

function checkScreenSize() {
    if (window.innerWidth > 768) {
        loginForm.style.display = 'block';
        registerForm.style.display = 'block';
    } else {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    }
}

window.addEventListener('load', checkScreenSize);
window.addEventListener('resize', checkScreenSize);
