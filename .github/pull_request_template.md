<!-- Title: <type>(<scope>): <description>, at most 72 characters. It becomes the squash commit. -->
<!-- CI checks that "Summary" and "How to verify" have content. Write "None" or "n/a" rather than
     leaving another section empty; comments like this one can stay, they are ignored. -->

## Summary

<!-- What changes and why, in a few lines, for someone who has not followed the work. -->

## Type of change

- [ ] Feature (spec `NNN-name`)
- [ ] Fix
- [ ] Refactor (no behavior change)
- [ ] Docs, CI or tooling

## Spec and tasks

<!-- Feature PRs (branch NNN-name) must link their spec; CI checks it. Otherwise "n/a". -->

- Spec: `specs/NNN-name/spec.md`
- Prototype pages:
- Tasks: T###–T###
- Checklists: `specs/NNN-name/checklists/`

## What changes

<!-- The main changes by area, so reviewers know where to look: routes and pages, components,
     API layer (`src/lib/api`), i18n catalogs, tests, configuration. -->

## Screenshots

<!-- UI changes: before and after, desktop (1440 px) and mobile (390 px); Spanish and English if
     the text changed. Otherwise "n/a". -->

## How to verify

<!-- Steps a reviewer can follow without asking:
     - Setup: branch, `npm install`, new env vars, and whether the backend is needed (which branch;
       see README › Local development). Say what the Vercel preview cannot show (no backend yet).
     - Automated: the commands to run, e.g. `npm test && npm run test:e2e:app`.
     - Manual: who to sign in as (demo users in README), the URL, what to do and what to expect,
       in Spanish and English when the text changed. -->

## Dependencies and merge order

<!-- Related PRs (e.g. DocentAI-Org/backend#N), the PR this one is stacked on, and the order to
     merge them. Otherwise "None". -->

## Risks and rollback

<!-- Breaking changes (routes, cookies, env vars, API contract), anything shared links or saved
     data rely on, and how to revert. Otherwise "None". -->

## Checks

- [ ] Constitution Check passed in `plan.md` (before and after design)
- [ ] Tests written first and seen failing; none skipped without a reason below
- [ ] E2E tests with axe pass for every new screen (WCAG 2.2 AA), desktop and mobile
- [ ] Spanish and English complete; no hard-coded user-facing text
- [ ] API types regenerated from the backend `openapi.json` if it changed
- [ ] New settings documented in `.env.example` and the README
- [ ] Vercel preview reviewed, or the reason it cannot show this change
- [ ] UX changes validated by the pedagogy team

## Known gaps and follow-ups

<!-- What is left out on purpose, open decisions and follow-up tasks. Otherwise "None". -->
