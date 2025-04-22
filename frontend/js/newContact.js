document.addEventListener('DOMContentLoaded', function () {
    const cancelBtn = document.querySelector('.cancel-btn');
    const saveBtn = document.querySelector('.save-btn');
    const firstNameInput = document.getElementById('first-name');
    const lastNameInput = document.getElementById('last-name');
    const emailInput = document.getElementById('email');

    // Handle cancel
    cancelBtn.addEventListener('click', function () {
        window.parent.postMessage('closeContactModal', '*');
    });

    // Handle save
    saveBtn.addEventListener('click', function () {
        const firstName = firstNameInput.value.trim();
        const lastName = lastNameInput.value.trim();
        const email = emailInput.value.trim();

        if (!firstName || !lastName || !email) {
            alert('Please fill in all fields.');
            return;
        }

        const newContact = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            photo: 'images/contact-icon.png' // Default photo
        };

        const contacts = JSON.parse(localStorage.getItem('chatContacts') || '[]');
        contacts.push(newContact);
        localStorage.setItem('chatContacts', JSON.stringify(contacts));

        window.parent.postMessage('closeContactModal', '*');
        window.parent.postMessage('refreshChatList', '*');
    });
});