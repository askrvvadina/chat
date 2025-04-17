document.addEventListener('DOMContentLoaded', function () {
    // DOM elements
    const profileModal = document.getElementById('profileModal');
    const profileAvatar = document.getElementById('profileAvatar');
    const avatarChange = document.querySelector('.avatar-change');
    const avatarInput = document.getElementById('avatarInput');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profilePassword = document.getElementById('profilePassword');
    const cancelButton = document.getElementById('cancelButton');
    const saveButton = document.getElementById('saveButton');

    // Check if we're in an iframe
    const isInIframe = window.frameElement !== null;

    // Load profile data from localStorage if available
    function loadProfileData() {
        // Use parent's localStorage if in an iframe
        const storage = isInIframe ? window.parent.localStorage : localStorage;
        const userData = JSON.parse(storage.getItem('chatAppUserData')) || {};

        if (userData.name) profileName.value = userData.name;
        if (userData.email) profileEmail.value = userData.email;
        if (userData.password) profilePassword.value = userData.password;
        if (userData.avatar) profileAvatar.src = userData.avatar;
    }

    // Save profile data to localStorage
    function saveProfileData() {
        const userData = {
            name: profileName.value.trim(),
            email: profileEmail.value.trim(),
            password: profilePassword.value,
            avatar: profileAvatar.src
        };

        // Use parent's localStorage if in an iframe
        const storage = isInIframe ? window.parent.localStorage : localStorage;
        storage.setItem('chatAppUserData', JSON.stringify(userData));

        console.log("Profile data saved:", userData);
    }

    // Avatar change functionality
    avatarChange.addEventListener('click', function () {
        avatarInput.click();
    });

    // Handle avatar file selection
    avatarInput.addEventListener('change', function () {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                profileAvatar.src = e.target.result;
            };
            reader.readAsDataURL(this.files[0]);
        }
    });

    // Cancel button click handler
    cancelButton.addEventListener('click', function () {
        if (isInIframe) {
            console.log("Sending closeProfile message to parent");
            window.parent.postMessage('closeProfile', '*');
        } else {
            window.close();
        }
    });

    // Save button click handler
    saveButton.addEventListener('click', function () {
        saveProfileData();
        if (isInIframe) {
            console.log("Sending profileSaved message to parent");
            window.parent.postMessage('profileSaved', '*');
        } else {
            window.close();
        }
    });

    // Handle ESC key press to close the modal
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            if (isInIframe) {
                window.parent.postMessage('closeProfile', '*');
            } else {
                window.close();
            }
        }
    });

    // Initialize profile data
    loadProfileData();

    // Always show the modal
    if (profileModal) {
        profileModal.style.display = 'flex';
    }
});