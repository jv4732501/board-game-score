# Board Game Score — Design

## Summary

Board Game Score is a client-side-only (localStorage, no backend) React app for
tracking scores across arbitrary board games. Unlike `basketballscore` /
`soccerscore` (each hardcoded to one sport's rules), this app is built around
**user-definable scoring templates**: a template names a game's scoring
categories and an optional formula for combining them into a total. A few
built-in preset templates ship for immediate use; anything else is built with
an in-app template builder. Sibling to `basketballscore` / `soccerscore` /
`horsebetting` / `studyapp`; built with React + Vite + TypeScript + MUI
instead of a zero-build vanilla-JS stack, hosted on GitHub Pages via GitHub
Actions.

## Goals

- Define a game's scoring shape once (categories + optional formula + win
  direction), reuse it for every future game of that kind.
- Track scores per player, per category, across multiple entries/rounds, with
  a live running total and standings.
- Keep a persistent player roster and a browsable history of finished games.
- Survive localStorage loss via JSON export/import backup.

## Non-goals

- No game-specific rules enforcement (turn order, move legality, timers). This
  is a scorekeeping tool, not a game engine.
- No multi-device sync — localStorage only, same as every sibling app.
- No sharing/QR-code team import (basketballscore has this; out of scope here
  — the JSON backup covers the "don't lose my data" need).

## Data model

```ts
interface Category {
  id: string; // stable id, generated on creation
  name: string; // display name, e.g. "Longest Road"
  key: string; // identifier used in formulas, derived from name, editable, must be unique per template
}

interface Template {
  id: string;
  name: string;
  categories: Category[];
  formula: string | null; // e.g. "resources + longestRoad - handPenalty"; null = sum of all categories
  winDirection: 'high' | 'low';
  builtIn: boolean; // true for presets (read-only); false for user-created/duplicated templates
}

interface Player {
  id: string;
  name: string;
  color: string; // hex, used as an avatar/accent color
}

interface GameSession {
  id: string;
  templateId: string;
  playerIds: string[];
  // entries[playerId][categoryId] is an ordered log of values, one per round/tap
  entries: Record<string, Record<string, number[]>>;
  startedAt: string; // ISO
  finishedAt: string | null; // ISO once ended
}

interface StandingRow {
  playerId: string;
  playerName: string;
  categoryTotals: Record<string, number>; // categoryId -> sum of its entries
  total: number; // formula(categoryTotals) or sum of categoryTotals
  rank: number; // 1 = winner per template.winDirection; ties share a rank
}

interface HistoryEntry {
  gameId: string;
  templateName: string;
  playerNames: string[];
  finishedAt: string;
  standings: StandingRow[];
}
```

A category's **subtotal** is the sum of its entry log. A player's **total**
is `evaluateFormula(template.formula, categorySubtotals)` when a formula is
set, otherwise the plain sum of all category subtotals. Standings sort
players by total, descending for `winDirection: 'high'`, ascending for `'low'`;
equal totals share a rank (dense ranking: 1, 1, 3).

## Formula language

Formulas are parsed and evaluated by a small hand-written recursive-descent
parser in `src/logic/formula.ts` — **never `eval`/`Function`**. Grammar:

```
expr    := term (('+' | '-') term)*
term    := factor (('*' | '/') factor)*
factor  := NUMBER | IDENT | '(' expr ')' | '-' factor
IDENT   := category.key (must exist in the template's category list)
```

- `parseFormula(source, knownKeys) -> { ok: true, ast } | { ok: false, error }`
  validates all identifiers against the template's category keys and reports
  unbalanced parens / unknown tokens / unknown identifiers with a message
  suitable for inline display in the builder.
- `evaluateFormula(ast, values: Record<string, number>) -> number` — division
  by zero returns `0` rather than throwing (scores should never crash the UI
  on an edge-case entry).
- The template builder shows a live preview: as the formula is typed, plug in
  each category's current subtotal (or `0` before any game exists) and show
  the resulting number, with the parse error shown inline if invalid. A
  template cannot be saved with an invalid formula.

## Built-in preset templates

Ship three presets demonstrating both formula use and win direction:

1. **Catan** — categories: Settlements, Cities, Longest Road, Largest Army,
   Development Cards, Other. `winDirection: 'high'`, `formula: null` (sum).
2. **Ticket to Ride** — categories: Routes, Longest Route Bonus, Completed
   Tickets, Incomplete Tickets Penalty. `winDirection: 'high'`,
   `formula: "routes + longestRouteBonus + completedTickets - incompleteTicketsPenalty"`.
3. **Golf (card game)** — categories: Points. `winDirection: 'low'`,
   `formula: null` — demonstrates the lowest-wins case with a single category.

Presets are defined as plain data in `src/logic/presetTemplates.ts`,
`builtIn: true`, not persisted to localStorage (always available, always
current). A "Duplicate" action on a preset creates an editable `builtIn:
false` copy in the user's custom template list.

## Screens & navigation

State-based navigation via a `screen` field in app state (no router),
matching soccerscore's `Nav.tsx` pattern.

- **Home** — start a new game: pick a template, pick/add players from the
  roster, Start. Shows a resume banner if a game is already in progress
  (`finishedAt === null`), matching the resume-on-reload pattern in every
  sibling app. Links to Templates / Players / History / Settings.
- **Templates** — list of presets + custom templates. "New Template" opens
  the builder: add/remove/rename categories (key auto-derived from name,
  editable, uniqueness enforced), formula field with live preview/validation,
  win direction toggle. Presets are view-only with a Duplicate action; custom
  templates are editable/deletable (deleting a template used by history
  entries does not affect those entries, since history stores plain names/
  standings, not a live template reference).
- **Players** — roster CRUD: name + color. Matches basketballscore's Teams
  tab in spirit, without the QR-sharing part.
- **Game** — one card per player: for each category, an entry log (each entry
  removable) plus a quick numeric "add entry" input, category subtotal, and a
  live overall total/rank per player. Undo removes the most recent entry
  across the whole game (simple linear undo stack, not per-category). "End
  Game" finalizes: computes final `StandingRow[]`, appends a `HistoryEntry`,
  clears the active game, navigates to Summary.
- **Summary** — final standings (rank, player, total) and a per-category
  breakdown table. "Done" returns Home. Reached either right after finishing
  a game or by opening an entry from History (read-only in that case).
- **History** — list of finished games (date, template name, players,
  winner). Tap to reopen the read-only Summary view.
- **Settings** — Export downloads a dated JSON backup file; Import lets you
  pick a file, previews a merge summary, confirms, then merges.

## Persistence

Single `useReducer` in `src/hooks/useAppState.ts` holds `{ players, templates,
game, history }` and persists the whole state to one `localStorage` key on
every change (mirrors soccerscore's single-key `AppState`, which keeps export/
import atomic). `src/logic/persistence.ts` provides:

- `serialize` / `deserialize` (JSON, try/catch on parse)
- `AppState` / `Backup` types, `formatVersion: 1`
- `buildBackup(state, nowMs)`, `validateBackup(obj)`, `mergeBackup(state,
  backup)` — same upsert-by-id merge semantics as soccerscore: players and
  history entries are upserted by id (added/updated counts returned for the
  confirmation message); an in-progress game in the backup is only restored
  if there isn't already one in progress locally (otherwise it's reported as
  skipped, never silently overwritten).
- A `migrate*` seam (currently identity) for future schema changes, following
  the sibling apps' pattern of normalizing old records on load.

## Project structure & tooling

Matches `soccerscore` exactly: Vite + React 19 + TypeScript, MUI (`theme.ts`
with the same compact typography/spacing overrides), Vitest + Testing Library
for unit/component tests, Playwright for e2e, oxlint + prettier, GitHub
Actions build+test+deploy to GitHub Pages (`base: '/boardgamescore/'`).

```
src/
  logic/          formula.ts, template.ts, game.ts, persistence.ts,
                   presetTemplates.ts, types.ts (+ *.test.ts alongside each)
  hooks/          useAppState.ts
  components/
    App.tsx, Nav.tsx
    Home/
    Templates/    TemplateList.tsx, TemplateBuilder.tsx, CategoryEditor.tsx
    Players/      PlayerList.tsx, PlayerEditor.tsx
    Game/         GameScreen.tsx, PlayerScoreCard.tsx, CategoryEntryLog.tsx
    Summary/      SummaryScreen.tsx
    History/      HistoryScreen.tsx
    Settings/     SettingsScreen.tsx
  theme.ts, main.tsx, index.css
e2e/              Playwright specs
```

## Testing plan

- **Logic layer (TDD, Vitest):** formula parsing edge cases (unbalanced
  parens, unknown identifiers, division by zero, negative numbers,
  precedence); standings computation for both win directions and tie
  handling; game entry add/remove/undo as pure state transitions; backup
  merge conflict cases (new vs. existing ids, in-progress game skip).
- **Components (Testing Library):** template builder validation UI, game
  screen entry add/undo, standings rendering.
- **E2E (Playwright, against a production build):** create a custom template
  → start a game with a preset and the roster → add entries across a few
  rounds → end game → verify it appears in History with correct standings.

## Open items / future extensions (explicitly out of scope for v1)

- Per-player cross-game stats/leaderboards.
- Sharing a template or game result via link/QR (as basketballscore does for
  teams).
- Editable formula functions beyond `+ - * /` (e.g. `max`, `min`, ternaries) —
  add only if a real template needs it.
