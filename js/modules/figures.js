class Figure{
    #type;      // тип фигуры (0-6)
    #x;         // позиция X на поле
    #y;         // позиция Y на поле  
    #shape;     // матрица формы фигуры
    #color;     // цвет фигуры
    #size;      // размер блока (0.8 = 80% клетки)

    constructor(type, x=0, y=0){
        this.#type=type;
        this.#x=x;
        this.#y=y;
        this.#shape=this.#getShape(type);
        this.#color=this.#getColor(type);
        this.#size=1;
    }
        
    get type() { return this.#type; }
    get x() { return this.#x; }
    set x(value) { this.#x = value; }
    get y() { return this.#y; }
    set y(value) { this.#y = value; }
    get shape() { return this.#shape; }
    set shape(value) { this.#shape = value; } 
    get color() { return this.#color; }
    get size() { return this.#size; }



    // *получаем коорды
    getAllCoord(){
        const coord=[];
        const shape=this.#shape;

        for(let row=0; row< shape.length; row++){
            for(let col=0; col<shape[row].length; col++){
                if(shape[row][col]!==0){
                    coord.push({
                        x: this.#x+col,
                        y: this.#y+row
                    });
                }
            }
        }
        return coord;
    }

    // *ищет минимальные координаты фигуры
    getMinCoord(){
        const coord=this.getAllCoord();
        let minX=coord[0].x;
        let minY=coord[0].y;
        for(let i=1; i<coord.length; i++){
            if(coord[i].x<minX){
                minX=coord[i].x;
            }
            if(coord[i].y<minY){
                minY=coord[i].y;
            }
        }
        return{x: minX, y:minY};
    }
    // *ищет максимальные координаты фигуры
    getMaxCoord(){
        const coord=this.getAllCoord();
        let maxX=coord[0].x;
        let maxY=coord[0].y;
        for(let i=1; i<coord.length; i++){
            if(coord[i].x>maxX){
                maxX=coord[i].x;
            }
            if(coord[i].y>maxY){
                maxY=coord[i].y;
            }
        }
        return{x: maxX, y:maxY};
    }

    // *Приватный метод: получение формы фигуры
    #getShape(type) {
        const shapes = [
            [[1, 1, 1, 1]],                               // I
            [[2, 0, 0], [2, 2, 2]],                       // J
            [[0, 0, 3], [3, 3, 3]],                       // L
            [[4, 4], [4, 4]],                             // O
            [[0, 5, 5], [5, 5, 0]],                       // S
            [[0, 6, 0], [6, 6, 6]],                       // T
            [[7, 7, 0], [0, 7, 7]]                        // Z
        ];
        
        return shapes[type] || shapes[0];
    }

    // *Приватный метод: получение цвета фигуры
    #getColor(type) {
        const colors = [
            '#a91b1bff', //  - I
            '#3743c2ff', //  - J
            '#2792aaff', //  - L
            '#f9c74f', //  - O
            '#619b35ff', //  - S
            '#e0682cff', //  - T
            '#a813c6ff'  //  - Z
        ];
        return colors[type] || colors[0];
    }

}