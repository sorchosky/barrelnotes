# Decisions Log — BarrelNotes

> Append-only. Claude Code adds an entry any time it makes a judgment call the
> PRD didn't specify, or you make a call together mid-build. Newest at top.
> This is what keeps a second session (or a second project) from re-deciding
> something already settled.

The entries below the first one are **reconstructed** from git history and from
the code itself — BarrelNotes ran for its first stretch without a decisions log,
so these were recovered rather than recorded live. Dates are commit dates. Where
the original reasoning wasn't written down anywhere, the entry says so instead of
inventing it.

---

### 2026-08-11 — Adopt the vibe-scaffold operational structure, keep three-tier branching

**Context:** BarrelNotes had a 20-line `claude.md` covering branch naming and commit
prefixes, and nothing else — no PRD, no architecture doc, no decisions log, no
Claude Code permission rules, no worktree tooling. The vibe-scaffold template supplies
all of it but assumes a two-tier branch model where every merge to `main` ships.

**Decision:** Port the full scaffold operational layer into the repo, and keep the
existing `feature/*` → `dev` → `main` flow rather than flattening to the template's
default. The template was changed to accommodate this instead: `CLAUDE.md` now carries
an **Integration branch** line (`dev` here, `main` by default) and the rest of the
contract reads off it, so both repos run the same text.

Three supporting calls made in the same pass:

- **`vercel.json` omits the template's `cleanUrls: true`.** BarrelNotes is already
  deployed; `cleanUrls` changes redirect behavior on a live site and buys nothing in a
  single-page app with no multi-page routes. The three keys kept (`framework`,
  `buildCommand`, `outputDirectory`) match what Vercel already auto-detects, so adding
  the file changes no deploy behavior — it just makes the config explicit.
- **`claude.md` was deleted, not kept alongside `CLAUDE.md`.** Two files differing only
  in case collide on macOS and Windows checkouts. Its content lives in `CLAUDE.md` now.
- **`docs/PRD.md` was only partly filled in.** Problem, users, core loop, and constraints
  are reverse-engineered from shipped code and are safe to state. Scope, out-of-scope, and
  success criteria were left as marked TODOs — those steer future work and shouldn't be
  Claude's guess at the owner's intent.

**Alternatives considered:** Flattening to two-tier to match the template exactly —
rejected, the slower production cadence is deliberate and the whole point of the request.
Forking `CLAUDE.md` into two variants — rejected, guarantees drift between the two repos.

**Reversible?** Yes. Docs and config only; no application code changed.

---

### 2026-03-27 — Guard against code fences in the scan response

**Context:** The system prompt in `api/scan.js` tells Claude to return JSON only, with
no markdown. It sometimes wrapped the response in ```` ``` ```` fences anyway, and
`JSON.parse` threw — surfacing to the user as "Couldn't read the bottle," a misleading
message for a response that had actually parsed fine on the model's side.

**Decision:** Strip code fences before parsing rather than relying on the prompt alone.
Prompt instructions are a strong prior, not a guarantee; the parser handles both shapes.

**Reversible?** Yes, but don't — this is a defensive guard, and removing it reintroduces
an intermittent, hard-to-reproduce failure.

---

### 2026-03-27 — Claude Haiku 4.5 for label scanning, with an in-function rate limit

**Context:** The scan feature needs vision — read a bottle label, identify the bottling,
and reason about it against the user's ratings. That's a paid API call on every scan, in
a personal project with no revenue.

**Decision:** `claude-haiku-4-5-20251001` at `max_tokens: 600` — the cheapest model that
reads a label reliably — plus a 10-request-per-IP-per-day cap enforced by an in-memory
`Map` in the function itself.

**Alternatives considered:** A larger model for better identification on obscure bottlings;
rejected as not worth the per-scan cost for the common case. A shared KV/Redis store for
the rate limit; rejected as infrastructure this project doesn't otherwise need.

**Reversible?** Yes, but note the tradeoff that came with it: the in-memory limit resets on
every cold start and doesn't coordinate across concurrent instances, so it is a cost speed
bump, not a real ceiling. If scanning is ever exposed beyond the owner, this needs shared
state before it needs anything else.

---

### 2026-03-27 — Rename CaskBook to BarrelNotes with a localStorage migration

**Context:** The project was renamed. The bottle array was stored under
`whiskey-tracker-bottles`, and changing the key without care would have made every
existing user's log vanish — with no backup anywhere, since there is no server.

**Decision:** Move the data to `barrelnotes-bottles` behind a one-time migration block
at the top of `src/App.jsx` that copies the old key and deletes it. The view-mode
preference stayed on `whiskey-tracker-view` — renaming it would silently reset everyone's
grid/list choice for no benefit.

**Reversible?** No, in the direction that matters: once the migration has run in a browser,
the old key is gone. Leave the migration block in place until you're certain no browser
still holds the legacy key. This is the precedent for all `localStorage` changes here —
schema changes are data migrations, not refactors.

---

### 2026-03-27 — Hand-rolled `/api/scan` shim for the Vite dev server

**Context:** `api/scan.js` is a Vercel serverless function. `vite dev` doesn't run Vercel
functions, so scanning 404'd locally while working fine in production.

**Decision:** A `configureServer` middleware in `vite.config.js` that fakes the `req`/`res`
pair and calls the same handler, rather than requiring `vercel dev` to work on the app.

**Alternatives considered:** `vercel dev` — rejected as a heavier local dependency for a
one-function app.

**Reversible?** Yes. But it implements only `status()` and `json()`: add a response method
in the handler and dev breaks while prod stays green. That asymmetry is the cost of this call.

---

### 2026-03-26 — localStorage, no backend

**Context:** Single-user personal project. Every persistence option beyond the browser
brings accounts, hosting, and a schema to maintain.

**Decision:** `localStorage` only. No database, no auth, no sync.

**Reversible?** Effectively a one-way door while it stands: there is no export, so the log
lives and dies with one browser profile. Revisiting this is the biggest open architectural
question in `docs/PRD.md`.

---

### 2026-03-26 — Three-tier branch model: `feature/*` → `dev` → `main`

**Context:** `main` auto-deploys to Vercel production. With features merging straight to
`main`, every merge is a deploy.

**Decision:** Add `dev` as an integration branch. Work lands on `dev` continuously and
promotes to `main` in a separate, less frequent release PR, so merging and shipping are
two different events. Original reasoning wasn't written down at the time; this entry
records the model, which is now codified in `CLAUDE.md`.

**Reversible?** Yes, but it's the convention the repo is built around — see `CLAUDE.md`.

---
