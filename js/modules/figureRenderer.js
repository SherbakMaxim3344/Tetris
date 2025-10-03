class FigureRenderer {
    static render(figure, field) {
        const ctx = field.ctx;
        const size = figure.size;
        const offset = (1 - size) / 2;
        
        figure.shape.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (cell > 0) {
                    const x = figure.x + colIndex + offset;
                    const y = figure.y + rowIndex + offset;
                    
                    ctx.fillStyle = figure.color;
                    ctx.fillRect(x, y, size, size);
                    
                    // обводка
                    ctx.strokeStyle = '#ffffff84'; 
                    ctx.lineWidth = 0.05;
                    ctx.strokeRect(x, y, size, size);
                }
            });
        });
    }

    // Новый метод для отрисовки предпросмотра (ghost piece)
    static renderGhost(figure, field) {
        const ctx = field.ctx;
        const size = figure.size;
        const offset = (1 - size) / 2;
        
        figure.shape.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (cell > 0) {
                    const x = figure.x + colIndex + offset;
                    const y = figure.y + rowIndex + offset;
                    
                    // Полупрозрачный серый цвет для предпросмотра
                    ctx.fillStyle = 'rgba(128, 128, 128, 0.3)';
                    ctx.fillRect(x, y, size, size);
                    
                    // Тонкая обводка для ghost piece
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.lineWidth = 0.03;
                    ctx.strokeRect(x, y, size, size);
                }
            });
        });
    }
}