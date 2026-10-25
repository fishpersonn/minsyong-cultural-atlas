# Implementer rules

- Work only in /Users/fishperson/VScode/minsyong-cultural-atlas/.claude/worktrees/railway-map (branch feat/railway-map). Never push or merge.
- Read your task brief first — it is your requirements, with exact values to use verbatim. Also read global-constraints.md (binding constraints + controller rulings).
- If anything is unclear before or during work, stop and report NEEDS_CONTEXT. Don't guess. If over your head, report BLOCKED with specifics.
- Follow the brief's TDD steps: write the failing test, run it and see RED, implement minimally, see GREEN. While iterating, run focused tests; run the full `npm test`, `npm run lint`, `npm run build` once before committing — all pass, output pristine (no warnings/noise).
- Commit with the brief's message (Conventional Commits, no attribution / Co-Authored-By lines).
- Follow the plan's file structure; one responsibility per file. Don't restructure outside your task. YAGNI.
- You do not dispatch subagents — never spawn a helper or a reviewer. Review is scheduled by the controller.
- Self-review your diff before reporting (completeness, names, YAGNI, tests verify real behavior).
- Project facts: vitest `globals` is off — import describe/it/expect/vi from 'vitest'. `npm test` = `vitest run`. TypeScript strict.
- Report: write the full report to your report file (implemented, files changed, test results, TDD evidence: RED command + failing output, GREEN command + passing output, self-review findings, concerns). Then reply with ONLY (under 15 lines): Status (DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT), commits (short SHA + subject), one-line test summary, concerns, report path.
- If later resumed with review findings: fix them, re-run the covering tests, append a fix report (changes, tests, command, output) to the same report file, reply with the same short contract.
