// Глобальная переменка для отслеживания состояния отправки формы
let isSubmitting = false;

document.addEventListener('DOMContentLoaded', function () {
    console.log('newGroup.js loaded');

    // Получаем кнопки напрямую
    const cancelButton = document.getElementById('cancelGroup') ||
        document.querySelector('.btn-cancel');
    const saveButton = document.getElementById('saveGroup') ||
        document.querySelector('.btn-save');
    const groupNameInput = document.querySelector('input.group-name');

    console.log('Elements found:', {
        cancelButton: cancelButton ? 'Found' : 'Not found',
        saveButton: saveButton ? 'Found' : 'Not found',
        groupNameInput: groupNameInput ? 'Found' : 'Not found'
    });

    // Загружаем контакты
    loadContactsFromStorage();

    // Добавляем функционал загрузки фото для группы
    setupPhotoUpload();

    // Обработчик для кнопки Cancel
    if (cancelButton) {
        cancelButton.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            window.parent.postMessage('closeGroupModal', '*');
        });
    }

    // Обработчик для кнопки Save
    if (saveButton) {
        saveButton.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (!isSubmitting) {
                isSubmitting = true;
                saveGroupData();

                // Увеличиваем время блокировки для надежности
                setTimeout(() => {
                    isSubmitting = false;
                }, 1500);
            }
        });
    }

    // Вспомогательная функция для сохранения данных группы
    function saveGroupData() {
        const groupNameInput = document.querySelector('input.group-name');
        const groupName = groupNameInput ? groupNameInput.value.trim() : '';

        // Проверка имени группы
        if (!groupName) {
            if (groupNameInput) {
                groupNameInput.style.borderColor = 'red';
                setTimeout(() => { groupNameInput.style.borderColor = ''; }, 2000);
            }
            return;
        }

        // Получаем выбранные контакты
        const selectedContacts = [];
        document.querySelectorAll('.contact-checkbox:checked').forEach(checkbox => {
            const contactItem = checkbox.closest('.contact-item');
            if (contactItem) {
                const contactNameElement = contactItem.querySelector('.contact-name');
                if (contactNameElement) {
                    selectedContacts.push(contactNameElement.textContent.trim());
                }
            }
        });

        console.log('Selected contacts:', selectedContacts);

        // Получаем фото группы если оно было загружено
        const photoElement = document.querySelector('.photo-placeholder img');
        let groupPhoto = null;
        if (photoElement && photoElement.src && !photoElement.src.includes('camera.png')) {
            groupPhoto = photoElement.src;
        }

        // Создаем объект группы
        const newGroup = {
            name: groupName,
            members: selectedContacts,
            photo: groupPhoto,
            createdAt: new Date().toISOString()
        };

        // Сохраняем группу
        console.log('Saving group:', newGroup);

        // Проверяем сохранение и сразу закрываем окно только если сохранение прошло успешно
        if (saveGroup(newGroup)) {
            // Закрываем модальное окно и обновляем список чатов
            window.parent.postMessage('refreshChatList', '*');
            window.parent.postMessage('closeGroupModal', '*');
        }
    }

    // Функция для настройки загрузки фото
    function setupPhotoUpload() {
        const photoPlaceholder = document.querySelector('.photo-placeholder');
        if (photoPlaceholder) {
            photoPlaceholder.style.cursor = 'pointer';
            photoPlaceholder.addEventListener('click', function () {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'image/*';
                fileInput.style.display = 'none';
                document.body.appendChild(fileInput);

                fileInput.click();

                fileInput.addEventListener('change', function () {

                    if (fileInput.files && fileInput.files[0]) {
                        const file = fileInput.files[0];
                        if (file.size > 5 * 1024 * 1024) {
                            alert('Image too large. Please select an image under 5MB.');
                            document.body.removeChild(fileInput);
                            return;
                        }
                    }


                    if (fileInput.files && fileInput.files[0]) {
                        const reader = new FileReader();

                        reader.onload = function (e) {
                            // Create a standardized image element
                            const img = document.createElement('img');
                            img.src = e.target.result;
                            img.alt = "Group photo";
                            // Set standardized styling
                            img.style.width = '100%';
                            img.style.height = '100%';
                            img.style.borderRadius = '50%';
                            img.style.objectFit = 'cover';
                            // Restricting size
                            photoPlaceholder.style.width = '80px';
                            photoPlaceholder.style.height = '80px';
                            photoPlaceholder.style.margin = '0 auto';
                            // Clear placeholder and add image
                            photoPlaceholder.innerHTML = '';
                            photoPlaceholder.appendChild(img);
                        };

                        reader.readAsDataURL(fileInput.files[0]);
                    }
                    document.body.removeChild(fileInput);
                });
            });
        }
    }
// Функция загрузки контактов из localStorage
function loadContactsFromStorage() {
    const savedContacts = JSON.parse(localStorage.getItem('chatContacts') || '[]');
    const contactsList = document.querySelector('.contacts-list');

    if (!contactsList) {
        console.error('Contacts list container not found');
        return;
    }

    // Очищаем список если есть сохраненные контакты
    if (savedContacts.length > 0) {
        contactsList.innerHTML = '';
    }

    // Добавляем сохраненные контакты
    savedContacts.forEach((contact, index) => {
        const fullName = `${contact.firstName} ${contact.lastName}`.trim();
        const contactItem = document.createElement('div');
        contactItem.className = 'contact-item';
        contactItem.innerHTML = `
            <div class="contact-avatar">
                <img src="images/contact-icon.png" alt="Contact">
            </div>
            <div class="contact-name">${fullName}</div>
            <div class="contact-select">
                <input type="checkbox" class="contact-checkbox" id="contact-${index}">
                <span class="checkmark"></span>
            </div>
        `;
        contactsList.appendChild(contactItem);
    });

    // Добавляем обработчики для чекбоксов
    document.querySelectorAll('.contact-select').forEach(selectBox => {
        selectBox.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const checkbox = this.querySelector('.contact-checkbox');
            checkbox.checked = !checkbox.checked;
        });
    });

    // Если нет контактов, показываем сообщение
    if (savedContacts.length === 0 && contactsList.children.length === 0) {
        const noContactsMsg = document.createElement('div');
        noContactsMsg.className = 'no-contacts-message';
        noContactsMsg.textContent = 'Нет контактов. Добавьте контакты сначала.';
        noContactsMsg.style.padding = '15px';
        noContactsMsg.style.textAlign = 'center';
        contactsList.appendChild(noContactsMsg);
    }
}

    // Функция сохранения группы
    function saveGroup(group) {
        console.log('Saving group:', group);
        // Сохраняем в localStorage
        const savedGroups = JSON.parse(localStorage.getItem('chatGroups') || '[]');

        // Проверка на дубликаты по имени группы
        const isDuplicate = savedGroups.some(existingGroup =>
            existingGroup.name === group.name
        );

        // Только сохраняем если нет дубликата
        if (!isDuplicate) {
            savedGroups.push(group);
            localStorage.setItem('chatGroups', JSON.stringify(savedGroups));
            console.log('Group saved successfully');
            return true;
        } else {
            console.log('Group already exists, not saving duplicate');
            alert('Группа с таким именем уже существует');
            return false;
        }
    }
});