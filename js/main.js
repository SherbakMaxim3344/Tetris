// *Функция для получения всей информации о пользователе
function getUserData() {
    return userManager.getUserData();
}

// *Функция для обновления статистики пользователя
function updateUserStats(score = 0) {
    return userManager.updateUserStats(score);
}
// *Добавить сыгранную игру
function addGamePlayed() {
    const userData = userManager.addGamePlayed();
    updateUserDisplay(); // Сразу обновляем интерфейс
    return userData;
}
// *Функция для смены пользователя (ОБНОВЛЕННАЯ)
function changeUser() {
    showUserChangeModal();
}

// *Обновляем отображение пользователя
function updateUserDisplay() {
    const currentUserElement = document.getElementById('currentUser');
    const userData = getUserData();
    
    if (currentUserElement) {
        currentUserElement.textContent = userData.username;
        // Добавляем анимацию при смене пользователя
        currentUserElement.classList.add('user-changed');
        setTimeout(() => {
            currentUserElement.classList.remove('user-changed');
        }, 500);
    }
    
    const bestScoreElement = document.getElementById('bestScore');
    if (bestScoreElement) {
        bestScoreElement.textContent = userData.bestScore || 0;
    }
    
    const gamesPlayedElement = document.getElementById('gamesPlayed');
    if (gamesPlayedElement) {
        gamesPlayedElement.textContent = userData.gamesPlayed || 0;
    }
    
    const firstLoginElement = document.getElementById('firstLogin');
    if (firstLoginElement) {
        firstLoginElement.textContent = formatDate(userData.firstLogin);
    }
    
    const lastLoginElement = document.getElementById('lastLogin');
    if (lastLoginElement) {
        lastLoginElement.textContent = formatDate(userData.lastLogin);
    }
}

// *Функция для форматирования даты
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU') + ' ' + date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// *Функция для перезапуска игры
function restartGame() {
    if (window.game) {
        window.game.isPlaying = false;
        
        if (window.game.field && typeof window.game.field.clearField === 'function') {
            window.game.field.clearField();
        }
        
        const existingCanvas = document.querySelector('.tetris-field');
        if (existingCanvas && existingCanvas.parentNode) {
            existingCanvas.parentNode.removeChild(existingCanvas);
        }
        
        setTimeout(() => {
            window.game = new Game();
            setTimeout(() => {
                if (window.game && typeof window.game.start === 'function') {
                    window.game.start();
                }
            }, 100);
        }, 100);
    }
}

// *Функция для сброса текущей статистики
function resetGameStats() {
    showCustomModal();
}

// *МОДАЛЬНОЕ ОКНО ДЛЯ НОВОЙ ИГРЫ
function showCustomModal() {
    const modal = document.getElementById('customModal');
    modal.style.display = 'block';
}

function hideCustomModal() {
    const modal = document.getElementById('customModal');
    modal.style.display = 'none';
}

function confirmNewGame() {
    addGamePlayed();
    localStorage.removeItem('tetris.currentStats');
    location.reload();
    hideCustomModal();
}

// *МОДАЛЬНОЕ ОКНО ДЛЯ СМЕНЫ ПОЛЬЗОВАТЕЛЯ
function showUserChangeModal() {
    const modal = document.getElementById('userChangeModal');
    const input = document.getElementById('newUsernameInput');
    
    // Очищаем поле ввода
    input.value = '';
    
    // Заполняем список существующих пользователей
    fillUsersList();
    
    // Показываем модальное окно
    modal.style.display = 'block';
    
    // Фокус на поле ввода
    setTimeout(() => {
        input.focus();
    }, 300);
}

function hideUserChangeModal() {
    const modal = document.getElementById('userChangeModal');
    modal.style.display = 'none';
}

function fillUsersList() {
    const usersList = document.getElementById('usersList');
    const allUsers = userManager.getAllUsers();
    const currentUser = userManager.getCurrentUser();
    
    usersList.innerHTML = '';
    
    // Добавляем каждого пользователя в список
    Object.keys(allUsers).forEach(username => {
        const userData = allUsers[username];
        const userItem = document.createElement('div');
        userItem.className = `user-item ${username === currentUser ? 'active' : ''}`;
        userItem.innerHTML = `
            <span class="user-name">${username}</span>
            <div class="user-stats">
                <span class="games-played">${userData.gamesPlayed || 0} игр</span>
                <span class="best-score">рекорд: ${userData.bestScore || 0}</span>
            </div>
        `;
        
        // Обработчик клика на пользователя
        userItem.addEventListener('click', () => {
            document.getElementById('newUsernameInput').value = username;
            
            // Подсвечиваем выбранного пользователя
            document.querySelectorAll('.user-item').forEach(item => {
                item.classList.remove('active');
            });
            userItem.classList.add('active');
        });
        
        usersList.appendChild(userItem);
    });
    
    // Показываем/скрываем блок с пользователями
    const existingUsers = document.getElementById('existingUsers');
    existingUsers.style.display = Object.keys(allUsers).length > 1 ? 'block' : 'none';
}

function confirmUserChange() {
    const newUsername = document.getElementById('newUsernameInput').value.trim();
    
    if (newUsername === '') {
        alert('Пожалуйста, введите имя пользователя');
        return;
    }
    
    if (newUsername.length < 2) {
        alert('Имя пользователя должно содержать минимум 2 символа');
        return;
    }
    
    if (newUsername.length > 20) {
        alert('Имя пользователя не должно превышать 20 символов');
        return;
    }
    
    const userData = userManager.changeUser(newUsername);
    
    if (userData) {
        updateUserDisplay();
        hideUserChangeModal();
        
        // Показываем уведомление о успешной смене
        showNotification(`Пользователь изменен на: ${newUsername}`, 'success');
        
        if (window.game) {
            setTimeout(() => {
                restartGame();
            }, 500);
        }
    }
}

// ФУНКЦИЯ ДЛЯ  УВЕДОМЛЕНИЙ
function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(46, 204, 113, 0.9)' : 'rgba(52, 152, 219, 0.9)'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 1001;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

let game = null;

function initGame() {
    try {
        updateUserDisplay();
        setupEventListeners();
        
        setTimeout(() => {
            game = new Game();
            console.log('Игра инициализирована!');
            
            window.tetrisGame = game;
            window.game = game;
            
            setTimeout(() => {
                if (game && typeof game.start === 'function') {
                    game.start();
                }
            }, 1000);
            
        }, 100);
        
    } catch (error) {
        console.error('Ошибка инициализации игры:', error);
    }
}

// НАСТРОЙКА ВСЕХ ОБРАБОТЧИКОВ СОБЫТИЙ
function setupEventListeners() {
    // Кнопка сброса игры
    const resetButton = document.getElementById('resetButton');
    if (resetButton) {
        resetButton.addEventListener('click', showCustomModal);
    }
    
    // Кнопка смены пользователя
    const changeUserBtn = document.getElementById('changeUserBtn');
    if (changeUserBtn) {
        changeUserBtn.addEventListener('click', showUserChangeModal);
    }
    
    // Кнопки модального окна новой игры
    const confirmBtn = document.querySelector('.custom-confirm-btn');
    const cancelBtn = document.querySelector('.custom-cancel-btn');
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', confirmNewGame);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideCustomModal);
    }
    
    // Кнопки модального окна смены пользователя
    const confirmUserBtn = document.getElementById('confirmUserChange');
    const cancelUserBtn = document.querySelector('#userChangeModal .custom-cancel-btn');
    
    if (confirmUserBtn) {
        confirmUserBtn.addEventListener('click', confirmUserChange);
    }
    
    if (cancelUserBtn) {
        cancelUserBtn.addEventListener('click', hideUserChangeModal);
    }
    
    // Закрытие модальных окон при клике вне их
    const modals = document.querySelectorAll('.custom-modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Обработка Enter в поле ввода имени
    const usernameInput = document.getElementById('newUsernameInput');
    if (usernameInput) {
        usernameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                confirmUserChange();
            }
        });
    }
}

// Запускаем при полной загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, инициализируем игру...');
    initGame();
});


document.head.appendChild(style);