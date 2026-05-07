// ── Shared constants and helpers ──────────────────────────

// Layout constants — single source of truth for chart margins and padding
const MARGIN_LEFT = 40;
const MARGIN_TOP = 20;
const CANVAS_PAD_X = 70; // total horizontal canvas padding (margins + row-number gutter)
const CANVAS_PAD_Y = 40; // total vertical canvas padding

/**
 * Calculate canvas pixel dimensions from grid parameters.
 * @param {number} cols  Number of stitch columns
 * @param {number} rows  Number of chart rows
 * @param {number} cell  Pixel size of one cell
 * @returns {{ width: number, height: number }}
 */
function canvasSize(cols, rows, cell) {
    return {
        width: cols * cell + CANVAS_PAD_X,
        height: rows * cell + CANVAS_PAD_Y
    };
}

/**
 * Return the active and inactive colour indices for a given grid row.
 * Even rows (0, 2, 4…) → Color A active (0), Color B inactive (1).
 * Odd  rows (1, 3, 5…) → Color B active (1), Color A inactive (0).
 * @param {number} r  Zero-based row index
 * @returns {{ active: number, inactive: number }}
 */
function getRowColors(r) {
    const active = r % 2 === 0 ? 0 : 1;
    return { active, inactive: 1 - active };
}

/**
 * Parse a string to an integer, constrain it within [min, max],
 * and return the result. Returns `fallback` if the value is NaN.
 * @param {string|number} value  Raw value to parse
 * @param {number} min      Lower bound (inclusive)
 * @param {number} max      Upper bound (inclusive)
 * @param {number} fallback Default if NaN
 * @returns {number}
 */
function safeParseInt(value, min, max, fallback) {
    const n = parseInt(value, 10);
    if (isNaN(n)) return fallback;
    return Math.max(min, Math.min(max, n));
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function hashCode(str) {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
        let chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return Math.abs(hash);
}

// ── Algorithm registry ───────────────────────────────────
// Maps algorithm key → { fn, description, densityLabel, param2Label, setup }
// Populated by algorithms.js; used by sketch.js and ui-logic.js

const ALGORITHM_REGISTRY = {};

/**
 * Register an algorithm so generatePattern() and the UI can discover it.
 * @param {string} key           Algorithm select-value (e.g. "perlin")
 * @param {object} opts
 * @param {Function} opts.fn            Generator function(cols, rows) → grid[][]
 * @param {string}  opts.description   Human-readable description for the UI
 * @param {string}  [opts.densityLabel] Custom label for the density slider
 * @param {string}  [opts.param2Label]  Label for the secondary slider (falsy = hidden)
 * @param {Function} [opts.setup]       Called by readControls() to show/hide specialised controls
 */
function registerAlgorithm(key, opts) {
    ALGORITHM_REGISTRY[key] = opts;
}

// ── Algorithm description / label data ───────────────────
// Kept here so both readControls() and any future UI can reference them
// without duplicating strings inside ui-logic.js.

const ALGO_DESCRIPTIONS = {
    random: "Randomly fills grid cells based on density.",
    classic: "Traditional knitting motifs like Greek Keys and Houndstooth.",
    image: "Upload an image to convert it into a 2-color mosaic chart using dithering.",
    diamonds: "Generates a repeating diamond grid pattern. Scale controls diamond size.",
    chevron: "Creates zigzagging chevron stripes. Band width controls thickness.",
    brick: "Offset rectangular blocks resembling masonry. Brick size controls frequency.",
    diagonal: "Simple diagonal stripes across the chart.",
    seed: "Alternating single-pixel checkerboard pattern (Seed stitch).",
    zigzag: "Horizontal zigzag waves. Amplitude controls height.",
    basket: "Woven basketweave blocks.",
    cellular: "Cellular automaton generative pattern. Survival threshold controls density.",
    perlin: "Perlin noise cloud pattern. Useful for organic, flowing shapes.",
    wfc: "Wave Function Collapse: constraint solver that builds complex structures.",
    wolfram: "1D Cellular Automata (Rule 30, 90, etc) expanded to 2D.",
    sierpinski: "Recursive fractal triangle pattern (Sierpinski Sieve).",
    waves: "Interference pattern of overlapping sine waves.",
    voronoi: "Cellular patterns based on distance to random seed points.",
    reactionDiffusion: "Reaction-Diffusion (Gray-Scott). Generates spots and stripes. 'Reaction rate' tunes the pattern.",
    gameOfLife: "Conway's Game of Life. Evolves from a starting seed pattern.",
    lissajous: "Overlapping parametric sine curves.",
    spiral: "Archimedean spirals radiating from center.",
    mandelbrot: "The boundary of the Mandelbrot set fractal.",
    dla: "Diffusion-Limited Aggregation: particles form coral-like structures.",
    truchet: "Randomly oriented tiles forming maze-like paths.",
    langton: "Langton's Ant. Density controls number of steps.",
    maze: "Perfect maze generated with Recursive Backtracker.",
    hexagonal: "Staggered approximation of a hexagonal honeycomb grid."
};

const DENSITY_LABELS = {
    random: "Pattern density",
    perlin: "Noise threshold",
    cellular: "Survival threshold",
    diamonds: "Motif scale",
    chevron: "Band width",
    brick: "Brick size",
    diagonal: "Stripe width",
    zigzag: "Amplitude",
    basket: "Block size",
    waves: "Wave threshold",
    voronoi: "Cell count",
    reactionDiffusion: "Reaction rate",
    gameOfLife: "Initial fill",
    lissajous: "Frequency ratio",
    spiral: "Number of arms",
    mandelbrot: "Zoom level",
    dla: "Particle density",
    truchet: "Tile size",
    langton: "Ant steps",
    hexagonal: "Hexagon scale"
};

const PARAM2_LABELS = {
    reactionDiffusion: "Iterations (Simulation speed)",
    gameOfLife: "Generations",
    lissajous: "Number of curves",
    mandelbrot: "Max iterations"
};
