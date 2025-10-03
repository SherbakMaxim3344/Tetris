class NextFigureRenderer {
    constructor(canvasId, blockSize = 20) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('Canvas not found:', canvasId);
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.blockSize = blockSize;
        
        // Очищаем canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Масштабируем контекст
        this.ctx.scale(blockSize, blockSize);
        
        console.log('NextFigureRenderer initialized');
    }

    // Отрисовка следующей фигуры
    renderNextFigure(figureType) {
        if (!this.ctx) return;
        
        console.log('Rendering next figure type:', figureType);
        
        // Размеры preview области в блоках
        const previewWidth = 6;
        const previewHeight = 6;
        
        // Очищаем canvas
        this.ctx.clearRect(0, 0, previewWidth, previewHeight);
        
        // Создаем временную фигуру для отрисовки
        const figure = new Figure(figureType, 0, 0);
        const shape = figure.shape;
        const figureWidth = shape[0].length;
        const figureHeight = shape.length;
        
        // Вычисляем смещение для центрирования
        const offsetX = Math.floor((previewWidth - figureWidth) / 2);
        const offsetY = Math.floor((previewHeight - figureHeight) / 2);
        
        // Отрисовываем фон
        this.ctx.fillStyle = '#131329';
        this.ctx.fillRect(0, 0, previewWidth, previewHeight);
        
        // Отрисовываем сетку preview
        this.#drawPreviewGrid(previewWidth, previewHeight);
        
        // Отрисовываем фигуру
        this.#drawFigure(figure, offsetX, offsetY);
    }

    // Отрисовка сетки preview
    #drawPreviewGrid(width, height) {
        this.ctx.strokeStyle = '#7b43ac52';
        this.ctx.lineWidth = 0.03;

        // Вертикальные линии
        for (let col = 0; col <= width; col++) {
            this.ctx.beginPath();
            this.ctx.moveTo(col, 0);
            this.ctx.lineTo(col, height);
            this.ctx.stroke();
        }

        // Горизонтальные линии
        for (let row = 0; row <= height; row++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, row);
            this.ctx.lineTo(width, row);
            this.ctx.stroke();
        }
    }

    // Отрисовка фигуры
    #drawFigure(figure, offsetX, offsetY) {
        const shape = figure.shape;
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] !== 0) {
                    // Рисуем блок
                    this.ctx.fillStyle = figure.color;
                    this.ctx.fillRect(col + offsetX, row + offsetY, 1, 1);
                    
                    // Рисуем обводку
                    this.ctx.strokeStyle = '#9295b2ff';
                    this.ctx.lineWidth = 0.05;
                    this.ctx.strokeRect(col + offsetX, row + offsetY, 1, 1);
                }
            }
        }
    }

    // Очистка preview
    clear() {
        if (this.ctx) {
            const previewWidth = 6;
            const previewHeight = 6;
            this.ctx.clearRect(0, 0, previewWidth, previewHeight);
        }
    }
}