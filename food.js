import * as gameGridModule from "./gameGrid.js";
import * as snakeModule from "./snake.js";

const NullFood = Object.freeze({ position: {col: -1, row: -1}, value: 0, color: "" });
let food = {...NullFood};

export function PlaceFoodCommand(col, row, value, color) {
    const backupFood = {...food};
    return {
        name: "Place Food",
        execute() {
            food.position.col = col;
            food.position.row = row;
            food.value = value;
            food.color = color;
        },

        undo() {
            food = {...backupFood};
        }
    }
}

/*
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
*/

export function placeFoodAtRandomPosition(value, color) {
    let nextFood = {
        col: Math.floor(Math.random() * gameGridModule.getColumnCount()),
        row: Math.floor(Math.random() * gameGridModule.getRowCount())
    };

    while (snakeModule.isOnAnySnake(nextFood)) {
        nextFood.col = Math.floor(Math.random() * gameGridModule.getColumnCount());
        nextFood.row = Math.floor(Math.random() * gameGridModule.getRowCount());
    }

    return PlaceFoodCommand(nextFood.col, nextFood.row, value, color);
}


export function drawFood() {
    gameGridModule.drawGridSegment([food.position], food.color);
}

export function getFood() {
    return food;
}