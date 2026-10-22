# From two tools to an honest answer: source

A [StoryDeck](https://www.npmjs.com/package/footprint-storydeck) deck folder: 24 clicks on one board, the whole app on
every slide. An AI assistant grows one problem at a time on a real storage-operations chat app: skills, a map, a code
tool, references, a run log and a findings ledger; then the boundary between what agentfootprint provides and what the
app brings, and what comes next. Each part wears its own look (`data-theme`), light and dark (T in the deck).

## Build

```
npx footprint-storydeck@0.8.0 build .     # → index.html, one self-contained page with no network requests
npx footprint-storydeck@0.8.0 check .     # what to fix, click by click
cp index.html ../index.html
```

## Files

| File | What it holds |
|---|---|
| `deck.json` | title, footer, the map area |
| `clicks.html` | the parts and their clicks: what comes in, what lights, headlines, speaker notes |
| `board.html` | the one board: every piece at its fixed place |
| `theme.css` | the ten looks, light and dark |
| `post.json` | the Read and Scroll lenses' sections |
| `icons/` | the drawn identities |

Counts and measured numbers come from agentfootprint's code and checked-in benches, each with its conditions in the
speaker notes. Example questions, answers and values are illustrations. The app is not named.
