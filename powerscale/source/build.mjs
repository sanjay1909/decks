// PowerScale explainer → one self-contained HTML deck (index.html) + StoryDeck's deck-data.json.
//
//   node build.mjs
//
// Sources (deck/):
//   map.html     the big picture the story is told on: every data-k piece is a StoryDeck focus piece
//   data.html    the data zoom: one synthetic poll from response to finding (same piece rules)
//   icons.mjs    the components' drawn identities (inline SVG, one stroke style)
//   clicks.html  the parts; each <step> in a data-map part is one click (data-in/out/on, data-focus…)
//   theme.css    the deck's tokens and look (light + dark)
// and, for StoryDeck's Read/Scroll lenses: post.json (sections → the clicks they show) + body.md (the prose).
//
// What each click is about, and what happens to the rest, is StoryDeck's focus (footprint-storydeck/focus):
// grey by default, `path` to light a route piece by piece, `zoom` to close in. The page runs on StoryDeck's
// <deck-stage> runtime, its focusRuntime (only a forward click animates) and its notes runtime
// (N notes · P presenter · L listen). Everything is inlined: the page makes no network request.
import {readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {focusStep} from 'footprint-storydeck/focus';
import {readPieces, readStep, drawFocus, wrapStage, slideClass, focusOverlay, focusRuntime} from 'footprint-storydeck/focus-html';
import {notesData, notesRuntime, listenRuntime} from 'footprint-storydeck/narration-html';
import {ICONS} from './deck/icons.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = f => readFileSync(path.join(here, f), 'utf8');
const readPackaged = spec => readFileSync(fileURLToPath(import.meta.resolve(spec)), 'utf8');
const stripComments = html => html.replace(/<!--[\s\S]*?-->/g, '');
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));

const TITLE = 'PowerScale, explained';
const AREA = [0, 220, 1920, 1000];   // where focus may move and blur: below the headline, above the footer

// ── wires: <i data-arrow="x1 y1 x2 y2 [bend]"> → an SVG placed in slide pixels (a focus piece by its data-k) ──
function wire(html) {
  return html.replace(/<i\b([^>]*?)\sdata-arrow="([^"]+)"([^>]*)><\/i>/g, (_, a, spec, b) => {
    const [x1, y1, x2, y2, bend = 0] = spec.trim().split(/[\s,]+/).map(Number);
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
    const cx = (x1 + x2) / 2 - dy / len * bend, cy = (y1 + y2) / 2 + dx / len * bend;
    const tl = Math.hypot(x2 - cx, y2 - cy) || 1, ux = (x2 - cx) / tl, uy = (y2 - cy) / tl, hs = 18;
    const pad = 20, X = Math.min(x1, x2, cx) - pad, Y = Math.min(y1, y2, cy) - pad;
    const W = Math.max(x1, x2, cx) + pad - X, H = Math.max(y1, y2, cy) + pad - Y, f = v => +v.toFixed(1);
    const ex = x2 - ux * hs * .8, ey = y2 - uy * hs * .8;
    const d = `M${f(x1 - X)} ${f(y1 - Y)} Q${f(cx - X)} ${f(cy - Y)} ${f(ex - X)} ${f(ey - Y)}`;
    const tip = [x2 - X, y2 - Y], back = [tip[0] - ux * hs, tip[1] - uy * hs], nx = -uy * hs * .6, ny = ux * hs * .6;
    const head = `<path class="head" d="M${f(tip[0])} ${f(tip[1])}L${f(back[0] + nx)} ${f(back[1] + ny)}L${f(back[0] - nx)} ${f(back[1] - ny)}Z"/>`;
    let attrs = a + b;
    attrs = attrs.replace(/\sclass="([^"]*)"/, (_, c) => ` class="${c.includes('wire') ? c : `wire ${c}`}"`);
    if (!/\sclass="/.test(attrs)) attrs += ' class="wire"';
    // class "pkt": a packet that rides the wire once, at the wire's turn on a `path` click (theme.css · pktRun). At rest it
    // is hidden, so print, a jump and reduced motion show the plain wire.
    const pkt = /\bpkt\b/.test(attrs) ? `<rect class="pkt" x="${f(x1 - X - 8)}" y="${f(y1 - Y - 6)}" width="16" height="12" rx="3" style="--pdx:${f(ex - x1)}px;--pdy:${f(ey - y1)}px"/>` : '';
    return `<svg${attrs} style="left:${f(X)}px;top:${f(Y)}px;width:${f(W)}px;height:${f(H)}px" viewBox="0 0 ${f(W)} ${f(H)}" aria-hidden="true"><path d="${d}"/>${head}${pkt}</svg>`;
  });
}

// ── drawn identities: <i class="ic" data-icon="name"> → inline SVG (deck/icons.mjs) ──
const icon = html => html.replace(/<i\b([^>]*?)\sdata-icon="([\w-]+)"([^>]*)><\/i>/g, (_, a, key, b) => {
  if (!ICONS[key]) throw new Error(`no icon "${key}" (there are ${Object.keys(ICONS).join(', ')})`);
  return `<svg${a}${b} viewBox="0 0 64 64" aria-hidden="true">${ICONS[key]}</svg>`;
});

// ── a window of polls: <i data-bars="N" data-gaps="i j"> → N slots of one seeded series (illustration), gaps left empty ──
const bars = html => html.replace(/<i\s+data-bars="(\d+)"\s+data-gaps="([^"]*)"><\/i>/g, (_, n, g) => {
  const gaps = new Set(g.trim().split(/\s+/).map(Number));
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const rects = Array.from({length: Number(n)}, (_, i) => {
    if (gaps.has(i)) return '';
    const h = Math.round(18 + rnd() * 30 + (i === 38 ? 16 : 0));
    return `<rect x="${i * 10}" y="${64 - h}" width="7" height="${h}" rx="1.5"${i === 38 ? ' class="peak"' : ''}/>`;
  }).join('');
  return `<svg class="bars" viewBox="0 0 ${n * 10} 64" aria-hidden="true">${rects}</svg>`;
});

// ── notes: <aside class="notes"> taken out of the slide (the audience never sees them) ──
const NOTES = /<aside\b[^>]*class="notes"[^>]*>([\s\S]*?)<\/aside>/g;
const plain = h => h.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const takeNotes = html => ({html: html.replace(NOTES, ''), notes: [...html.matchAll(NOTES)].map(m => plain(m[1]))});

// ── the maps: the big picture, and the data zoom ──
const maps = Object.fromEntries(['map', 'data'].map(name => [name, {name, state: null, ...readPieces(wire(bars(icon(stripComments(read(`deck/${name}.html`))))))}]));

// ── the parts and their clicks ──
const parts = [...stripComments(read('deck/clicks.html')).matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/g)].map(([, attrs, body]) => {
  const attr = n => new RegExp(`\\s${n}="([^"]*)"`).exec(attrs)?.[1] ?? null;
  const label = attr('data-label');
  if (!label) throw new Error(`a part has no data-label: ${attrs}`);
  const mapName = attr('data-map');
  if (mapName !== null && !maps[mapName]) throw new Error(`"${label}": no map "${mapName}" (there are ${Object.keys(maps).join(', ')})`);
  return {label, kicker: attr('data-kicker') ?? '', onMap: mapName !== null, map: maps[mapName], body: icon(body)};
});

// Each map's state carries from click to click, part to part: one picture, built up. Coming back to a map from
// another slide, it arrives fresh (its pieces come in where they were left) and the diff goes on from there.
let lastMap = null;
const clicks = [];
for (const part of parts) {
  if (!part.onMap) {
    const {html, notes} = takeNotes(part.body);
    clicks.push({label: part.label, part, kind: 'plain', inner: html, notes, headline: ''}); lastMap = null;
    continue;
  }
  const steps = [...part.body.matchAll(/<step\b([^>]*)>([\s\S]*?)<\/step>/g)];
  if (!steps.length) throw new Error(`"${part.label}": a map part needs at least one <step>`);
  steps.forEach(([, attrs, inner], k) => {
    let r;
    const map = part.map;
    try { r = focusStep(map.state, {...readStep(attrs), fresh: k === 0 && lastMap !== map}, {pieces: map.pieces, area: AREA}); }
    catch (e) { throw new Error(`"${part.label}" click ${k + 1}: ${e.message}`, {cause: e}); }
    map.state = r.state; lastMap = map;
    const {html, notes} = takeNotes(inner);
    const headline = /<h2>([\s\S]*?)<\/h2>/.exec(html)?.[1].trim() ?? '';
    clicks.push({label: `${part.label} · ${k + 1}`, part, kind: 'map', look: r.look, headline, notes, step: k, steps: steps.length});
  });
}

// ── the slides ──
const total = clicks.length;
const head = (kicker, headline) => `<div class="head" data-chrome><div class="kicker">${esc(kicker)}</div>${headline ? `<h2>${headline}</h2>` : ''}</div>`;
const foot = n => `<div class="foot" data-chrome><span>${TITLE} · illustration, no live systems</span><span class="count">${n} / ${total}</span></div>`;
const slides = clicks.map((c, i) => {
  const open = `<section data-label="${esc(c.label)}"`;
  const html = c.kind === 'plain'
    ? `${open} class="slide plain">${head(c.part.kicker, '')}${c.inner}${foot(i + 1)}</section>`
    : `${open} class="slide on-map ${slideClass(c.look)}">${head(c.part.kicker, c.headline)}`
      + `<div class="map map-${c.part.map.name}">${wrapStage(drawFocus(c.part.map.html, c.look), c.look)}</div>${focusOverlay(c.look, {area: AREA})}${foot(i + 1)}</section>`;
  const partClicks = clicks.filter(x => x.part === c.part);
  const k = partClicks.indexOf(c);
  return {label: c.label, html, notes: {slide: c.part.label, step: k, steps: partClicks.length - 1, now: c.notes, earlier: partClicks.slice(0, k).flatMap(x => x.notes)}};
});

// ── check post.json against the deck: every slide it names must exist (Read/Scroll show a section's last one) ──
const post = JSON.parse(read('post.json'));
const labels = new Set(slides.map(s => s.label));
for (const s of post.sections) for (const l of s.slides) if (!labels.has(l)) throw new Error(`post.json section "${s.key}" names slide "${l}", which the deck does not have (labels: ${[...labels].join(' | ')})`);

// ── the page ──
const deckCss = `${readPackaged('footprint-storydeck/focus.css')}\n${readPackaged('footprint-storydeck/narration.css')}\n${read('deck/theme.css')}`;
const runtime = readPackaged('footprint-storydeck/deck-stage.js').replace(/<\/script/gi, '<\\/script');

// Runs in the page: the theme toggle (button or T). Light or dark follows the system until a choice is saved.
function themeRuntime() {
  const root = document.documentElement, btn = document.querySelector('.theme-toggle');
  const set = dark => { root.classList.toggle('dark', dark); btn?.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`); };
  const flip = () => { const dark = !root.classList.contains('dark'); set(dark); try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch {} };
  set(root.classList.contains('dark'));
  btn?.addEventListener('click', e => { e.stopPropagation(); flip(); btn.blur(); });
  window.addEventListener('keydown', e => { if ((e.key === 't' || e.key === 'T') && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); flip(); } }, true);
}

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(TITLE)}</title>
<meta name="description" content="${esc(post.description)}">
<script>(function(){var d;try{var t=localStorage.getItem('theme');d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches}catch(e){d=false}if(d)document.documentElement.classList.add('dark')})();</script>
<style>${deckCss}</style>
</head>
<body>
<deck-stage width="1920" height="1080" no-rail>
${slides.map(s => s.html).join('\n')}
</deck-stage>
<button class="theme-toggle" type="button" aria-label="Switch theme" title="Light / dark (T)"><svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path stroke-linecap="round" d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/></svg><svg class="moon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg></button>
<!-- deck-stage.js, focus and narration runtimes: footprint-storydeck ${JSON.parse(read('node_modules/footprint-storydeck/package.json')).version} (MIT) -->
${notesData(slides.map(s => s.notes))}
<script>${runtime}</script>
<script>(${focusRuntime})();</script>
<script>(${notesRuntime})();</script>
<script>(${listenRuntime})();</script>
<script>(${themeRuntime})();</script>
</body>
</html>
`;

writeFileSync(path.join(here, 'index.html'), page);
writeFileSync(path.join(here, 'deck-data.json'), JSON.stringify({deckCss, sections: slides.map(({label, html}) => ({label, html}))}, null, 1));
const mapClicks = clicks.filter(c => c.kind === 'map');
console.log(`index.html · ${parts.length} slides, ${total} clicks (${mapClicks.length} on two diagrams: the big picture and the data zoom) · ${(page.length / 1024).toFixed(0)} KB`);
