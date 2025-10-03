class Game {
    #field;
    #currentFigure;
    #isPlaying;
    #keys;
    #lastMoveTime;
    #timeGame;
    #scoreManager;
    #figureBag;
    #nextFigureRenderer;
    #nextFigureType;

    constructor() {
        this.#field = new Field();
        this.#currentFigure = null;
        this.#isPlaying = false;
        this.#keys = {};
        this.#lastMoveTime = 0;
        this.#timeGame = 1000;
        this.#scoreManager = new ScoreManager();
        this.#figureBag = new FigureBag();
        
        // Инициализируем рендерер следующей фигуры
        this.#nextFigureRenderer = new NextFigureRenderer('nextFigureCanvas');
        
        // Получаем ПЕРВУЮ фигуру для текущей игры
        const firstFigureType = this.#figureBag.getNext();
        const startX = Math.floor(this.#field.cols / 2) - 1;
        this.#currentFigure = new Figure(firstFigureType, startX, 0);
        
        // Получаем СЛЕДУЮЩУЮ фигуру для preview
        this.#nextFigureType = this.#figureBag.getNext();
        
        this.#setupKeyboardControls();
        this.#updateNextFigurePreview();
        
        this.draw();
        console.log('Game initialized! Current figure:', firstFigureType, 'Next figure:', this.#nextFigureType);
    }

    // Обновление preview следующей фигуры
    #updateNextFigurePreview() {
        if (this.#nextFigureRenderer && this.#nextFigureType !== undefined) {
            console.log('Updating preview with figure type:', this.#nextFigureType);
            this.#nextFigureRenderer.renderNextFigure(this.#nextFigureType);
        }
    }

    // !-----------------------настройка управления---------------------------------------
    #setupKeyboardControls() {
        document.addEventListener('keydown', (event) => {
            if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'Space'].includes(event.code)) {
                event.preventDefault();
            }

            this.#keys[event.code] = true;
            this.#handleInput();
        });

        document.addEventListener('keyup', (event) => {
            this.#keys[event.code] = false;
        });
    }

    // *Обработка ввода
    #handleInput() {
        if (!this.#currentFigure) return;
        const currentTime = Date.now();

        if (currentTime - this.#lastMoveTime < 100) return;
        this.#lastMoveTime = currentTime;

        if (this.#keys['Escape']) {
            this.#togglePause();
            return;
        }
        if (!this.#isPlaying) return;

        if (this.#keys['ArrowLeft']) {
            this.#moveLeft();
        }
        else if (this.#keys['ArrowRight']) {
            this.#moveRight();
        }
        else if (this.#keys['ArrowDown']) {
            this.#moveDownFast();
        }
        else if (this.#keys['ArrowUp']) {
            this.#rotateFigure();
        }
        else if (this.#keys['Space']) {
            this.#hardDrop();
        }
    }

    #togglePause() {
        this.#isPlaying = !this.#isPlaying;

        if (this.#isPlaying) {
            console.log("Игра продолжается");
            this.moveDown();
        } else {
            console.log("Пауза");
            this.#showPauseText();
        }
    }

    #showPauseText() {
        const ctx = this.#field.ctx;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.#field.cols, this.#field.rows);

        ctx.fillStyle = 'white';
        ctx.font = '1px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ПАУЗА', this.#field.cols / 2, this.#field.rows / 2);
    }

    #moveLeft() {
        if (!this.#field.checkCollision(this.#currentFigure, -1, 0)) {
            this.#currentFigure.x--;
            this.#field.drawWithFigure(this.#currentFigure);
        }
    }

    #moveRight() {
        if (!this.#field.checkCollision(this.#currentFigure, 1, 0)) {
            this.#currentFigure.x++;
            this.#field.drawWithFigure(this.#currentFigure);
        }
    }

    #moveDownFast() {
        if (!this.#field.checkCollision(this.#currentFigure, 0, 1)) {
            this.#currentFigure.y++;
            this.#field.drawWithFigure(this.#currentFigure);
        }
    }

    #hardDrop() {
        while (!this.#field.checkCollision(this.#currentFigure, 0, 1)) {
            this.#currentFigure.y++;
        }
        this.#lockFigure();
    }

    // *Фиксируем фигуру и создаем новую
    #lockFigure() {
        this.#field.addFigure(this.#currentFigure);

        // Проверяем и очищаем заполненные линии
        const linesCleared = this.#field.checkAndClearLines();
        if (linesCleared > 0) {
            const points = this.#scoreManager.addLines(linesCleared);
            console.log(`Удалено линий: ${linesCleared}, +${points} очков`);
            
            // ОБНОВЛЯЕМ СКОРОСТЬ ПОСЛЕ ДОБАВЛЕНИЯ ЛИНИЙ
            this.#updateGameSpeed();
        }

        // Проверяем Game Over
        if (this.#checkGameOver()) {
            console.log("Game Over!");
            this.#isPlaying = false;
            this.#scoreManager.saveFinalStats();
            this.#showGameOver();
            return;
        }

        // Создаем новую фигуру из preview
        this.creatNewFigure();
        this.#field.drawWithFigure(this.#currentFigure);
    }

    #rotateFigure() {
        console.log("Поворот фигуры");
        const oldShape = this.#currentFigure.shape;
        const rotatedShape = this.#rotateShape(oldShape);

        // Пытаемся повернуть фигуру с системой wall kicks
        if (this.#tryRotateWithWallKicks(rotatedShape)) {
            this.#currentFigure.shape = rotatedShape;
            this.#field.drawWithFigure(this.#currentFigure);
            console.log("Фигура повернута с wall kick");
        } else {
            console.log("Поворот невозможен");
        }
    }
    #tryRotateWithWallKicks(rotatedShape) {
        const originalX = this.#currentFigure.x;
        const originalY = this.#currentFigure.y;
        
        // Тестовые смещения для wall kicks
        const wallKickTests = [
            { x: 0, y: 0 },    // исходная позиция
            { x: -1, y: 0 },   // влево
            { x: 1, y: 0 },    // вправо
            { x: 0, y: -1 },   // вверх
            { x: -2, y: 0 },   // дальше влево
            { x: 2, y: 0 },    // дальше вправо
            { x: -1, y: -1 },  // влево-вверх
            { x: 1, y: -1 }    // вправо-вверх
        ];

        // Создаем тестовую фигуру для проверки коллизий
        const testFigure = {
            x: this.#currentFigure.x,
            y: this.#currentFigure.y,
            shape: rotatedShape,
            getAllCoord: function() {
                const coord = [];
                for (let row = 0; row < this.shape.length; row++) {
                    for (let col = 0; col < this.shape[row].length; col++) {
                        if (this.shape[row][col] !== 0) {
                            coord.push({
                                x: this.x + col,
                                y: this.y + row
                            });
                        }
                    }
                }
                return coord;
            }
        };

        // Пробуем все варианты wall kicks
        for (const test of wallKickTests) {
            testFigure.x = originalX + test.x;
            testFigure.y = originalY + test.y;
            
            if (!this.#field.checkCollision(testFigure, 0, 0)) {
                // Нашли валидную позицию для поворота
                this.#currentFigure.x = testFigure.x;
                this.#currentFigure.y = testFigure.y;
                return true;
            }
        }
        
        // Ни один вариант не подошел
        return false;
    }

    #rotateShape(shape) {
        const rows = shape.length;
        const cols = shape[0].length;
        const newShape = [];

        for (let col = 0; col < cols; col++) {
            const newRow = [];
            for (let row = rows - 1; row >= 0; row--) {
                newRow.push(shape[row][col]);
            }
            newShape.push(newRow);
        }
        return newShape;
    }

    // *создаем новую фигуру из preview
    creatNewFigure() {
        // Берем фигуру ИЗ PREVIEW для текущей
        const type = this.#nextFigureType;
        const startX = Math.floor(this.#field.cols / 2) - 1;
        this.#currentFigure = new Figure(type, startX, 0);
        
        // Получаем НОВУЮ фигуру для preview
        this.#nextFigureType = this.#figureBag.getNext();
        this.#updateNextFigurePreview();
        
        console.log("Создана новая фигура типа:", type, "Следующая фигура:", this.#nextFigureType);
    }

    // *гетеры
    get field() { return this.#field };
    get currentFigure() { return this.#currentFigure };
    get isPlaying() { return this.#isPlaying };
    get scoreManager() { return this.#scoreManager }; // ДОБАВЛЯЕМ геттер для scoreManager

    set isPlaying(value) { this.#isPlaying = value };

    // *все отрисовываем
    draw() {
        if (typeof this.#field.draw === 'function') {
            this.#field.draw();
        }

        if (this.#currentFigure) {
            FigureRenderer.render(this.#currentFigure, this.#field);
        }
    }

    start() {
        this.#isPlaying = true;
        console.log('Game started!');
        this.moveDown();
    }

    // *логика продолжения игры
    moveDown() {
        if (!this.#isPlaying) return;
        
        if (!this.#field.checkCollision(this.#currentFigure, 0, 1)) {
            this.#currentFigure.y++;
            this.#field.drawWithFigure(this.#currentFigure);
            setTimeout(() => this.moveDown(), this.#timeGame);
        } else {
            this.#lockFigure();
            setTimeout(() => this.moveDown(), this.#timeGame);
        }
    }

    #checkGameOver() {
        const testFigure = new Figure(0, Math.floor(this.#field.cols / 2) - 1, 0);
        return this.#field.checkCollision(testFigure, 0, 0);
    }

    // *ОБНОВЛЕННЫЙ МЕТОД: Обновление скорости игры
    #updateGameSpeed() {
        const currentLevel = this.#scoreManager.level;
        
        // Рассчитываем скорость на основе уровня
        // Уровень 1: 1000ms, Уровень 2: 900ms, Уровень 3: 800ms, и т.д.
        // Минимальная скорость: 100ms
        this.#timeGame = Math.max(100, 1000 - (currentLevel - 1) * 100);
        
        // Альтернативная формула для более плавного ускорения:
        // this.#timeGame = Math.max(100, 1000 / currentLevel);
        
        console.log(`🎯 Уровень: ${currentLevel}, Скорость игры: ${this.#timeGame}ms`);
        
        // Обновляем отображение скорости на странице
        this.#updateSpeedDisplay();
    }

    // *НОВЫЙ МЕТОД: Обновление отображения скорости
    #updateSpeedDisplay() {
        const speedElement = document.getElementById('speed');
        if (speedElement) {
            const speedMultiplier = (1000 / this.#timeGame).toFixed(1);
            speedElement.textContent = `${speedMultiplier}x`;
        }
    }

    #showGameOver() {
        const ctx = this.#field.ctx;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, this.#field.cols, this.#field.rows);

        ctx.fillStyle = 'white';
        ctx.font = '1px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', this.#field.cols / 2, this.#field.rows / 2 - 0.5);
        ctx.fillText(`Счет: ${this.#scoreManager.score}`, this.#field.cols / 2, this.#field.rows / 2 + 0.5);
        ctx.fillText(`Уровень: ${this.#scoreManager.level}`, this.#field.cols / 2, this.#field.rows / 2 + 1.5);

        updateUserStats(this.#scoreManager.score);
    }

    // *Публичный метод для сброса игры
    reset() {
        this.#isPlaying = false;
        this.#scoreManager.reset();
        this.#field.clearField();
        this.#figureBag = new FigureBag();
        
        // Получаем новую первую фигуру
        const firstFigureType = this.#figureBag.getNext();
        const startX = Math.floor(this.#field.cols / 2) - 1;
        this.#currentFigure = new Figure(firstFigureType, startX, 0);
        
        // Получаем следующую фигуру для preview
        this.#nextFigureType = this.#figureBag.getNext();
        this.#updateNextFigurePreview();
        
        // Сбрасываем скорость
        this.#timeGame = 1000;
        this.#updateSpeedDisplay();
        
        this.draw();
        console.log('Игра сброшена. Current:', firstFigureType, 'Next:', this.#nextFigureType);
    }
}