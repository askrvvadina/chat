document.addEventListener('DOMContentLoaded', function () {
    console.log('Chat.js loaded');
    
    // Инициализируем UI и обработчики событий
    initializeUI(
        function setupEmojiPanel() {
            const emojiButton = document.getElementById('emojiButton');
            const emojiPanel = document.getElementById('emojiPanel');

            if (emojiButton && emojiPanel) {
                emojiButton.addEventListener('click', function (e) {
                    e.stopPropagation(); // Предотвращаем закрытие при клике на кнопку

                    // Правильно переключаем отображение
                    if (emojiPanel.style.display === 'block') {
                        emojiPanel.style.display = 'none';
                    } else {
                        emojiPanel.style.display = 'block';

                        // Позиционируем правильно
                        const inputContainer = document.querySelector('.message-input-container');
                        if (inputContainer) {
                            const rect = inputContainer.getBoundingClientRect();
                            emojiPanel.style.bottom = (window.innerHeight - rect.top + 10) + 'px';
                            emojiPanel.style.left = '15px';
                        }
                    }
                });

                // Закрываем панель при клике вне неё
                document.addEventListener('click', function (e) {
                    if (!emojiPanel.contains(e.target) && e.target !== emojiButton) {
                        emojiPanel.style.display = 'none';
                    }
                });

                // Обработчики для эмодзи
                document.querySelectorAll('.emoji').forEach(emoji => {
                    emoji.addEventListener('click', function (e) {
                        e.stopPropagation();
                        const messageInput = document.querySelector('.message-input');
                        if (messageInput) {
                            messageInput.value += this.textContent;
                            messageInput.focus();
                            
                        }
                    });
                });
            }
        }
    );

    // Загружаем список чатов
    loadChatList();

    // Настраиваем эмодзи-панель
    setupEmojiPanel();

    // Настраиваем модальное окно блокировки
    setupBlockModal();



    // Слушаем сообщения от iframe
    window.addEventListener('message', function (event) {
        console.log('Message received:', event.data);
        
        if (event.data === 'refreshChatList') {
            loadChatList();
        } else if (event.data === 'closeContactModal' || event.data === 'closeGroupModal') {
            // Находим и удаляем открытое модальное окно
            const modalOverlay = document.querySelector('.modal-overlay');
            if (modalOverlay) {
                document.body.removeChild(modalOverlay);
            }
        }
    });
});

function initializeUI() {
    // Иконка групп
    const groupIcon = document.getElementById('groupIcon');
    if (groupIcon) {
        groupIcon.addEventListener('click', function () {
            console.log('Group icon clicked');
            openNewGroupModal();
        });
    }

    // Иконка контактов
    const contactIcon = document.getElementById('contactIcon');
    if (contactIcon) {
        contactIcon.addEventListener('click', function () {
            console.log('Contact icon clicked');
            openNewContactModal();
        });
    }
    
    // Добавляем обработчики для других элементов UI
    setupOtherUIElements();
}

function setupOtherUIElements() {
    // Кнопка информации о пользователе
    const infoButton = document.getElementById('infoButton');
    if (infoButton) {
        infoButton.addEventListener('click', function() {
            const userSidebar = document.getElementById('userSidebar');
            if (userSidebar) {
                userSidebar.style.display = 'block';
            }
        });
    }
    
    // Кнопка закрытия боковой панели
    const closeSidebar = document.getElementById('closeSidebar');
    if (closeSidebar) {
        closeSidebar.addEventListener('click', function() {
            const userSidebar = document.getElementById('userSidebar');
            if (userSidebar) {
                userSidebar.style.display = 'none';
            }
        });
    }
    
    // Кнопка меню пользователя
    const userMenuButton = document.getElementById('userMenuButton');
    if (userMenuButton) {
        userMenuButton.addEventListener('click', function() {
            const userMenu = document.getElementById('userMenu');
            if (userMenu) {
                userMenu.style.display = userMenu.style.display === 'block' ? 'none' : 'block';
            }
        });
    }
    
    // Обработчик для отправки сообщения
    const sendButton = document.querySelector('.send-button');
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }
    
    // Обработчик для отправки сообщения по Enter
    const messageInput = document.querySelector('.message-input');
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

function sendMessage() {
    const messageInput = document.querySelector('.message-input');
    if (!messageInput || !messageInput.value.trim()) return;
    
    const messagesContainer = document.querySelector('.messages-container');
    if (!messagesContainer) return;
    
    const messageContent = messageInput.value.trim();
    const messageTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    // Создаем новый элемент сообщения
    const messageElement = document.createElement('div');
    messageElement.className = 'message sent';
    messageElement.innerHTML = `
        <div class="message-content">${messageContent}</div>
        <div class="message-time">${messageTime}</div>
    `;
    
    messagesContainer.appendChild(messageElement);
    
    // Прокручиваем к новому сообщению
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Очищаем поле ввода
    messageInput.value = '';
}

function openNewGroupModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `
        display: flex;
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

    const iframe = document.createElement('iframe');
    iframe.src = 'newGroup.html';
    iframe.style.cssText = `
        border: none;
        width: 100%;
        max-width: 480px;
        height: 85vh;
        border-radius: 12px;
        background-color: white;
    `;

    modal.appendChild(iframe);
    document.body.appendChild(modal);

    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    console.log('New group modal opened');
}

function openNewContactModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `
        display: flex;
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

    const iframe = document.createElement('iframe');
    iframe.src = 'newContact.html';
    iframe.style.cssText = `
        border: none;
        width: 100%;
        max-width: 480px;
        height: 600px;
        border-radius: 12px;
        background-color: white;
    `;

    modal.appendChild(iframe);
    document.body.appendChild(modal);

    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    console.log('New contact modal opened');
}

function loadChatList() {
    const chatList = document.querySelector('.chat-list');

    if (!chatList) {
        console.error('Chat list container not found');
        return;
    }

    chatList.innerHTML = ''; // Очищаем перед обновлением

    // Загружаем контакты
    const contacts = JSON.parse(localStorage.getItem('chatContacts') || '[]');
    contacts.forEach(contact => {
        const fullName = `${contact.firstName} ${contact.lastName}`.trim();
        const item = document.createElement('div');
        item.className = 'chat-item';
        
        // Используем загруженное фото, если оно есть
        const photoSrc = contact.photo || 'images/contact-icon.png';
        
        item.innerHTML = `
            <div class="chat-avatar">
                <img src="${photoSrc}" alt="Contact">
            </div>
            <div class="chat-info">
                <div class="chat-name">${fullName}</div>
                <div class="chat-last-message">Нет сообщений</div>
            </div>
        `;
        
        // Если фото из data URL, настраиваем стили
        if (contact.photo) {
            const img = item.querySelector('img');
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.borderRadius = '50%';
            img.style.objectFit = 'cover';
        }
        
        chatList.appendChild(item);
    });

    // Загружаем группы
    const groups = JSON.parse(localStorage.getItem('chatGroups') || '[]');
    groups.forEach(group => {
        const item = document.createElement('div');
        item.className = 'chat-item';
        
        // Используем загруженное фото группы, если оно есть
        const photoSrc = group.photo || 'images/group-icon.png';
        
        item.innerHTML = `
            <div class="chat-avatar">
                <img src="${photoSrc}" alt="Group">
            </div>
            <div class="chat-info">
                <div class="chat-name">${group.name}</div>
                <div class="chat-last-message">${group.members.length} участников</div>
            </div>
        `;
        
        // Если фото из data URL, настраиваем стили
        if (group.photo) {
            const img = item.querySelector('img');
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.borderRadius = '50%';
            img.style.objectFit = 'cover';
        }
        
        chatList.appendChild(item);
    });

    console.log('Chat list updated:', { contacts: contacts.length, groups: groups.length });
    
    // Добавляем обработчики для элементов чата
    document.querySelectorAll('.chat-item').forEach(chatItem => {
        chatItem.addEventListener('click', function() {
            // Убираем активный класс у всех элементов
            document.querySelectorAll('.chat-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Добавляем активный класс выбранному элементу
            this.classList.add('active');
            
            // Обновляем заголовок чата с именем выбранного контакта/группы
            const chatName = this.querySelector('.chat-name').textContent;
            const headerName = document.querySelector('.contact-name');
            if (headerName) {
                headerName.textContent = chatName;
            }
        });
    });




    // DOM elements
    const chatItems = document.querySelectorAll('.chat-item');
    const messageInput = document.querySelector('.message-input');
    const sendButton = document.querySelector('.send-button');
    const messagesContainer = document.querySelector('.messages-container');
    const attachButton = document.getElementById('attachButton');
    const fileInput = document.getElementById('fileInput');
    const emojiButton = document.getElementById('emojiButton');
    const emojiPanel = document.getElementById('emojiPanel');
    const emojis = document.querySelectorAll('.emoji');
    
    // User menu elements
    const userMenuButton = document.getElementById('userMenuButton');
    const userMenu = document.getElementById('userMenu');
    
    // User sidebar elements
    const infoButton = document.getElementById('infoButton');
    const userSidebar = document.getElementById('userSidebar');
    const closeSidebar = document.getElementById('closeSidebar');
    
    // Block confirmation modal elements
    const blockButton = document.getElementById('blockButton');
    const modalOverlay = document.getElementById('modalOverlay');
    const cancelBlock = document.getElementById('cancelBlock');
    const confirmBlock = document.getElementById('confirmBlock');

    // Shared media storage
    const sharedMedia = {
        photos: [],
        videos: [],
        files: [],
        documents: []
    };

    // Chat item selection
    chatItems.forEach(item => {
        item.addEventListener('click', function () {
           
            // Remove active class from all chat items
            chatItems.forEach(chat => chat.classList.remove('active'));
            
            // Add active class to the clicked item
            this.classList.add('active');
        });
    });

    // Send message functionality
    function sendMessage() {
        const messageText = messageInput.value.trim();
        
        if (messageText) {
            const messageElement = document.createElement('div');
            messageElement.className = 'message sent';
            const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            messageElement.innerHTML = `
    
            <div class="message-bubble">
        <div class="message-text">${messageText}</div>
        <div class="message-time">${currentTime}</div>
    </div>
    <div class="message-actions">
        <div class="action-menu">
            <div class="action-item" data-action="edit">
                <img src="images/edit.png" alt="Edit" class="action-icon">
                Edit
            </div>
            <div class="action-item" data-action="copy">
                <img src="images/copy.png" alt="Copy" class="action-icon">
                Copy
            </div>
            <div class="action-item" data-action="delete">
                <img src="images/delete.png" alt="Delete" class="action-icon">
                Delete
            </div>
        </div>
    </div>
`;

            messagesContainer.appendChild(messageElement);
            messageInput.value = '';
            
            // Scroll to the bottom of the messages container
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            // Add event listeners to new action items
            const newActionItems = messageElement.querySelectorAll('.action-item');
            addActionItemListeners(newActionItems);
            
            // Add hover effects for message actions
            addMessageActionHoverEffects(messageElement);
        }
    }

    // Send button click event
    sendButton.addEventListener('click', sendMessage);
    
    // Enter key press event on message input
    messageInput.addEventListener('keypress', function (e) {
        
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // User menu toggle
    userMenuButton.addEventListener('click', function (e) {
        e.stopPropagation();
        userMenu.style.display = userMenu.style.display === 'block' ? 'none' : 'block';
    });

    // Close user menu when clicking elsewhere
    document.addEventListener('click', function () {
        userMenu.style.display = 'none';
    });

    // User sidebar toggle
    infoButton.addEventListener('click', function () {
        userSidebar.classList.add('active');
    });

    closeSidebar.addEventListener('click', function () {
        userSidebar.classList.remove('active');
    });

    // Enhanced file handling functionality
    // Update file input to accept multiple file types
    fileInput.setAttribute('accept', '*/*');
    // Attachment button click event
    attachButton.addEventListener('click', function () {
        fileInput.click();
    });

    // File input change event with enhanced file type handling
    fileInput.addEventListener('change', function () {
        
        if (this.files && this.files[0]) {
            const file = this.files[0];
            const reader = new FileReader();
            const fileSize = formatFileSize(file.size);
            const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            reader.onload = function (e) {
               
                let messageContainer = document.createElement('div');
                messageContainer.className = 'message sent';
                const fileType = file.type;
                
                // Handle different file types
                if (fileType.startsWith('image/')) {
                    // Handle image files
                    sharedMedia.photos.push({ src: e.target.result, name: file.name, size: fileSize });
                    messageContainer.className = 'message-image-container sent';
                    messageContainer.innerHTML = `
                        <img src="${e.target.result}" alt="Uploaded Image" class="message-image">
                        <div class="message-time">${currentTime}</div>
                    `;
                }

                else if (fileType.startsWith('video/')) {
                    // Handle video files
                    sharedMedia.videos.push({ src: e.target.result, name: file.name, size: fileSize });
                    messageContainer.innerHTML = `
                        <div class="message-bubble">
                            <div class="message-video">
                                <video controls class="video-content">
                                    <source src="${e.target.result}" type="${file.type}">
                                    Your browser does not support video playback.
                                </video>
                            </div>
                            <div class="file-info">
                                <div class="file-name">${file.name}</div>
                                <div class="file-size">${fileSize}</div>
                            </div>
                            <div class="message-time">${currentTime}</div>
                        </div>
                        <div class="message-actions">
                            <div class="action-menu">
                                <div class="action-item" data-action="delete">Delete</div>
                            </div>
                        </div>
                    `;
                }

                else if (fileType.startsWith('audio/')) {
                    // Handle audio files
                    sharedMedia.files.push({ src: e.target.result, name: file.name, size: fileSize, type: 'audio' });
                    messageContainer.innerHTML = `
                        <div class="message-bubble">
                            <div class="message-audio">
                                <audio controls class="audio-content">
                                    <source src="${e.target.result}" type="${file.type}">
                                    Your browser does not support audio playback.
                                </audio>
                            </div>
                            <div class="file-info">
                                <div class="file-name">${file.name}</div>
                                <div class="file-size">${fileSize}</div>
                            </div>
                            <div class="message-time">${currentTime}</div>
                        </div>
                        <div class="message-actions">
                            <div class="action-menu">
                                <div class="action-item" data-action="delete">Delete</div>
                            </div>
                        </div>
                    `;
                }

                else {
                    // Handle document files
                    let fileIcon = '📄'; // Default document icon
                    
                    // Set appropriate icon based on file extension
                    const extension = file.name.split('.').pop().toLowerCase();
                    if (['pdf'].includes(extension)) fileIcon = '📕';
                    else if (['doc', 'docx'].includes(extension)) fileIcon = '📘';
                    else if (['xls', 'xlsx'].includes(extension)) fileIcon = '📗';
                    else if (['ppt', 'pptx'].includes(extension)) fileIcon = '📙';
                    else if (['zip', 'rar', '7z'].includes(extension)) fileIcon = '🗜️';
                    else if (['txt', 'rtf'].includes(extension)) fileIcon = '📝';
                    else if (['js', 'py', 'java', 'c', 'cpp', 'php', 'html', 'css'].includes(extension)) fileIcon = '💻';
                    
                    // Добавляем файл в хранилище
                    sharedMedia.documents.push({
                        src: URL.createObjectURL(file),  // Используем URL.createObjectURL вместо DataURL для больших файлов
                        name: file.name,
                        size: fileSize,
                        extension: extension,
                        actualFile: file  // Храним сам файл для возможности скачивания
                    });

                    messageContainer.innerHTML = `
                <div class="message-bubble">
        <div class="message-file">
            <div class="file-icon">${fileIcon}</div>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${fileSize}</div>
            </div>
            <button class="download-button">⬇️</button>
        </div>
        <div class="message-time">${currentTime}</div>
    </div>
    <div class="message-actions">
        <div class="action-menu">
            <div class="action-item" data-action="delete">
                <img src="images/delete.png" alt="Delete" class="action-icon">
                Delete
            </div>
        </div>
    </div>
`;

                    // Добавляем обработчик скачивания файла
                    const downloadButton = messageContainer.querySelector('.download-button');
                    
                    if (downloadButton) {
                        downloadButton.addEventListener('click', function () {
                            
                            // Создаем ссылку для скачивания
                            const downloadLink = document.createElement('a');
                            downloadLink.href = URL.createObjectURL(file);
                            downloadLink.download = file.name;
                            document.body.appendChild(downloadLink);
                            downloadLink.click();
                            document.body.removeChild(downloadLink);
                        });
                    }
                }

                messagesContainer.appendChild(messageContainer);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                
                // Add hover effects for message actions
                addMessageActionHoverEffects(messageContainer);
                
                // Add event listeners to new action items
                const newActionItems = messageContainer.querySelectorAll('.action-item');
                addActionItemListeners(newActionItems);
                
                // Update shared content in the sidebar
                updateSharedContent();
            };

            reader.readAsDataURL(file);
        }
    });

    // Helper function for file size formatting
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    }

    // Function to update shared content in the sidebar
    function updateSharedContent() {
        
        // Update shared files in user sidebar
        const sharedFilesSection = userSidebar.querySelector('.user-sections');
        
        // Clear existing content first
        const existingFiles = sharedFilesSection.querySelectorAll('.shared-file');
        existingFiles.forEach(file => file.remove());
        
        // Add recent photos and files
        let recentMedia = [];
        
        // Add most recent photo if available
        if (sharedMedia.photos.length > 0) {
            const recentPhoto = sharedMedia.photos[sharedMedia.photos.length - 1];
            recentMedia.push(`
                <div class="shared-file">
                    <div class="file-preview">
                        <img src="${recentPhoto.src}" alt="Photo" class="file-thumbnail">
                    </div>
                    <div class="file-info">
                        <div class="file-name">${recentPhoto.name}</div>
                        <img src="images/dowload.png" alt="Download" class="download-icon">
                    </div>
                </div>
            `);
        }

        // Add most recent document if available
        if (sharedMedia.documents.length > 0) {
            const recentDoc = sharedMedia.documents[sharedMedia.documents.length - 1];
            recentMedia.push(`
                <div class="shared-file">
                    <div class="file-preview document">
                        <div class="file-icon-preview">📄</div>
                    </div>
                    <div class="file-info">
                        <div class="file-name">${recentDoc.name}</div>
                        <img src="images/dowload.png" alt="Download" class="download-icon">
                    </div>
                </div>
            `);
        }

        // Add most recent video if available
        if (sharedMedia.videos.length > 0) {
            const recentVideo = sharedMedia.videos[sharedMedia.videos.length - 1];
            recentMedia.push(`
                <div class="shared-file">
                    <div class="file-preview video">
                        <div class="file-icon-preview">🎬</div>
                    </div>
                    <div class="file-info">
                        <div class="file-name">${recentVideo.name}</div>
                        <img src="images/dowload.png" alt="Download" class="download-icon">
                    </div>
                </div>
            `);
        }

        // Append media to sidebar
        if (recentMedia.length > 0) {
            const sectionDiv = document.createElement('div');
            sectionDiv.innerHTML = recentMedia.join('');
            sharedFilesSection.appendChild(sectionDiv);
        }
    }

    // Emoji button click event
    emojiButton.addEventListener('click', function (e) {
        e.stopPropagation();
        emojiPanel.style.display = emojiPanel.style.display === 'block' ? 'none' : 'block';
    });

    // Close emoji panel when clicking elsewhere
    document.addEventListener('click', function () {
        emojiPanel.style.display = 'none';
    });

    // Prevent emoji panel from closing when clicking inside it
    emojiPanel.addEventListener('click', function (e) {
        e.stopPropagation();
    });

    // Emoji selection
    emojis.forEach(emoji => {
        emoji.addEventListener('click', function () {
            messageInput.value += this.textContent;
            messageInput.focus();
        });
    });

    // Block user functionality with center modal
    blockButton.addEventListener('click', function () {
        modalOverlay.style.display = 'flex';
    });

    // Cancel block
    cancelBlock.addEventListener('click', function () {
        modalOverlay.style.display = 'none';
    });

    // Confirm block
    confirmBlock.addEventListener('click', function () {
        alert('User has been blocked');
        modalOverlay.style.display = 'none';
    });

    // Click outside modal to close
    modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) {
            modalOverlay.style.display = 'none';
        }
    });

    // Function to add listeners to action menu items
    function addActionItemListeners(items) {
        items.forEach(item => {
            item.addEventListener('click', function () {
                
                const action = this.getAttribute('data-action');
                const messageElement = this.closest('.message') || this.closest('.message-image-container');
                const messageText = messageElement.querySelector('.message-text')?.textContent || '';
                switch (action) {
                    case 'copy':
                        navigator.clipboard.writeText(messageText.trim()).then(() => {
                            // Создаем временное уведомление
                            const notification = document.createElement('div');
                            notification.className = 'copy-notification';
                            notification.textContent = 'Message copied to clipboard';
                            document.body.appendChild(notification);
                            // Автоматически убираем уведомление через 2 секунды
                            setTimeout(() => {
                                notification.style.opacity = '0';
                                setTimeout(() => notification.remove(), 300);
                            }, 2000);
                        });

                        break;
                    case 'edit':
                        // Only proceed if there's a message text element
                        if (!messageElement.querySelector('.message-text')) return;
                        
                        // Close the action menu first
                        const actionMenu = messageElement.querySelector('.message-actions');
                        if (actionMenu) {
                            actionMenu.style.display = 'none';
                        }

                        // Replace message content with editable input
                        const editInput = document.createElement('input');
                        editInput.type = 'text';
                        editInput.className = 'edit-message-input';
                        editInput.value = messageText.trim();
                        
                        // Store original text
                        const originalText = messageText.trim();
                        
                        // Replace message text with input
                        const messageTextElement = messageElement.querySelector('.message-text');
                        messageTextElement.innerHTML = '';
                        messageTextElement.appendChild(editInput);
                        
                        // Focus the input
                        editInput.focus();
                        
                        // Add a class to the message to indicate edit mode
                        messageElement.classList.add('editing');
                        
                        // Handle editing completion
                        editInput.addEventListener('keypress', function (e) {
                            if (e.key === 'Enter') {
                                const newText = this.value.trim();
                                if (newText) {
                                    messageTextElement.innerHTML = newText;
                                } else {
                                    messageTextElement.innerHTML = originalText;
                                }
                                messageElement.classList.remove('editing');
                            }
                        });

                        // Handle click outside to cancel
                        editInput.addEventListener('blur', function () {
                            const newText = this.value.trim();
                            if (newText) {
                                messageTextElement.innerHTML = newText;
                            } else {
                                messageTextElement.innerHTML = originalText;
                            }
                            messageElement.classList.remove('editing');
                        });

                        break;
                    case 'delete':
                        messageElement.remove();
                        break;
                    case 'forward':
                        alert('Forward functionality would open here');
                        break;
                }
            });
        });
    }

    // Add listeners to initial action items
    const initialActionItems = document.querySelectorAll('.action-item');
    addActionItemListeners(initialActionItems);
    
    // Function to add hover effects for message actions
    function addMessageActionHoverEffects(messageElement) {
        const actions = messageElement.querySelector('.message-actions');
        if (!actions) return;
       
        // Ensure all action menus have the correct structure and position
        ensureCorrectActionMenu(messageElement);
        
        // Remove hover events and add click event instead
        messageElement.addEventListener('click', function (e) {
            
            // Don't trigger when clicking on download button or in edit mode
            if (e.target.classList.contains('download-button') ||
                messageElement.classList.contains('editing')) {
                return;
            }

            // Hide all other open action menus first
            document.querySelectorAll('.message-actions').forEach(menu => {
                if (menu !== actions) {
                    menu.style.display = 'none';
                }
            });

            // Toggle this action menu
            actions.style.display = actions.style.display === 'block' ? 'none' : 'block';
        });

        // Close menu when clicking anywhere else on the document
        document.addEventListener('click', function (e) {
            if (!messageElement.contains(e.target)) {
                actions.style.display = 'none';
            }
        });
    }

    // New function to ensure correct action menu structure for all message types
    function ensureCorrectActionMenu(messageElement) {
        const actions = messageElement.querySelector('.message-actions');
        if (!actions) return;
        
        // Move action menu to the left side
        actions.style.right = 'auto';
        actions.style.left = '-24px';
        
        // Check if it's a photo message
        if (messageElement.classList.contains('message-image-container')) {
            
            // Make sure photo messages have a delete option with icon
            const actionMenu = actions.querySelector('.action-menu');
            
            // If no action menu, create one
            if (!actionMenu) {
                const newMenu = document.createElement('div');
                newMenu.className = 'action-menu';
                newMenu.innerHTML = `
                <div class="action-item" data-action="delete">
                    <img src="images/delete.png" alt="Delete" class="action-icon">
                    Delete
                </div>
            `;

                actions.appendChild(newMenu);
                // Add event listener to the new delete button
                const newDeleteButton = newMenu.querySelector('.action-item[data-action="delete"]');
                newDeleteButton.addEventListener('click', function () {
                    messageElement.remove();
                });
            }
        }

        // For video messages, ensure they have the delete icon
        if (messageElement.querySelector('.message-video')) {
            const deleteAction = actions.querySelector('.action-item[data-action="delete"]');
            if (deleteAction && !deleteAction.querySelector('.action-icon')) {
                deleteAction.innerHTML = `
                <img src="images/delete.png" alt="Delete" class="action-icon">
                Delete
            `;
            }
        }
    }

    // Add this to the initial setup in the DOMContentLoaded event
    // Update CSS for all message actions to position on left by default
    document.querySelectorAll('.message-actions').forEach(actions => {
        actions.style.right = 'auto';
        actions.style.left = '-24px';
    });

    // Close action menus when clicking in empty space of messages container
    messagesContainer.addEventListener('click', function (e) {
        if (e.target === messagesContainer) {
            document.querySelectorAll('.message-actions').forEach(menu => {
                menu.style.display = 'none';
            });
        }
    });

    // Update existing messages with correct action menu structure
    document.querySelectorAll('.message, .message-image-container').forEach(message => {
        ensureCorrectActionMenu(message);
    });

    // Menu item functionality
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function () {
            const action = this.textContent;
            if (action === 'Language') {
                alert('Language settings would open here');
            } else if (action === 'Edit Profile') {
                alert('Edit profile settings would open here');
            }
            userMenu.style.display = 'none';
        });
    });
};

document.addEventListener('DOMContentLoaded', function () {
    // Language switching functionality
    const languages = {
        'English': {
            searchPlaceholder: 'Search...',
            typeMessage: 'Type a message...',
            sendButton: 'Send',
            blockButton: 'Block user',
            blockConfirmHeader: 'Block User',
            blockConfirmMessage: 'Are you sure you want to block this user?',
            cancelButton: 'Cancel',
            confirmButton: 'Block',
            lastSeen: 'last seen yesterday at 21:58',
            sharedPhotos: 'Shared photos',
            sharedFiles: 'Shared files',
            copiedMessage: 'Message copied to clipboard',
            editAction: 'Edit',
            copyAction: 'Copy',
            deleteAction: 'Delete',
            languageMenu: 'Language'
        },

        'Русский': {
            searchPlaceholder: 'Поиск...',
            typeMessage: 'Введите сообщение...',
            sendButton: 'Отправить',
            blockButton: 'Заблокировать',
            blockConfirmHeader: 'Заблокировать пользователя',
            blockConfirmMessage: 'Вы уверены, что хотите заблокировать этого пользователя?',
            cancelButton: 'Отмена',
            confirmButton: 'Заблокировать',
            lastSeen: 'был(а) в сети вчера в 21:58',
            sharedPhotos: 'Общие фотографии',
            sharedFiles: 'Общие файлы',
            copiedMessage: 'Сообщение скопировано в буфер обмена',
            editAction: 'Изменить',
            copyAction: 'Копировать',
            deleteAction: 'Удалить',
            languageMenu: 'Язык'
        },

        'Кыргызча': {
            searchPlaceholder: 'Издөө...',
            typeMessage: 'Билдирүү жазыңыз...',
            sendButton: 'Жөнөтүү',
            blockButton: 'Бөгөттөө',
            blockConfirmHeader: 'Колдонуучуну бөгөттөө',
            blockConfirmMessage: 'Бул колдонуучуну бөгөттөгүңүз келеби?',
            cancelButton: 'Жокко чыгаруу',
            confirmButton: 'Бөгөттөө',
            lastSeen: 'кечээ саат 21:58 онлайн болгон',
            sharedPhotos: 'Бөлүшүлгөн сүрөттөр',
            sharedFiles: 'Бөлүшүлгөн файлдар',
            copiedMessage: 'Билдирүү буферге көчүрүлдү',
            editAction: 'Өзгөртүү',
            copyAction: 'Көчүрүү',
            deleteAction: 'Жок кылуу',
            languageMenu: 'Тил'
        }
    };

    // Default language
    let currentLanguage = 'English';
    
    // Function to update UI language
    function updateLanguage(lang) {
        if (!languages[lang]) return;
        currentLanguage = lang;
        const texts = languages[lang];
        
        // Update all text elements
        document.querySelector('.search-box input').placeholder = texts.searchPlaceholder;
        document.querySelector('.message-input').placeholder = texts.typeMessage;
        document.querySelector('.send-button').textContent = texts.sendButton;
        document.querySelector('.block-button').textContent = texts.blockButton;
        document.querySelector('.modal-header').textContent = texts.blockConfirmHeader;
        document.querySelector('.modal-body').textContent = texts.blockConfirmMessage;
        document.querySelector('.btn-cancel').textContent = texts.cancelButton;
        document.querySelector('.btn-delete').textContent = texts.confirmButton;
        document.querySelector('.last-seen').textContent = texts.lastSeen;
        
        // Update section titles
        const sectionTitles = document.querySelectorAll('.section-title');
        if (sectionTitles.length >= 2) {
            sectionTitles[0].textContent = texts.sharedPhotos;
            sectionTitles[1].textContent = texts.sharedFiles;
        }

        // Update action items
        document.querySelectorAll('.action-item[data-action="edit"]').forEach(item => {
            // Keep the existing image and add the text
            const img = item.querySelector('img');
            item.innerHTML = '';
            if (img) item.appendChild(img);
            item.appendChild(document.createTextNode(' ' + texts.editAction));
        });

        document.querySelectorAll('.action-item[data-action="copy"]').forEach(item => {
            const img = item.querySelector('img');
            item.innerHTML = '';
            if (img) item.appendChild(img);
            item.appendChild(document.createTextNode(' ' + texts.copyAction));
        });

        document.querySelectorAll('.action-item[data-action="delete"]').forEach(item => {
            const img = item.querySelector('img');
            item.innerHTML = '';
            if (img) item.appendChild(img);
            item.appendChild(document.createTextNode(' ' + texts.deleteAction));
        });

        // Update language menu item text
        const languageMenuItem = document.getElementById('languageMenuItem');
        if (languageMenuItem) {
            languageMenuItem.textContent = texts.languageMenu;
        }

        // Save language preference to local storage
        localStorage.setItem('chatLanguage', lang);
    }

    // Setup improved language menu
    function setupLanguageMenu() {
        const userMenuButton = document.getElementById('userMenuButton');
        const userMenu = document.getElementById('userMenu');
        const languageMenuItem = document.getElementById('languageMenuItem');
        if (!userMenuButton || !userMenu || !languageMenuItem) return;
        
        // Create language dropdown that stays open
        let languageDropdown = document.createElement('div');
        languageDropdown.id = 'languageDropdown';
        languageDropdown.className = 'language-dropdown';
        languageDropdown.style.cssText = `
            display: none;
            position: absolute;
            background-color: white;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            width: 150px;
            z-index: 1001;
            left: 175px;
            top: 0;
        `;

        // Add language options to the dropdown
        Object.keys(languages).forEach(lang => {
            const langOption = document.createElement('div');
            langOption.className = 'language-option';
            langOption.textContent = lang;
            langOption.style.cssText = `
                padding: 12px 15px;
                cursor: pointer;
                border-bottom: 1px solid #f0f0f0;
            `;

            langOption.onmouseover = function () {
                this.style.backgroundColor = '#f5f5f5';
            };

            langOption.onmouseout = function () {
                this.style.backgroundColor = 'white';
            };

            langOption.onclick = function (e) {
                e.stopPropagation();
                updateLanguage(lang);
                setTimeout(() => {
                    languageDropdown.style.display = 'none';
                    userMenu.style.display = 'none';
                }, 200);
            };

            languageDropdown.appendChild(langOption);
        });

        // Add the dropdown to the DOM
        document.body.appendChild(languageDropdown);
        
        // Toggle language dropdown when language menu item is clicked
        languageMenuItem.addEventListener('click', function (e) {
            e.stopPropagation();
            const menuRect = languageMenuItem.getBoundingClientRect();
            languageDropdown.style.top = menuRect.top + 'px';
            
            // Show language dropdown
            languageDropdown.style.display = 'block';
           
            // Keep parent menu open
            e.stopPropagation();
        });

        // Hide language dropdown when clicking elsewhere
        document.addEventListener('click', function (e) {
            if (!e.target.closest('#languageDropdown') &&
                !e.target.closest('#languageMenuItem')) {
                languageDropdown.style.display = 'none';
            }
        });

        // Keep parent menu open when hovering language menu item
        languageMenuItem.addEventListener('mouseenter', function () {
            const menuRect = languageMenuItem.getBoundingClientRect();
            languageDropdown.style.top = menuRect.top + 'px';
            languageDropdown.style.display = 'block';
        });

        // Add event to userMenuButton to hide language dropdown when menu is closed
        userMenuButton.addEventListener('click', function (e) {
            if (userMenu.style.display === 'none' || !userMenu.style.display) {
                languageDropdown.style.display = 'none';
            }
        });
    }

    // Initialize language functionality
    function initLanguage() {
        // Check if there's a saved language preference
        const savedLanguage = localStorage.getItem('chatLanguage');
        if (savedLanguage && languages[savedLanguage]) {
            updateLanguage(savedLanguage);
        }
        setupLanguageMenu();
    }
    // Call initialization
    initLanguage();
});

// Find the event listener for menu items and modify it:
document.addEventListener('DOMContentLoaded', function () {
    
    // Функционал пунктов меню
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function () {
            const action = this.textContent;
            
            if (action.includes('Language') || action === 'Язык' || action === 'Тил') {
                // Обработка языкового меню 
            } else if (action.includes('Edit Profile') || action === 'Редактировать профиль') {
                openProfileInModal();
            }
            const userMenu = document.getElementById('userMenu');
            if (userMenu) userMenu.style.display = 'none';
        });
    });

    // Function to open profile editor
    function openProfileEditor() {
        // Method 1: Open in new window (works better for separate HTML)
        const profileWindow = window.open('profile.html', 'profileEditor',
            'width=400,height=500,resizable=yes,scrollbars=yes');
    }

    // Load user data from localStorage if available
    function loadUserData() {
        const userData = JSON.parse(localStorage.getItem('chatAppUserData')) || {};

        // Update user name if available
        if (userData.name) {
            const userNameElements = document.querySelectorAll('.user-name');
            userNameElements.forEach(el => {
                el.textContent = userData.name;
            });
        }

        // Update avatar if available
        if (userData.avatar) {
            const userAvatars = document.querySelectorAll('.profile-avatar img, .user-profile img');
            userAvatars.forEach(avatar => {
                avatar.src = userData.avatar;
            });
        }
    }
    // Call this function when the page loads
    loadUserData();
    // ... (rest of your existing code)
});

// Menu item functionality 
const menuItems = document.querySelectorAll('.menu-item');
menuItems.forEach(item => {
    item.addEventListener('click', function () {
        const action = this.textContent;
        if (action === 'Edit Profile' || action === 'Редактировать профиль' || action === 'Профилди түзөтүү') {
            openProfileInModal();
        }
        const userMenu = document.getElementById('userMenu');
        if (userMenu) userMenu.style.display = 'none';
    });
});

// Load user data when page loads
loadUserData();
function openProfileInModal() {
    // Create modal container if it doesn't exist
    let profileModalContainer = document.getElementById('profileModalContainer');
    
    if (!profileModalContainer) {
        profileModalContainer = document.createElement('div');
        profileModalContainer.id = 'profileModalContainer';
        profileModalContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 2000;
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        document.body.appendChild(profileModalContainer);
    }

    // Create iframe for the profile editor
    profileModalContainer.innerHTML = `
        <iframe id="profileIframe" src="profile.html" style="
            width: 400px;
            height: 500px;
            border: none;
            border-radius: 15px;
            background-color: white;
        "></iframe>
    `;

    // Show the modal
    profileModalContainer.style.display = 'flex';
    
    // Close modal when clicking outside iframe
    profileModalContainer.addEventListener('click', function (e) {
        if (e.target === profileModalContainer) {
            window.closeProfileModal();
        }
    });
}

// Правильная функция для закрытия модального окна
function closeProfileModal() {
    const modalContainer = document.getElementById('profileModalContainer');
    if (modalContainer) {
        modalContainer.style.display = 'none';
    }
}

window.closeProfileModal = function () {
    const modalContainer = document.getElementById('profileModalContainer');
    if (modalContainer) {
        modalContainer.style.display = 'none';
    }
};

window.addEventListener('message', function (event) {
    console.log("Message received from iframe:", event.data);
    if (event.data === 'closeProfile') {
        window.closeProfileModal();
    } else if (event.data === 'profileSaved') {
        loadUserData();
        window.closeProfileModal();
    }
});

// Функция для загрузки данных пользователя из localStorage
function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('chatAppUserData')) || {};
    // Update user name if available
    if (userData.name) {
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(el => {
            el.textContent = userData.name;
        });
    }

    // Update avatar if available
    if (userData.avatar) {
        const userAvatars = document.querySelectorAll('.profile-avatar img, .user-profile img');
        userAvatars.forEach(avatar => {
            avatar.src = userData.avatar;
        });
    }
}

function createProfileModal() {
    // Check if modal already exists
    if (document.getElementById('profileModalDirect')) {
        return;
    }
    
    // Create the modal container
    const modalContainer = document.createElement('div');
    modalContainer.id = 'profileModalDirect';
    modalContainer.className = 'profile-modal-container';
    modalContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 2000;
        display: none;
        justify-content: center;
        align-items: center;
    `;

    // Create modal content
    modalContainer.innerHTML = `
        <div class="profile-modal" style="
            background-color: white;
            border-radius: 15px;
            padding: 20px;
            width: 350px;
            max-width: 90%;
        ">
            <div class="profile-header" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            ">
                <h2 style="margin: 0;">Edit Profile</h2>
                <button id="profileCloseBtn" style="
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                ">×</button>
            </div>
            
            <div class="avatar-section" style="
                display: flex;
                justify-content: center;
                margin-bottom: 20px;
            ">
                <div class="avatar-container" style="position: relative;">
                    <img id="profileAvatarDirect" src="images/profile.png" alt="Profile" style="
                        width: 100px;
                        height: 100px;
                        border-radius: 50%;
                        object-fit: cover;
                    ">
                    <div class="avatar-change-direct" style="
                        position: absolute;
                        bottom: 0;
                        right: 0;
                        background-color: #f0f0f0;
                        border-radius: 50%;
                        width: 30px;
                        height: 30px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        cursor: pointer;
                    ">
                        <img src="images/camera.png" alt="Change" style="width: 16px; height: 16px;">
                    </div>
                    <input type="file" id="avatarInputDirect" accept="image/*" style="display: none;">
                </div>
            </div>
            
            <div class="form-group" style="margin-bottom: 15px;">
                <label for="profileNameDirect" style="display: block; margin-bottom: 5px;">Name</label>
                <input type="text" id="profileNameDirect" style="
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    box-sizing: border-box;
                ">
            </div>
            
            <div class="form-group" style="margin-bottom: 15px;">
                <label for="profileEmailDirect" style="display: block; margin-bottom: 5px;">Email</label>
                <input type="email" id="profileEmailDirect" style="
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    box-sizing: border-box;
                ">
            </div>
            
            <div class="form-group" style="margin-bottom: 20px;">
                <label for="profilePasswordDirect" style="display: block; margin-bottom: 5px;">Password</label>
                <input type="password" id="profilePasswordDirect" style="
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    box-sizing: border-box;
                ">
            </div>
            
            <div class="button-group" style="
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            ">
                <button id="cancelButtonDirect" style="
                    padding: 8px 15px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    background: white;
                    cursor: pointer;
                ">Cancel</button>
                <button id="saveButtonDirect" style="
                    padding: 8px 15px;
                    border: none;
                    border-radius: 5px;
                    background: #4b71fa;
                    color: white;
                    cursor: pointer;
                ">Save</button>
            </div>
        </div>
    `;

    // Add modal to the page
    document.body.appendChild(modalContainer);
    // Set up event listeners
    setupProfileModalEvents();
}

// Set up all event listeners for the profile modal
function setupProfileModalEvents() {
    const modalContainer = document.getElementById('profileModalDirect');
    const closeBtn = document.getElementById('profileCloseBtn');
    const avatarChange = document.querySelector('.avatar-change-direct');
    const avatarInput = document.getElementById('avatarInputDirect');
    const cancelButton = document.getElementById('cancelButtonDirect');
    const saveButton = document.getElementById('saveButtonDirect');
    
    // Close button listener
    closeBtn.addEventListener('click', closeProfileModalDirect);
    
    // Close on click outside
    modalContainer.addEventListener('click', function (e) {
        if (e.target === modalContainer) {
            closeProfileModalDirect();
        }
    });

    // Avatar change click
    avatarChange.addEventListener('click', function () {
        avatarInput.click();
    });

    // Handle avatar file selection
    avatarInput.addEventListener('change', function () {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById('profileAvatarDirect').src = e.target.result;
            };
            reader.readAsDataURL(this.files[0]);
        }
    });

    // Cancel button
    cancelButton.addEventListener('click', closeProfileModalDirect);
    
    // Save button
    saveButton.addEventListener('click', function () {
        saveProfileDataDirect();
        closeProfileModalDirect();
    });

    // ESC key to close
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modalContainer.style.display === 'flex') {
            closeProfileModalDirect();
        }
    });
}

// Load profile data into the modal
function loadProfileDataDirect() {
    const userData = JSON.parse(localStorage.getItem('chatAppUserData')) || {};
    
    // Set values if they exist
    if (userData.name) document.getElementById('profileNameDirect').value = userData.name;
    if (userData.email) document.getElementById('profileEmailDirect').value = userData.email;
    if (userData.password) document.getElementById('profilePasswordDirect').value = userData.password;
    if (userData.avatar) document.getElementById('profileAvatarDirect').src = userData.avatar;
}

// Save profile data from the modal
function saveProfileDataDirect() {
    const userData = {
        name: document.getElementById('profileNameDirect').value.trim(),
        email: document.getElementById('profileEmailDirect').value.trim(),
        password: document.getElementById('profilePasswordDirect').value,
        avatar: document.getElementById('profileAvatarDirect').src
    };

    // Save to localStorage
    localStorage.setItem('chatAppUserData', JSON.stringify(userData));
   
    // Update UI with new data
    updateUserInterface(userData);
}

// Close the profile modal
function closeProfileModalDirect() {
    const modalContainer = document.getElementById('profileModalDirect');
    if (modalContainer) {
        modalContainer.style.display = 'none';
    }
}

// Open the profile modal
function openProfileModalDirect() {
    
    // Create modal if it doesn't exist
    createProfileModal();
    
    // Load profile data
    loadProfileDataDirect();
    
    // Show the modal
    const modalContainer = document.getElementById('profileModalDirect');
    modalContainer.style.display = 'flex';
}

// Update user interface with profile data
function updateUserInterface(userData) {
    
    // Update user name
    if (userData.name) {
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(el => {
            el.textContent = userData.name;
        });
    }

    // Update avatar
    if (userData.avatar) {
        const userAvatars = document.querySelectorAll('.profile-avatar img, .user-profile img');
        userAvatars.forEach(avatar => {
            avatar.src = userData.avatar;
        });
    }
}

// Make sure this code is added to your existing DOMContentLoaded event
// or wrap it in a new one if needed
document.addEventListener('DOMContentLoaded', function () {
    
    // Update menu item click handlers
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function () {
            const action = this.textContent;
            if (action === 'Edit Profile' || action === 'Редактировать профиль' || action === 'Профилди түзөтүү') {
                openProfileModalDirect();
            }
            const userMenu = document.getElementById('userMenu');
            if (userMenu) userMenu.style.display = 'none';
        });
    });

    // Load user data on page load
    const userData = JSON.parse(localStorage.getItem('chatAppUserData')) || {};
    updateUserInterface(userData);
});

// Получаем элементы разделов в sidebar
const sharedPhotosSection = document.querySelector('.user-sections .section:nth-child(1)');
const sharedFilesSection = document.querySelector('.user-sections .section:nth-child(2)');

// Обработчики клика для разделов
if (sharedPhotosSection) {
    sharedPhotosSection.addEventListener('click', function () {
        openMediaGallery('photos');
    });
}

if (sharedFilesSection) {
    sharedFilesSection.addEventListener('click', function () {
        openMediaGallery('files');
    });
}

// Функция для открытия галереи медиафайлов
function openMediaGallery(type) {
    // Проверяем, есть ли контент для отображения
    let mediaContent;
    let galleryTitle;
    
    if (type === 'photos') {
        mediaContent = sharedMedia.photos;
        galleryTitle = languages[currentLanguage]?.sharedPhotos || 'Shared Photos';
    
    } else if (type === 'files') {
        // Объединяем видео и документы для раздела "Files"
        mediaContent = [...sharedMedia.videos, ...sharedMedia.documents];
        galleryTitle = languages[currentLanguage]?.sharedFiles || 'Shared Files';
    }

    // Если нет контента, показываем уведомление
    if (!mediaContent || mediaContent.length === 0) {
        alert(languages[currentLanguage]?.noMediaFound || 'No media found');
        return;
    }

    // Создаем модальное окно галереи, если его еще нет
    let galleryModal = document.getElementById('mediaGalleryModal');
    if (!galleryModal) {
        galleryModal = document.createElement('div');
        galleryModal.id = 'mediaGalleryModal';
        galleryModal.className = 'media-gallery-modal';
        galleryModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 2000;
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        document.body.appendChild(galleryModal);
    }

    // Создаем содержимое галереи
    let galleryContent = `
        <div class="gallery-container" style="
            background-color: white;
            border-radius: 15px;
            width: 80%;
            max-width: 800px;
            max-height: 80%;
            overflow-y: auto;
            padding: 20px;
        ">
            <div class="gallery-header" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                position: sticky;
                top: 0;
                background-color: white;
                padding: 10px 0;
                z-index: 10;
            ">
                <h2 style="margin: 0;">${galleryTitle}</h2>
                <button id="closeGalleryBtn" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                ">×</button>
            </div>
            <div class="gallery-items" style="
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: 15px;
            ">
    `;

    // Добавляем медиафайлы в галерею
    mediaContent.forEach((item, index) => {
        if (type === 'photos') {
            
            // Отображение фотографий
            galleryContent += `
                <div class="gallery-item" style="
                    position: relative;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    aspect-ratio: 1;
                ">
                    <img src="${item.src}" alt="${item.name}" style="
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    ">
                    <div class="media-actions" style="
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        background: rgba(0,0,0,0.5);
                        display: flex;
                        justify-content: space-around;
                        padding: 8px;
                    ">
                        <button class="download-media" data-index="${index}" data-type="photo" style="
                            background: transparent;
                            border: none;
                            color: white;
                            cursor: pointer;
                        ">⬇️</button>
                        <button class="forward-media" data-index="${index}" data-type="photo" style="
                            background: transparent;
                            border: none;
                            color: white;
                            cursor: pointer;
                        ">↪️</button>
                    </div>
                </div>
            `;

        } else {
            // Отображение файлов (видео и документов)
            let fileIcon = '📄'; // Значок документа по умолчанию
            let filePreview = '';
            
            // Определяем тип файла и подходящий превью
            if (item.type === 'audio') {
                fileIcon = '🎵';
            
            } else if (sharedMedia.videos.includes(item)) {
                fileIcon = '🎬';
                filePreview = `
                    <div class="video-thumbnail" style="
                        width: 100%;
                        height: 100px;
                        background-color: #f0f0f0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        font-size: 32px;
                    ">🎬</div>
                `;

            } else if (item.extension) {
                // Выбираем значок в зависимости от расширения
                if (['pdf'].includes(item.extension)) fileIcon = '📕';
                else if (['doc', 'docx'].includes(item.extension)) fileIcon = '📘';
                else if (['xls', 'xlsx'].includes(item.extension)) fileIcon = '📗';
                else if (['ppt', 'pptx'].includes(item.extension)) fileIcon = '📙';
                else if (['zip', 'rar', '7z'].includes(item.extension)) fileIcon = '🗜️';
                else if (['txt', 'rtf'].includes(item.extension)) fileIcon = '📝';
                else if (['js', 'py', 'java', 'c', 'cpp', 'php', 'html', 'css'].includes(item.extension)) fileIcon = '💻';
            }

            galleryContent += `
                <div class="gallery-item file-item" style="
                    position: relative;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    display: flex;
                    flex-direction: column;
                ">
                    ${filePreview || `
                        <div class="file-icon-preview" style="
                            width: 100%;
                            height: 100px;
                            background-color: #f0f0f0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            font-size: 32px;
                        ">${fileIcon}</div>
                    `}
                    <div class="file-details" style="
                        padding: 10px;
                        flex-grow: 1;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                    ">
                        <div class="file-name" style="
                            font-size: 12px;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        ">${item.name}</div>
                        <div class="file-size" style="
                            font-size: 10px;
                            color: #666;
                        ">${item.size}</div>
                        <div class="media-actions" style="
                            display: flex;
                            justify-content: space-around;
                            padding-top: 8px;
                        ">
                            <button class="download-media" data-index="${index}" data-type="${sharedMedia.videos.includes(item) ? 'video' : 'document'}" style="
                                background: transparent;
                                border: none;
                                cursor: pointer;
                            ">⬇️</button>
                            <button class="forward-media" data-index="${index}" data-type="${sharedMedia.videos.includes(item) ? 'video' : 'document'}" style="
                                background: transparent;
                                border: none;
                                cursor: pointer;
                            ">↪️</button>
                        </div>
                    </div>
                </div>
            `;
        }
    });

    galleryContent += `
            </div>
        </div>
    `;

    galleryModal.innerHTML = galleryContent;
    galleryModal.style.display = 'flex';
    // Добавляем обработчик закрытия галереи
    const closeBtn = document.getElementById('closeGalleryBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            galleryModal.style.display = 'none';
        });
    }

    // Закрытие при клике на фон
    galleryModal.addEventListener('click', function (e) {
        if (e.target === galleryModal) {
            galleryModal.style.display = 'none';
        }
    });

    // Добавляем обработчики для кнопок скачивания и пересылки
    const downloadButtons = galleryModal.querySelectorAll('.download-media');
    const forwardButtons = galleryModal.querySelectorAll('.forward-media');
    downloadButtons.forEach(button => {
        button.addEventListener('click', function () {
            const index = parseInt(this.getAttribute('data-index'));
            const mediaType = this.getAttribute('data-type');
            downloadMedia(index, mediaType);
        });
    });

    forwardButtons.forEach(button => {
        button.addEventListener('click', function () {
            const index = parseInt(this.getAttribute('data-index'));
            const mediaType = this.getAttribute('data-type');
            forwardMedia(index, mediaType);
        });
    });
}

// Функция скачивания медиафайла
function downloadMedia(index, mediaType) {
    let mediaItem;
    switch (mediaType) {
        case 'photo':
            mediaItem = sharedMedia.photos[index];
            break;
        case 'video':
            mediaItem = sharedMedia.videos[index];
            break;
        case 'document':
            mediaItem = sharedMedia.documents[index];
            break;
        default:
            return;
    }

    if (!mediaItem) return;
    // Создаем ссылку для скачивания
    const downloadLink = document.createElement('a');
    downloadLink.href = mediaItem.src;
    downloadLink.download = mediaItem.name || `file-${Date.now()}`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    // Показываем уведомление о скачивании
    showNotification(languages[currentLanguage]?.downloadStarted || 'Download started');
}

// Функция пересылки медиафайла
function forwardMedia(index, mediaType) {
    let mediaItem;
    switch (mediaType) {
        case 'photo':
            mediaItem = sharedMedia.photos[index];
            break;
        case 'video':
            mediaItem = sharedMedia.videos[index];
            break;
        case 'document':
            mediaItem = sharedMedia.documents[index];
            break;
        default:
            return;
    }
    if (!mediaItem) return;
    // Открываем модальное окно выбора чата для пересылки
    openForwardModal(mediaItem, mediaType);
}

// Функция для отображения модального окна пересылки
function openForwardModal(mediaItem, mediaType) {
    // Создаем модальное окно, если его еще нет
    let forwardModal = document.getElementById('forwardModal');
    if (!forwardModal) {
        forwardModal = document.createElement('div');
        forwardModal.id = 'forwardModal';
        forwardModal.className = 'forward-modal';
        forwardModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 2100;
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        document.body.appendChild(forwardModal);
    }

    // Получаем список чатов из DOM
    const chatsList = Array.from(document.querySelectorAll('.chat-item')).map(chat => {
        const chatName = chat.querySelector('.chat-name')?.textContent || 'Unknown';
        const chatAvatar = chat.querySelector('.chat-avatar img')?.src || 'images/profile.png';
        return { name: chatName, avatar: chatAvatar };
    });

    // Если список чатов пуст, добавляем демо-данные
    if (chatsList.length === 0) {
        chatsList.push(
            { name: 'Alice Cooper', avatar: 'images/profile.png' },
            { name: 'John Doe', avatar: 'images/profile.png' },
            { name: 'Support Team', avatar: 'images/profile.png' }
        );
    }

    // Создаем содержимое модального окна
    let modalContent = `
        <div class="forward-container" style="
            background-color: white;
            border-radius: 15px;
            width: 350px;
            max-height: 80%;
            overflow-y: auto;
            padding: 20px;
        ">
            <div class="forward-header" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                position: sticky;
                top: 0;
                background-color: white;
                padding: 10px 0;
                z-index: 10;
            ">
                <h3 style="margin: 0;">${languages[currentLanguage]?.forwardTo || 'Forward to'}</h3>
                <button id="closeForwardBtn" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                ">×</button>
            </div>
            <div class="forward-preview" style="
                margin-bottom: 15px;
                padding: 10px;
                background-color: #f5f5f5;
                border-radius: 8px;
                display: flex;
                align-items: center;
            ">
    `;

    // Показываем превью файла в зависимости от его типа
    if (mediaType === 'photo') {
        modalContent += `
            <img src="${mediaItem.src}" alt="Photo" style="
                width: 50px;
                height: 50px;
                object-fit: cover;
                border-radius: 6px;
                margin-right: 10px;
            ">
        `;

    } else if (mediaType === 'video') {
        modalContent += `
            <div style="
                width: 50px;
                height: 50px;
                display: flex;
                justify-content: center;
                align-items: center;
                background-color: #e0e0e0;
                border-radius: 6px;
                margin-right: 10px;
                font-size: 24px;
            ">🎬</div>
        `;

    } else {
        let fileIcon = '📄';
        if (mediaItem.extension) {
            if (['pdf'].includes(mediaItem.extension)) fileIcon = '📕';
            else if (['doc', 'docx'].includes(mediaItem.extension)) fileIcon = '📘';
            else if (['xls', 'xlsx'].includes(mediaItem.extension)) fileIcon = '📗';
            else if (['ppt', 'pptx'].includes(mediaItem.extension)) fileIcon = '📙';
            else if (['zip', 'rar', '7z'].includes(mediaItem.extension)) fileIcon = '🗜️';
            else if (['txt', 'rtf'].includes(mediaItem.extension)) fileIcon = '📝';
            else if (['js', 'py', 'java', 'c', 'cpp', 'php', 'html', 'css'].includes(mediaItem.extension)) fileIcon = '💻';
        }

        modalContent += `
            <div style="
                width: 50px;
                height: 50px;
                display: flex;
                justify-content: center;
                align-items: center;
                background-color: #e0e0e0;
                border-radius: 6px;
                margin-right: 10px;
                font-size: 24px;
            ">${fileIcon}</div>
        `;

    }

    modalContent += `
                <div class="preview-info">
                    <div style="font-weight: bold;">${mediaItem.name || 'File'}</div>
                    <div style="font-size: 12px; color: #666;">${mediaItem.size || ''}</div>
                </div>
            </div>
            <div class="chats-list" style="
                max-height: 300px;
                overflow-y: auto;
            ">
    `;

    // Добавляем список чатов
    chatsList.forEach((chat, index) => {
        modalContent += `
            <div class="forward-chat-item" data-index="${index}" style="
                display: flex;
                align-items: center;
                padding: 10px;
                border-radius: 8px;
                cursor: pointer;
                margin-bottom: 5px; 
            ">
                <img src="${chat.avatar}" alt="${chat.name}" style="
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    margin-right: 10px;
                ">
                <div class="chat-name">${chat.name}</div>
            </div>
        `;
    });

    modalContent += `
            </div>
        </div>
    `;

    forwardModal.innerHTML = modalContent;
    forwardModal.style.display = 'flex';
    // Добавляем обработчики событий
    // Закрытие модального окна
    const closeBtn = document.getElementById('closeForwardBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            forwardModal.style.display = 'none';
        });
    }

    // Закрытие при клике на фон
    forwardModal.addEventListener('click', function (e) {
        if (e.target === forwardModal) {
            forwardModal.style.display = 'none';
        }
    });

    // Обработка выбора чата для пересылки
    const chatItems = forwardModal.querySelectorAll('.forward-chat-item');
    chatItems.forEach(item => {
        item.addEventListener('click', function () {
            const index = this.getAttribute('data-index');
            const selectedChat = chatsList[index];
            // Симулируем пересылку (в реальном приложении здесь будет логика отправки)
            showNotification(`${languages[currentLanguage]?.fileSentTo || 'File sent to'} ${selectedChat.name}`);
            // Закрываем модальное окно
            forwardModal.style.display = 'none';
            // Закрываем галерею
            const galleryModal = document.getElementById('mediaGalleryModal');
            if (galleryModal) {
                galleryModal.style.display = 'none';
            }
        });

        // Добавляем эффект при наведении
        item.addEventListener('mouseover', function () {
            this.style.backgroundColor = '#f5f5f5';
        });

        item.addEventListener('mouseout', function () {
            this.style.backgroundColor = 'transparent';
        });

    });

}

// Функция для отображения уведомлений
function showNotification(message) {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = 'toast-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 10px 20px;
        border-radius: 20px;
        z-index: 3000;
        opacity: 0;
        transition: opacity 0.3s;
    `;

    // Добавляем на страницу
    document.body.appendChild(notification);
    
    // Делаем видимым
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);

    // Скрываем через 3 секунды
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Обновленная функция updateSharedContent - добавьте вызов этой функции после загрузки файлов
function updateSharedContent() {
    // Обновление sharedMedia в сайдбаре
    const sharedFilesSection = userSidebar.querySelector('.user-sections');
    const existingFiles = sharedFilesSection.querySelectorAll('.shared-file');
    existingFiles.forEach(file => file.remove());

    if (sharedMedia.photos.length > 0) {
        const photosSectionDiv = document.createElement('div');
        photosSectionDiv.className = 'photos-preview-grid';
        photosSectionDiv.style.cssText = `
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 5px;
            margin-bottom: 15px;
        `;

        const photosToShow = sharedMedia.photos.slice(-6).reverse();
        photosToShow.forEach(photo => {
            const photoDiv = document.createElement('div');
            photoDiv.className = 'photo-preview';
            photoDiv.style.cssText = `
                aspect-ratio: 1;
                overflow: hidden;
                border-radius: 4px;
            `;

            const photoImg = document.createElement('img');
            photoImg.src = photo.src;
            photoImg.alt = photo.name;
            photoImg.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
            `;

            photoDiv.appendChild(photoImg);
            photosSectionDiv.appendChild(photoDiv);
        });

        sharedFilesSection.appendChild(photosSectionDiv);
    }

    const combinedFiles = [...sharedMedia.videos, ...sharedMedia.documents].slice(-3).reverse();
    if (combinedFiles.length > 0) {
        const filesSectionDiv = document.createElement('div');
        filesSectionDiv.className = 'files-preview-list';
        filesSectionDiv.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;

        combinedFiles.forEach(file => {
            let fileIcon = '📄';
            if (sharedMedia.videos.includes(file)) {
                fileIcon = '🎬';
            } else if (file.extension) {
                if (['pdf'].includes(file.extension)) fileIcon = '📕';
                else if (['doc', 'docx'].includes(file.extension)) fileIcon = '📘';
                else if (['xls', 'xlsx'].includes(file.extension)) fileIcon = '📗';
                else if (['ppt', 'pptx'].includes(file.extension)) fileIcon = '📙';
                else if (['zip', 'rar', '7z'].includes(file.extension)) fileIcon = '🗜️';
                else if (['txt', 'rtf'].includes(file.extension)) fileIcon = '📝';
                else if (['js', 'py', 'java', 'c', 'cpp', 'php', 'html', 'css'].includes(file.extension)) fileIcon = '💻';
            }

            const fileDiv = document.createElement('div');
            fileDiv.className = 'shared-file';
            fileDiv.innerHTML = `
                <div class="file-preview document">
                    <div class="file-icon-preview">${fileIcon}</div>
                </div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <img src="images/dowload.png" alt="Download" class="download-icon">
                </div>
            `;

            const downloadIcon = fileDiv.querySelector('.download-icon');
            if (downloadIcon) {
                downloadIcon.addEventListener('click', function (e) {
                    e.stopPropagation();
                    const downloadLink = document.createElement('a');
                    downloadLink.href = file.src;
                    downloadLink.download = file.name;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                    showNotification(languages[currentLanguage]?.downloadStarted || 'Download started');
                });
            }

            filesSectionDiv.appendChild(fileDiv);
        });

        sharedFilesSection.appendChild(filesSectionDiv);
    }

    const sectionTitles = document.querySelectorAll('.section-title');
    if (sectionTitles.length >= 2) {
        const photosTitle = sectionTitles[0];
        const filesTitle = sectionTitles[1];
        photosTitle.style.cursor = 'pointer';
        filesTitle.style.cursor = 'pointer';
        photosTitle.addEventListener('click', function () {
            openMediaGallery('photos');
        });

        filesTitle.addEventListener('click', function () {
            openMediaGallery('files');
        });
    }
}

// Добавьте эти языковые строки в соответствующие языковые блоки
if (languages.English) {
    languages.English.forwardTo = 'Forward to';
    languages.English.downloadStarted = 'Download started';
    languages.English.fileSentTo = 'File sent to';
    languages.English.noMediaFound = 'No media found';
}

if (languages.Русский) {
    languages.Русский.forwardTo = 'Переслать';
    languages.Русский.downloadStarted = 'Скачивание начато';
    languages.Русский.fileSentTo = 'Файл отправлен';
    languages.Русский.noMediaFound = 'Медиафайлы не найдены';
}

if (languages.Кыргызча) {
    languages.Кыргызча.forwardTo = 'Жөнөтүү';
    languages.Кыргызча.downloadStarted = 'Жүктөп алуу башталды';
    languages.Кыргызча.fileSentTo = 'Файл жөнөтүлдү';
    languages.Кыргызча.noMediaFound = 'Медиафайлдар табылган жок';
}

// CSS стили для галереи - добавьте их в ваш файл стилей
const mediaGalleryStyles = document.createElement('style');
mediaGalleryStyles.textContent = `
.media-gallery-modal {
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInModal 0.3s forwards;
}

@keyframes fadeInModal {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.gallery-header {
    border-bottom: 1px solid #eee;
}

.gallery-item {
    transition: transform 0.2s, box-shadow 0.2s;
}

.gallery-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}

.media-actions {
    opacity: 0.7;
    transition: opacity 0.2s;
}

.gallery-item:hover .media-actions {
    opacity: 1;
}

.forward-chat-item {
    transition: background-color 0.2s;
}

.toast-notification {
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}
`;

document.head.appendChild(mediaGalleryStyles);
// Структура данных для хранения медиафайлов
const sharedMedia = {
    photos: [
        {
            src: 'images/demo/photo1.jpg',
            name: 'Photo 1',
            size: '2.4 MB',
            date: '2023-12-15'
        },
        {
            src: 'images/demo/photo2.jpg',
            name: 'Photo 2',
            size: '1.8 MB',
            date: '2023-12-14'
        },
        {
            src: 'images/demo/photo3.jpg',
            name: 'Holiday',
            size: '3.2 MB',
            date: '2023-12-10'
        }
        // Вы можете добавить больше фотографий при необходимости
    ],
    videos: [
        {
            src: 'videos/demo/video1.mp4',
            name: 'Video 1.mp4',
            size: '15.7 MB',
            extension: 'mp4',
            date: '2023-12-10'
        },
        {
            src: 'videos/demo/video2.mp4',
            name: 'Meeting Recording.mp4',
            size: '24.3 MB',
            extension: 'mp4',
            date: '2023-12-07'
        }
        // Вы можете добавить больше видео при необходимости
    ],
    documents: [
        {
            src: 'documents/document1.pdf',
            name: 'Contract Agreement.pdf',
            size: '1.2 MB',
            extension: 'pdf',
            date: '2023-12-05'
        },
        {
            src: 'documents/document2.docx',
            name: 'Report.docx',
            size: '548 KB',
            extension: 'docx',
            date: '2023-12-01'
        },
        {
            src: 'documents/document3.xlsx',
            name: 'Budget 2024.xlsx',
            size: '782 KB',
            extension: 'xlsx',
            date: '2023-11-28'
        }
        // Вы можете добавить больше документов при необходимости
    ]
};

// Функция для добавления нового медиафайла в коллекцию
function addMediaToShared(file, type) {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const fileSize = formatFileSize(file.size);
    const newMedia = {
        src: URL.createObjectURL(file),
        name: file.name,
        size: fileSize,
        extension: fileExtension,
        date: new Date().toISOString().split('T')[0]
    };

    // Определяем категорию для файла
    if (type === 'photo' || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
        sharedMedia.photos.push(newMedia);
    } else if (type === 'video' || ['mp4', 'webm', 'avi', 'mov', 'mkv'].includes(fileExtension)) {
        sharedMedia.videos.push(newMedia);
    } else {
        sharedMedia.documents.push(newMedia);
    }
    // Обновляем отображение в интерфейсе
    updateSharedContent();
    return newMedia;
}

// Функция для форматирования размера файла
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Функция для инициализации интерфейса разделов медиафайлов
function initializeMediaSections() {
    const userSidebar = document.querySelector('.user-sidebar');
    if (!userSidebar) return;
    // Проверяем, есть ли уже секции
    let userSections = userSidebar.querySelector('.user-sections');
    if (!userSections) {
        userSections = document.createElement('div');
        userSections.className = 'user-sections';
        userSidebar.appendChild(userSections);
    }

    // Очищаем существующие секции
    userSections.innerHTML = '';
    // Создаем секцию для фотографий
    const photosSection = document.createElement('div');
    photosSection.className = 'section';
    photosSection.innerHTML = `
        <div class="section-title">${languages[currentLanguage]?.sharedPhotos || 'Shared Photos'}</div>
        <div class="section-content photos-grid"></div>
    `;

    userSections.appendChild(photosSection);
    // Создаем секцию для файлов
    const filesSection = document.createElement('div');
    filesSection.className = 'section';
    filesSection.innerHTML = `
        <div class="section-title">${languages[currentLanguage]?.sharedFiles || 'Shared Files'}</div>
        <div class="section-content files-list"></div>
    `;

    userSections.appendChild(filesSection);
    // Обновляем содержимое секций
    updateSharedContent();
   
    // Добавляем обработчики событий для секций
    photosSection.addEventListener('click', function () {
        openMediaGallery('photos');
    });

    filesSection.addEventListener('click', function () {
        openMediaGallery('files');
    });
}

// Добавляем обработчик для загрузки медиафайлов (для интеграции с интерфейсом отправки сообщений)
document.addEventListener('DOMContentLoaded', function () {
    // Находим кнопку для прикрепления файлов в интерфейсе чата
    const attachButton = document.querySelector('.attach-btn');
    const attachFileInput = document.getElementById('attachFile') || document.createElement('input');
    
    if (!attachFileInput.id) {
        attachFileInput.id = 'attachFile';
        attachFileInput.type = 'file';
        attachFileInput.multiple = true;
        attachFileInput.accept = 'image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar';
        attachFileInput.style.display = 'none';
        document.body.appendChild(attachFileInput);
    }

    // Обработчик для кнопки прикрепления файлов
    if (attachButton) {
        attachButton.addEventListener('click', function () {
            attachFileInput.click();
        });
    }

    // Обработчик для выбора файлов
    attachFileInput.addEventListener('change', function () {
        if (this.files.length > 0) {
            Array.from(this.files).forEach(file => {
                // Определяем тип файла
                const fileType = file.type.split('/')[0];
                const addedMedia = addMediaToShared(file, fileType);
                // Здесь можно добавить код для отображения прикрепленного файла в поле ввода сообщения
                appendAttachmentToMessageInput(addedMedia, fileType);
            });
        }

        // Сбрасываем значение поля ввода файлов
        this.value = '';
    });

    // Инициализируем секции медиафайлов
    initializeMediaSections();
});

// Функция для добавления прикрепленного файла в поле ввода сообщения
function appendAttachmentToMessageInput(media, fileType) {
    const attachmentsContainer = document.querySelector('.attachments-container');
    if (!attachmentsContainer) return;
    const attachmentElement = document.createElement('div');
    attachmentElement.className = 'attachment-item';
    attachmentElement.setAttribute('data-src', media.src);
    
    // Визуальное отображение в зависимости от типа файла
    if (fileType === 'image') {
        attachmentElement.innerHTML = `
            <div class="attachment-preview">
                <img src="${media.src}" alt="${media.name}">
                <button class="remove-attachment">×</button>
            </div>
            <div class="attachment-name">${media.name}</div>
        `;

    } else if (fileType === 'video') {
        attachmentElement.innerHTML = `
            <div class="attachment-preview video">
                <div class="file-icon">🎬</div>
                <button class="remove-attachment">×</button>
            </div>
            <div class="attachment-name">${media.name}</div>
        `;

    } else {
        // Определяем значок для документа
        let fileIcon = '📄';
        if (media.extension) {
            if (['pdf'].includes(media.extension)) fileIcon = '📕';
            else if (['doc', 'docx'].includes(media.extension)) fileIcon = '📘';
            else if (['xls', 'xlsx'].includes(media.extension)) fileIcon = '📗';
            else if (['ppt', 'pptx'].includes(media.extension)) fileIcon = '📙';
            else if (['zip', 'rar', '7z'].includes(media.extension)) fileIcon = '🗜️';
            else if (['txt', 'rtf'].includes(media.extension)) fileIcon = '📝';
            else if (['js', 'py', 'java', 'c', 'cpp', 'php', 'html', 'css'].includes(media.extension)) fileIcon = '💻';
        }

        attachmentElement.innerHTML = `
            <div class="attachment-preview document">
                <div class="file-icon">${fileIcon}</div>
                <button class="remove-attachment">×</button>
            </div>
            <div class="attachment-name">${media.name}</div>
        `;
    }
    
    // Добавляем элемент в контейнер вложений
    attachmentsContainer.appendChild(attachmentElement);
    // Обработчик для удаления вложения
    attachmentElement.querySelector('.remove-attachment').addEventListener('click', function () {
        attachmentElement.remove();
    });
}

// Добавляем стили для вложений
const attachmentsStyles = document.createElement('style');
attachmentsStyles.textContent = `
.attachments-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px;
    background-color: #f5f5f5;
    border-radius: 8px;
    margin-bottom: 10px;
}

.attachment-item {
    position: relative;
    width: 80px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    background-color: white;
}

.attachment-preview {
    position: relative;
    width: 80px;
    height: 80px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #e0e0e0;
}

.attachment-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.attachment-preview .file-icon {
    font-size: 32px;
}

.attachment-name {
    font-size: 10px;
    padding: 5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
}

.remove-attachment {
    position: absolute;
    top: 0;
    right: 0;
    background-color: rgba(0,0,0,0.5);
    color: white;
    border: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-size: 14px;
    padding: 0;
}
`;

document.head.appendChild(attachmentsStyles);
// Добавляем строки перевода
if (languages.English) {
    languages.English.sharedPhotos = 'Shared Photos';
    languages.English.sharedFiles = 'Shared Files';
    languages.English.attachFile = 'Attach File';
}
if (languages.Русский) {
    languages.Русский.sharedPhotos = 'Фотографии';
    languages.Русский.sharedFiles = 'Файлы';
    languages.Русский.attachFile = 'Прикрепить файл';
}
if (languages.Кыргызча) {
    languages.Кыргызча.sharedPhotos = 'Сүрөттөр';
    languages.Кыргызча.sharedFiles = 'Файлдар';
    languages.Кыргызча.attachFile = 'Файл тиркөө';
}

function setupBlockModal() {
    const blockButton = document.getElementById('blockButton');
    const modalOverlay = document.getElementById('modalOverlay');
    const cancelBlock = document.getElementById('cancelBlock');
    const confirmBlock = document.getElementById('confirmBlock');

    if (blockButton && modalOverlay) {
        blockButton.addEventListener('click', function () {
            modalOverlay.style.display = 'flex';
        });
    }

    if (cancelBlock) {
        cancelBlock.addEventListener('click', function () {
            modalOverlay.style.display = 'none';
        });
    }

    if (confirmBlock) {
        confirmBlock.addEventListener('click', function () {
            // Логика блокировки пользователя
            modalOverlay.style.display = 'none';
            // Дополнительные действия при блокировке
        });
    }
}


function setupMessageActions() {
    // Создаем шаблон для меню действий
    const actionMenuTemplate = `
        <div class="message-actions">
            <div class="action-menu">
                <div class="action-item" data-action="edit">
                    <img src="images/edit.png" alt="Edit" class="action-icon">
                    Edit
                </div>
                <div class="action-item" data-action="copy">
                    <img src="images/copy.png" alt="Copy" class="action-icon">
                    Copy
                </div>
                <div class="action-item" data-action="delete">
                    <img src="images/delete.png" alt="Delete" class="action-icon">
                    Delete
                </div>
            </div>
        </div>
    `;

    // Функция добавления меню к сообщению
    function addActionsToMessage(messageElement) {
        // Создаем меню
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'message-actions';
        actionsContainer.innerHTML = actionMenuTemplate;
        messageElement.appendChild(actionsContainer);

        // Добавляем троеточие для вызова меню
        const optionsButton = document.createElement('div');
        optionsButton.className = 'message-options';
        optionsButton.innerHTML = '•••';
        optionsButton.style.cssText = `
            position: absolute;
            right: 5px;
            top: 5px;
            font-size: 16px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        messageElement.appendChild(optionsButton);

        // Показываем кнопку при наведении
        messageElement.addEventListener('mouseover', function () {
            optionsButton.style.opacity = '1';
        });

        messageElement.addEventListener('mouseout', function () {
            optionsButton.style.opacity = '0';
        });

        // При клике показываем меню
        optionsButton.addEventListener('click', function (e) {
            e.stopPropagation();
            const actionMenu = messageElement.querySelector('.action-menu');
            if (actionMenu) {
                actionMenu.style.display = actionMenu.style.display === 'block' ? 'none' : 'block';

                // Правильное позиционирование
                actionMenu.style.position = 'absolute';
                actionMenu.style.right = '25px';
                actionMenu.style.top = '0';
            }
        });

        // Обработчики действий
        const actionItems = messageElement.querySelectorAll('.action-item');
        actionItems.forEach(item => {
            item.addEventListener('click', function (e) {
                e.stopPropagation();
                const action = this.dataset.action;
                const messageText = messageElement.querySelector('.message-content').textContent;

                switch (action) {
                    case 'edit':
                        // Логика редактирования
                        console.log('Edit message:', messageText);
                        break;
                    case 'copy':
                        // Копирование текста
                        navigator.clipboard.writeText(messageText);
                        console.log('Copied to clipboard');
                        break;
                    case 'delete':
                        // Удаление сообщения
                        messageElement.remove();
                        console.log('Message deleted');
                        break;
                }

                // Скрываем меню
                const actionMenu = messageElement.querySelector('.action-menu');
                if (actionMenu) {
                    actionMenu.style.display = 'none';
                }
            });
        });
    }

    // Добавляем меню к существующим сообщениям
    document.querySelectorAll('.message').forEach(message => {
        addActionsToMessage(message);
    });

    // Модифицируем функцию отправки сообщения, чтобы добавлять меню к новым сообщениям
    const originalSendMessage = window.sendMessage;
    window.sendMessage = function () {
        const messageInput = document.querySelector('.message-input');
        if (!messageInput || !messageInput.value.trim()) return;

        const messagesContainer = document.querySelector('.messages-container');
        if (!messagesContainer) return;

        const messageContent = messageInput.value.trim();
        const messageTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Создаем новый элемент сообщения
        const messageElement = document.createElement('div');
        messageElement.className = 'message sent';
        messageElement.innerHTML = `
            <div class="message-content">${messageContent}</div>
            <div class="message-time">${messageTime}</div>
        `;
        messageElement.style.position = 'relative';

        messagesContainer.appendChild(messageElement);

        // Добавляем меню действий
        addActionsToMessage(messageElement);

        // Прокручиваем к новому сообщению
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Очищаем поле ввода
        messageInput.value = '';
    };
}