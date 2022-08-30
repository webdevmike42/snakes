export function createInputHandler(up, left, down, right) {
    const inputBuffer = [];
    const INPUT_BUFFER_SIZE = 3;
    let lastValidInput = { x: 0, y: 0 };
    const movementKeys = {
        "up": up,
        "left": left,
        "down": down,
        "right": right
    }

    const inputHandler = {
        getNextInput() {
            const nextInput = inputBuffer.shift()
            return (nextInput != undefined)
                ? nextInput
                : lastValidInput;
        },

        setMovementKeys({ up = movementKeys.up, left = movementKeys.left, down = movementKeys.down, right = movementKeys.right }) {
            movementKeys.up = up;
            movementKeys.left = left;
            movementKeys.down = down;
            movementKeys.right = right;
        }
    }

    window.addEventListener("keypress", e => {

        switch (e.key) {
            case movementKeys.up:
                if (lastValidInput.y != 0) break;
                inputBuffer.push({ x: 0, y: -1 });
                break;
            case movementKeys.left:
                if (lastValidInput.x != 0) break;
                inputBuffer.push({ x: -1, y: 0 });
                break;
            case movementKeys.down:
                if (lastValidInput.y != 0) break;
                inputBuffer.push({ x: 0, y: 1 });
                break;
            case movementKeys.right:
                if (lastValidInput.x != 0) break;
                inputBuffer.push({ x: 1, y: 0 });
                break;
        }

        while (inputBuffer.length > INPUT_BUFFER_SIZE)
            inputBuffer.shift();

        if (inputBuffer.length > 0)
            lastValidInput = { ...inputBuffer.slice(-1)[0] };
    })

    return inputHandler;
}