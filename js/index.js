// Функция для сохранения имени в localStorage
function storeUsername() {
    const usernameInput = document.getElementById('username');
    const username = usernameInput.value.trim();
    
    if (username !== '') {
        userManager.setCurrentUser(username);
        userManager.getUserData(username);
        console.log('Пользователь установлен:', username);
    }
}

// Функция для чтения сохраненного имени
function readUsername() {
    const savedName = userManager.getCurrentUser();
    const usernameInput = document.getElementById('username');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const savedNameSpan = document.getElementById('savedName');
    
    if (savedName) {
        usernameInput.value = savedName;
        savedNameSpan.textContent = savedName;
        welcomeMessage.style.display = 'block';
        console.log('Найдено сохраненное имя:', savedName);
    }
    
    return savedName;
}

// Превью имени пользователя (реакция на ввод)
function previewUsername(value) {
    const welcomeMessage = document.getElementById('welcomeMessage');
    const savedNameSpan = document.getElementById('savedName');
    
    if (value.trim() !== '') {
        savedNameSpan.textContent = value;
        welcomeMessage.style.display = 'block';
    } else {
        welcomeMessage.style.display = 'none';
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('Страница загружена, инициализация...');
    
    // Загружаем сохраненное имя
    readUsername();
    
    // Автофокус на поле ввода
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        usernameInput.focus();
        
        // Добавляем обработчик клавиши Enter
        usernameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.querySelector('form').submit();
            }
        });
    }
    
    // Логируем текущие данные пользователя
    const userData = userManager.getUserData();
    console.log('Данные пользователя:', userData);
});