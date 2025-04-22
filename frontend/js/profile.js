document.addEventListener('DOMContentLoaded', function () {
    const cancelBtn = document.querySelector('.btn.cancel');
    const saveBtn = document.querySelector('.btn.save');
    const avatarImg = document.getElementById('avatar-img');
    const userNameInput = document.getElementById('user-name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Load current user data from parent window
    window.addEventListener('message', function (event) {
        if (event.data && event.data.type === 'userData') {
            const userData = event.data.data;
            avatarImg.src = userData.avatar || 'images/avatar.png';
            userNameInput.value = userData.name || '';
            emailInput.value = userData.email || '';
            passwordInput.value = userData.password || '';
        }
    });

    // Request user data from parent window
    window.parent.postMessage({ type: 'requestUserData' }, '*');

    // Close modal on cancel
    cancelBtn.addEventListener('click', function () {
        window.parent.postMessage('closeProfileModal', '*');
    });

    // Save changes and close modal
    saveBtn.addEventListener('click', function () {
        const updatedUserData = {
            name: userNameInput.value || 'Nurtilek Abibillaev',
            email: emailInput.value || 'nurtilek@example.com',
            password: passwordInput.value || '',
            avatar: avatarImg.src
        };

        // Save to localStorage
        localStorage.setItem('userProfile', JSON.stringify(updatedUserData));

        // Notify parent to update UI and close modal
        window.parent.postMessage({ type: 'updateUserProfile', data: updatedUserData }, '*');
        window.parent.postMessage('closeProfileModal', '*');
    });
});