# MLB World Series History

A static website covering every Major League Baseball World Series from 1903 through 2025 — who won, the score of every individual game, and who took home World Series MVP.

**Live site:** https://liorbongart.github.io/mlb-world-series/

## What's in it

- **Every World Series, 1903–2025** — 123 years, including the two years no series was played (1904, cancelled by the Giants/Americans dispute; 1994, cancelled by the players' strike), shown with the historical reason.
- **Game-by-game scores** for every series — teams, final score, date, and venue for each individual game, with notes on historical quirks (tie games, extra innings, postponements, etc.).
- **World Series MVP** for every year the award has existed (1955–present), including the rare co-MVP years (1981, 2001).
- **Browse by decade** — series are grouped into decade sections with a filter bar, plus a search box to jump straight to a team, year, or MVP.

Click any year to open a detail view with the full game log for that series.

## How to view it

Just open the live site: **https://liorbongart.github.io/mlb-world-series/**

No build step, no install — it's plain HTML/CSS/JS. To run it locally instead, clone the repo and open `index.html` directly in a browser, or serve the folder with any static file server.

## Tech

- `index.html` — page structure
- `css/style.css` — styling (light/dark aware)
- `js/data.js` — the full World Series dataset
- `js/app.js` — renders the timeline, search, filters, and per-series detail view

Historical data was compiled from public World Series records (team results, game scores, dates, venues, and MVPs).
