// All algorithms that generate the "raw" 0/1 grid before mosaic constraints are applied.

/** Pure random — the original algorithm */
function algRandom(cols, rows) {
    const g = [];
    for (let r = 0; r < rows; r++) {
        g[r] = [];
        const { active, inactive } = getRowColors(r);
        for (let c = 0; c < cols; c++) {
            g[r][c] = random() < density ? inactive : active;
        }
    }
    return g;
}

/** Concentric diamond / argyle motifs */
function algDiamonds(cols, rows) {
    const g = [];
    const scale = Math.max(4, Math.round(cols * density));
    for (let r = 0; r < rows; r++) {
        g[r] = [];
        const { active, inactive } = getRowColors(r);
        for (let c = 0; c < cols; c++) {
            const cx = c % scale;
            const cy = r % scale;
            const dist = Math.abs(cx - scale / 2) + Math.abs(cy - scale / 2);
            g[r][c] = dist < scale * 0.4 ? inactive : active;
        }
    }
    return g;
}

/** V-shaped chevron bands */
function algChevron(cols, rows) {
    const g = [];
    const period = Math.max(4, Math.round(8 * density));
    for (let r = 0; r < rows; r++) {
        g[r] = [];
        const { active, inactive } = getRowColors(r);
        for (let c = 0; c < cols; c++) {
            const v = (Math.abs(c - cols / 2) + r) % period;
            g[r][c] = v < period / 2 ? inactive : active;
        }
    }
    return g;
}

/** Offset brick / running bond pattern */
function algBrick(cols, rows) {
    const g = [];
    const brickW = Math.max(3, Math.round(6 * density));
    const brickH = Math.max(2, Math.round(4 * density));
    for (let r = 0; r < rows; r++) {
        g[r] = [];
        const { active, inactive } = getRowColors(r);
        const rowGroup = Math.floor(r / brickH);
        const offset = (rowGroup % 2) * Math.floor(brickW / 2);
        for (let c = 0; c < cols; c++) {
            const inBrick = (c + offset) % brickW;
            // Mortar lines
            g[r][c] = (inBrick === 0 || r % brickH === 0) ? inactive : active;
        }
    }
    return g;
}

/** Diagonal stripes at ~45° */
function algDiagonal(cols, rows) {
    const g = [];
    const stripe = Math.max(2, Math.round(6 * density));
    for (let r = 0; r < rows; r++) {
        g[r] = [];
        const { active, inactive } = getRowColors(r);
        for (let c = 0; c < cols; c++) {
            g[r][c] = (c + r) % stripe < stripe / 2 ? inactive : active;
        }
    }
    return g;
}

/** Alternating seed / moss stitch texture */
function algSeed(cols, rows) {
    const g = [];
    for (let r = 0; r < rows; r++) {
        g[r] = [];
        const { active, inactive } = getRowColors(r);
        for (let c = 0; c < cols; c++) {
            g[r][c] = (c + r) % 2 === 0 ? inactive : active;
        }
    }
    return g;
}

/** Zigzag columns that bounce back and forth */
function algZigzag(cols, rows) {
    const g = [];
    const amp = Math.max(2, Math.round(cols * 0.3 * density));
    const period = amp * 2;
    for (let r = 0; r < rows; r++) {
        g[r] = [];
        const { active, inactive } = getRowColors(r);
        const zigPos = r % period;
        const offset = zigPos < amp ? zigPos : period - zigPos;
        for (let c = 0; c < cols; c++) {
            const dist = Math.abs(c % (amp * 2) - offset);
            g[r][c] = dist <= 1 ? inactive : active;
        }
    }
    return g;
}

/** Basketweave — alternating blocks of colour */
function algBasket(cols, rows) {
    const g = [];
    const block = Math.max(2, Math.round(5 * density));
    for (let r = 0; r < rows; r++) {
        g[r] = [];
        const { active, inactive } = getRowColors(r);
        const rowBlock = Math.floor(r / block) % 2;
        for (let c = 0; c < cols; c++) {
            const colBlock = Math.floor(c / block) % 2;
            g[r][c] = (rowBlock ^ colBlock) ? inactive : active;
        }
    }
    return g;
}

/** Cellular automaton — totalistic evolution from a configurable seed row */
function algCellular(cols, rows, opts) {
    const g = [];
    const seedType = (opts && opts.seedPattern) || 'random';
    // Seed the first row based on selected pattern
    g[0] = [];
    for (let c = 0; c < cols; c++) g[0][c] = 0;
    switch (seedType) {
        case 'center':
            g[0][Math.floor(cols / 2)] = 1;
            break;
        case 'alternating':
            for (let c = 0; c < cols; c++) g[0][c] = c % 2;
            break;
        case 'twoCells':
            g[0][Math.floor(cols / 3)] = 1;
            g[0][Math.floor(2 * cols / 3)] = 1;
            break;
        case 'edges':
            g[0][0] = 1;
            g[0][cols - 1] = 1;
            break;
        default: // random
            for (let c = 0; c < cols; c++) g[0][c] = random() < 0.5 ? 0 : 1;
            break;
    }
    // Evolve using a totalistic rule influenced by density
    for (let r = 1; r < rows; r++) {
        g[r] = [];
        const { active, inactive } = getRowColors(r);
        for (let c = 0; c < cols; c++) {
            const l = g[r - 1][(c - 1 + cols) % cols];
            const center = g[r - 1][c];
            const ri = g[r - 1][(c + 1) % cols];
            const neighbourhood = l + center + ri;
            // Smooth threshold: low density → cells need more neighbours to survive
            const threshold = 1 + 2 * (1 - density);
            g[r][c] = neighbourhood >= threshold ? inactive : active;
        }
    }
    return g;
}

// Perlin noise — organic, cloud-like mosaic texture
function algPerlin(cols, rows, opts) {
    const g = [];
    const scaleKey = (opts && opts.perlinScale) || 'medium';
    const scaleMap = { fine: 0.25, medium: 0.12, large: 0.05, xlarge: 0.025 };
    const s = scaleMap[scaleKey] || 0.12;
    const seed = random(1000);
    noiseSeed(seed);
    for (let r = 0; r < rows; r++) {
        g[r] = [];
        for (let c = 0; c < cols; c++) {
            const n = noise(c * s, r * s);
            g[r][c] = n < density ? 0 : 1;
        }
    }
    return g;
}

// Wolfram elementary CA — uses rule number for diverse 1D automata
function algWolfram(cols, rows, opts) {
    const ruleNum = (opts && opts.wolframRule) ? parseInt(opts.wolframRule) : 30;
    const seedType = (opts && opts.seedPattern) || 'center';
    // Build the 8-bit lookup table from the rule number
    const ruleBits = [];
    for (let i = 0; i < 8; i++) {
        ruleBits[i] = (ruleNum >> i) & 1;
    }
    const g = [];
    // Seed row based on selected pattern
    g[0] = [];
    for (let c = 0; c < cols; c++) g[0][c] = 0;
    switch (seedType) {
        case 'random':
            for (let c = 0; c < cols; c++) g[0][c] = random() < 0.5 ? 1 : 0;
            break;
        case 'alternating':
            for (let c = 0; c < cols; c++) g[0][c] = c % 2;
            break;
        case 'twoCells':
            g[0][Math.floor(cols / 3)] = 1;
            g[0][Math.floor(2 * cols / 3)] = 1;
            break;
        case 'edges':
            g[0][0] = 1;
            g[0][cols - 1] = 1;
            break;
        default: // center
            g[0][Math.floor(cols / 2)] = 1;
            break;
    }
    for (let r = 1; r < rows; r++) {
        g[r] = [];
        for (let c = 0; c < cols; c++) {
            const l = g[r - 1][(c - 1 + cols) % cols];
            const center = g[r - 1][c];
            const ri = g[r - 1][(c + 1) % cols];
            const idx = (l << 2) | (center << 1) | ri;
            g[r][c] = ruleBits[idx];
        }
    }
    return g;
}

/** Sierpinski triangle — XOR fractal */
function algSierpinski(cols, rows) {
    const g = [];
    for (let r = 0; r < rows; r++) {
        g[r] = [];
        for (let c = 0; c < cols; c++) {
            g[r][c] = (c & r) === 0 ? 1 : 0;
        }
    }
    return g;
}

/** Wave Interference — sum of sine waves at different angles, thresholded */
function algWaves(cols, rows, opts) {
    const g = [];
    const numWaves = (opts && opts.waveCount) ? parseInt(opts.waveCount) : 3;
    // Generate random wave parameters seeded by p5 random
    const waves = [];
    for (let i = 0; i < numWaves; i++) {
        waves.push({
            angle: random(TWO_PI),
            freq: random(0.15, 0.6),
            phase: random(TWO_PI)
        });
    }
    for (let r = 0; r < rows; r++) {
        g[r] = [];
        for (let c = 0; c < cols; c++) {
            let sum = 0;
            for (const w of waves) {
                const proj = c * cos(w.angle) + r * sin(w.angle);
                sum += sin(proj * w.freq + w.phase);
            }
            // Normalise to 0–1 then threshold with density
            const normalised = (sum / numWaves + 1) / 2;
            g[r][c] = normalised < density ? 1 : 0;
        }
    }
    return g;
}

/** Voronoi cells — organic stained-glass regions */
function algVoronoi(cols, rows) {
    const g = [];
    const numSeeds = Math.max(3, Math.round(20 * (1 - density) + 3));
    const seeds = [];
    for (let i = 0; i < numSeeds; i++) {
        seeds.push({
            x: random(cols),
            y: random(rows),
            color: i % 2
        });
    }
    for (let r = 0; r < rows; r++) {
        g[r] = [];
        for (let c = 0; c < cols; c++) {
            let minDist = Infinity;
            let nearest = 0;
            for (let i = 0; i < seeds.length; i++) {
                const dx = c - seeds[i].x;
                const dy = r - seeds[i].y;
                const d = dx * dx + dy * dy;
                if (d < minDist) {
                    minDist = d;
                    nearest = seeds[i].color;
                }
            }
            g[r][c] = nearest;
        }
    }
    return g;
}

/** Reaction-Diffusion (Gray-Scott model) — organic spots and stripes */
function algReactionDiffusion(cols, rows) {
    // Parameters tuned for interesting mosaic-scale patterns
    const feed = 0.037 + density * 0.025;
    const kill = 0.06 + density * 0.005;
    const dA = 1.0, dB = 0.5;
    const dt = 1.0;
    // Map param2 (0-100) to iterations (100-3000)
    const iterations = Math.floor(map(param2, 0, 100, 100, 3000));

    // Initialise chemical concentrations
    let a = [], b = [];
    for (let r = 0; r < rows; r++) {
        a[r] = []; b[r] = [];
        for (let c = 0; c < cols; c++) {
            a[r][c] = 1;
            b[r][c] = 0;
        }
    }
    // Seed a few random spots of chemical B
    const numSpots = Math.max(2, Math.floor(Math.sqrt(cols * rows) / 3));
    for (let i = 0; i < numSpots; i++) {
        const sc = Math.floor(random(cols));
        const sr = Math.floor(random(rows));
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const rr = (sr + dr + rows) % rows;
                const cc = (sc + dc + cols) % cols;
                b[rr][cc] = 1;
            }
        }
    }

    // Run simulation
    for (let t = 0; t < iterations; t++) {
        const na = [], nb = [];
        for (let r = 0; r < rows; r++) {
            na[r] = []; nb[r] = [];
            for (let c = 0; c < cols; c++) {
                // 5-point Laplacian with wrapping
                const up = (r - 1 + rows) % rows;
                const dn = (r + 1) % rows;
                const le = (c - 1 + cols) % cols;
                const ri = (c + 1) % cols;
                const lapA = a[up][c] + a[dn][c] + a[r][le] + a[r][ri] - 4 * a[r][c];
                const lapB = b[up][c] + b[dn][c] + b[r][le] + b[r][ri] - 4 * b[r][c];
                const abb = a[r][c] * b[r][c] * b[r][c];
                na[r][c] = a[r][c] + (dA * lapA - abb + feed * (1 - a[r][c])) * dt;
                nb[r][c] = b[r][c] + (dB * lapB + abb - (kill + feed) * b[r][c]) * dt;

                // Clamp
                if (na[r][c] < 0) na[r][c] = 0; else if (na[r][c] > 1) na[r][c] = 1;
                if (nb[r][c] < 0) nb[r][c] = 0; else if (nb[r][c] > 1) nb[r][c] = 1;
            }
        }
        a = na; b = nb;
    }

    // Threshold map to 0/1
    const g = [];
    for (let r = 0; r < rows; r++) {
        g[r] = [];
        const { active, inactive } = getRowColors(r);
        for (let c = 0; c < cols; c++) {
            // If concentration B is high -> contrast colour
            g[r][c] = (b[r][c] - a[r][c] > 0.05) ? inactive : active;
        }
    }
    return g;
}

/** Game of Life */
function algGameOfLife(cols, rows) {
    // Map param2 (0-100) to generations (0-200)
    const generations = Math.floor(map(param2, 0, 100, 0, 200));

    // Initial state
    let current = [];
    // Seed using density
    for (let r = 0; r < rows; r++) {
        current[r] = [];
        for (let c = 0; c < cols; c++) {
            current[r][c] = random() < density ? 1 : 0;
        }
    }

    // Evolve
    for (let gen = 0; gen < generations; gen++) {
        let next = [];
        for (let r = 0; r < rows; r++) {
            next[r] = [];
            for (let c = 0; c < cols; c++) {
                // Count neighbours with wrapping
                let neighbors = 0;
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (i === 0 && j === 0) continue;
                        const rr = (r + i + rows) % rows;
                        const cc = (c + j + cols) % cols;
                        neighbors += current[rr][cc];
                    }
                }

                // Rules
                if (current[r][c] === 1) {
                    if (neighbors < 2 || neighbors > 3) next[r][c] = 0;
                    else next[r][c] = 1;
                } else {
                    if (neighbors === 3) next[r][c] = 1;
                    else next[r][c] = 0;
                }
            }
        }
        current = next;
    }

    // Convert to mosaic constraints
    // Since GoL doesn't respect odd/even rows, we just map 1->inactive, 0->active
    const g = [];
    for (let r = 0; r < rows; r++) {
        g[r] = [];
        const { active, inactive } = getRowColors(r);
        for (let c = 0; c < cols; c++) {
            g[r][c] = current[r][c] === 1 ? inactive : active;
        }
    }
    return g;
}

/** Lissajous curves */
function algLissajous(cols, rows) {
    const g = [];
    const freqX = Math.floor(map(density, 0, 1, 1, 10));
    const freqY = Math.floor(map(param2, 0, 100, 1, 10));

    // Initialize background
    for (let r = 0; r < rows; r++) {
        g[r] = [];
        const { active } = getRowColors(r);
        for (let c = 0; c < cols; c++) {
            g[r][c] = active;
        }
    }

    // Trace curve
    const points = 1000;
    for (let i = 0; i < points; i++) {
        const t = map(i, 0, points, 0, TWO_PI);
        const x = map(sin(freqX * t), -1, 1, 0, cols - 1);
        const y = map(cos(freqY * t), -1, 1, 0, rows - 1);

        const c = Math.round(x);
        const r = Math.round(y);

        if (c >= 0 && c < cols && r >= 0 && r < rows) {
            g[r][c] = getRowColors(r).inactive;
        }
    }
    return g;
}

/** Spiral */
function algSpiral(cols, rows) {
    const g = [];
    const arms = Math.max(1, Math.round(10 * density));

    for (let r = 0; r < rows; r++) {
        g[r] = [];
        const { active, inactive } = getRowColors(r);
        for (let c = 0; c < cols; c++) {
            const dx = c - cols / 2;
            const dy = r - rows / 2;
            const angle = atan2(dy, dx) + PI; // 0 to TWO_PI
            const dist = sqrt(dx * dx + dy * dy);

            // Spiral equation: r = a + b * theta
            // We want to check if the point is close to the spiral arm
            const spiralVal = (angle * arms / TWO_PI + dist / 5) % 1;

            g[r][c] = spiralVal < 0.5 ? inactive : active;
        }
    }
    return g;
}

/** Mandelbrot set boundary */
function algMandelbrot(cols, rows) {
    const g = [];
    const maxIter = Math.floor(map(param2, 0, 100, 20, 200));
    const zoom = map(density, 0, 1, 0.5, 3.0);

    for (let r = 0; r < rows; r++) {
        g[r] = [];
        const { active, inactive } = getRowColors(r);

        for (let c = 0; c < cols; c++) {
            let zx = 0;
            let zy = 0;
            let cx = map(c, 0, cols, -2.5 / zoom, 1.0 / zoom);
            let cy = map(r, 0, rows, -1.0 / zoom, 1.0 / zoom);

            let i = 0;
            while (zx * zx + zy * zy < 4 && i < maxIter) {
                const xtemp = zx * zx - zy * zy + cx;
                zy = 2 * zx * zy + cy;
                zx = xtemp;
                i++;
            }

            // Map iteration count to pattern
            // Even iterations = active, Odd = inactive (or some other mapping)
            g[r][c] = (i % 2 === 0) ? active : inactive;
        }
    }
    return g;
}

/** Diffusion-Limited Aggregation */
function algDLA(cols, rows) {
    const g = [];
    // Initialize empty grid (active color)
    for (let r = 0; r < rows; r++) {
        g[r] = [];
        const { active } = getRowColors(r);
        for (let c = 0; c < cols; c++) {
            g[r][c] = active;
        }
    }

    // Seed center
    const cx = Math.floor(cols / 2);
    const cy = Math.floor(rows / 2);

    const inactiveCenter = getRowColors(cy).inactive;
    g[cy][cx] = inactiveCenter;

    const particles = Math.floor(cols * rows * density * 0.5);

    for (let i = 0; i < particles; i++) {
        let x = Math.floor(random(cols));
        let y = Math.floor(random(rows));

        const maxSteps = cols * rows * 4;
        let steps = 0;
        while (steps < maxSteps) {
            steps++;
            const nextX = x + Math.floor(random(-1, 2));
            const nextY = y + Math.floor(random(-1, 2));

            if (nextX < 0 || nextX >= cols || nextY < 0 || nextY >= rows) {
                continue;
            }

            let stuck = false;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    const ny = nextY + dy;
                    const nx = nextX + dx;
                    if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
                        if (g[ny][nx] !== getRowColors(ny).active) {
                            stuck = true;
                            break;
                        }
                    }
                }
                if (stuck) break;
            }

            if (stuck) {
                g[nextY][nextX] = getRowColors(nextY).inactive;
                break;
            } else {
                x = nextX;
                y = nextY;
            }
        }
    }
    return g;
}

/** Truchet tiles */
function algTruchet(cols, rows) {
    const g = [];
    const tileSize = Math.max(2, Math.round(6 * (1.1 - density))); // Smaller tile size = higher density

    for (let r = 0; r < rows; r++) {
        g[r] = [];
        const { active } = getRowColors(r);
        for (let c = 0; c < cols; c++) {
            g[r][c] = active;
        }
    }

    for (let r = 0; r < rows; r += tileSize) {
        for (let c = 0; c < cols; c += tileSize) {
            const tileType = random() < 0.5 ? 0 : 1; // 0 = /, 1 = \

            for (let y = 0; y < tileSize; y++) {
                for (let x = 0; x < tileSize; x++) {
                    const absR = r + y;
                    const absC = c + x;
                    if (absR >= rows || absC >= cols) continue;

                    const { active, inactive } = getRowColors(absR);

                    let filled = false;
                    // Simple diagonal line approximation
                    if (tileType === 0) {
                        // /
                        if (Math.abs(x + y - tileSize) < tileSize / 3) filled = true;
                    } else {
                        // \
                        if (Math.abs(x - y) < tileSize / 3) filled = true;
                    }

                    g[absR][absC] = filled ? inactive : active;
                }
            }
        }
    }
    return g;
}

/** Classic patterns from library */
function algClassic(cols, rows) {
    const g = [];
    const selection = classicPattern || 'greekKey';
    const tile = CLASSIC_TILES[selection] || CLASSIC_TILES.greekKey;
    const tileData = tile.data;
    const tH = tile.h;
    const tW = tile.w;

    for (let r = 0; r < rows; r++) {
        g[r] = [];
        // Mosaic Knitting logic: 
        // A single "visual" row in a chart usually corresponds to 2 knitted rows (1 ridge).
        // Row 1 (Odd, B-active) + Row 2 (Even, A-active).
        // To make classic bitmaps look "correct" and not get eaten by constraints, 
        // we stretch them vertically (1 pixel height = 2 grid rows).
        const sourceR = Math.floor(r / 2);

        for (let c = 0; c < cols; c++) {
            const tileVal = tileData[sourceR % tH][c % tW];
            g[r][c] = tileVal;
        }
    }
    return g;
}
/*
 * Image import with dithering
 * Resizes the uploaded image to the grid dimensions and applies Floyd-Steinberg dithering
 * to reduce it to 2 colors.
 */
function algImage(cols, rows) {
    const g = [];

    // Default blank if no image
    if (!uploadedImg) {
        for (let r = 0; r < rows; r++) {
            g[r] = [];
            for (let c = 0; c < cols; c++) {
                g[r][c] = getRowColors(r).active; // Stripes as placeholder
            }
        }
        return g;
    }

    // 1. Resize image to grid dimensions
    // We create a graphics buffer to draw the image resized
    const pg = createGraphics(cols, rows);
    pg.image(uploadedImg, 0, 0, cols, rows);
    pg.loadPixels();

    // 2. Convert to grayscale and dithering
    // We'll store brightness values in a 2D array for easier dithering
    const pixels = [];
    for (let y = 0; y < rows; y++) {
        pixels[y] = [];
        for (let x = 0; x < cols; x++) {
            const idx = 4 * (y * cols + x);
            // Simple luminosity
            const r = pg.pixels[idx];
            const gr = pg.pixels[idx + 1];
            const b = pg.pixels[idx + 2];
            pixels[y][x] = (r + gr + b) / 3;
        }
    }
    pg.remove();

    // Floyd-Steinberg Dithering
    for (let y = 0; y < rows; y++) {
        g[y] = []; // Initialize output row
        for (let x = 0; x < cols; x++) {
            const oldPixel = pixels[y][x];
            const newPixel = oldPixel < 128 ? 0 : 255; // Quantize to black (0) or white (255)

            // Store as 0=ColorA (Dark/Black), 1=ColorB (Light/White)
            // Assuming Color A is background/dark and B is motif/light usually,
            // but let's just map 0->0 and 255->1.
            g[y][x] = newPixel === 0 ? 0 : 1;

            const quantError = oldPixel - newPixel;

            if (x + 1 < cols) pixels[y][x + 1] += quantError * 7 / 16;
            if (x - 1 >= 0 && y + 1 < rows) pixels[y + 1][x - 1] += quantError * 3 / 16;
            if (y + 1 < rows) pixels[y + 1][x] += quantError * 5 / 16;
            if (x + 1 < cols && y + 1 < rows) pixels[y + 1][x + 1] += quantError * 1 / 16;
        }
    }

    return g;
}

/**
 * Simplified WFC implementation for 2-color mosaic grids.
 * Uses hardcoded 3x3 tile prototypes.
 */
function algWFC(cols, rows) {

    const tiles = [
        [[0, 0, 0], [0, 0, 0], [0, 0, 0]], // Solid A
        [[1, 1, 1], [1, 1, 1], [1, 1, 1]], // Solid B
        [[0, 1, 0], [1, 1, 1], [0, 1, 0]], // Cross
        [[1, 0, 1], [0, 0, 0], [1, 0, 1]], // Corners
        [[0, 0, 1], [0, 1, 0], [1, 0, 0]], // Diagonal /
        [[1, 0, 0], [0, 1, 0], [0, 0, 1]], // Diagonal \
    ];

    const g = [];
    for (let r = 0; r < rows; r++) g[r] = new Array(cols).fill(0);

    for (let r = 0; r < rows - 2; r += 3) {
        for (let c = 0; c < cols - 2; c += 3) {
            const tileIdx = Math.floor(random(tiles.length));
            const tile = tiles[tileIdx];
            for (let y = 0; y < 3; y++) {
                for (let x = 0; x < 3; x++) {
                    if (r + y < rows && c + x < cols) {
                        g[r + y][c + x] = tile[y][x];
                    }
                }
            }
        }
    }

    return g;
}

/**
 * Mutate the current grid by randomly flipping ~5% of cells,
 * then re-applying symmetry and mosaic constraints.
 */
function mutatePattern() {
    const mutationRate = 0.05;

    let raw = [];
    for (let r = 0; r < numRows; r++) {
        raw[r] = grid[r].slice();
    }

    for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
            if (random() < mutationRate) {
                raw[r][c] = 1 - raw[r][c];
            }
        }
    }

    let wCols = numCols;
    let wRows = numRows;
    if (symmetryMode === "mirrorX" || symmetryMode === "kaleidoscope") wCols = Math.ceil(numCols / 2);
    if (symmetryMode === "mirrorY" || symmetryMode === "kaleidoscope") wRows = Math.ceil(numRows / 2);

    let source = [];
    for (let r = 0; r < wRows; r++) {
        source[r] = raw[r].slice(0, wCols);
    }

    const fullRaw = applySymmetry(source, wCols, wRows);
    grid = enforceMosaicConstraints(fullRaw, numCols, numRows);
}

function enforceMosaicConstraints(raw, cols, rows) {
    const out = [];

    for (let r = 0; r < rows; r++) {
        out[r] = [];
        const { active, inactive } = getRowColors(r);

        for (let c = 0; c < cols; c++) {
            if (r === 0) { out[r][c] = active; continue; }

            const desired = raw[r][c];
            const below = out[r - 1][c];
            const canSlip = below === inactive;

            out[r][c] = (desired === inactive && canSlip) ? inactive : active;
        }
    }

    for (let r = 0; r < rows; r++) {
        const { active } = getRowColors(r);
        out[r][0] = active;
        out[r][cols - 1] = active;
    }

    const MAX_CONTRAST_RUN = 3;
    for (let r = 0; r < rows; r++) {
        const { active } = getRowColors(r);
        let run = 0;
        for (let c = 0; c < cols; c++) {
            if (out[r][c] !== active) {
                run++;
                if (run > MAX_CONTRAST_RUN) {
                    out[r][c] = active;
                    run = 0;
                }
            } else {
                run = 0;
            }
        }
    }

    return out;
}

registerAlgorithm("random", { fn: algRandom });
registerAlgorithm("diamonds", { fn: algDiamonds });
registerAlgorithm("chevron", { fn: algChevron });
registerAlgorithm("brick", { fn: algBrick });
registerAlgorithm("diagonal", { fn: algDiagonal });
registerAlgorithm("seed", { fn: algSeed });
registerAlgorithm("zigzag", { fn: algZigzag });
registerAlgorithm("basket", { fn: algBasket });
registerAlgorithm("cellular", { fn: algCellular });
registerAlgorithm("perlin", { fn: algPerlin });
registerAlgorithm("wfc", { fn: algWFC });
registerAlgorithm("wolfram", { fn: algWolfram });
registerAlgorithm("sierpinski", { fn: algSierpinski });
registerAlgorithm("waves", { fn: algWaves });
registerAlgorithm("voronoi", { fn: algVoronoi });
registerAlgorithm("reactionDiffusion", { fn: algReactionDiffusion });
registerAlgorithm("gameOfLife", { fn: algGameOfLife });
registerAlgorithm("lissajous", { fn: algLissajous });
registerAlgorithm("spiral", { fn: algSpiral });
registerAlgorithm("mandelbrot", { fn: algMandelbrot });
registerAlgorithm("dla", { fn: algDLA });
registerAlgorithm("truchet", { fn: algTruchet });
registerAlgorithm("classic", { fn: algClassic });
registerAlgorithm("image", { fn: algImage });
