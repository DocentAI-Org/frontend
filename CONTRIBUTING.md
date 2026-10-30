# Contributing

The rules come from the constitution (`.specify/memory/constitution.md`, Development Workflow).
Git hooks check them locally and the `PR conventions` workflow checks them on every pull request.
The hooks in `.githooks/` are mirrored in the backend repository: change both together.

## Set up the hooks

`npm install` enables them (the `prepare` script runs `git config core.hooksPath .githooks`).

- `pre-commit`: refuses commits on `main` and runs ESLint on staged scripts.
- `commit-msg`: checks the message format below.

## Branches

- A Spec Kit feature: the name of its `specs/` folder, e.g. `001-mvp-prototype`.
- Anything else: `<type>/<name>`, e.g. `ci/commit-conventions`, `fix/chat-focus`.

## Commit messages

```text
<type>(<scope>): <description>

<optional body: why, not what>
```

- Types: `feat`, `fix`, `docs`, `test`, `build`, `ci`, `chore`, `refactor`, `perf`, `style`,
  `revert`. The scope is required and lowercase.
- Header of at most 72 characters, no trailing period.
- `feat` and `fix` reference their task IDs: `feat(chat): T012 citation sheet`.
- One commit per Spec Kit artifact: `docs(spec): …`, `docs(plan): …`, `docs(tasks): …`.
  Amendments to the constitution: `docs(constitution): vX.Y.Z`.

## Pull requests

- One PR per feature, squash-merged. The PR title becomes the commit, so it follows the same
  format (a task ID is not required in the title).
- Feature PRs link `specs/NNN-name/spec.md` in the description; the template lists the rest:
  prototype pages, checklists, Vercel preview and pedagogy review.

`git commit --no-verify` skips the local hooks; CI still checks every commit of the PR.

## CI

`CI` runs lint, types, unit tests and the build on every pull request, and the E2E suites only
where a change can affect them (`scripts/ci-changes.sh`):

- **App E2E** (3 shards): anything but documentation (`specs/`, `docs/`, `*.md`), repository
  tooling and the prototype.
- **Prototype E2E** (3 shards): `public/prototype/`, its tests, dependencies, Next.js and Vercel
  config, `src/proxy.ts` and the workflow itself.

Pushes to `main` run everything.
