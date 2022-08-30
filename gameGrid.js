let _colCount = 0, _rowCount = 0, _colWidth = 0, _rowHeight = 0, _ctx = null;
const gridColors = ["lightgrey", "darkgrey"], backgroundColor = "lightgrey";

export function InitGameGridCommand(colCount, rowCount, ctx) {
    return {
        name: "InitGameGrid",
        execute() {
            if (ctx.canvas !== null) {
                _colCount = colCount;
                _rowCount = rowCount;
                _colWidth = ctx.canvas.width / colCount;
                _rowHeight = ctx.canvas.height / rowCount;
                _ctx = ctx;
            }
        },

        undo() {
            _colCount = 0;
            _rowCount = 0;
            _colWidth = 0;
            _rowHeight = 0;
            _ctx = null;
        }
    };
}

export function draw() {
    if (_ctx !== null) {
        for (let r = 0; r < _rowCount; r++) {
            for (let c = 0; c < _colCount; c++) {
                _ctx.fillStyle = gridColors[Math.abs((c % 2) - (r % 2))];
                _ctx.fillRect(c * _colWidth, r * _rowHeight, _colWidth, _rowHeight);
            }
        }
    }
}

function clear() {
    if (_ctx.canvas !== null) {
        _ctx.fillStyle = backgroundColor;
        _ctx.fillRect(0, 0, _ctx.canvas.width, _ctx.canvas.height);
    }
}

export function drawGridSegment(gridCellArray, color) {
    if (_ctx !== null) {
        _ctx.fillStyle = color;
        gridCellArray.forEach(cell => _ctx.fillRect(cell.col * _colWidth, cell.row * _rowHeight, _colWidth, _rowHeight));
    }
}

export function clearGridSegment(gridCellArray) {
    if (_ctx !== null) {
        gridCellArray.forEach(cell => {
            _ctx.fillStyle = gridColors[Math.abs((cell.col % 2) - (cell.row % 2))];
            _ctx.fillRect(cell.col * _colWidth, cell.row * _rowHeight, _colWidth, _rowHeight);
        });
    }
}

export function getColumnCount(){
    return _colCount;
}

export function getRowCount(){
    return _rowCount;
}