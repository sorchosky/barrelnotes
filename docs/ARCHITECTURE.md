# Architecture — BarrelNotes

> One pass at project start, then edit only when a decision actually changes.
> If this drifts from what's actually in the repo, DECISIONS.md is where the
> drift gets recorded, not here.

## Stack

- **Framework:** React 18 + Vite 5
- **Deploy:** Vercel, connected to `main` (see CLAUDE.md — `dev` is the integration branch, `main` is production)
- **Styling:** Tailwind CSS 3, with a custom token palette in `tailwind.config.js` and component classes in `src/index.css`
- **State management:** `useState` / `useEffect` in `src/App.jsx` only. No Redux, Zustand, or context — all app state lives in the root component and is passed down as props.
- **External APIs:** Anthropic Messages API, called server-side from `api/scan.js`. **Paid, billed per scan.** Model is `claude-haiku-4-5-20251001`, `max_tokens: 600`, one image plus one text block per request.
- **Data/persistence:** `localStorage` only. No backend, no database, no accounts.
- **Routing:** none. Single view, filtered client-side.
- **Tests:** none currently. There is no test runner installed.

## Data model

One entity, `bottle`, held in a single array in `App` state and mirrored to
`localStorage` on every change:

```js
{
  id:         'bottle-<timestamp>-<random>',  // generateId() in src/App.jsx
  name:       'Blanton\'s Original Single Barrel',
  distillery: 'Buffalo Trace Distillery',
  type:       'bourbon',   // bourbon | rye | scotch | irish | japanese | other
  proof:      93,
  price:      65,
  status:     'tried',     // 'tried' | 'wishlist' — drives the FilterBar tabs
  rating:     9,           // 1-10, null unless status === 'tried'
  notes:      'Caramel, orange peel, vanilla...',  // null unless status === 'tried'
  dateAdded:  '2025-11-14' // YYYY-MM-DD
}
```

`rating` and `notes` are forced to `null` whenever `status !== 'tried'`, in both
`handleAddBottle` and `handleEditBottle`. Don't let those two paths drift apart.

### localStorage keys

| Key | Holds |
|---|---|
| `barrelnotes-bottles` | The bottle array. Seeded from `SAMPLE_BOTTLES` on first run. |
| `whiskey-tracker-view` | `'grid'` or `'list'`. Kept under the old name — renaming it would silently reset everyone's view preference for no benefit. |
| `whiskey-tracker-bottles` | **Legacy.** Migrated to `barrelnotes-bottles` and deleted by a one-time block at the top of `src/App.jsx`. Leave that migration in place. |

This is the whole persistence layer, and it has no backup. Treat any change to
these keys or to the bottle shape as a data migration, not a refactor.

## The scan path

The one piece of real architecture in the app:

```
ScanButton (file input, capture=environment)
  -> Header -> App.handleScan(base64, mimeType)
  -> POST /api/scan  { image, mimeType, triedBottles[] }
  -> api/scan.js: rate-limit check, then Anthropic Messages API
  -> JSON response -> ScanConfirmCard -> BottleForm prefill -> wishlist
```

- `handleScan` in `src/App.jsx` sends only the user's **tried** bottles, reduced to
  `{ name, type, rating, notes }`. That list is the taste profile — it's what makes
  `matchScore` personalized rather than generic.
- `api/scan.js` builds two different prompts: personalized when `triedBottles` is
  non-empty, general critic-style when the user has no history yet.
- The system prompt tells Claude to answer in **JSON only**. The handler still
  guards against code-fence wrapping, because the model sometimes adds it anyway.
  Keep that guard.
- Failures collapse to one user-facing message — "Couldn't read the bottle. Try a
  clearer photo of the front label." — for every cause except rate limiting, which
  gets its own. Real errors go to `console.error` server-side.

### Local dev

Vercel functions don't run under `vite dev`, so `vite.config.js` installs a
`configureServer` middleware that hand-rolls a `req`/`res` shim and calls the same
`api/scan.js` handler. It is a shim, not a real Vercel runtime — it implements only
`status()` and `json()`. If you add a response method in the handler, add it there
too or dev will break while prod stays fine.

`ANTHROPIC_API_KEY` must be in `.env.local` for scanning to work locally. Everything
except the scan path works without it.

## Key architectural decisions made up front

See `docs/DECISIONS.md` for the full log with reasoning. In brief:

- localStorage over any backend — no accounts, no sync, no server to run
- Haiku 4.5 for scanning — cheapest model that reads a label reliably
- Rate limit lives in the function, not in a service
- Three-tier git branch model (`feature/*` → `dev` → `main`)

## Known constraints / things to watch

- **The scan rate limit is in-memory** (`rateLimitStore`, a `Map` in `api/scan.js`).
  Serverless instances are ephemeral and there can be several at once, so the real
  ceiling is "10 per IP per warm instance," not a true 10/day. It's a cost speed
  bump, not a guarantee. Anything stricter needs shared state (KV/Redis).
- **No storage quota handling.** `localStorage.setItem` is called unguarded on every
  bottle change; a full store throws and the write is silently lost.
- **`JSON.parse` on load is unguarded.** Corrupt `barrelnotes-bottles` content
  throws during the `useState` initializer and takes the whole app down.
- **Fonts come from Google Fonts over the network** (`index.html`). Offline or
  blocked, the app falls back to system fonts.
- **`src/data/bourbons.json` is not imported anywhere.** 100 entries of reference
  bourbon data — MSRP, proof, mashbill, ratings — currently dead weight in the
  bundle's source tree. Either wire it into something (autocomplete on the bottle
  form is the obvious use) or delete it; don't leave it ambiguous much longer.
- **Sample data seeds on first run** and is indistinguishable from real user data
  once written. A user's "first" three bottles are Blanton's, Lagavulin 16, and
  WhistlePig 10.

## Folder structure

Standard Vite React layout, plus a Vercel functions directory:

```
api/scan.js          serverless function — the only server-side code
src/App.jsx          all app state and handlers
src/components/      presentational components, props-only
src/data/            SAMPLE_BOTTLES seed + bourbons.json (unused, see above)
src/index.css        Tailwind layers + .chip / .label-eyebrow component classes
vite.config.js       React plugin + the /api/scan dev shim
```

Components are props-only and hold no app state of their own, except local form
and UI state. Keep it that way — it's the reason `App.jsx` is the single place to
look for behavior.
