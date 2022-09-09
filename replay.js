let replay = [];
let replayIndex = 0, replayTime = 0, prevFrameTime = 0;
let replayPaused = false, replayFinished = false, replayInitialized = false;
const NullCommands = [{ name: "NULL_COMMAND", execute() { }, undo() { } }];
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

export function initReplay() {
    replayIndex = 0;
    replayTime = 0;
    replayPaused = false;
    replayFinished = false;
    replayInitialized = true;
    executeFrameCommandsAtIndex(replayIndex++);
}

export function resetReplay() {
    replay = [];
    replayIndex = 0;
    replayTime = 0;
    replayPaused = false;
    replayFinished = false;
}

/*
export function executeReplayLoopFromIndex(index) {
    replayIndex = clamp(index, 0, replay.length - 1);

    while (!isReplayFinished()) {
        console.log("executing");
        setTimeout(() => {
            executeFrameCommandsAtIndex(replayIndex);
        },replay[replayIndex+1]?.time || 0);
        replayIndex++;
    }
}
*/

/*
function executeFrameCommandsAtCurrentIndex() {
    getFrameCommandsAtIndex(replayIndex).forEach(cmd => {
        console.log(cmd);
        cmd.execute()
    });
}
*/

function executeFrameCommandsAtIndex(index) {
    console.log("executeFrameCommandsAtIndex: " + index);
    getFrameCommandsAtIndex(index).forEach(cmd => {
        console.log(cmd);
        cmd.execute()
    });
}

function getFrameCommandsAtIndex(index) {
    return (index >= 0 && index < replay.length)
        ? replay[index].commands
        : [...NullCommands];
}

export function executeNextFrameCommands() {
    executeFrameCommandsAtIndex(++replayIndex);
    replayTime = replay[replayIndex].time;
}

export function undoCurrentFrameCommands() {
    let test = getFrameCommandsAtIndex(replayIndex--).reverse();
    console.log(test);
    test.forEach(cmd => cmd.undo());
    replayTime = replay[replayIndex].time;
    /*
    getFrameCommandsAtIndex(replayIndex--).reverse().forEach(cmd => cmd.undo());
    replayTime = replay[replayIndex].time;
    */
}

export function isReplayFinished() {
    return replayIndex >= replay.length;
}

export function pauseReplay(currentTime) {
    replayPaused = true;
}

export function resumeReplay(currentTime) {
    replayPaused = false;
}

export function togglePause(currentTime) {
    if (replayPaused) resumeReplay(currentTime);
    else pauseReplay(currentTime);
}

export function isPaused() {
    return replayPaused;
}

export function updateReplay(timeSinceLastCall) {
    if (isPaused()) return;

    if (!hasNextFrame()) {
        finishReplay();
        return;
    }

    replayTime += timeSinceLastCall;

    if (canExecuteCommandsOfNextFrame(replayTime))
        executeNextFrameCommands();
}

function canExecuteCommandsOfNextFrame(time) {
    return hasNextFrame() && replay[replayIndex + 1].time <= time;
}

export function hasNextFrame() {
    return replayIndex < replay.length - 1;
}

export function hasPrevFrame() {
    return replayIndex > 0;
}


export function isFinished() {
    return replayFinished;
}

function finishReplay() {
    replayFinished = true;
    replayInitialized = false;
}

export function addCommandAtTime(currentTime, command) {
    const frame = (existsFrameAtTime(currentTime)
        ? getFrameAtTime(currentTime)
        : createFrameAtTime(currentTime))

    frame.commands.push(command);
}

function existsFrameAtTime(time) {
    return replay.some(frame => frame.time === time);
}

function getFrameAtTime(time) {
    return replay.find(frame => frame.time === time);
}

function createFrameAtTime(currentTime) {
    const newFrame = {
        deltaTimeToPrevFrame: currentTime - prevFrameTime,
        time: currentTime,
        commands: []
    };
    replay.push(newFrame);
    prevFrameTime = currentTime;
    return newFrame;
}

export function logReplay() {
    console.log(replay);
}

export function isReplayInitialized() {
    return replayInitialized;
}