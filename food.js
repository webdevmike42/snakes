import * as gameGridModule from "./gameGrid.js";
import * as snakeModule from "./snake.js";

const NullFood = Object.freeze({ position: Object.freeze({ col: -1, row: -1 }), value: 0, color: "" });
let food = NullFood;

export function PlaceFoodCommand(col, row, value, color) {
    const backupFood = food;
    return {
        name: "Place Food",
        execute() {
            food = createFood(col, row, value, color);
            console.log(food);
            console.log(backupFood);
        },

        undo() {
            food = backupFood;
        }
    }
}

function createFood(col, row, value, color) {
    return {
        position: {
            col: col,
            row: row
        },
        value: value,
        color: color
    };
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
    if (food != NullFood) {
        gameGridModule.drawGridSegment([food.position], food.color);
    }
}

export function getFood() {
    return food;
}