class FigureBag {
    constructor() {
        this.bag = [];
        this.refillBag();
    }

    // Заполняем мешок всеми 7 фигурами в случайном порядке
    refillBag() {
        const figures = [0, 1, 2, 3, 4, 5, 6];
        // Перемешиваем фигуры
        for (let i = figures.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [figures[i], figures[j]] = [figures[j], figures[i]];
        }
        this.bag = figures;
    }

    // Берем следующую фигуру из мешка
    getNext() {
        if (this.bag.length === 0) {
            this.refillBag();
        }
        return this.bag.pop();
    }

    // Предпросмотр следующих фигур (опционально)
    getPreview(count = 3) {
        const preview = [];
        const tempBag = [...this.bag];
        
        for (let i = 0; i < count; i++) {
            if (tempBag.length === 0) {
                // Если мешок пуст, создаем временный
                const figures = [0, 1, 2, 3, 4, 5, 6];
                for (let i = figures.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [figures[i], figures[j]] = [figures[j], figures[i]];
                }
                tempBag.push(...figures);
            }
            preview.push(tempBag.pop());
        }
        
        return preview;
    }
}