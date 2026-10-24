<!-- Title: <type>(<scope>): <description>, at most 72 characters. It becomes the squash commit. -->

## Summary

<!-- What changes and why, in a few lines. -->

## Spec and tasks

<!-- Feature PRs (branch NNN-name) must link their spec; CI checks it. -->

- Spec: `specs/NNN-name/spec.md`
- Prototype pages:
- Tasks: T###–T###
- Checklists: `specs/NNN-name/checklists/`

## Checks

- [ ] Constitution Check passed in `plan.md` (before and after design)
- [ ] Tests written first and seen failing; none skipped without a reason below
- [ ] E2E tests with axe pass for every new screen (WCAG 2.2 AA)
- [ ] Spanish and English complete; no hard-coded user-facing text
- [ ] API types regenerated from the backend `openapi.json` if it changed
- [ ] Vercel preview reviewed
- [ ] UX changes validated by the pedagogy team
