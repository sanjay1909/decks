# PowerScale, explained: source

A [StoryDeck](https://www.npmjs.com/package/footprint-storydeck) deck folder: 80 clicks in four parts, each drawn in its
own look (`data-theme` on its sections), between a cover and a closing slide.

| Part | Sections | Look |
|---|---|---|
| One · The request | 1–8 | a drawing sheet (`blueprint`) |
| Two · Who does what | 9–12 | a line map (`transit`) |
| Three · What we keep | 13–14 | a ledger (`ledger`) |
| Four · What it costs, how it grows | 15–17 | an instrument (`scope`), then the closing summary (`finale`) |

Every look has a light and a dark version (T in the deck).

## Build

```
npx footprint-storydeck build .     # → index.html, one self-contained page with no network requests
npx footprint-storydeck check .     # what to fix, click by click
cp index.html ../index.html
```

Part looks (`data-theme`) need StoryDeck 0.8.0 or later. Until that is on npm, build with StoryDeck's main branch;
0.7.0 builds the same clicks without the part looks.

## Files

| File | What it holds |
|---|---|
| `deck.json` | title, footer, the map area |
| `clicks.html` | the parts and their clicks: what comes in, what lights, headlines, speaker notes |
| `map.html`, `data.html` | Part one: the request and its evidence; one poll's data |
| `flow.html`, `steps.html` | Part two: the flow once, then each owner's steps |
| `store.html` | Part three: what we keep, and how it stays small |
| `perf.html`, `scale.html` | Part four: performance and scaling |
| `summary.html` | the closing summary |
| `theme.css` | the six looks (cover, blueprint, transit, ledger, scope, finale), light and dark |
| `post.json` | the Read and Scroll lenses' sections |
| `icons/` | the drawn identities |

Numbers are measured on a local, synthetic setup, or worked out from those measurements, and each says which.
Example values are labelled "illustration". No live system was queried.
