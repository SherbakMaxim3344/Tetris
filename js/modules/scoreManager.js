class ScoreManager {
    #score;
    #level;
    #lines;
    #pointsPerLine;
    #linesForLevelUp;

    constructor() {
        this.#score = 0;
        this.#level = 1;
        this.#lines = 0;
        this.#pointsPerLine = 100;
        this.#linesForLevelUp = 10;

        this.loadFromStorage();
    }

    get score() { return this.#score; }
    get level() { return this.#level; }
    get lines() { return this.#lines; }

    // *Обновляем статистику на странице
    updateDisplay(){
        document.getElementById('score').textContent = this.#score;
        document.getElementById('level').textContent = this.#level;
        document.getElementById('lines').textContent = this.#lines;

        // Обновляем рекорд и скорость
        const userData = userManager.getUserData();
        document.getElementById('bestScore').textContent = userData.bestScore || 0;
        document.getElementById('speed').textContent = this.#level + 'x';
    }

    // *Добавляем очки за удаленные линии
    addLines(linesCount){
        const points = this.calculatePoints(linesCount);
        this.#score += points;
        this.#lines += linesCount;

        // Проверяем повышение уровня
        const newLevel = Math.floor(this.#lines / this.#linesForLevelUp) + 1;

        if(newLevel > this.#level){
            this.#level = newLevel;
            console.log(`Уровень повышен! Теперь уровень: ${this.level}`);
        }
        this.updateDisplay();
        this.saveToStorage(); 
        return points;
    }

    // *Расчет очков в зависимости от количества линий
    calculatePoints(linesCount) {
        const multiplier = [0, 100, 300, 500, 800];
        return (multiplier[linesCount] || 1000) * this.#level;
    }

    // *Сохраняем текущую статистику 
    saveToStorage(){
        const stats = {
            score: this.#score,
            level: this.#level,
            lines: this.#lines,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('tetris.currentStats', JSON.stringify(stats));
        
        // Обновляем лучший результат в реальном времени
        this.updateBestScore();
    }

    // *Обновляем лучший результат
    updateBestScore(){
        const userData = userManager.getUserData();
        if(this.#score > userData.bestScore){
            userData.bestScore = this.#score;
            // Сохраняем через userManager для consistency
            const allUsers = userManager.getAllUsers();
            allUsers[userData.username] = userData;
            userManager.saveAllUsers(allUsers);
            console.log('🎯 Новый рекорд!', this.#score);
        }
    }

    // *Сброс статистики (ВЫЗЫВАЕТСЯ ПРИ НОВОЙ ИГРЕ)
    reset(){
        this.#score = 0;
        this.#level = 1;
        this.#lines = 0;
        this.updateDisplay();
        this.saveToStorage();
    }

    // *Загружаем статистику 
    loadFromStorage(){
        const saved = localStorage.getItem('tetris.currentStats');
        if (saved) {
            try {
                const stats = JSON.parse(saved);
                this.#score = stats.score || 0;
                this.#level = stats.level || 1;
                this.#lines = stats.lines || 0;
                this.updateDisplay();
            } catch (e) {
                console.error('Ошибка загрузки статистики:', e);
            }
        }
    }

    // *Сохраняем финальную статистику при завершении игры
    saveFinalStats() {
        this.saveToStorage();
        // ТОЛЬКО обновляем счет, не добавляем игру
        userManager.updateUserStats(this.#score);
    }

    // *Получить финальный счет (для статистики)
    getFinalScore() {
        return this.#score;
    }
}