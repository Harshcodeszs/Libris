import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { C, W, H, DISPLAY, SANS, rect, text, circle, line } from './lib/kit.mjs'
import { publicScreens } from './lib/screens-public.mjs'
import { studentScreens } from './lib/screens-student.mjs'
import { librarianScreens } from './lib/screens-librarian.mjs'
import { superScreens } from './lib/screens-super.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const svgDir = path.join(here, 'svg')
fs.mkdirSync(svgDir, { recursive: true })

const screens = [
  ...publicScreens,
  ...studentScreens,
  ...librarianScreens,
  ...superScreens,
]

function screenSvg(screen) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title-${screen.id} desc-${screen.id}">
<title id="title-${screen.id}">Libris — ${screen.title}</title>
<desc id="desc-${screen.id}">${screen.note}</desc>
<defs><clipPath id="clip-${screen.id}"><rect x="0" y="0" width="${W}" height="${H}"/></clipPath></defs>
<rect x="0" y="0" width="${W}" height="${H}" fill="${C.cream100}"/>
<g id="screen-${screen.id}" clip-path="url(#clip-${screen.id})">
${screen.render()}
</g>
</svg>
`
}

screens.forEach((screen) => {
  fs.writeFileSync(path.join(svgDir, `${screen.id}.svg`), screenSvg(screen), 'utf8')
})

// ------------------------------------------------------------------ board

const SCALE = 0.52
const SW = Math.round(W * SCALE)
const SH = Math.round(H * SCALE)
const COLS = 3
const GAP_X = 44
const GAP_Y = 58
const LABEL_H = 46
const MARGIN = 64
const HEADER = 176
const rows = Math.ceil(screens.length / COLS)
const BOARD_W = MARGIN * 2 + COLS * SW + (COLS - 1) * GAP_X
const BOARD_H = HEADER + rows * (SH + LABEL_H + GAP_Y) - GAP_Y + 96

const groupColors = {
  Public: C.brass700,
  Student: C.forest700,
  Librarian: C.forest800,
  Superlibrarian: C.violet700,
  Access: C.red700,
}

let board = `<svg xmlns="http://www.w3.org/2000/svg" width="${BOARD_W}" height="${BOARD_H}" viewBox="0 0 ${BOARD_W} ${BOARD_H}" role="img" aria-labelledby="board-title">
<title id="board-title">Libris Library Borrowing System — high-fidelity wireframe board</title>
<rect width="${BOARD_W}" height="${BOARD_H}" fill="${C.cream100}"/>
<rect x="0" y="0" width="${BOARD_W}" height="${HEADER}" fill="${C.forest950}"/>
${circle(BOARD_W - 120, 40, 210, { fill: C.forest900, opacity: 0.75 })}
${circle(BOARD_W - 40, 150, 150, { fill: C.brass900, opacity: 0.3 })}
${rect(MARGIN, 42, 42, 42, { fill: C.cream100, rx: 13 })}
${text(MARGIN + 21, 70, 'L', { size: 22, weight: 600, family: DISPLAY, fill: C.forest900, anchor: 'middle' })}
${text(MARGIN + 58, 60, 'Libris', { size: 25, weight: 600, family: DISPLAY, fill: C.cream50 })}
${text(MARGIN + 58, 76, 'LIBRARY BORROWING SYSTEM', { size: 8, weight: 700, fill: 'rgba(250,247,241,0.5)', letter: 1.5 })}
${text(MARGIN, 128, 'High-fidelity wireframes', { size: 34, weight: 600, family: DISPLAY, fill: C.cream50 })}
${text(MARGIN + 386, 128, '21 screens · 1440 × 900 · editable SVG', { size: 12, fill: 'rgba(250,247,241,0.6)' })}
${text(BOARD_W - MARGIN, 128, 'Forest · Cream · Brass — Fraunces + Inter', { size: 11, fill: 'rgba(250,247,241,0.55)', anchor: 'end' })}
${line(MARGIN, HEADER - 1, BOARD_W - MARGIN, HEADER - 1, { stroke: '#FFFFFF', opacity: 0.08 })}`

screens.forEach((screen, index) => {
  const col = index % COLS
  const row = Math.floor(index / COLS)
  const x = MARGIN + col * (SW + GAP_X)
  const y = HEADER + row * (SH + LABEL_H + GAP_Y)
  const color = groupColors[screen.group] || C.forest700

  board += circle(x + 4, y + 9, 4, { fill: color })
  board += text(x + 16, y + 13, screen.group.toUpperCase(), {
    size: 8.5,
    weight: 700,
    fill: color,
    letter: 1.4,
  })
  board += text(x + SW, y + 13, screen.id.split('-')[0], {
    size: 8.5,
    weight: 600,
    fill: C.inkFaint,
    anchor: 'end',
  })
  board += text(x, y + 33, screen.title, { size: 14, weight: 600, family: DISPLAY, fill: C.ink })
  board += rect(x - 1, y + LABEL_H - 1, SW + 2, SH + 2, {
    fill: C.white,
    stroke: C.cream300,
    rx: 13,
  })
  board += `<g transform="translate(${x} ${y + LABEL_H}) scale(${SCALE})" clip-path="url(#board-clip-${index})">${screen.render()}</g>`
  board += `<defs><clipPath id="board-clip-${index}"><rect x="0" y="0" width="${W}" height="${H}"/></clipPath></defs>`
})

board += `${text(MARGIN, BOARD_H - 40, 'Prepared for design hand-off · import the whole board or any single SVG into Figma.', { size: 11, fill: C.inkFaint })}${text(BOARD_W - MARGIN, BOARD_H - 40, 'All text remains editable. Fonts: Fraunces + Inter.', { size: 11, fill: C.inkFaint, anchor: 'end' })}`
board += '</svg>'

fs.writeFileSync(path.join(here, 'all-screens.svg'), board, 'utf8')
fs.writeFileSync(path.join(here, 'screens.json'), JSON.stringify(screens.map(({ id, group, title, note }) => ({ id, group, title, note, file: `svg/${id}.svg` })), null, 2), 'utf8')

// ------------------------------------------------------------------ gallery

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Libris — High-fidelity wireframes</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <style>
      :root {
        --cream-50: #fdfcf9;
        --cream-100: #faf7f1;
        --cream-200: #f3ede2;
        --cream-300: #e8decb;
        --ink: #1c1917;
        --ink-soft: #44403c;
        --muted: #57534e;
        --faint: #78716c;
        --forest: #204531;
        --forest-deep: #0d2118;
        --forest-soft: #f1f7f2;
        --brass: #ae6d1c;
        --brass-soft: #fcf8ec;
        --line: #e8decb;
      }
      * { box-sizing: border-box; }
      html { scroll-behavior: smooth; }
      body {
        margin: 0;
        background: var(--cream-100);
        color: var(--ink);
        font-family: Inter, ui-sans-serif, system-ui, sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      .wrap { max-width: 1500px; margin: 0 auto; padding: 0 32px; }
      header.hero {
        background: var(--forest-deep);
        color: var(--cream-50);
        padding: 36px 0 44px;
        position: relative;
        overflow: hidden;
      }
      header.hero::before {
        content: '';
        position: absolute;
        inset: -40% -10% auto auto;
        width: 620px;
        height: 620px;
        background: radial-gradient(circle, rgba(61, 132, 90, 0.35), transparent 65%);
        pointer-events: none;
      }
      .brand { display: flex; align-items: center; gap: 12px; position: relative; }
      .brand-mark {
        width: 42px; height: 42px; border-radius: 13px;
        background: var(--cream-100); color: var(--forest-deep);
        display: grid; place-items: center;
      }
      .brand-name { font-family: Fraunces, Georgia, serif; font-size: 24px; font-weight: 600; line-height: 1; }
      .brand-tag { font-size: 8px; letter-spacing: 0.2em; font-weight: 700; color: rgba(250,247,241,0.5); margin-top: 5px; }
      .hero-grid { display: flex; align-items: end; justify-content: space-between; gap: 32px; margin-top: 56px; position: relative; }
      .eyebrow { font-size: 10px; font-weight: 700; letter-spacing: 0.2em; color: #e4bf5c; }
      h1 { font-family: Fraunces, Georgia, serif; font-size: clamp(34px, 4vw, 52px); font-weight: 600; letter-spacing: -0.02em; margin: 14px 0 0; line-height: 1.04; }
      .hero p { max-width: 620px; color: rgba(250,247,241,0.62); font-size: 14px; line-height: 1.7; margin: 18px 0 0; }
      .hero-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
      .btn {
        display: inline-flex; align-items: center; gap: 8px; height: 44px; padding: 0 18px;
        border-radius: 11px; font-size: 13px; font-weight: 600; text-decoration: none;
        border: 1px solid transparent; cursor: pointer; white-space: nowrap;
      }
      .btn-primary { background: var(--cream-50); color: var(--forest-deep); }
      .btn-primary:hover { background: #fff; }
      .btn-outline { border-color: rgba(250,247,241,0.22); color: var(--cream-50); background: rgba(255,255,255,0.04); }
      .btn-outline:hover { background: rgba(255,255,255,0.1); }
      .meta-strip { display: flex; gap: 26px; flex-wrap: wrap; margin-top: 30px; font-size: 11.5px; color: rgba(250,247,241,0.5); position: relative; }
      .meta-strip b { color: rgba(250,247,241,0.9); font-weight: 600; }

      .toolbar {
        position: sticky; top: 0; z-index: 30;
        background: rgba(250,247,241,0.94);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid var(--line);
      }
      .toolbar-inner { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 0; flex-wrap: wrap; }
      .filters { display: flex; gap: 6px; flex-wrap: wrap; }
      .chip {
        border: 1px solid var(--line); background: #fff; color: var(--muted);
        border-radius: 999px; height: 34px; padding: 0 14px; font-size: 12px; font-weight: 600;
        cursor: pointer; display: inline-flex; align-items: center; gap: 7px;
        transition: 0.15s ease;
      }
      .chip:hover { border-color: #c0dbc7; color: var(--forest); }
      .chip[aria-pressed='true'] { background: var(--forest); border-color: var(--forest); color: var(--cream-50); }
      .chip .dot { width: 7px; height: 7px; border-radius: 99px; background: currentColor; opacity: 0.55; }
      .count { font-size: 11px; color: var(--faint); }
      .search {
        height: 36px; width: 260px; border: 1px solid var(--line); border-radius: 10px;
        padding: 0 12px; font: inherit; font-size: 12px; background: #fff; color: var(--ink);
      }
      .search:focus { outline: 2px solid #94c1a1; outline-offset: 1px; border-color: transparent; }

      main { padding: 34px 0 70px; }
      .section-head { display: flex; align-items: baseline; justify-content: space-between; gap: 20px; margin-bottom: 16px; }
      .section-head h2 { font-family: Fraunces, Georgia, serif; font-size: 22px; margin: 0; font-weight: 600; letter-spacing: -0.01em; }
      .section-head p { margin: 0; font-size: 12px; color: var(--faint); }

      .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 20px; }
      .card {
        background: #fff; border: 1px solid var(--line); border-radius: 16px;
        overflow: hidden; text-align: left; padding: 0; cursor: pointer; font: inherit; color: inherit;
        transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
        display: flex; flex-direction: column;
      }
      .card:hover { transform: translateY(-3px); border-color: #c0dbc7; box-shadow: 0 18px 36px -24px rgba(13, 33, 24, 0.5); }
      .thumb { background: var(--cream-200); aspect-ratio: 16 / 10; overflow: hidden; border-bottom: 1px solid var(--line); }
      .thumb img { width: 100%; height: 100%; display: block; object-fit: cover; object-position: top center; }
      .card-body { padding: 15px 16px 16px; display: flex; flex-direction: column; gap: 5px; flex: 1; }
      .card-kicker { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
      .kicker { font-size: 9px; text-transform: uppercase; letter-spacing: 0.14em; font-weight: 700; color: var(--brass); }
      .num { font-size: 10px; color: var(--faint); font-variant-numeric: tabular-nums; }
      .card h3 { font-family: Fraunces, Georgia, serif; font-size: 17px; margin: 0; font-weight: 600; }
      .card p { margin: 0; font-size: 11.5px; line-height: 1.55; color: var(--muted); }
      .card-foot { margin-top: auto; padding-top: 12px; display: flex; align-items: center; justify-content: space-between; }
      .open-hint { font-size: 10.5px; font-weight: 600; color: var(--forest); }
      .dl { font-size: 10.5px; color: var(--faint); text-decoration: none; border-bottom: 1px solid var(--line); }
      .dl:hover { color: var(--forest); border-color: #c0dbc7; }

      .empty { padding: 70px 20px; text-align: center; color: var(--faint); border: 1px dashed var(--line); border-radius: 16px; background: var(--cream-50); }

      .handoff { margin-top: 54px; display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 20px; }
      .panel { background: #fff; border: 1px solid var(--line); border-radius: 18px; padding: 26px; }
      .panel h2 { font-family: Fraunces, Georgia, serif; font-size: 22px; margin: 0 0 8px; font-weight: 600; }
      .panel p { font-size: 12.5px; color: var(--muted); line-height: 1.65; margin: 0; }
      .steps { margin: 18px 0 0; padding: 0; list-style: none; display: grid; gap: 14px; }
      .steps li { display: flex; gap: 12px; font-size: 12px; color: var(--muted); line-height: 1.55; }
      .step-num {
        width: 24px; height: 24px; flex: 0 0 auto; border-radius: 8px; display: grid; place-items: center;
        background: var(--forest-soft); color: var(--forest); font-size: 10px; font-weight: 700;
      }
      .steps b { color: var(--ink); font-weight: 600; }
      .palette { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 18px; }
      .swatch { border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }
      .swatch-color { height: 50px; }
      .swatch-meta { padding: 8px 10px; background: #fff; }
      .swatch-meta b { display: block; font-size: 10px; font-weight: 600; }
      .swatch-meta span { font-size: 9px; color: var(--faint); }
      .type-row { display: flex; align-items: baseline; justify-content: space-between; border-top: 1px solid var(--line); padding-top: 12px; margin-top: 16px; }
      .type-row span:first-child { font-family: Fraunces, Georgia, serif; font-size: 20px; }
      .type-row span:last-child { font-size: 9px; color: var(--faint); }

      footer { border-top: 1px solid var(--line); padding: 26px 0 40px; color: var(--faint); font-size: 11px; }
      footer .wrap { display: flex; justify-content: space-between; gap: 18px; flex-wrap: wrap; }

      .lightbox {
        position: fixed; inset: 0; z-index: 80; background: rgba(13, 33, 24, 0.72);
        backdrop-filter: blur(5px); display: none; align-items: center; justify-content: center; padding: 28px;
      }
      .lightbox.open { display: flex; }
      .lightbox-inner { width: min(1440px, 96vw); max-height: 94vh; overflow: auto; background: var(--cream-100); border-radius: 16px; box-shadow: 0 40px 90px -40px #000; }
      .lightbox-top { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 14px 18px; border-bottom: 1px solid var(--line); position: sticky; top: 0; background: rgba(250,247,241,0.97); z-index: 2; }
      .lightbox-top h3 { font-family: Fraunces, Georgia, serif; margin: 0; font-size: 18px; font-weight: 600; }
      .lightbox-top p { margin: 2px 0 0; font-size: 11px; color: var(--faint); }
      .icon-btn { width: 34px; height: 34px; border-radius: 9px; border: 1px solid var(--line); background: #fff; cursor: pointer; font-size: 18px; line-height: 1; color: var(--muted); }
      .lightbox img { width: 100%; display: block; }

      @media (max-width: 900px) {
        .handoff { grid-template-columns: 1fr; }
        .hero-grid { flex-direction: column; align-items: flex-start; }
        .hero-actions { justify-content: flex-start; }
        .wrap { padding: 0 20px; }
        .search { width: 100%; }
      }
    </style>
  </head>
  <body>
    <header class="hero">
      <div class="wrap">
        <div class="brand">
          <span class="brand-mark" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          </span>
          <div>
            <div class="brand-name">Libris</div>
            <div class="brand-tag">Library Borrowing System</div>
          </div>
        </div>

        <div class="hero-grid">
          <div>
            <div class="eyebrow">DESIGN HAND-OFF · FINAL FLOWS</div>
            <h1>High-fidelity wireframes</h1>
            <p>Twenty-one finished screens covering public access, the student catalog, the circulation desk and superlibrarian oversight. Built in the Libris visual language — forest, cream and brass — and exported as editable SVG for Figma.</p>
          </div>
          <div class="hero-actions">
            <a class="btn btn-primary" href="./all-screens.svg" target="_blank" rel="noreferrer">Open combined board</a>
            <a class="btn btn-outline" href="#handoff">Figma import guide</a>
          </div>
        </div>

        <div class="meta-strip">
          <span><b>21</b> screens</span>
          <span><b>1440 × 900</b> artboards</span>
          <span><b>Fraunces</b> + <b>Inter</b></span>
          <span><b>Editable</b> text layers</span>
          <span><b>SVG</b> · no embedded raster</span>
        </div>
      </div>
    </header>

    <div class="toolbar">
      <div class="wrap toolbar-inner">
        <div class="filters" id="filters" role="group" aria-label="Filter screens"></div>
        <input class="search" id="search" type="search" placeholder="Search screens, flows or features…" aria-label="Search screens" />
      </div>
    </div>

    <main class="wrap">
      <div class="section-head">
        <h2 id="section-title">All screens</h2>
        <p id="section-count">21 artboards · click any card to inspect</p>
      </div>
      <div class="grid" id="grid"></div>
      <div class="empty" id="empty" hidden>No screens match that search.</div>

      <section class="handoff" id="handoff">
        <div class="panel">
          <h2>Drop into Figma</h2>
          <p>Every file is a standalone SVG with a 1440 × 900 artboard. Import one screen at a time, or open the combined board and place the whole set in a single move.</p>
          <ol class="steps">
            <li><span class="step-num">01</span><span><b>Install the fonts.</b> Add Fraunces and Inter from Google Fonts so headings and body copy render exactly as designed.</span></li>
            <li><span class="step-num">02</span><span><b>Import.</b> In Figma choose <b>File → Place image</b> (or drag the SVG) and drop <b>all-screens.svg</b> for the overview, or any file in <b>/svg</b> for a single screen.</span></li>
            <li><span class="step-num">03</span><span><b>Keep it editable.</b> Import as SVG rather than flattening. Text becomes text layers, shapes become vectors, and the screen group is named after its flow.</span></li>
            <li><span class="step-num">04</span><span><b>Reuse the system.</b> Cards, badges, inputs, buttons, book covers and the sidebar all repeat across screens, so you can build components directly from the imported layers.</span></li>
          </ol>
        </div>

        <div class="panel">
          <h2>Visual system</h2>
          <p>Colours match the shipped Tailwind theme. Type pairings and spacing are consistent across every artboard.</p>
          <div class="palette">
            <div class="swatch"><div class="swatch-color" style="background:#0D2118"></div><div class="swatch-meta"><b>Forest 950</b><span>#0D2118 · sidebar</span></div></div>
            <div class="swatch"><div class="swatch-color" style="background:#204531"></div><div class="swatch-meta"><b>Forest 800</b><span>#204531 · primary</span></div></div>
            <div class="swatch"><div class="swatch-color" style="background:#FAF7F1; border-bottom:1px solid #E8DECB"></div><div class="swatch-meta"><b>Cream 100</b><span>#FAF7F1 · canvas</span></div></div>
            <div class="swatch"><div class="swatch-color" style="background:#AE6D1C"></div><div class="swatch-meta"><b>Brass 600</b><span>#AE6D1C · accent</span></div></div>
          </div>
          <div class="type-row"><span>Fraunces</span><span>Display / headings</span></div>
          <div class="type-row"><span style="font-family: Inter, sans-serif; font-size: 15px; font-weight: 500;">Inter</span><span>Body / UI · 400–700</span></div>
          <div class="type-row"><span style="font-family: Inter, sans-serif; font-size: 10px; letter-spacing: 0.16em; font-weight: 700; color:#78716C;">UPPERCASE LABEL</span><span>10px · 0.16em tracking</span></div>
        </div>
      </section>
    </main>

    <footer>
      <div class="wrap">
        <span>Libris Library Borrowing System · high-fidelity wireframe set</span>
        <span>21 screens · 1440 × 900 · SVG · 2026</span>
      </div>
    </footer>

    <div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-labelledby="lightbox-title">
      <div class="lightbox-inner">
        <div class="lightbox-top">
          <div>
            <h3 id="lightbox-title"></h3>
            <p id="lightbox-note"></p>
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            <a class="btn btn-outline" id="lightbox-download" style="height:34px; padding:0 12px; color:var(--forest); border-color:var(--line); background:#fff;" download>Download SVG</a>
            <button class="icon-btn" id="lightbox-close" aria-label="Close preview">×</button>
          </div>
        </div>
        <img id="lightbox-img" alt="" />
      </div>
    </div>

    <script>
      const SCREENS = ${JSON.stringify(screens.map(({ id, group, title, note }) => ({ id, group, title, note })))};
      const GROUPS = ['All', ...new Set(SCREENS.map((screen) => screen.group))];
      const grid = document.getElementById('grid');
      const filters = document.getElementById('filters');
      const search = document.getElementById('search');
      const empty = document.getElementById('empty');
      const sectionTitle = document.getElementById('section-title');
      const sectionCount = document.getElementById('section-count');
      let activeGroup = 'All';

      const pad = (index) => String(index + 1).padStart(2, '0');

      function renderFilters() {
        filters.innerHTML = GROUPS.map((group) => {
          const count = group === 'All' ? SCREENS.length : SCREENS.filter((s) => s.group === group).length;
          return '<button class="chip" type="button" data-group="' + group + '" aria-pressed="' + (group === activeGroup) + '"><span class="dot"></span>' + group + ' <span class="count">' + count + '</span></button>';
        }).join('');
        filters.querySelectorAll('button').forEach((button) => {
          button.addEventListener('click', () => {
            activeGroup = button.dataset.group;
            renderFilters();
            render();
          });
        });
      }

      function matches(screen) {
        const inGroup = activeGroup === 'All' || screen.group === activeGroup;
        const term = search.value.trim().toLowerCase();
        const haystack = (screen.title + ' ' + screen.group + ' ' + screen.note + ' ' + screen.id).toLowerCase();
        return inGroup && (!term || haystack.includes(term));
      }

      function render() {
        const list = SCREENS.filter(matches);
        sectionTitle.textContent = activeGroup === 'All' ? 'All screens' : activeGroup;
        sectionCount.textContent = list.length + ' artboard' + (list.length === 1 ? '' : 's') + ' · click any card to inspect';
        grid.innerHTML = list.map((screen) => {
          const number = pad(SCREENS.indexOf(screen));
          return '<button class="card" type="button" data-id="' + screen.id + '" data-title="' + screen.title + '" data-note="' + screen.note + '">' +
            '<span class="thumb"><img loading="lazy" src="./svg/' + screen.id + '.svg" alt="' + screen.title + ' wireframe" /></span>' +
            '<span class="card-body">' +
              '<span class="card-kicker"><span class="kicker">' + screen.group + '</span><span class="num">' + number + '</span></span>' +
              '<h3>' + screen.title + '</h3>' +
              '<p>' + screen.note + '</p>' +
              '<span class="card-foot"><span class="open-hint">Preview screen</span><a class="dl" href="./svg/' + screen.id + '.svg" download>Download SVG</a></span>' +
            '</span>' +
          '</button>';
        }).join('');
        empty.hidden = list.length !== 0;
        grid.hidden = list.length === 0;
        grid.querySelectorAll('.card').forEach((card) => {
          card.addEventListener('click', (event) => {
            if (event.target.closest('a')) return;
            openLightbox(card.dataset.id, card.dataset.title, card.dataset.note);
          });
        });
      }

      const lightbox = document.getElementById('lightbox');
      const lightboxImg = document.getElementById('lightbox-img');
      const lightboxTitle = document.getElementById('lightbox-title');
      const lightboxNote = document.getElementById('lightbox-note');
      const lightboxDownload = document.getElementById('lightbox-download');

      function openLightbox(id, title, note) {
        lightboxImg.src = './svg/' + id + '.svg';
        lightboxImg.alt = title + ' wireframe';
        lightboxTitle.textContent = title;
        lightboxNote.textContent = note;
        lightboxDownload.href = './svg/' + id + '.svg';
        lightboxDownload.setAttribute('download', id + '.svg');
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
      function closeLightbox() {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
        lightboxImg.removeAttribute('src');
      }
      document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
      lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox) closeLightbox();
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeLightbox();
      });
      search.addEventListener('input', render);

      renderFilters();
      render();
    </script>
  </body>
</html>
`

fs.writeFileSync(path.join(here, 'index.html'), html, 'utf8')

console.log(`Wrote ${screens.length} screens to wireframes/svg/`)
console.log(`Board: ${BOARD_W} × ${BOARD_H}`)
