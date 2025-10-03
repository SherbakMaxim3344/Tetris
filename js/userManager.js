class UserManager {
    constructor() {
        this.currentUserKey = 'tetris.currentUser';
        this.usersDataKey = 'tetris.usersData';
    }

    // *Получить всех пользователей
    getAllUsers() {
        const usersJSON = localStorage.getItem(this.usersDataKey);
        return usersJSON ? JSON.parse(usersJSON) : {};
    }

    // *Сохранить всех пользователей
    saveAllUsers(users) {
        localStorage.setItem(this.usersDataKey, JSON.stringify(users));
    }

    // *Получить текущего пользователя
    getCurrentUser() {
        return localStorage.getItem(this.currentUserKey) || localStorage.getItem('tetris.username');
    }

    // *Установить текущего пользователя
    setCurrentUser(username) {
        localStorage.setItem(this.currentUserKey, username);
        localStorage.removeItem('tetris.username'); // Убираем старый ключ для чистоты
    }

    // *Получить данные пользователя
    getUserData(username = null) {
        const targetUser = username || this.getCurrentUser();
        const allUsers = this.getAllUsers();
        
        if (targetUser && allUsers[targetUser]) {
            return allUsers[targetUser];
        }
        
        return this.createUser(targetUser || 'Гость');
    }

    // *Создать нового пользователя
    createUser(username) {
        const allUsers = this.getAllUsers();
        
        const newUser = {
            username: username,
            firstLogin: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            gamesPlayed: 0,
            bestScore: 0,
            totalScore: 0 // Добавим общий счет для статистики
        };
        
        allUsers[username] = newUser;
        this.saveAllUsers(allUsers);
        this.setCurrentUser(username);
        
        return newUser;
    }

    // *Обновить статистику (ТЕПЕРЬ ТОЛЬКО ДЛЯ СЧЕТА)
    updateUserStats(score = 0) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return null;
        
        const allUsers = this.getAllUsers();
        const userData = allUsers[currentUser] ? {...allUsers[currentUser]} : this.createUser(currentUser);
        
        userData.lastLogin = new Date().toISOString();
        
        // Обновляем только лучший счет
        if (score > 0) {
            userData.totalScore = (userData.totalScore || 0) + score;
            if (score > userData.bestScore) {
                userData.bestScore = score;
                console.log(`🎉 Новый рекорд: ${score}`);
            }
        }
        
        allUsers[currentUser] = userData;
        this.saveAllUsers(allUsers);
        
        return userData;
    }

    // *Добавить одну сыгранную игру (НОВАЯ ФУНКЦИЯ)
    addGamePlayed() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return null;
        
        const allUsers = this.getAllUsers();
        const userData = allUsers[currentUser] ? {...allUsers[currentUser]} : this.createUser(currentUser);
        
        userData.lastLogin = new Date().toISOString();
        userData.gamesPlayed = (userData.gamesPlayed || 0) + 1;
        
        console.log(`🎮 Добавлена игра для ${currentUser}. Всего игр: ${userData.gamesPlayed}`);
        
        allUsers[currentUser] = userData;
        this.saveAllUsers(allUsers);
        
        return userData;
    }

    // *Сменить пользователя
    changeUser(newUsername) {
        if (newUsername && newUsername.trim() !== '') {
            const username = newUsername.trim();
            
            const oldUser = this.getCurrentUser();
            console.log('Меняем пользователя с', oldUser, 'на', username);
            
            this.setCurrentUser(username);
            const userData = this.getUserData(username);
            
            return userData;
        }
        return null;
    }

    // *Получить статистику пользователя (для отображения)
    getUserStats() {
        return this.getUserData();
    }
}

// Создаем глобальный экземпляр
const userManager = new UserManager();