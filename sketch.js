let grid = [];
let numCols = 20;
let numRows = 24;
let cellSize = 20;
let colorA, colorB;
let density = 0.5;
let param2 = 50;
let symmetryMode = "none";
let algorithm = "random";
let classicPattern = "greekKey";
let uploadedImg = null;

function setup() {
    readControls();

    const sz = canvasSize(numCols, numRows, cellSize);
    const canvas = createCanvas(sz.width, sz.height);
    canvas.parent("sketch-holder");

    generatePattern();
    updateSwatches();

    // Handlers defined in ui-logic.js
    setupUIHandlers();

    noLoop();
}

function draw() {
    background(255);
    drawChart();
}


/**
 * Build a valid mosaic knitting grid using the selected algorithm.
 */
function generatePattern() {
    let wCols = numCols;
    let wRows = numRows;

    if (symmetryMode === "mirrorX" || symmetryMode === "kaleidoscope") {
        wCols = Math.ceil(numCols / 2);
    }
    if (symmetryMode === "mirrorY" || symmetryMode === "kaleidoscope") {
        wRows = Math.ceil(numRows / 2);
    }

    const algoOpts = {
        seedPattern: (document.getElementById('seedPattern') || {}).value,
        customSeed: (document.getElementById('customSeed') || {}).value,
        perlinScale: (document.getElementById('perlinScale') || {}).value,
        wolframRule: (document.getElementById('wolframRule') || {}).value,
        waveCount: (document.getElementById('waveCount') || {}).value
    };
    let raw;
    const entry = ALGORITHM_REGISTRY[algorithm];
    raw = entry ? entry.fn(wCols, wRows, algoOpts) : algRandom(wCols, wRows);

    const fullRaw = applySymmetry(raw, wCols, wRows);
    grid = enforceMosaicConstraints(fullRaw, numCols, numRows);
    updateStitchCounts();
}

function updateStitchCounts() {
    let countA = 0;
    let countB = 0;

    for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
            if (grid[r][c] === 0) {
                // Color A
                countA += 2; // each chart row represents 2 knitted rows
            } else {
                // Color B
                countB += 2;
            }
        }
    }

    const countAEl = document.getElementById("countA");
    const countBEl = document.getElementById("countB");
    if (countAEl) countAEl.textContent = countA;
    if (countBEl) countBEl.textContent = countB;
}

function applySymmetry(source, w, h) {
    let out = [];

    const reflectRow = (rowArr) => {
        const left = rowArr.slice();
        const pivot = (numCols % 2 === 0) ? 0 : 1;
        const right = rowArr.slice().reverse().slice(pivot);
        return left.concat(right);
    };

    let baseRows = [];
    for (let r = 0; r < h; r++) {
        if (!source[r]) continue;

        if (symmetryMode === "mirrorX" || symmetryMode === "kaleidoscope") {
            baseRows.push(reflectRow(source[r]));
        } else {
            baseRows.push(source[r].slice());
        }
    }

    if (symmetryMode === "mirrorY" || symmetryMode === "kaleidoscope") {
        const pivot = (numRows % 2 === 0) ? 0 : 1;
        const top = baseRows.slice();
        const bottom = top.slice().reverse().slice(pivot);
        out = top.concat(bottom);
    } else {
        out = baseRows;
    }

    while (out.length < numRows) {
        out.push(new Array(numCols).fill(0));
    }
    return out.slice(0, numRows);
}

function drawChart(pg = window) {
    const mx = MARGIN_LEFT;
    const my = MARGIN_TOP;

    pg.push();
    pg.translate(mx, my);

    pg.noStroke();
    pg.textSize(cellSize * 0.6);
    pg.textAlign(CENTER, CENTER);

    for (let r = 0; r < numRows; r++) {
        const y = (numRows - 1 - r) * cellSize;
        const rowNum = r * 2 + 1;
        const { active } = getRowColors(r);
        const activeColor = active === 0 ? colorA : colorB;

        pg.fill(0);
        pg.text(rowNum, -20, y + cellSize / 2);

        pg.fill(activeColor);
        pg.rect(-10, y + 4, 6, cellSize - 8);

        for (let c = 0; c < numCols; c++) {
            const x = c * cellSize;

            const val = grid[r][c];
            pg.fill(val === 1 ? colorB : colorA);
            pg.stroke(200);
            pg.strokeWeight(1);
            pg.rect(x, y, cellSize, cellSize);

            if (val !== active) {
                pg.noStroke();
                const dotColor = pg.color(val === 0 ? colorB : colorA);
                dotColor.setAlpha(160);
                pg.fill(dotColor);
                pg.ellipse(x + cellSize / 2, y + cellSize / 2, cellSize * 0.3);
            }
        }
    }

    pg.noFill();
    pg.stroke(0);
    pg.strokeWeight(2);
    pg.rect(0, 0, numCols * cellSize, numRows * cellSize);

    pg.pop();
}
