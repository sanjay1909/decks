# Explainer Decks

Progressive explainer decks built with [StoryDeck](https://www.npmjs.com/package/footprint-storydeck). Each deck is one self-contained HTML file; `index.html` lists them, newest first.

## Layout

```
index.html              the list of decks
<deck>/index.html       the built deck (self-contained, no network)
<deck>/source/          its StoryDeck source and build script
```

## Add a deck

1. Make a folder named after the deck and put the built `index.html` in it, with its source in `<deck>/source/`.
2. Copy one `<li class="deck">` in `index.html`, put it at the top, and update the link, date, title, description and click count.
3. Check the deck: no customer, cluster, host or person names; every example value labelled "illustration".

## Rebuild a deck

```
cd <deck>/source
npm install --legacy-peer-deps
npm run build
cp index.html ../index.html
```
