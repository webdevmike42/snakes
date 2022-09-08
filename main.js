import * as gameGridModule from "./gameGrid.js";
import * as snakeModule from "./snake.js";
import * as replayModule from "./replay.js";
import * as foodModule from "./food.js";
import { createInputHandler as createInputHandler } from "./input.js";

export const gameMaster = {
    isTwoPlayerGame: false,
    quitGame: false,

    executeCommand(time, command) {
        replayModule.addCommandAtTime(time, command);
        command.execute();
    }
}

const pageLoaded = () => {

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    let startTime = 0, previousTime = -1, timeElapsedSinceLastFrame = 0;
    let snakeIDs = [];

    const score0HTML = document.getElementById("score0");
    const score1HTML = document.getElementById("score1");

    const startButtonHTML = document.getElementById("start");

    const replayButtonHTML = document.getElementById("replay");
    const replayNextStepButtonHTML = document.getElementById("replayNextStep");
    const replayPrevStepButtonHTML = document.getElementById("replayPrevStep");
    const replayStartPauseButtonHTML = document.getElementById("replayStartPause");
    startButtonHTML.addEventListener("click", () => {
        startNewGame();
    });

    replayButtonHTML.addEventListener("click", () => {
        snakeModule.resetSnakes();
        replayModule.initReplay();
        previousTime = -1;
        requestAnimationFrame(replayLoop);
    });

    replayNextStepButtonHTML.addEventListener("click", () => {
        if (!replayModule.isPaused())
            replayModule.pauseReplay();
        if (replayModule.hasNextFrame()) {
            replayModule.executeNextFrameCommands();
            draw();
        }
    });
    replayPrevStepButtonHTML.addEventListener("click", () => {
        if (!replayModule.isPaused())
            replayModule.pauseReplay();
        if (replayModule.hasPrevFrame()) {
            replayModule.undoCurrentFrameCommands();
            draw();
        }
    });
    replayStartPauseButtonHTML.addEventListener("click", () => {
        replayModule.togglePause();
    });

    startNewGame();


    function startNewGame() {
        resetGameEnvironment();
        initGame(document.getElementById("redSnakeEnabled").checked);
        /*
        snakeModule.setIdleState(0);
        snakeModule.logSnakes();
        snakeModule.setGrowingState(0,3);
        snakeModule.logSnakes();
        snakeModule.setShrinkingState(0,5);
        snakeModule.logSnakes();
        */

        requestAnimationFrame(gameLoop);
    }

    function resetGameEnvironment() {
        gameMaster.isTwoPlayerGame = false;
        previousTime = -1;
        replayModule.resetReplay();
        snakeModule.resetSnakes();
        gameMaster.quitGame = false;
        startTime = -1;
    }

    function initGame(isTwoPlayerGame) {
        gameMaster.isTwoPlayerGame = isTwoPlayerGame;
        gameMaster.executeCommand(0, gameGridModule.InitGameGridCommand(20, 20, ctx));
        gameMaster.executeCommand(0, snakeModule.CreateSnakeCommand(0, 0, "black", createInputHandler("w", "a", "s", "d")));

        if (isTwoPlayerGame)
            gameMaster.executeCommand(0, snakeModule.CreateSnakeCommand(5, 5, "red", createInputHandler("i", "j", "k", "l")));

        gameMaster.executeCommand(0, foodModule.placeFoodAtRandomPosition(3, "green"));

        snakeIDs = snakeModule.getSnakeIDs();
    }


    function gameLoop(currentTime) {
        if (startTime === -1)
            startTime = currentTime;
        update(currentTime - startTime);

        if (gameMaster.quitGame) {
            quitGame();
        }
        else {
            draw();
            requestAnimationFrame(gameLoop);
        }
    }

    function update(currentTime) {
        snakeModule.updateSnakes(currentTime, foodModule.getFood());

        /*
        const eatingSnake = snakeModule.getEatingSnake(foodModule.getFood());
        if (eatingSnake !== null) {
            const foodValue = foodModule.getFood().value;
            gameMaster.executeCommand(currentTime, snakeModule.AddScoreCommand(eatingSnake.id, foodValue));
            gameMaster.executeCommand(currentTime, snakeModule.GrowSnakeCommand(eatingSnake.id, foodValue));
            gameMaster.executeCommand(currentTime, foodModule.EatFoodCommand());
            gameMaster.executeCommand(currentTime, foodModule.placeFoodAtRandomPosition(3, "green"));
        }
        */
    }

    function draw() {
        gameGridModule.draw();
        snakeModule.drawSnakes();
        foodModule.drawFood();
        updateHUD();
    }

    function replayLoop(currentTime) {
        if (previousTime === -1)
            previousTime = currentTime;

        timeElapsedSinceLastFrame = currentTime - previousTime;

        replayModule.updateReplay(timeElapsedSinceLastFrame);

        previousTime = currentTime;

        if (!replayModule.isFinished()) {
            draw();
            requestAnimationFrame(replayLoop);
        }
        updateHUD();
    }

    function quitGame() {
        replayModule.logReplay();
        updateHUD();
    }

    function updateHUD() {

        score0HTML.textContent = snakeModule.getSnakeScoreByID(0);
        if (gameMaster.isTwoPlayerGame)
            score1HTML.textContent = snakeModule.getSnakeScoreByID(1);

        replayButtonHTML.disabled = !gameMaster.quitGame;
        replayNextStepButtonHTML.disabled = !replayModule.isReplayInitialized();
        replayPrevStepButtonHTML.disabled = !replayModule.isReplayInitialized();
        replayStartPauseButtonHTML.disabled = !replayModule.isReplayInitialized();
        replayStartPauseButtonHTML.textContent = replayModule.isPaused()
            ? "Resume"
            : "Pause";

    }
}

document.addEventListener("DOMContentLoaded", pageLoaded);
