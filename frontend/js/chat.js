document.addEventListener('DOMContentLoaded', function () {
    console.log('Main app initialized');

    setupTopMenu();
    setupSidebar();
    setupMainView();
    setupEventListeners();
    setupChatInterface();

    showChatView();
    loadChatsInSidebar();
    initializeTheme();
});

let isSelectionMode = false;
let currentChatContact = null;
let isOnline = true;
let isContactOnline = true;
let replyingToMessage = null; // Хранит сообщение, на которое отвечают
let editingMessage = null; // Хранит сообщение, которое редактируется

function setupTopMenu() {
    const menuDots = document.getElementById('menu-dots');
    const dropdownMenu = document.getElementById('dropdown-menu');

    if (menuDots && dropdownMenu) {
        menuDots.addEventListener('click', function (e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('active');
        });

        document.addEventListener('click', function () {
            if (dropdownMenu.classList.contains('active')) {
                dropdownMenu.classList.remove('active');
            }
        });

        const dropdownItems = dropdownMenu.querySelectorAll('li');
        dropdownItems.forEach(item => {
            item.addEventListener('click', function () {
                const action = this.textContent;
                console.log(`Selected action: ${action}`);

                if (action === 'Select Language') {
                    alert('Language selector coming soon!');
                } else if (action === 'Edit Profile') {
                    openModal('profile.html', 'profileModal');
                } else if (action === 'Select Contact') {
                    toggleSelectionMode();
                }

                dropdownMenu.classList.remove('active');
            });
        });
    }
}

function toggleSelectionMode() {
    isSelectionMode = !isSelectionMode;
    const selectionActions = document.querySelector('.selection-actions');
    const checkboxes = document.querySelectorAll('.contact-checkbox');

    if (isSelectionMode) {
        selectionActions.style.display = 'flex';
        checkboxes.forEach(checkbox => {
            checkbox.style.display = 'inline-block';
        });
    } else {
        selectionActions.style.display = 'none';
        checkboxes.forEach(checkbox => {
            checkbox.style.display = 'none';
            checkbox.checked = false;
        });
    }
}

function deleteSelectedContacts() {
    const checkboxes = document.querySelectorAll('.contact-checkbox:checked');
    const indices = Array.from(checkboxes).map(checkbox => parseInt(checkbox.dataset.index));

    if (indices.length === 0) {
        alert('Please select at least one contact to delete.');
        return;
    }

    let contacts = JSON.parse(localStorage.getItem('chatContacts') || '[]');
    indices.sort((a, b) => b - a);
    indices.forEach(index => {
        contacts.splice(index, 1);
    });
    localStorage.setItem('chatContacts', JSON.stringify(contacts));
    loadChatsInSidebar();
    toggleSelectionMode();
}

function setupSidebar() {
    const contactsIcon = document.getElementById('contacts-icon');
    const groupsIcon = document.getElementById('groups-icon');

    if (contactsIcon) {
        contactsIcon.addEventListener('click', function () {
            openModal('newContact.html', 'contactModal');
            activateSection('chats');
        });
    }

    if (groupsIcon) {
        groupsIcon.addEventListener('click', function () {
            openModal('newGroup.html', 'groupModal');
            activateSection('chats');
        });
    }

    loadChatsInSidebar();

    const deleteButton = document.getElementById('delete-selected');
    if (deleteButton) {
        deleteButton.addEventListener('click', deleteSelectedContacts);
    }

    const cancelButton = document.getElementById('cancel-selection');
    if (cancelButton) {
        cancelButton.addEventListener('click', toggleSelectionMode);
    }
}

function setupMainView() { }

function setupChatInterface() {
    const sendButton = document.getElementById('send-button');
    const messageInput = document.getElementById('message-input');
    const attachIcon = document.getElementById('attach-icon');
    const fileInput = document.getElementById('file-input');
    const emojiIcon = document.getElementById('emoji-icon');
    const emojiPickerContainer = document.getElementById('emoji-picker-container');
    const emojiPicker = document.querySelector('emoji-picker');
    const infoIcon = document.getElementById('info-icon');
    const rightPanel = document.getElementById('right-panel');
    const photoModal = document.getElementById('photo-modal');
    const fullScreenPhoto = document.getElementById('full-screen-photo');
    const closePhoto = document.getElementById('close-photo');
    const cancelReplyButton = document.getElementById('cancel-reply');
    const cancelEditButton = document.getElementById('cancel-edit');

    if (sendButton) {
        sendButton.addEventListener('click', function () {
            console.log('Send button clicked');
            sendMessage();
        });
    } else {
        console.error('Send button not found');
    }

    if (messageInput) {
        messageInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                console.log('Enter key pressed in message input');
                sendMessage();
            }
        });
    } else {
        console.error('Message input not found');
    }

    if (attachIcon && fileInput) {
        attachIcon.addEventListener('click', function () {
            console.log('Attach icon clicked');
            fileInput.click();
        });
    } else {
        console.error('Attach icon or file input not found');
    }

    if (fileInput) {
        fileInput.addEventListener('change', function (event) {
            console.log('File input changed');
            const file = event.target.files[0];
            if (file) {
                sendAttachment(file);
            }
            event.target.value = '';
        });
    } else {
        console.error('File input not found');
    }

    if (emojiIcon && emojiPickerContainer && emojiPicker) {
        emojiIcon.addEventListener('click', function (e) {
            e.stopPropagation();
            console.log('Emoji icon clicked');
            emojiPickerContainer.style.display = emojiPickerContainer.style.display === 'none' ? 'block' : 'none';
        });

        emojiPicker.addEventListener('emoji-click', function (event) {
            console.log('Emoji selected:', event.detail.unicode);
            if (messageInput) {
                messageInput.value += event.detail.unicode;
                emojiPickerContainer.style.display = 'none';
                messageInput.focus();
            }
        });

        document.addEventListener('click', function (event) {
            if (!emojiIcon.contains(event.target) && !emojiPickerContainer.contains(event.target)) {
                emojiPickerContainer.style.display = 'none';
            }
        });
    } else {
        console.error('Emoji icon, picker container, or picker not found');
    }

    if (infoIcon && rightPanel) {
        infoIcon.addEventListener('click', function () {
            rightPanel.style.display = rightPanel.style.display === 'none' ? 'block' : 'none';
        });
    }

    if (closePhoto && photoModal) {
        closePhoto.addEventListener('click', function () {
            photoModal.style.display = 'none';
        });
    }

    if (cancelReplyButton) {
        cancelReplyButton.addEventListener('click', function () {
            replyingToMessage = null;
            document.getElementById('reply-preview').style.display = 'none';
        });
    }

    if (cancelEditButton) {
        cancelEditButton.addEventListener('click', function () {
            editingMessage = null;
            document.getElementById('edit-preview').style.display = 'none';
            document.getElementById('message-input').value = '';
        });
    }
}

function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const messageText = messageInput.value.trim();

    if (!messageInput) {
        console.error('Message input not found in sendMessage');
        return;
    }

    if (messageText === '') {
        console.log('Message is empty');
        return;
    }

    if (!currentChatContact) {
        alert('Please select a contact to send the message to.');
        return;
    }

    if (editingMessage) {
        console.log('Editing message:', editingMessage);
        const chats = JSON.parse(localStorage.getItem('chats') || '{}');
        const messages = chats[currentChatContact.index] || [];
        const messageIndex = messages.findIndex(msg => msg.fullTimestamp === editingMessage.fullTimestamp && msg.sender === 'user');
        if (messageIndex !== -1) {
            messages[messageIndex].content = messageText;
            chats[currentChatContact.index] = messages;
            localStorage.setItem('chats', JSON.stringify(chats));
            loadMessages(currentChatContact.index);
        }
        messageInput.value = '';
        editingMessage = null;
        document.getElementById('edit-preview').style.display = 'none';
        return;
    }

    if (!isOnline) {
        const message = {
            type: 'text',
            content: messageText,
            sender: 'user',
            status: 'Failed',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            fullTimestamp: new Date().toISOString(),
            replyTo: replyingToMessage ? { content: replyingToMessage.content, sender: replyingToMessage.sender } : null
        };
        console.log('Sending failed message:', message);
        addMessageToChat(message);
        saveMessage(currentChatContact.index, message);
        replyingToMessage = null;
        document.getElementById('reply-preview').style.display = 'none';
        messageInput.value = '';
        return;
    }

    const message = {
        type: 'text',
        content: messageText,
        sender: 'user',
        status: isContactOnline ? 'Delivered' : 'Sent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fullTimestamp: new Date().toISOString(),
        replyTo: replyingToMessage ? { content: replyingToMessage.content, sender: replyingToMessage.sender } : null
    };

    console.log('Sending message:', message);
    addMessageToChat(message);
    saveMessage(currentChatContact.index, message);

    setTimeout(() => {
        const receivedMessage = {
            type: 'text',
            content: 'This is a reply!',
            sender: 'contact',
            status: 'Read',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            fullTimestamp: new Date().toISOString()
        };
        addMessageToChat(receivedMessage);
        saveMessage(currentChatContact.index, receivedMessage);

        updateMessageStatus(currentChatContact.index, message.timestamp, 'Read');
    }, 2000);

    messageInput.value = '';
    replyingToMessage = null;
    document.getElementById('reply-preview').style.display = 'none';
}

function sendAttachment(file) {
    if (!currentChatContact) {
        alert('Please select a contact to send the file to.');
        return;
    }

    if (!isOnline) {
        const message = {
            type: 'text',
            content: 'Failed to send attachment: No internet connection',
            sender: 'user',
            status: 'Failed',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            fullTimestamp: new Date().toISOString(),
            replyTo: replyingToMessage ? { content: replyingToMessage.content, sender: replyingToMessage.sender } : null
        };
        addMessageToChat(message);
        saveMessage(currentChatContact.index, message);
        replyingToMessage = null;
        document.getElementById('reply-preview').style.display = 'none';
        return;
    }

    const message = {
        type: '',
        content: '',
        sender: 'user',
        status: isContactOnline ? 'Delivered' : 'Sent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fullTimestamp: new Date().toISOString(),
        replyTo: replyingToMessage ? { content: replyingToMessage.content, sender: replyingToMessage.sender } : null
    };

    const reader = new FileReader();
    reader.onload = function (e) {
        const dataUrl = e.target.result;

        if (file.type.startsWith('image/')) {
            message.type = 'image';
            message.content = dataUrl;
        } else if (file.type.startsWith('video/')) {
            message.type = 'video';
            message.content = dataUrl;
        } else {
            message.type = 'document';
            message.content = file.name;
            message.fileData = dataUrl;
            message.fileType = file.type;
        }

        console.log('Sending attachment:', message);
        addMessageToChat(message);
        saveMessage(currentChatContact.index, message);

        setTimeout(() => {
            const receivedMessage = {
                type: 'text',
                content: 'Got it!',
                sender: 'contact',
                status: 'Read',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                fullTimestamp: new Date().toISOString()
            };
            addMessageToChat(receivedMessage);
            saveMessage(currentChatContact.index, receivedMessage);

            updateMessageStatus(currentChatContact.index, message.timestamp, 'Read');
        }, 2000);

        replyingToMessage = null;
        document.getElementById('reply-preview').style.display = 'none';
    };
    reader.onerror = function () {
        console.error('Error reading file:', file.name);
        alert('Failed to read the file. Please try again.');
    };
    reader.readAsDataURL(file);
}

function addMessageToChat(message) {
    const chatBody = document.getElementById('chat-body');
    if (!chatBody) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.sender === 'user' ? 'sent' : 'received'}`;
    if (message.replyTo) messageDiv.classList.add('reply');
    messageDiv.dataset.timestamp = message.timestamp;

    const dropdownIcon = document.createElement('img');
    dropdownIcon.src = 'images/dropdown.png';
    dropdownIcon.className = 'dropdown-icon';
    dropdownIcon.alt = 'Options';
    messageDiv.appendChild(dropdownIcon);

    const messageMenu = document.createElement('div');
    messageMenu.className = 'message-menu';
    const menuList = document.createElement('ul');

    const canEdit = message.sender === 'user' && isWithinEditTimeLimit(message.fullTimestamp);

    if (message.sender === 'user') {
        let menuItems = `
            <li class="copy-message"><img src="images/copy.png" alt="Copy"> Copy</li>
            ${canEdit ? '<li class="edit-message"><img src="images/edit.png" alt="Edit"> Edit</li>' : ''}
            <li class="delete-message"><img src="images/delete.png" alt="Delete"> Delete</li>
            <li class="reply-message"><img src="images/reply.png" alt="Reply"> Reply</li>
        `;
        menuList.innerHTML = menuItems;
    } else {
        menuList.innerHTML = `
            <li class="copy-message"><img src="images/copy.png" alt="Copy"> Copy</li>
            <li class="reply-message"><img src="images/reply.png" alt="Reply"> Reply</li>
        `;
    }
    messageMenu.appendChild(menuList);
    messageDiv.appendChild(messageMenu);

    dropdownIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.message-menu').forEach(menu => {
            if (menu !== messageMenu) menu.classList.remove('active');
        });
        messageMenu.classList.toggle('active');
        adjustMenuPosition(messageDiv, messageMenu);
    });

    menuList.querySelectorAll('li').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = item.className;
            handleMessageAction(action, message, messageDiv);
            messageMenu.classList.remove('active');
        });
    });

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    if (message.replyTo) {
        const replyReference = document.createElement('div');
        replyReference.className = 'reply-reference';
        replyReference.innerHTML = `
            <span class="reply-contact-name">${message.replyTo.sender === 'user' ? 'You' : currentChatContact.name}</span>
            <p class="reply-text">${message.replyTo.content}</p>
        `;
        contentDiv.appendChild(replyReference);
    }

    if (message.type === 'text') {
        contentDiv.insertAdjacentHTML('beforeend', message.content);
    } else if (message.type === 'image') {
        const img = document.createElement('img');
        img.src = message.content;
        img.alt = 'Chat image';
        img.addEventListener('click', function () {
            const photoModal = document.getElementById('photo-modal');
            const fullScreenPhoto = document.getElementById('full-screen-photo');
            if (photoModal && fullScreenPhoto) {
                fullScreenPhoto.src = this.src;
                photoModal.style.display = 'flex';
            }
        });
        contentDiv.appendChild(img);
    } else if (message.type === 'video') {
        const video = document.createElement('video');
        video.src = message.content;
        video.controls = true;
        contentDiv.appendChild(video);
    } else if (message.type === 'document') {
        const docDiv = document.createElement('div');
        docDiv.className = 'document';
        const icon = document.createElement('img');
        icon.src = 'images/download.png';
        icon.alt = 'Download';
        const link = document.createElement('a');
        link.href = message.fileData;
        link.download = message.content;
        link.textContent = message.content;
        link.setAttribute('data-filetype', message.fileType);
        docDiv.appendChild(icon);
        docDiv.appendChild(link);
        contentDiv.appendChild(docDiv);
    }

    messageDiv.appendChild(contentDiv);

    const metaDiv = document.createElement('div');
    metaDiv.className = 'message-meta';

    const timestampSpan = document.createElement('span');
    timestampSpan.className = 'timestamp';
    timestampSpan.textContent = message.timestamp;
    metaDiv.appendChild(timestampSpan);

    if (message.sender === 'user') {
        if (message.status === 'Failed') {
            const noInternetIcon = document.createElement('img');
            noInternetIcon.src = 'images/no-internet.png';
            noInternetIcon.className = 'no-internet-icon';
            noInternetIcon.alt = 'No Internet';
            metaDiv.appendChild(noInternetIcon);
        } else {
            const statusDiv = document.createElement('div');
            statusDiv.className = 'status-ticks';
            const statusIcon = document.createElement('img');
            if (message.status === 'Sent') {
                statusIcon.src = 'images/single-tick-gray.png';
            } else if (message.status === 'Delivered') {
                statusIcon.src = 'images/double-tick-gray.png';
            } else if (message.status === 'Read') {
                statusIcon.src = 'images/double-tick-green.png';
                const seenText = document.createElement('span');
                seenText.className = 'seen-text';
                seenText.textContent = 'Seen just now';
                metaDiv.appendChild(seenText);
            }
            statusDiv.appendChild(statusIcon);
            metaDiv.appendChild(statusDiv);
        }
    }

    messageDiv.appendChild(metaDiv);

    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Выносим обработчик закрытия меню за пределы addMessageToChat
document.addEventListener('click', (event) => {
    const messageMenus = document.querySelectorAll('.message-menu');
    messageMenus.forEach(menu => {
        const dropdownIcon = menu.parentElement.querySelector('.dropdown-icon');
        if (!dropdownIcon.contains(event.target) && !menu.contains(event.target)) {
            menu.classList.remove('active');
        }
    });
});

function adjustMenuPosition(messageDiv, messageMenu) {
    const messageRect = messageDiv.getBoundingClientRect();
    const chatBodyRect = document.getElementById('chat-body').getBoundingClientRect();
    const menuRect = messageMenu.getBoundingClientRect();

    if (messageDiv.classList.contains('sent')) {
        messageMenu.style.right = 'auto';
        messageMenu.style.left = `-${menuRect.width + 10}px`;
    } else {
        messageMenu.style.left = 'auto';
        messageMenu.style.right = `-${menuRect.width + 10}px`;
    }

    if (messageRect.top - chatBodyRect.top + menuRect.height > chatBodyRect.height) {
        messageMenu.style.top = 'auto';
        messageMenu.style.bottom = '0';
    } else {
        messageMenu.style.top = '10px';
        messageMenu.style.bottom = 'auto';
    }
}

function showCopyNotification() {
    const notification = document.getElementById('copy-notification');
    if (notification) {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }
}

function isWithinEditTimeLimit(fullTimestamp) {
    const messageTime = new Date(fullTimestamp).getTime();
    const currentTime = new Date().getTime();
    const timeDiff = (currentTime - messageTime) / 1000 / 60;
    return timeDiff <= 15;
}

function handleMessageAction(action, message, messageDiv) {
    if (action === 'copy-message') {
        navigator.clipboard.writeText(message.type === 'text' ? message.content : message.fileData || message.content).then(() => {
            showCopyNotification();
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    } else if (action === 'edit-message' && message.sender === 'user') {
        editingMessage = message;
        const editPreview = document.getElementById('edit-preview');
        const editText = document.getElementById('edit-text');
        editText.textContent = 'Редактирование сообщения';
        editPreview.style.display = 'flex';

        const messageInput = document.getElementById('message-input');
        messageInput.value = message.content;
        messageInput.focus();
    } else if (action === 'delete-message' && message.sender === 'user') {
        const chats = JSON.parse(localStorage.getItem('chats') || '{}');
        const messages = chats[currentChatContact.index] || [];
        const messageIndex = messages.findIndex(msg => msg.timestamp === message.timestamp && msg.sender === 'user');
        if (messageIndex !== -1) {
            messages.splice(messageIndex, 1);
            chats[currentChatContact.index] = messages;
            localStorage.setItem('chats', JSON.stringify(chats));
            loadMessages(currentChatContact.index);
        }
    } else if (action === 'reply-message') {
        replyingToMessage = message;
        const replyPreview = document.getElementById('reply-preview');
        const replyContactName = document.getElementById('reply-contact-name');
        const replyText = document.getElementById('reply-text');

        replyContactName.textContent = message.sender === 'user' ? 'You' : currentChatContact.name;
        replyText.textContent = message.content;
        replyPreview.style.display = 'flex';

        const messageInput = document.getElementById('message-input');
        messageInput.focus();
    }
}

function updateMessageStatus(contactIndex, timestamp, newStatus) {
    const chats = JSON.parse(localStorage.getItem('chats') || '{}');
    const messages = chats[contactIndex] || [];
    const messageIndex = messages.findIndex(msg => msg.timestamp === timestamp && msg.sender === 'user');
    if (messageIndex !== -1) {
        messages[messageIndex].status = newStatus;
        chats[contactIndex] = messages;
        localStorage.setItem('chats', JSON.stringify(chats));
        loadMessages(contactIndex);
    }
}

function saveMessage(contactIndex, message) {
    const chats = JSON.parse(localStorage.getItem('chats') || '{}');
    if (!chats[contactIndex]) {
        chats[contactIndex] = [];
    }
    chats[contactIndex].push(message);
    localStorage.setItem('chats', JSON.stringify(chats));
}

function loadMessages(contactIndex) {
    const chats = JSON.parse(localStorage.getItem('chats') || '{}');
    const messages = chats[contactIndex] || [];
    const chatBody = document.getElementById('chat-body');
    if (chatBody) {
        chatBody.innerHTML = '';
        messages.forEach(message => addMessageToChat(message));
    }
}

function setupEventListeners() {
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase();
            if (searchTerm.length > 0) {
                filterSidebarItems(searchTerm);
            } else {
                resetSidebarFilters();
            }
        });
    }

    window.addEventListener('message', handleModalMessage);
}

function handleModalMessage(event) {
    console.log('Message received:', event.data);

    if (event.data === 'closeContactModal' || event.data === 'closeGroupModal' || event.data === 'closeProfileModal' || event.data === 'closeSelectContactModal') {
        const modal = document.getElementById('contactModal') || document.getElementById('groupModal') || document.getElementById('profileModal') || document.getElementById('selectContactModal');
        if (modal) {
            document.body.removeChild(modal);
            document.body.style.overflow = '';
        }
    }

    if (event.data === 'refreshChatList') {
        loadChatsInSidebar();
    }

    if (event.data && event.data.type === 'requestUserData') {
        const userData = JSON.parse(localStorage.getItem('userProfile') || {
            name: 'Nurtilek Abibillaev',
            email: 'nurtilek@example.com',
            password: '',
            avatar: 'images/avatar.png'
        });
        const modal = document.getElementById('profileModal');
        if (modal) {
            const iframe = modal.querySelector('iframe');
            iframe.contentWindow.postMessage({ type: 'userData', data: userData }, '*');
        }
    }

    if (event.data && event.data.type === 'updateUserProfile') {
        const userData = event.data.data;
        updateProfileSection(userData);
    }

    if (event.data && event.data.type === 'toggleTheme') {
        const isDarkTheme = event.data.isDarkTheme;
        localStorage.setItem('darkTheme', isDarkTheme);
        if (isDarkTheme) {
            document.body.classList.add('dark-theme');
            document.querySelector('.theme-icon').src = 'images/sun.png';
        } else {
            document.body.classList.remove('dark-theme');
            document.querySelector('.theme-icon').src = 'images/moon.png';
        }
    }
}

function updateProfileSection(userData) {
    const userInfo = document.querySelector('.user-info');
    const userAvatar = document.querySelector('.user-avatar img');
    if (userInfo && userAvatar) {
        userInfo.querySelector('h3').textContent = userData.name;
        userInfo.querySelector('.user-email').textContent = userData.email;
        userAvatar.src = userData.avatar;
    }
}

function showChatView() {
    const chatContainer = document.querySelector('.chat-container');
    if (!chatContainer) return;

    const chatAppLogo = document.querySelector('.chat-app-logo');
    const chatView = document.querySelector('.chat-view');

    if (currentChatContact) {
        chatAppLogo.style.display = 'none';
        chatView.style.display = 'flex';

        document.getElementById('chat-contact-name').textContent = currentChatContact.name;
        document.getElementById('chat-contact-avatar').src = currentChatContact.photo || 'images/avatar.png';
        document.getElementById('chat-contact-status').textContent = isContactOnline ? 'Online' : 'Last seen recently';

        loadMessages(currentChatContact.index);
    } else {
        chatAppLogo.style.display = 'flex';
        chatView.style.display = 'none';
    }
}

function loadChatsInSidebar() {
    const sidebarChats = document.querySelector('.chats-list');
    const sidebarContacts = document.querySelector('.contacts-list');
    const sidebarGroups = document.querySelector('.groups-list');

    if (sidebarChats) {
        sidebarChats.innerHTML = '';
        const savedContacts = JSON.parse(localStorage.getItem('chatContacts') || '[]');
        savedContacts.forEach((contact, index) => {
            const chatItem = createContactElement(contact, index);
            chatItem.classList.add('contact-chat-item');
            chatItem.dataset.id = index;
            chatItem.addEventListener('click', () => {
                if (!isSelectionMode) {
                    currentChatContact = {
                        index: index,
                        name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
                        photo: contact.photo
                    };
                    showChatView();
                }
            });
            sidebarChats.appendChild(chatItem);
        });

        const savedGroups = JSON.parse(localStorage.getItem('chatGroups') || '[]');
        savedGroups.forEach((group, index) => {
            const chatItem = createGroupElement(group);
            chatItem.classList.add('group-chat-item');
            chatItem.dataset.id = index;
            sidebarChats.appendChild(chatItem);
        });

        if (savedContacts.length === 0 && savedGroups.length === 0) {
            sidebarChats.innerHTML = '<div class="no-items">No chats available</div>';
        }
    }

    if (sidebarContacts) {
        loadContactsToSidebar(sidebarContacts);
    }

    if (sidebarGroups) {
        loadGroupsToSidebar(sidebarGroups);
    }

    const selectionActions = document.querySelector('.selection-actions');
    const checkboxes = document.querySelectorAll('.contact-checkbox');
    if (isSelectionMode) {
        selectionActions.style.display = 'flex';
        checkboxes.forEach(checkbox => {
            checkbox.style.display = 'inline-block';
        });
    } else {
        selectionActions.style.display = 'none';
        checkboxes.forEach(checkbox => {
            checkbox.style.display = 'none';
            checkbox.checked = false;
        });
    }
}

function loadContactsToSidebar(container) {
    const contacts = JSON.parse(localStorage.getItem('chatContacts') || '[]');
    container.innerHTML = '';
    if (contacts.length === 0) {
        container.innerHTML = '<div class="no-items">No contacts available</div>';
        return;
    }
    contacts.forEach((contact, index) => {
        const contactElement = createContactElement(contact, index);
        container.appendChild(contactElement);
    });
}

function loadGroupsToSidebar(container) {
    const groups = JSON.parse(localStorage.getItem('chatGroups') || '[]');
    container.innerHTML = '';
    if (groups.length === 0) {
        container.innerHTML = '<div class="no-items">No groups available</div>';
        return;
    }
    groups.forEach((group, index) => {
        const groupElement = createGroupElement(group, index);
        container.appendChild(groupElement);
    });
}

function createContactElement(contact, index) {
    const contactDiv = document.createElement('div');
    contactDiv.className = 'contact-item';

    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
    const photo = contact.photo || 'images/avatar.png';

    contactDiv.innerHTML = `
        <input type="checkbox" class="contact-checkbox" data-index="${index}" style="display: none;">
        <div class="contact-avatar">
            <img src="${photo}" alt="${fullName}">
        </div>
        <div class="contact-info">
            <div class="contact-name">${fullName}</div>
        </div>
    `;

    return contactDiv;
}

function createGroupElement(group) {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'group-item';

    const photo = group.photo || 'images/group-icon.png';

    groupDiv.innerHTML = `
        <div class="group-avatar">
            <img src="${photo}" alt="${group.name}">
        </div>
        <div class="group-info">
            <div class="group-name">${group.name}</div>
        </div>
    `;

    return groupDiv;
}

function filterSidebarItems(searchTerm) {
    const chatItems = document.querySelectorAll('.contact-item, .group-item');

    chatItems.forEach(item => {
        const nameElement = item.querySelector('.contact-name, .group-name');
        if (nameElement) {
            const name = nameElement.textContent.toLowerCase();
            if (name.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        }
    });
}

function resetSidebarFilters() {
    const chatItems = document.querySelectorAll('.contact-item, .group-item');
    chatItems.forEach(item => {
        item.style.display = 'flex';
    });
}

function activateSection(section) {
    document.querySelectorAll('.section').forEach(el => {
        el.classList.remove('active');
    });

    const activeSection = document.querySelector(`.section[data-section="${section}"]`);
    if (activeSection) {
        activeSection.classList.add('active');
    }
}

function openModal(url, modalId) {
    const modalOverlay = document.createElement('div');
    modalOverlay.id = modalId;
    modalOverlay.className = 'modal-overlay';

    modalOverlay.innerHTML = `
        <div class="modal-container">
            <iframe src="${url}" frameborder="0"></iframe>
        </div>
    `;

    document.body.appendChild(modalOverlay);
    document.body.style.overflow = 'hidden';

    const iframe = modalOverlay.querySelector('iframe');
    iframe.addEventListener('load', () => {
        const isDarkTheme = localStorage.getItem('darkTheme') === 'true';
        iframe.contentWindow.postMessage({ type: 'toggleTheme', isDarkTheme }, '*');
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

        const modals = document.querySelectorAll('.modal-overlay iframe');
        modals.forEach(iframe => {
            iframe.contentWindow.postMessage({ type: 'toggleTheme', isDarkTheme }, '*');
        });
    });
}