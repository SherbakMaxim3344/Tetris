class Field{
    #cols;          // количество колонок
    #rows;          // количество строк
    #blockSize;     // размер одного блока в пикселях
    #blocks;        // двумерный массив блоков поля
    #canvas;        // canvas элемент
    #ctx;           // контекст canvas

    constructor(cols = 10, rows = 20, blockSize = 34) {
        this.#cols = cols;
        this.#rows = rows;
        this.#blockSize = blockSize;
        this.#blocks = this.#createEmptyBoard(); // Создаем пустое игровое поле
        
        this.#initCanvas();
    }
    
    
    get cols() { return this.#cols; }
    get rows() { return this.#rows; }
    get blockSize() { return this.#blockSize; }
    get canvas() { return this.#canvas; }   
    get blocks() { return this.#blocks.map(row => [...row]); }
    get ctx() { return this.#ctx; }
    
    //* Приватный метод: создание пустого игрового поля
    #createEmptyBoard() {
        const board = [];
        for (let row = 0; row < this.#rows; row++) {
            board.push(new Array(this.#cols).fill(0));
        }
        return board;
    }

    // *Приватный метод: инициализация canvas
    #initCanvas() {
        // Проверяем, существует ли уже canvas
        let existingCanvas = document.querySelector('.tetris-field');
        
        if (existingCanvas) {
            // Если canvas уже существует, используем его
            this.#canvas = existingCanvas;
            console.log('Используем существующий canvas');
        } else {
            // Создаем новый canvas элемент только если его нет
            this.#canvas = document.createElement('canvas');
            this.#canvas.className = 'tetris-field';

            // Устанавливаем РЕАЛЬНЫЕ размеры canvas в пикселях
            this.#canvas.width = this.#cols * this.#blockSize;
            this.#canvas.height = this.#rows * this.#blockSize;

            this.#canvas.style.maxHeight = '90vh'; 
            this.#canvas.style.maxWidth = '100%';
            this.#canvas.style.width = 'auto';
            this.#canvas.style.height = 'auto';

            // Добавляем canvas в блок main-field
            const mainField = document.querySelector('.main-field');
            if (mainField) {
                mainField.appendChild(this.#canvas);
                console.log('Создан новый canvas');
            } else {
                // Fallback
                const gameContainer = document.querySelector('.game-container');
                if (gameContainer) {
                    gameContainer.appendChild(this.#canvas);
                }
            }
        }

        // Получаем контекст
        this.#ctx = this.#canvas.getContext('2d');
        this.#ctx.scale(this.#blockSize, this.#blockSize);

        this.#draw();
    }

    // *Приватный метод: отрисовка сетки поля
    #drawGrid() {
        this.#ctx.strokeStyle = '#b3525285';
        this.#ctx.lineWidth = 0.03;

        // Вертикальные линии
        for (let col = 0; col <= this.#cols; col++) {
            this.#ctx.beginPath();      // Начинаем новый путь
            this.#ctx.moveTo(col, 0);   // Переходим к начальной точке
            this.#ctx.lineTo(col, this.#rows); // Рисуем линию до конечной точки
            this.#ctx.stroke();         // Отрисовываем линию
        }

        // Горизонтальные линии
        for (let row = 0; row <= this.#rows; row++) {
            this.#ctx.beginPath();
            this.#ctx.moveTo(0, row);
            this.#ctx.lineTo(this.#cols, row);
            this.#ctx.stroke();
        }
    }

    // *Приватный метод: отрисовка всего поля
    #draw() {
        // Очищаем canvas
        // this.#ctx.fillStyle = '#000';
        // this.#ctx.fillRect(0, 0, this.#cols, this.#rows);
        // Рисуем сетку и блоки
        this.#drawGrid();
    }
    // *Очистка всего поля
    clearField() {
        this.#blocks = this.#createEmptyBoard();
        this.#draw();
    }

    // *рисует и обводит блоки
    #drawBlocks(){
        for(let row=0; row<this.#rows; row++){
            for(let col=0; col<this.#cols; col++){
                const block = this.#blocks[row][col];
                if(block!==0){
                    this.#ctx.fillStyle = block.color;
                    this.#ctx.fillRect(col, row, 1, 1);

                    this.#ctx.strokeStyle = '#9295b2ff';
                    this.#ctx.lineWidth = 0.05;
                    this.#ctx.strokeRect(col, row, 1, 1);
                }
            }
        }
    }

    // *очищает канвас, рисует сохр блоки и потом саму сетку поля
    drawWithFigure(figure = null) {
        // Очищаем canvas
        this.#ctx.clearRect(0, 0, this.#cols, this.#rows);
        this.#drawBlocks();
        this.#drawGrid();

        if (figure) {
            FigureRenderer.render(figure, this);
        }
    }

    // *запоминает фигуру на поле когда она достигла дна
    addFigure(figure){
        const coords=figure.getAllCoord();
        for(const coord of coords){
            if(coord.y >= 0 && coord.y <this.#rows  && coord.x>=0 && coord.x < this.#cols){
                this.#blocks[coord.y][coord.x]={
                    type: figure.type,
                    color: figure.color
                }
            }
        }
    }

    // *проверка что фигура достигла дна
    checkBottom(figure){
        // const maxY=figure.getMaxCoord().y;
        // return maxY >= this.#rows-1;
        return this.checkCollision(figure, 0, 1);
    }

    //*проверка столкновения блоков
    checkCollision(figure, offsetX, offsetY){
        const coords = figure.getAllCoord();
        for(const coord of coords){
            const newX=coord.x+offsetX;
            const newY=coord.y+offsetY;
                        // Проверка границ поля
            if (newX < 0 || newX >= this.#cols || newY >= this.#rows) {
                return true;
            }
            
            // Проверка столкновения с другими блоками
            if(newY>=0 && this.#blocks[newY] && this.#blocks[newY][newX]!==0){
                return true;
            }
        }
        return false;
    }

    // ! ------------------проверка и удаления линии----------------------
    checkAndClearLines(){
        let linesCleared=0;

        for(let row=this.rows-1;row>=0;row--){
            if(this.#isLineFull(row)){
                this.#removeLine(row);
                this.#moveLinesDown(row);
                linesCleared++;
                row++;// Проверяем эту же позицию снова (т.к. линии сместились)
            }
        }
        return linesCleared;
    }

    // *проверка заполнена ли линия
    #isLineFull(row){
        for(let col=0; col<this.#cols; col++){
            if(this.#blocks[row][col]===0){
                return false;
            }
        }
        return true;
    }
    //* удаление линии
    #removeLine(row) {
        for(let col=0; col<this.#cols; col++){
            this.#blocks[row][col]=0;
        }
    }
    //* Смещаем все линии выше удаленной вниз
    #moveLinesDown(clearedRow){
        for(let row=clearedRow; row>0; row--){
            for(let col=0; col<this.#cols; col++){
                this.#blocks[row][col]=this.#blocks[row-1][col];
            }
        }
        // Очищаем самую верхнюю линию
        for(let col=0; col<this.#cols; col++){
            this.#blocks[0][col]=0;
        }
    }
    // ! ------------------проверка и удаления линии----------------------
}


