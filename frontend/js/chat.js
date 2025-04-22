document.addEventListener('DOMContentLoaded', function () {
    console.log('Main app initialized');

    // Set up UI components
    setupTopMenu();
    setupSidebar();
    setupMainView();
    setupEventListeners();
    setupChatInterface();

    // Initialize with default view (chats)
    showChatView();

    // Load contacts and groups into sidebar
    loadChatsInSidebar();

    // Theme handling
    initializeTheme();
});

// Global state for selection mode and current chat
let isSelectionMode = false;
let currentChatContact = null;

// Set up the top menu components
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

// Toggle selection mode
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
            checkbox.checked = false; // Reset selection
        });
    }
}

// Delete selected contacts
function deleteSelectedContacts() {
    const checkboxes = document.querySelectorAll('.contact-checkbox:checked');
    const indices = Array.from(checkboxes).map(checkbox => parseInt(checkbox.dataset.index));

    if (indices.length === 0) {
        alert('Please select at least one contact to delete.');
        return;
    }

    let contacts = JSON.parse(localStorage.getItem('chatContacts') || '[]');
    indices.sort((a, b) => b - a); // Sort descending to avoid index issues
    indices.forEach(index => {
        contacts.splice(index, 1);
    });
    localStorage.setItem('chatContacts', JSON.stringify(contacts));
    loadChatsInSidebar();
    toggleSelectionMode(); // Exit selection mode after deletion
}

// Set up sidebar navigation
function setupSidebar() {
    // Add click event for contacts and groups icons
    const contactsIcon = document.getElementById('contacts-icon');
    const groupsIcon = document.getElementById('groups-icon');

    if (contactsIcon) {
        contactsIcon.addEventListener('click', function () {
            openModal('newContact.html', 'contactModal');
            activateSection('chats'); // Stay on chats section
        });
    }

    if (groupsIcon) {
        groupsIcon.addEventListener('click', function () {
            openModal('newGroup.html', 'groupModal');
            activateSection('chats'); // Stay on chats section
        });
    }

    // Add click event for contacts to open chat
    loadChatsInSidebar(); // Ensure contacts are loaded to attach listeners

    // Add event listener for delete button
    const deleteButton = document.getElementById('delete-selected');
    if (deleteButton) {
        deleteButton.addEventListener('click', deleteSelectedContacts);
    }

    // Add event listener for cancel button
    const cancelButton = document.getElementById('cancel-selection');
    if (cancelButton) {
        cancelButton.addEventListener('click', toggleSelectionMode);
    }
}

// Set up main content area
function setupMainView() {
    // This function is now handled in setupSidebar for the icons
}

// Set up chat interface
function setupChatInterface() {
    const sendButton = document.getElementById('send-button');
    const messageInput = document.getElementById('message-input');
    const attachIcon = document.getElementById('attach-icon');
    const fileInput = document.getElementById('file-input');
    const emojiIcon = document.getElementById('emoji-icon');
    const emojiPickerContainer = document.getElementById('emoji-picker-container');
    const emojiPicker = document.getElementById('emoji-picker');
    const infoIcon = document.getElementById('info-icon');
    const rightPanel = document.getElementById('right-panel');

    // Send message on button click
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }

    // Send message on Enter key
    if (messageInput) {
        messageInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // Trigger file input on attach icon click
    if (attachIcon && fileInput) {
        attachIcon.addEventListener('click', function () {
            fileInput.click();
        });
    }

    // Handle file attachment
    if (fileInput) {
        fileInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                sendAttachment(file);
            }
            this.value = ''; // Reset file input
        });
    }

    // Emoji picker functionality
    if (emojiIcon && emojiPickerContainer && emojiPicker) {
        emojiIcon.addEventListener('click', function (e) {
            e.stopPropagation();
            emojiPickerContainer.style.display = emojiPickerContainer.style.display === 'none' ? ' religblock' : 'none';
        });

        emojiPicker.addEventListener('emoji-click', function (event) {
            if (messageInput) {
                messageInput.value += event.detail.unicode;
                emojiPickerContainer.style.display = 'none';
            }
        });

        // Close emoji picker when clicking outside
        document.addEventListener('click', function (event) {
            if (!emojiIcon.contains(event.target) && !emojiPickerContainer.contains(event.target)) {
                emojiPickerContainer.style.display = 'none';
            }
        });
    }

    // Toggle right panel
    if (infoIcon && rightPanel) {
        infoIcon.addEventListener('click', function () {
            rightPanel.style.display = rightPanel.style.display === 'none' ? 'block' : 'none';
        });
    }
}

// Send a text message
function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const messageText = messageInput.value.trim();

    if (messageText === '' || !currentChatContact) return;

    const message = {
        type: 'text',
        content: messageText,
        sender: 'user',
        status: 'Sent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    addMessageToChat(message);
    saveMessage(currentChatContact.index, message);

    // Simulate received message (for demo purposes)
    setTimeout(() => {
        const receivedMessage = {
            type: 'text',
            content: 'This is a reply!',
            sender: 'contact',
            status: 'Read',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        addMessageToChat(receivedMessage);
        saveMessage(currentChatContact.index, receivedMessage);
    }, 1000);

    messageInput.value = '';
}

// Send an attachment (photo, video, document)
function sendAttachment(file) {
    if (!currentChatContact) return;

    const message = {
        type: '',
        content: '',
        sender: 'user',
        status: 'Sent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const reader = new FileReader();
    reader.onload = function (e) {
        if (file.type.startsWith('image/')) {
            message.type = 'image';
            message.content = e.target.result;
        } else if (file.type.startsWith('video/')) {
            message.type = 'video';
            message.content = e.target.result;
        } else {
            // Handle all other file types as documents
            message.type = 'document';
            message.content = file.name;
            message.fileData = e.target.result; // Store file data for download
        }

        addMessageToChat(message);
        saveMessage(currentChatContact.index, message);

        // Simulate received message (for demo purposes)
        setTimeout(() => {
            const receivedMessage = {
                type: 'text',
                content: 'Got it!',
                sender: 'contact',
                status: 'Read',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            addMessageToChat(receivedMessage);
            saveMessage(currentChatContact.index, receivedMessage);
        }, 1000);
    };
    reader.onerror = function () {
        console.error('Error reading file:', file.name);
    };
    reader.readAsDataURL(file);
}

// Add message to chat body
function addMessageToChat(message) {
    const chatBody = document.getElementById('chat-body');
    if (!chatBody) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.sender === 'user' ? 'sent' : 'received'}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    if (message.type === 'text') {
        contentDiv.textContent = message.content;
    } else if (message.type === 'image') {
        const img = document.createElement('img');
        img.src = message.content;
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
        icon.src = 'chat-app/frontend/images/dowload.png';
        icon.alt = 'Download';
        const link = document.createElement('a');
        link.href = message.fileData || '#';
        link.download = message.content;
        link.textContent = message.content;
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

    const statusDiv = document.createElement('div');
    statusDiv.className = 'status-ticks';
    const statusIcon = document.createElement('img');
    if (message.sender === 'user') {
        if (message.status === 'Sent') {
            statusIcon.src = 'chat-app/frontend/images/single-tick.png'; // Single tick for sent
        } else if (message.status === 'Delivered') {
            statusIcon.src = 'chat-app/frontend/images/double-tick.png'; // Double tick for delivered
        } else if (message.status === 'Read') {
            statusIcon.src = 'chat-app/frontend/images/double-tick-read.png'; // Double blue tick for read
        }
    }
    statusDiv.appendChild(statusIcon);
    metaDiv.appendChild(statusDiv);

    messageDiv.appendChild(metaDiv);

    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight; // Scroll to bottom
}

// Save message to localStorage
function saveMessage(contactIndex, message) {
    const chats = JSON.parse(localStorage.getItem('chats') || '{}');
    if (!chats[contactIndex]) {
        chats[contactIndex] = [];
    }
    chats[contactIndex].push(message);
    localStorage.setItem('chats', JSON.stringify(chats));
}

// Load messages for a contact
function loadMessages(contactIndex) {
    const chats = JSON.parse(localStorage.getItem('chats') || '{}');
    const messages = chats[contactIndex] || [];
    const chatBody = document.getElementById('chat-body');
    if (chatBody) {
        chatBody.innerHTML = '';
        messages.forEach(message => addMessageToChat(message));
    }
}

// Set up general event listeners
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

    // Listen for messages from modal iframes
    window.addEventListener('message', handleModalMessage);
}

// Handle messages from iframes
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
            avatar: 'chat-app/frontend/images/avatar.png'
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
}

// Update profile section in the sidebar
function updateProfileSection(userData) {
    const userInfo = document.querySelector('.user-info');
    const userAvatar = document.querySelector('.user-avatar img');
    if (userInfo && userAvatar) {
        userInfo.querySelector('h3').textContent = userData.name;
        userInfo.querySelector('.user-email').textContent = userData.email;
        userAvatar.src = userData.avatar;
    }
}

// Show chats view in main area
function showChatView() {
    const chatContainer = document.querySelector('.chat-container');
    if (!chatContainer) return;

    const chatAppLogo = document.querySelector('.chat-app-logo');
    const chatView = document.querySelector('.chat-view');

    if (currentChatContact) {
        chatAppLogo.style.display = 'none';
        chatView.style.display = 'flex';

        // Update chat header with contact info
        document.getElementById('chat-contact-name').textContent = currentChatContact.name;
        document.getElementById('chat-contact-avatar').src = currentChatContact.photo || 'chat-app/frontend/images/avatar.png';
        document.getElementById('chat-contact-status').textContent = 'Last seen recently';

        // Load messages
        loadMessages(currentChatContact.index);
    } else {
        chatAppLogo.style.display = 'flex';
        chatView.style.display = 'none';
    }
}

// Load chats/contacts/groups in the sidebar
function loadChatsInSidebar() {
    const sidebarChats = document.querySelector('.chats-list');
    const sidebarContacts = document.querySelector('.contacts-list');
    const sidebarGroups = document.querySelector('.groups-list');

    // Load chats (contacts and groups combined)
    if (sidebarChats) {
        sidebarChats.innerHTML = '';
        const savedContacts = JSON.parse(localStorage.getItem('chatContacts') || '[]');
        savedContacts.forEach((contact, index) => {
            const chatItem = createContactElement(contact, index);
            chatItem.classList.add('contact-chat-item');
            chatItem.dataset.id = index;
            // Add click event to open chat
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

    // Load contacts section
    if (sidebarContacts) {
        loadContactsToSidebar(sidebarContacts);
    }

    // Load groups section
    if (sidebarGroups) {
        loadGroupsToSidebar(sidebarGroups);
    }

    // Reset selection mode UI
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

// Load contacts into the sidebar
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

// Load groups into the sidebar
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

// Create contact element with checkbox
function createContactElement(contact, index) {
    const contactDiv = document.createElement('div');
    contactDiv.className = 'contact-item';

    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
    const photo = contact.photo || 'chat-app/frontend/images/avatar.png';

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

// Create group element
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

// Filter sidebar items based on search term
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

// Reset sidebar filters
function resetSidebarFilters() {
    const chatItems = document.querySelectorAll('.contact-item, .group-item');
    chatItems.forEach(item => {
        item.style.display = 'flex';
    });
}

// Function to change active section in sidebar
function activateSection(section) {
    document.querySelectorAll('.section').forEach(el => {
        el.classList.remove('active');
    });

    const activeSection = document.querySelector(`.section[data-section="${section}"]`);
    if (activeSection) {
        activeSection.classList.add('active');
    }
}

// Function to handle opening modals
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
}

// Initialize theme
function initializeTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    if (typeof lottie !== 'undefined') {
        const themeAnimation = lottie.loadAnimation({
            container: themeToggle,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            path: 'images/Switch-Theme.lottie'
        });

        let isDarkTheme = localStorage.getItem('darkTheme') === 'true';

        if (isDarkTheme) {
            document.body.classList.add('dark-theme');
            themeAnimation.goToAndStop(themeAnimation.totalFrames - 1, true);
        }

        themeToggle.addEventListener('click', function () {
            isDarkTheme = !isDarkTheme;
            localStorage.setItem('darkTheme', isDarkTheme);

            if (isDarkTheme) {
                document.body.classList.add('dark-theme');
                themeAnimation.playSegments([0, themeAnimation.totalFrames], true);
            } else {
                document.body.classList.remove('dark-theme');
                themeAnimation.playSegments([themeAnimation.totalFrames, 0], true);
            }
        });
    }
}