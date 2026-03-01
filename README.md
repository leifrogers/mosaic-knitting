# Mosaic Knitting Pattern Generator

A browser-based tool that generates valid **mosaic knitting charts** using [p5.js](https://p5js.org/).

Mosaic knitting uses two colours but only one colour per row — stitches in the non-active colour are *slipped* (carried up from the row below). This generator produces charts that obey that constraint automatically.

## Features

- 24 pattern-generation algorithms (random, WFC, classic named patterns, and more)
- Adjustable grid size (stitches × rows) and cell size
- Colour picker for both yarn colours
- Density slider to control pattern complexity
- Multiple symmetry modes (mirror, rotate, kaleidoscope, etc.)
- Pattern mutation to evolve existing designs
- Export chart as PNG, SVG, or PDF
- Dark mode toggle
- Responsive layout for desktop and mobile

## Getting Started

No build step or install needed — just open the HTML file:

```bash
# Option 1: open directly
open index.html

# Option 2: use a local dev server (e.g. VS Code Live Server, or python)
python3 -m http.server 8000
```

Then visit `http://localhost:8000` if using a server.

## Project Structure

| File | Purpose |
|------|---------|
| `index.html` | Entry point — loads p5.js and jsPDF from CDN, defines all UI controls |
| `styles/style.css` | Layout, theming, dark mode, and responsive styling |
| `sketch.js` | p5.js canvas setup, pattern generation orchestration, chart rendering |
| `algorithms.js` | All 24 pattern algorithms, mutation logic, and mosaic constraint enforcement |
| `patterns.js` | Named classic mosaic patterns stored as binary grids |
| `ui-logic.js` | UI event handlers, control reading, algorithm UI, and PNG/SVG/PDF export |
| `utils.js` | Shared helpers (parsing, debounce, colour conversion, accessibility utilities) |

## Mosaic Knitting Rules

1. Each pair of chart rows uses **one colour only**.
2. A stitch can only show the *other* colour if it was slipped — meaning the stitch below it is already that colour.
3. No stitch of the non-active colour can stack more than 1 row without being anchored by the active colour.

## License

MIT
