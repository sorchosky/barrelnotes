# CLAUDE.md — Agent Contract

This file governs how Claude Code operates in this repo. Read it in full before
touching any code. It is copied from the vibe-scaffold template —
project-specific detail lives in `docs/PRD.md`, `docs/ARCHITECTURE.md`, and
`docs/DECISIONS.md`, not here.

## Project identity

- **Name:** BarrelNotes
- **One-liner:** Digital log for recording whiskey you've tried and deciding what to buy next, including a camera scan that reads a bottle label and scores it against your taste history.
- **Stack:** React 18 + Vite + Tailwind, deployed on Vercel, with one serverless function at `api/scan.js`
- **Integration branch:** `dev` (three-tier — see Git workflow)
- **PRD:** `docs/PRD.md`
- **Architecture / decisions:** `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`

Everything below that says "the integration branch" means `dev` in this repo.

## How to start a session

1. Read `docs/PRD.md` and `docs/ARCHITECTURE.md` in full.
2. Read `docs/DECISIONS.md` for anything already settled — don't re-litigate it.
3. Restate the plan for the current feature/phase in 3-5 bullets before writing code.
   **Wait for a go-ahead on this restatement before building.** This is the one
   mandatory check-in — everything after it runs autonomously until the next
   trigger below.

## Autonomy contract

**Do without asking:**
- Implement anything explicitly scoped in `docs/PRD.md`
- Install/remove npm dependencies that stay within the stack already declared in ARCHITECTURE.md
- Create commits and push to the current feature branch
- Open a PR from a feature branch into `dev`
- Write/update tests for code you write
- Update `docs/DECISIONS.md` when you make a judgment call worth remembering

**Stop and ask first:**
- Merging any PR
- Opening or merging a release PR (`dev` → `main`) — that ships to production, so
  it's a human call on human timing
- Anything that touches production data or a live deploy
- Adding a paid API, service, or anything with a cost attached — surface the cost before doing anything, no exceptions
- Changing the model, prompt, or `max_tokens` in `api/scan.js` in a way that moves
  per-scan cost, or raising the scan rate limit — both spend real money
- Any change that expands scope beyond what's in `docs/PRD.md`
- Deleting data, dropping a table/collection, or force-pushing
- Changing the `localStorage` schema or key names without a migration — that's user
  data, and there is no backup (see the CaskBook rename entry in DECISIONS.md)
- Introducing a new major dependency/framework not already in ARCHITECTURE.md

## Check-in cadence

Beyond the mandatory plan check-in above, check in when:
- A PRD feature/milestone is complete and ready for review
- You've attempted the same blocker two different ways and neither worked
- Something in the PRD is ambiguous enough that two reasonable interpretations
  would produce different code
- You're about to open a PR to `dev`
- Enough has accumulated on `dev` that a release to `main` looks due — say what's
  stacked up and let a human decide whether to ship

Otherwise, keep working. Don't check in just to narrate progress — a working
diff and a clear commit message says more than a status update.

## Git workflow

This project runs the **three-tier** model: work lands on `dev` continuously,
and `dev` promotes to `main` on a slower, deliberate release cadence. Merging
is not shipping here — those are two different events, and only the second one
reaches users.

```
feature/<slug> ──PR──> dev ──release PR──> main ──> Vercel production
```

### The rules

- `main` is production. Vercel auto-deploys `main` to prod and gives every
  branch/PR a preview URL — no extra config needed, just keep the repo connected.
- `dev` is integration. Everything lands here first and settles before it ships.
- One branch per unit of work, cut from latest `dev`: `feature/<slug>`,
  `fix/<slug>`, or `docs/<slug>`. Never cut from `main`.
- One **worktree** per feature, created with `scripts/new-feature.sh <slug>`,
  living as a sibling directory (`../barrelnotes-worktrees/<slug>`). This lets
  multiple features get worked in parallel without stashing.
- Squash-merge work branches into `dev` via PR. Delete the branch and remove the
  worktree after merge (`git worktree remove`).
- Never push directly to `main` or `dev`. Everything lands by PR.
- **Releases:** run `scripts/release.sh` to see what's stacked on `dev`, then open
  the `dev` → `main` PR. Merge it as a **merge commit, not a squash** — squashing
  would flatten the features into one opaque commit and leave `dev` and `main`
  permanently diverged. Opening that PR is a stop-and-ask.

### Commit messages

Conventional Commits, imperative mood, no filler ("add score validation" not
"this commit adds some validation logic for scores"). Reference the PRD section
a commit addresses when it's not obvious.

| Prefix | Use for |
|---|---|
| `feat:` | New feature or component |
| `fix:` | Bug fix |
| `style:` | Visual/CSS changes only, no logic |
| `refactor:` | Code restructuring, no behavior change |
| `docs:` | Documentation only |
| `chore:` | Config, dependencies, tooling |

## Quality bar before calling something done

- No console errors/warnings in the browser
- Responsive at mobile + desktop widths at minimum
- Keyboard-navigable, visible focus states, obvious touch targets (44px min)
- No hardcoded secrets — `ANTHROPIC_API_KEY` lives in `.env.local` locally and in
  Vercel project env vars in prod. `.gitignore` covers `.env.local` via `*.local`;
  confirm before adding any new secret file that doesn't match that pattern.
- Scan changes are verified against a real photo, not just a mocked response
- Update `docs/DECISIONS.md` if you made a call the PRD didn't specify

## Voice for anything user-facing in the PR/commit trail

Direct, no filler, no "great progress!" energy. State what changed and why in
as few words as it takes.
