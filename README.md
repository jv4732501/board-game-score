# Board Game Score

A board game score tracker: define a game's scoring categories (and an optional
formula) as a template, track scores per player across rounds, and browse past
games. Client-side only — `localStorage` persistence, no backend. Sibling to
`basketballscore` / `soccerscore` / `horsebetting` / `studyapp`.

## Run locally

```
npm install
npm run dev
```

## Test

```
npm run test        # Vitest unit/component tests
npm run test:e2e     # Playwright e2e (run `npm run build` first)
```

## Build

```
npm run build
```

## Deploy

Push to `master`; GitHub Actions builds and deploys `dist/` to GitHub Pages.
