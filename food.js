import * as gameGridModule from "./gameGrid.js";
import * as snakeModule from "./snake.js";

const NullFood = { col: -1, row: -1, value: 0, color: "" };
let food = {...NullFood};

export function PlaceFoodCommand(col, row, value, color) {
    return {
        name: "Place Food",
        execute() {
            food.col = col;
            food.row = row;
            food.value = value;
            food.color = color;
        },

        undo() {
            food = {...NullFood};
        }
    }
}

export function EatFoodCommand() {
    const backupFood = {...food};
    return {
        name: "Eat Food",
        execute() {
            food = {...NullFood};
        },

        undo() {
            food = {...backupFood};
        }
    }
}


export function placeFoodAtRandomPosition(value, color) {
    let nextFood = {
        col: Math.floor(Math.random() * gameGridModule.getColumnCount()),
        row: Math.floor(Math.random() * gameGridModule.getRowCount())
    };

    while (snakeModule.isOAnySnake(nextFood)) {
        nextFood.col = Math.floor(Math.random() * gameGridModule.getColumnCount());
        nextFood.row = Math.floor(Math.random() * gameGridModule.getRowCount());
    }

    return PlaceFoodCommand(nextFood.col, nextFood.row, value, color);
}


export function drawFood() {
    gameGridModule.drawGridSegment([{ col: food.col, row: food.row }], food.color);


    /*
        this.food = ((row < 0 || row >= this.gameGrid.rows || col < 0 || col >= this.gameGrid.cols || this.snakes.reduce((isOnSnake, snake) => isOnSnake || snake.onSnake({ x: col, y: row }), false)))
            ? {
                row: -1,
                col: -1,
                color: "",
                value: -1,
                draw() { }
            }
            : {
                row: row,
                col: col,
                color: "green",
                value: 1,
                draw(ctx) {
                    ctx.fillStyle = this.color;
                    ctx.fillRect(col * gameMaster.gameGrid.colWidth, row * gameMaster.gameGrid.rowHeight, gameMaster.gameGrid.colWidth, gameMaster.gameGrid.rowHeight);
                }
            }
            */
}

export function getFood() {
    return food;
}

/*
function createFoodAtRandom() {
    do {
        this.createFoodAt(Math.floor(Math.random() * this.gameGrid.cols), Math.floor(Math.random() * this.gameGrid.rows));
    }
    while (this.food.value === -1);
}
*/