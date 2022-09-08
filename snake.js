import { gameMaster } from "./main.js";
import * as gameGridModule from "./gameGrid.js";
import * as foodModule from "./food.js";

let snakes = [];
let _id = 0;
const states = Object.freeze({
    IDLE: "idle",
    GROWING: "growing",
});

export function setIdleState(snakeID) {
    getSnakeByID(snakeID).state = { type: states.IDLE, value: 0 };
}

export function setGrowingState(snakeID, growBy) {
    const snake = getSnakeByID(snakeID);
    const currentGrowValue = (snake.state.type === states.GROWING
        ? snake.state.value
        : 0);

    //adding growBy supports eating food while growing
    snake.state = { type: states.GROWING, value: (snake.state.value + growBy) };
}

export function CreateSnakeCommand(col, row, color, inputHandler) {
    return {
        name: "CreateSnake",
        execute() {
            const newSnake = {
                id: _id++,
                body: [{ col: col, row: row }],
                color: color,
                state: {},
                speed: 10,
                lastRenderTime: 0,
                score: 0,
                inputHandler: inputHandler
            };
            snakes.push(newSnake);
            setIdleState(newSnake.id);
        },

        undo() {
            let index = snakes.findIndex(snake => snake.id === newSnake.id);
            if (index !== -1)
                snakes.splice(index, 1);
        }
    };
};

export function getSnakeIDs() {
    return snakes.map(snake => snake.id);
}

export function getSnakeByID(snakeID) {
    return snakes.find(snake => snake.id === snakeID);
}

export function updateSnakes(currentTime, food) {
    snakes.forEach(snake => {
        if ((currentTime - snake.lastRenderTime) >= (1000 / snake.speed)) {

            if (snake.state.type === states.GROWING) {
                if (snake.state.value > 0) {
                    gameMaster.executeCommand(currentTime, GrowSnakeCommand(snake.id));
                    snake.state.value--;
                } else {
                    setIdleState(snake.id);
                }
            }

            gameMaster.executeCommand(currentTime, MoveSnakeCommand(snake.id, snake.inputHandler.getNextInput()));

            if (isSnakeEatingFood(snake.id, food.position)) {
                gameMaster.executeCommand(currentTime, AddScoreCommand(snake.id, food.value));
                setGrowingState(snake.id, food.value);
                //gameMaster.executeCommand(currentTime, snakeModule.GrowSnakeCommand(snake.id, food.value));
                //gameMaster.executeCommand(currentTime, foodModule.EatFoodCommand());
                gameMaster.executeCommand(currentTime, foodModule.placeFoodAtRandomPosition(3, "green"));
            }



            snake.lastRenderTime = currentTime;
        }
    });
}

export function drawSnakes() {
    snakes.forEach(snake => gameGridModule.drawGridSegment(snake.body, snake.color));
}

export function MoveSnakeCommand(snakeID, moveBy) {
    return {
        name: "MoveSnake",
        execute() {
            move(snakeID, moveBy);
        },

        undo() {
            reverseMove(snakeID, { x: moveBy.x * -1, y: moveBy.y * -1 });
        }
    };
}

function isSnakeEatingFood(snakeID, foodPosition) {
    return isOnSnake(snakeID, foodPosition);
}

function reverseMove(snakeID, inputDirection) {
    //reverseMove only used for replay
    if (inputDirection.x == 0 && inputDirection.y == 0) return;

    const snakeBody = getSnakeByID(snakeID).body;
    const tail = snakeBody[snakeBody.length - 1];

    for (let i = 0; i < snakeBody.length - 1; i++) {
        snakeBody[i] = { ...snakeBody[i + 1] };
    }

    tail.col += inputDirection.x;
    tail.row += inputDirection.y;
}

function move(snakeID, inputDirection) {
    if (inputDirection.x == 0 && inputDirection.y == 0) return;

    const snake = getSnakeByID(snakeID);
    const head = snake.body[0];

    for (let i = snake.body.length - 1; i > 0; i--) {
        snake.body[i] = { ...snake.body[i - 1] };
    }

    head.col += inputDirection.x;
    head.row += inputDirection.y;

    if (isSnakeCollided(snakeID))
        gameMaster.quitGame = true;
}

function isSnakeCollided(snakeID) {
    const head = getSnakeHeadByID(snakeID);
    return snakes.reduce((result, snake) => result || isOnSnake(snake.id, { ...head }, snake.id === snakeID), false)
        || head.col < 0 || head.col >= gameGridModule.getColumnCount() || head.row < 0 || head.row >= gameGridModule.getRowCount();
}

export function isOnSnake(snakeID, gridCell, ignoreHead = false) {
    return getSnakeByID(snakeID).body.some((part, index) => {
        if (ignoreHead && index === 0) return false;
        return gridCell.col === part.col && gridCell.row === part.row;
    });
}

export function isOnAnySnake(gridCell) {
    return snakes.reduce((result, snake) => result || isOnSnake(snake.id, gridCell), false);
}

function getSnakeHeadByID(snakeID) {
    return getSnakeByID(snakeID).body[0];
}

function grow(snakeID) {
    const snake = getSnakeByID(snakeID);
    const tail = snake.body[snake.body.length - 1];
    snake.body.push({ x: tail.x, y: tail.y });
}

function shrink(snakeID) {
    getSnakeByID(snakeID).body.pop();
}

export function GrowSnakeCommand(snakeID) {
    return {
        name: "GrowSnake",
        execute() {
            grow(snakeID);
        },

        undo() {
            shrink(snakeID);
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

export function getSnakeScoreByID(snakeID) {
    return getSnakeByID(snakeID).score;
}

function addScoreToSnake(snakeID, score) {
    getSnakeByID(snakeID).score += score;
}

function removeScoreFromSnake(snakeID, score) {
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
