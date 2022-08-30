import { gameMaster } from "./main.js";
import * as gameGridModule from "./gameGrid.js";

let snakes = [];
let _id = 0;

export function CreateSnakeCommand(col, row, color, inputHandler) {
    return {
        name: "CreateSnake",
        execute() {
            const newSnake = {
                id: _id++,
                body: [{ col: col, row: row }],
                color: color,
                speed: 10,
                lastRenderTime: 0,
                score: 0,
                inputHandler: inputHandler
            };
            snakes.push(newSnake);
        },

        undo() {
            let index = snakes.findIndex(snake => snake.id === newSnake.id);
            if (index !== -1)
                snakes.splice(index, 1);
        }
    };
};


export function getSnakeByID(snakeID) {
    return snakes.find(snake => snake.id === snakeID);
}

export function updateSnakes(currentTime) {
    snakes.forEach(snake => {
        if ((currentTime - snake.lastRenderTime) >= (1000 / snake.speed)) {
            gameMaster.executeCommand(currentTime, MoveSnakeCommand(snake.id, snake.inputHandler.getNextInput()));
            snake.lastRenderTime = currentTime;
        }
    });
}

export function drawSnakes() {
    snakes.forEach(snake => gameGridModule.drawGridSegment(snake.body, snake.color));
}

export function MoveSnakeCommand(snakeID, moveBy) {
    const snake = getSnakeByID(snakeID);

    return {
        name: "MoveSnake",
        execute() {
            gameGridModule.clearGridSegment(snake.body);
            move(snakeID, moveBy);
            gameGridModule.drawGridSegment(snake.body, snake.color);
        },

        undo() {
            gameGridModule.clearGridSegment(snake.body);
            move(snakeID, { x: moveBy.x * -1, y: moveBy.y * -1 });
            gameGridModule.drawGridSegment(snake.body, snake.color);
        }
    };
}

export function getEatingSnake({ col, row }) {
    const eatingSnakes = snakes.filter(snake => {
        const head = snake.body[0];
        return col == head.col && row == head.row;
    });

    return eatingSnakes.length === 0
        ? null
        : eatingSnakes[0];
}

function move(snakeID, inputDirection) {
    const snake = getSnakeByID(snakeID);

    if (inputDirection.x == 0 && inputDirection.y == 0) return;

    const newHead = { ...snake.body[0] };
    newHead.col += inputDirection.x;
    newHead.row += inputDirection.y;

    snake.body = [newHead, ...snake.body.slice(0, -1)];

    if (isSnakeCollided(snakeID))
        gameMaster.quitGame = true;
}

function isSnakeCollided(snakeID) {
    const head = getSnakeHeadByID(snakeID);
    return snakes.reduce((result, snake) => result || isOnSnake(snake.id, { ...head }, snake.id === snakeID), false)
        || head.col < 0 || head.col >= gameGridModule.getColumnCount() || head.row < 0 || head.row >= gameGridModule.getRowCount();
}

export function isOnSnake(snakeID, gridCell, ignoreHead = false) {
    const snake = getSnakeByID(snakeID);
    return snake.body.some((part, index) => {
        if (ignoreHead && index === 0) return false;
        return gridCell.col === part.col && gridCell.row == part.row;
    });
}

export function isOAnySnake(gridCell) {
    return snakes.reduce((result, snake) => result || isOnSnake(snake.id, gridCell), false);
}

function getSnakeHeadByID(snakeID) {
    return getSnakeByID(snakeID).body[0];
}


function grow(snakeID, growBy) {
    const snake = getSnakeByID(snakeID);
    const tail = snake.body[snake.body.length - 1];
    for (let i = 0; i < growBy; i++) {
        snake.body.push({ x: tail.x, y: tail.y });
    }
}

function shrink(snakeID, shrinkBy) {
    const snake = getSnakeByID(snakeID);
    for (let i = 0; i < shrinkBy; i++) {
        snake.body.pop();
    }
}

export function GrowSnakeCommand(snakeID, growBy) {
    return {
        name: "GrowSnake",
        execute() {
            grow(snakeID, growBy);
        },

        undo() {
            shrink(snakeID, growBy);
        }
    };
}

export function resetSnakes() {
    snakes = [];
    _id = 0;
}

export function logSnakes() {
    console.log(snakes);
}

export function getSnakeScoreByID(snakeID){
    return getSnakeByID(snakeID).score;
}

function addScoreToSnake(snakeID, score){
    getSnakeByID(snakeID).score += score;
}

function removeScoreFromSnake(snakeID, score){
    getSnakeByID(snakeID).score -= score;
}

export function AddScoreCommand(snakeID, score) {
    return {
        name: "Add Score",
        execute() {
            addScoreToSnake(snakeID, score);
        },

        undo() {
            removeScoreFromSnake(snakeID, score);
        }
    };
};
