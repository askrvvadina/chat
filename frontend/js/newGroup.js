document.addEventListener('DOMContentLoaded', function () {
    const cancelBtn = document.querySelector('.cancel-btn');
    const saveBtn = document.querySelector('.save-btn');
    const groupPhotoInput = document.getElementById('group-photo');
    const photoPlaceholder = document.querySelector('.photo-placeholder');
    const groupNameInput = document.getElementById('group-name');
    const contactsList = document.querySelector('.contacts-list');

    // Load contacts from localStorage
    const contacts = JSON.parse(localStorage.getItem('chatContacts') || '[]');
    contacts.forEach(contact => {
        const contactElement = document.createElement('div');
        contactElement.className = 'contact-item';

        const initials = `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase();
        contactElement.innerHTML = `
            <div class="contact-avatar">${initials}</div>
            <div class="contact-name">${contact.firstName} ${contact.lastName}</div>
            <div class="checkbox" data-id="${contact.email}"></div>
        `;
        contactsList.appendChild(contactElement);
    });

    // Handle photo upload
    photoPlaceholder.addEventListener('click', () => {
        groupPhotoInput.click();
    });

    let photoDataUrl = null;
    groupPhotoInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                photoDataUrl = event.target.result;
                photoPlaceholder.innerHTML = `<img src="${photoDataUrl}" alt="Group Photo" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // Handle checkbox selection
    contactsList.addEventListener('click', function (e) {
        if (e.target.classList.contains('checkbox')) {
            e.target.classList.toggle('checked');
        }
    });

    // Handle cancel
    cancelBtn.addEventListener('click', function () {
        window.parent.postMessage('closeGroupModal', '*');
    });

    // Handle save
    saveBtn.addEventListener('click', function () {
        const groupName = groupNameInput.value.trim();
        if (!groupName) {
            alert('Please enter a group name.');
            return;
        }

        const selectedMembers = [];
        document.querySelectorAll('.checkbox.checked').forEach(checkbox => {
            const email = checkbox.getAttribute('data-id');
            const contact = contacts.find(c => c.email === email);
            if (contact) {
                selectedMembers.push(contact);
            }
        });

        const newGroup = {
            name: groupName,
            photo: photoDataUrl || 'images/group-icon.png',
            members: selectedMembers
        };

        const groups = JSON.parse(localStorage.getItem('chatGroups') || '[]');
        groups.push(newGroup);
        localStorage.setItem('chatGroups', JSON.stringify(groups));

        window.parent.postMessage('closeGroupModal', '*');
        window.parent.postMessage('refreshChatList', '*');
    });
});