# PowerScale, explained: a StoryDeck progressive deck (v2)

37 clicks on StoryDeck's Watch runtime (`<deck-stage>`): a title, then two diagrams that build click by click.
- **The big picture.** Drawn components: a VM window, a file client, a network wire with a packet, PowerScale
  node blades, a collector clipboard, an InfluxDB store and a Footprint receipt. Packets run along each route as it
  lights.
- **"Zoom into the data".** One synthetic poll followed from the raw API response to a finding. A JSON row lifts out
  (`apart`) and becomes a typed line-protocol point; the fingerprint stamp travels into the run receipt (`place`).

Focus strategies used: `grey` (default), `path`, `zoom`, `apart`, `place`. The diagrams carry at most about 12
words per click. Explanations are in the speaker notes and `body.md` (the Read lens); references appear only there.
`index-v1.html` is the first version (26 clicks, boxes only); its sources are in `v1-source/`.

**Open:** double-click `index.html` (self-contained, no network requests). → / Space / click to advance,
← to go back. **T** or the corner button switches light/dark. **N** shows notes, **P** opens the presenter window,
**L** reads the deck aloud with the browser's voice.

## Files

| file | what |
|---|---|
| `deck/map.html` | the big picture: every `data-k` element is a focus piece |
| `deck/data.html` | the data zoom (one synthetic poll, illustration) |
| `deck/icons.mjs` | the drawn identities (inline SVG) |
| `deck/clicks.html` | the parts and their clicks (`data-in/out/on`, `data-focus`), headlines, notes |
| `deck/theme.css` | light + dark tokens, the look, the packet animation |
| `post.json` + `body.md` | StoryDeck's Read/Scroll source (sections → clicks; prose + references) |
| `build.mjs` | the build |
| `index.html`, `deck-data.json` | built outputs |

## Rebuild

```bash
npm install --legacy-peer-deps   # footprint-storydeck 0.6.0
npm run build                    # = node build.mjs → index.html + deck-data.json
```

The build fails if a click names a missing piece or `post.json` names a missing slide.
