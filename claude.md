## Git Conventions

### Branch naming
- Feature branches: feature/short-description
- Bug fixes: fix/short-description
- Documentation: docs/short-description
- Always branch off dev, never off main

### Commit messages
Follow Conventional Commits format:
- feat: new feature or component
- fix: bug fix
- style: visual/CSS only, no logic changes
- refactor: restructuring, no behavior change
- docs: documentation only
- chore: config, dependencies, tooling

### Workflow
- Feature branches merge to dev via PR
- dev merges to main via PR when ready to ship
- Never push directly to main or dev
