# What the model actually sees: source

A [StoryDeck](https://www.npmjs.com/package/footprint-storydeck) deck folder: 20 clicks on one board. One request to an
AI model, in its three parts (system prompt, tools, messages), built up click by click in the order agentfootprint
10.10.0 assembles it: tools, skills, the map, big results, the lines that go last, caching, four providers' shapes,
and who writes what. Light and dark (T in the deck).

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
| `board.html` | the one board: the app, the request in three parts, the model and its reply |
| `theme.css` | the look, light and dark |
| `post.json` | the Read and Scroll lenses' sections |
| `icons/` | the drawn identities |

Quoted lines come from agentfootprint's code at v10.10.0 (commit a0094ca), shortened only where marked "…". Tool
names, questions and numbers are illustrations.
