document.addEventListener('DOMContentLoaded', function () {
    console.log('New Contact modal initialized');

    setupEventListeners();
    initializeTheme();
});

function setupEventListeners() {
    const cancelBtn = document.querySelector('.cancel-btn');
    const saveBtn = document.querySelector('.save-btn');
    const firstNameInput = document.getElementById('first-name');
    const lastNameInput = document.getElementById('last-name');
    const emailInput = document.getElementById('email');

    if (cancelBtn) {
        cancelBtn.addEventListener('click', function () {
            window.parent.postMessage('closeContactModal', '*');
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', function () {
            const firstName = firstNameInput.value.trim();
            const lastName = lastNameInput.value.trim();
            const email = emailInput.value.trim();

            if (!firstName || !email) {
                alert('First name and email are required!');
                return;
            }

            const newContact = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                photo: 'images/avatar.png'
            };

            const contacts = JSON.parse(localStorage.getItem('chatContacts') || '[]');
            contacts.push(newContact);
            localStorage.setItem('chatContacts', JSON.stringify(contacts));

            window.parent.postMessage('refreshChatList', '*');
            window.parent.postMessage('closeContactModal', '*');
        });
    }

    window.addEventListener('message', function (event) {
        console.log('New Contact modal received message:', event.data);

        if (event.data && event.data.type === 'toggleTheme') {
            const isDarkTheme = event.data.isDarkTheme;
            const themeIcon = document.querySelector('.theme-icon');
            if (isDarkTheme) {
                document.body.classList.add('dark-theme');
                themeIcon.src = 'images/sun.png';
            } else {
                document.body.classList.remove('dark-theme');
                themeIcon.src = 'images/moon.png';
            }
        }
    });
}

function initializeTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.querySelector('.theme-icon');
    if (!themeToggle || !themeIcon) return;

    let isDarkTheme = localStorage.getItem('darkTheme') === 'true';

    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        themeIcon.src = 'images/sun.png';
    } else {
        document.body.classList.remove('dark-theme');
        themeIcon.src = 'images/moon.png';
    }

    themeToggle.addEventListener('click', function () {
        isDarkTheme = !isDarkTheme;
        localStorage.setItem('darkTheme', isDarkTheme);

        if (isDarkTheme) {
            document.body.classList.add('dark-theme');
            themeIcon.src = 'images/sun.png';
        } else {
            document.body.classList.remove('dark-theme');
            themeIcon.src = 'images/moon.png';
        }

        window.parent.postMessage({ type: 'toggleTheme', isDarkTheme }, '*');
    });
}