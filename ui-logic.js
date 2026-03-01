function setupUIHandlers() {
    document.getElementById("generateBtn").addEventListener("click", () => {
        readControls();
        generatePattern();
        const sz = canvasSize(numCols, numRows, cellSize);
        resizeCanvas(sz.width, sz.height);
        updateSwatches();
        redraw();
    });

    document.getElementById("swapColorsBtn").addEventListener("click", () => {
        const a = document.getElementById("colorA");
        const b = document.getElementById("colorB");
        [a.value, b.value] = [b.value, a.value];
        readControlValues();
        updateSwatches();
        redraw();
    });

    document.getElementById("mutateBtn").addEventListener("click", () => {
        readControls();
        mutatePattern();
        const sz = canvasSize(numCols, numRows, cellSize);
        resizeCanvas(sz.width, sz.height);
        updateSwatches();
        redraw();
    });

    document.getElementById("imgUpload").onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            console.warn("Skipped non-image file:", file.type);
            return;
        }
        const objectUrl = URL.createObjectURL(file);
        loadImage(
            objectUrl,
            (img) => {
                uploadedImg = img;
                if (algorithm === "image") {
                    generatePattern();
                    const sz = canvasSize(numCols, numRows, cellSize);
                    resizeCanvas(sz.width, sz.height);
                    redraw();
                }
            },
            () => {
                console.error("Failed to load image file.");
                URL.revokeObjectURL(objectUrl);
            }
        );
    };

    document.getElementById("symmetryMode").addEventListener("change", () => {
        readControls();
        generatePattern();
        const sz = canvasSize(numCols, numRows, cellSize);
        resizeCanvas(sz.width, sz.height);
        redraw();
    });

    document.getElementById("algorithm").addEventListener("change", () => {
        readControls();
    });

    document.getElementById("saveBtn").addEventListener("click", () => {
        saveCanvas("mosaic-pattern", "png");
    });

    document.getElementById("saveSvgBtn").addEventListener("click", () => {
        const mx = MARGIN_LEFT;
        const my = MARGIN_TOP;
        const sz = canvasSize(numCols, numRows, cellSize);
        const w = sz.width;
        const h = sz.height;

        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;

        svg += `<rect x="0" y="0" width="${w}" height="${h}" fill="white" />`;
        svg += `<g transform="translate(${mx}, ${my})">`;

        svg += `<rect x="0" y="0" width="${numCols * cellSize}" height="${numRows * cellSize}" fill="none" stroke="black" stroke-width="2" />`;
        const fontSize = cellSize * 0.6;
        const fontStyle = `font-family="sans-serif" font-size="${fontSize}px" text-anchor="middle" dominant-baseline="middle"`;

        for (let r = 0; r < numRows; r++) {
            const y = (numRows - 1 - r) * cellSize;
            const rowNum = r * 2 + 1;
            const { active } = getRowColors(r);
            const activeColor = active === 0 ? colorA : colorB;

            svg += `<text x="-20" y="${y + cellSize / 2}" fill="black" ${fontStyle}>${rowNum}</text>`;
            svg += `<rect x="-10" y="${y + 4}" width="6" height="${cellSize - 8}" fill="${activeColor}" />`;

            for (let c = 0; c < numCols; c++) {
                const x = c * cellSize;
                const val = grid[r][c];
                const cellColor = val === 1 ? colorB : colorA;
                svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${cellColor}" stroke="#c8c8c8" stroke-width="1" />`;

                if (val !== active) {
                    const dotFill = val === 0 ? "white" : "black";
                    const dotOpacity = 0.4;
                    const cx = x + cellSize / 2;
                    const cy = y + cellSize / 2;
                    const rDot = (cellSize * 0.3) / 2;
                    svg += `<circle cx="${cx}" cy="${cy}" r="${rDot}" fill="${dotFill}" fill-opacity="${dotOpacity}" stroke="none" />`;
                }
            }
        }

        svg += `</g></svg>`;

        const blob = new Blob([svg], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "mosaic-pattern.svg";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    document.getElementById("savePdfBtn").addEventListener("click", () => {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });

            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 15;
            const printWidth = pageWidth - (margin * 2);

            doc.setFontSize(22);
            doc.text("Mosaic Knitting Pattern", margin, 20);

            doc.setFontSize(12);
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 30);

            doc.setFontSize(10);
            let metaY = 40;
            const settings = [
                `Stitches: ${numCols}`,
                `Rows: ${numRows}`,
                `Algorithm: ${algorithm}`,
                `Symmetry: ${symmetryMode}`
            ];
            settings.forEach(s => {
                doc.text(s, margin, metaY);
                metaY += 5;
            });

            const canvas = document.querySelector("#sketch-holder canvas");
            const imgData = canvas.toDataURL("image/png");

            const imgProps = doc.getImageProperties(imgData);
            const imgHeight = (imgProps.height * printWidth) / imgProps.width;

            doc.addImage(imgData, 'PNG', margin, metaY + 5, printWidth, imgHeight);

            const keyY = metaY + imgHeight + 15;
            doc.setFontSize(14);
            doc.text("Key", margin, keyY);

            doc.autoTable({
                startY: keyY + 5,
                head: [['Symbol', 'Instruction']],
                body: [
                    ['Black Square (Active Color)', 'Knit'],
                    ['White Square (Inactive Color)', 'Slip 1 (with yarn in back)'],
                    ['Row Number', 'Indicates Right Side (RS) row.'],
                    ['Side Block', 'Indicates Active Color for the row pair.']
                ],
                theme: 'plain',
                styles: { fontSize: 10 },
                headStyles: { fontStyle: 'bold' },
                margin: { left: margin }
            });

            doc.save("mosaic-pattern.pdf");
        } catch (err) {
            console.error("PDF export failed:", err);
        }
    });
}
function readControls() {
    readControlValues();
    updateAlgoUI();
}

function readControlValues() {
    numCols = constrainValue("cols", 4, 60);
    numRows = constrainValue("rows", 4, 80);
    cellSize = constrainValue("cellSize", 8, 40);
    colorA = document.getElementById("colorA").value;
    colorB = document.getElementById("colorB").value;

    const dEl = document.getElementById("density");
    density = dEl ? int(dEl.value) / 100 : 0.5;

    const p2El = document.getElementById("param2");
    param2 = p2El ? int(p2El.value) : 50;

    symmetryMode = document.getElementById("symmetryMode").value;
    algorithm = document.getElementById("algorithm").value;
    classicPattern = document.getElementById("classicPattern").value;

    if (numRows % 2 !== 0) {
        numRows += 1;
        document.getElementById("rows").value = numRows;
    }
}

function updateAlgoUI() {
    const classicGroup = document.getElementById("classicGroup");
    const imageGroup = document.getElementById("imageGroup");
    const densityGroup = document.getElementById("densityGroup");
    const param2Group = document.getElementById("param2Group");
    const algoOptions = document.getElementById("algoOptions");
    const wolframRuleLabel = document.getElementById("wolframRuleLabel");
    const seedPatternLabel = document.getElementById("seedPatternLabel");
    const perlinScaleLabel = document.getElementById("perlinScaleLabel");
    const waveCountLabel = document.getElementById("waveCountLabel");
    const densityLabelText = document.getElementById("densityLabelText");
    const param2LabelText = document.getElementById("param2LabelText");
    const algoSummary = document.getElementById("algoSummary");
    const advancedPanel = document.getElementById("advancedPanel");

    classicGroup.hidden = true;
    imageGroup.hidden = true;
    algoOptions.hidden = true;
    wolframRuleLabel.hidden = true;
    seedPatternLabel.hidden = true;
    perlinScaleLabel.hidden = true;
    waveCountLabel.hidden = true;
    densityGroup.hidden = false;
    param2Group.hidden = true;

    if (algoSummary) {
        algoSummary.textContent = ALGO_DESCRIPTIONS[algorithm] || "Generates a mosaic knitting pattern.";
    }

    if (densityLabelText) {
        densityLabelText.textContent = DENSITY_LABELS[algorithm] || "Pattern density";
    }

    if (PARAM2_LABELS[algorithm]) {
        param2Group.hidden = false;
        if (param2LabelText) {
            param2LabelText.textContent = PARAM2_LABELS[algorithm];
        }
    }

    if (algorithm === "classic") {
        classicGroup.hidden = false;
        densityGroup.hidden = true;
    } else if (algorithm === "image") {
        imageGroup.hidden = false;
        densityGroup.hidden = true;
    } else if (algorithm === "wolfram") {
        algoOptions.hidden = false;
        wolframRuleLabel.hidden = false;
        seedPatternLabel.hidden = false;
        densityGroup.hidden = true;
    } else if (algorithm === "cellular") {
        algoOptions.hidden = false;
        seedPatternLabel.hidden = false;
    } else if (algorithm === "perlin") {
        algoOptions.hidden = false;
        perlinScaleLabel.hidden = false;
    } else if (algorithm === "seed") {
        densityGroup.hidden = true;
    } else if (algorithm === "sierpinski") {
        densityGroup.hidden = true;
    } else if (algorithm === "waves") {
        algoOptions.hidden = false;
        waveCountLabel.hidden = false;
    } else if (algorithm === "gameOfLife") {
        algoOptions.hidden = false;
        seedPatternLabel.hidden = false;
    }

    const hasAdvancedOptions = !imageGroup.hidden || !algoOptions.hidden || !param2Group.hidden;
    if (advancedPanel) {
        advancedPanel.hidden = !hasAdvancedOptions;
        if (hasAdvancedOptions) {
            advancedPanel.open = true;
        }
    }
}

function constrainValue(id, lo, hi) {
    const el = document.getElementById(id);
    const v = safeParseInt(el.value, lo, hi, lo);
    el.value = v;
    return v;
}

function updateSwatches() {
    const sA = document.getElementById("swatchA");
    const sB = document.getElementById("swatchB");
    if (sA) sA.style.background = colorA;
    if (sB) sB.style.background = colorB;
}
