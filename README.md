# BarrelNotes

Digital log for recording and reviewing whiskey, with a camera scan that reads a bottle label and scores it against your taste history. Built with React and Vite, deployed to Vercel via the `main` branch.

---

## Project Docs

Read these before making changes — they're what Claude Code reads too.

| File | What's in it |
|---|---|
| `CLAUDE.md` | The agent contract: autonomy boundaries, check-in cadence, git workflow, quality bar |
| `docs/PRD.md` | What this is, who it's for, what's in and out of scope |
| `docs/ARCHITECTURE.md` | Stack, data model, the scan path, known constraints |
| `docs/DECISIONS.md` | Append-only log of judgment calls already made — don't re-litigate them |

---

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Vercel serverless function (`api/scan.js`) calling the Anthropic API

---

## Getting Started

```bash
git clone https://github.com/sorchosky/barrelnotes.git
cd barrelnotes
npm install
npm run dev
```

### Environment variables

Bottle scanning calls the Anthropic API and needs a key. Create `.env.local` in the
project root:

```
ANTHROPIC_API_KEY=sk-ant-...
```

`.gitignore` already covers this via `*.local` — don't commit it. Everything except
the scan feature works without a key.

In production the same variable is set in the Vercel project's environment settings.

**Scanning costs money per call.** There's a 10-scans-per-IP-per-day limit in
`api/scan.js`, but it lives in memory and resets on cold start — treat it as a speed
bump, not a ceiling. See `docs/ARCHITECTURE.md`.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local dev server (http://localhost:5173) |
| `npm run build` | Compile and bundle for production (outputs to `/dist`) |
| `npm run preview` | Serve the production build locally for pre-deploy verification |
| `scripts/new-feature.sh <slug>` | Create a worktree + branch for new work, cut from `dev` |
| `scripts/release.sh` | Show what's stacked on `dev` and print the release PR link (read-only) |

---

## Git Workflow

Three tiers: work lands on `dev` continuously, and `dev` promotes to `main` on a
slower release cadence. **Merging is not shipping** — only the release reaches users.

```
feature/<slug> ──PR──> dev ──release PR──> main ──> Vercel production
```

### Branch Model

| Branch | Purpose |
|---|---|
| `main` | Production. Auto-deploys to Vercel on merge. Never push directly. |
| `dev` | Integration branch. All work lands here before shipping. Never push directly. |
| `feature/<name>` | New features. Always cut from `dev`. |
| `fix/<name>` | Bug fixes. Always cut from `dev`. |
| `docs/<name>` | Documentation only. Always cut from `dev`. |

### Feature Development

One worktree per feature, so several can be in flight without stashing:

```bash
scripts/new-feature.sh bottle-search
cd ../barrelnotes-worktrees/bottle-search
npm install
```

That cuts `feature/bottle-search` from the latest `origin/dev` and copies your
`.env.local` across. Prefix the slug (`fix/...`, `docs/...`) for a different branch type.

Work, commit, then push and open a PR targeting `dev`:

```bash
git add <files>
git commit -m "feat: short description"
git push -u origin feature/bottle-search
```

After merge, delete the branch and clean up the worktree with `git worktree remove`.

<details>
<summary>Without worktrees</summary>

```bash
git checkout dev && git pull origin dev
git checkout -b feature/<name>
# work, commit
git push -u origin feature/<name>
```
</details>

### Shipping to Production

When `dev` is stable and enough has accumulated to be worth a release:

```bash
scripts/release.sh    # lists what's waiting, prints the compare URL
```

Open the `dev` → `main` PR and merge it as a **merge commit, not a squash** —
squashing flattens the individual features into one opaque commit and leaves `dev`
and `main` permanently diverged. Merging triggers the Vercel production deploy.

---

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/), imperative mood,
no filler — "add score validation", not "this commit adds some validation logic":

| Prefix | Use for |
|---|---|
| `feat:` | New feature or component |
| `fix:` | Bug fix |
| `style:` | Visual/CSS changes only, no logic |
| `refactor:` | Code restructuring, no behavior change |
| `docs:` | Documentation only |
| `chore:` | Config, dependencies, tooling |

---

## Deployment

`main` is connected to Vercel. Every merge to `main` triggers a production deploy
automatically. `vercel.json` pins the framework, build command, and output directory
so the build doesn't depend on auto-detection.

`api/scan.js` deploys as a serverless function alongside the static build. It needs
`ANTHROPIC_API_KEY` set in the Vercel project's environment variables — without it,
the app deploys fine and scanning fails at runtime.

Use `npm run preview` locally to verify a production build before opening a release PR.
