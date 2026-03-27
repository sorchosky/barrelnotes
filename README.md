# CaskBook

Digital log for recording and reviewing whiskey. Built with React and Vite, deployed to Vercel via the `main` branch.

---

## Tech Stack

- React 18
- Vite
- Tailwind CSS

---

## Getting Started

```bash
git clone https://github.com/sorchosky/caskbook.git
cd caskbook
npm install
npm run dev
```

No environment variables required.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local dev server (http://localhost:5173) |
| `npm run build` | Compile and bundle for production (outputs to `/dist`) |
| `npm run preview` | Serve the production build locally for pre-deploy verification |

---

## Git Workflow

### Branch Model

| Branch | Purpose |
|---|---|
| `main` | Production. Auto-deploys to Vercel on merge. Never push directly. |
| `dev` | Integration branch. All work lands here before shipping. Never push directly. |
| `feature/<name>` | New features. Always cut from `dev`. |
| `fix/<name>` | Bug fixes. Always cut from `dev`. |
| `docs/<name>` | Documentation only. Always cut from `dev`. |

### Feature Development

```bash
# 1. Start from an up-to-date dev
git checkout dev
git pull origin dev

# 2. Cut a feature branch
git checkout -b feature/<name>

# 3. Do your work, then commit
git add <files>
git commit -m "feat: short description"

# 4. Push and open a PR targeting dev
git push -u origin feature/<name>
```

Open a PR from `feature/<name>` → `dev`. After merge, delete the feature branch.

### Shipping to Production

When `dev` is stable and ready to release, open a PR from `dev` → `main`. Merging that PR triggers an automatic Vercel deployment — no additional steps required.

---

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

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

`main` is connected to Vercel. Every merge to `main` triggers a production deploy automatically. Preview builds are not currently configured — use `npm run preview` locally to verify before merging to `main`.
