// Глобальная переменная для отслеживания состояния отправки
let isSubmitting = false;

document.addEventListener('DOMContentLoaded', function () {
    console.log('newContact.js loaded');

    // Получаем элементы напрямую
    const cancelButton = document.getElementById('cancelContact') ||
        document.querySelector('.btn-cancel');
    const saveButton = document.getElementById('saveContact') ||
        document.querySelector('.btn-save');
    const firstNameInput = document.querySelector('input[placeholder="First name"]');
    const lastNameInput = document.querySelector('input[placeholder="Last name"]');
    const emailInput = document.querySelector('input[placeholder="Email..."]');
    const phoneInput = document.querySelector('input[placeholder="Phone number"]');

    console.log('Elements found:', {
        cancelButton: cancelButton ? 'Found' : 'Not found',
        saveButton: saveButton ? 'Found' : 'Not found',
        firstNameInput: firstNameInput ? 'Found' : 'Not found'
    });

    // Настраиваем функционал загрузки фото
    setupPhotoUpload();

    // Обработчик для кнопки Cancel
    if (cancelButton) {
        cancelButton.addEventListener('click', function (e) {
            e.preventDefault();
            window.parent.postMessage('closeContactModal', '*');
        });
    }

    // Обработчик для кнопки Save
    if (saveButton) {
        saveButton.addEventListener('click', function (e) {
            e.preventDefault();
            if (!isSubmitting) {
                isSubmitting = true;
                saveContactData();
                setTimeout(() => { isSubmitting = false; }, 1000);
            }
        });
    }

    // Вспомогательная функция для сохранения данных контакта
    function saveContactData() {
        // Получаем значения полей
        const firstName = firstNameInput ? firstNameInput.value.trim() : '';
        const lastName = lastNameInput ? lastNameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const phone = phoneInput ? phoneInput.value.trim() : '';

        // Проверяем имя
        if (!firstName) {
            if (firstNameInput) {
                firstNameInput.style.borderColor = 'red';
                setTimeout(() => { firstNameInput.style.borderColor = ''; }, 2000);
            }
            isSubmitting = false;
            return;
        }

        // Получаем фото если оно было загружено
        const photoElement = document.querySelector('.photo-placeholder img');
        let contactPhoto = null;
        if (photoElement && photoElement.src && !photoElement.src.includes('camera.png')) {
            contactPhoto = photoElement.src;
        }

        // Создаем объект контакта
        const newContact = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone,
            photo: contactPhoto,
            createdAt: new Date().toISOString()
        };

        // Сохраняем контакт
        console.log('Saving contact:', newContact);
        saveContact(newContact);

        // Закрываем модальное окно и обновляем список чатов
        window.parent.postMessage('refreshChatList', '*');
        window.parent.postMessage('closeContactModal', '*');
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
                            img.alt = "User photo";

                            // Set standardized styling
                            img.style.width = '100%';
                            img.style.height = '100%';
                            img.style.borderRadius = '50%';
                            img.style.objectFit = 'cover';

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

// Функция сохранения контакта
function saveContact(contact) {
    console.log('Saving contact:', contact);

    // Get existing contacts
    const savedContacts = JSON.parse(localStorage.getItem('chatContacts') || '[]');

    // Check for duplicates based on name and email
    const isDuplicate = savedContacts.some(existingContact =>
        (existingContact.firstName === contact.firstName &&
            existingContact.lastName === contact.lastName) ||
        (contact.email && existingContact.email === contact.email)
    );

    // Only save if not a duplicate
    if (!isDuplicate) {
        savedContacts.push(contact);
        localStorage.setItem('chatContacts', JSON.stringify(savedContacts));
        console.log('Contact saved successfully');
    } else {
        console.log('Contact already exists, not saving duplicate');
        // Optional: Show feedback to user
        alert('Contact already exists');
    }
}
});