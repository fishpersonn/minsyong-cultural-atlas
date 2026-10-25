# SDD ledger — plan: docs/superpowers/plans/2026-10-26-minxiong-railway-map.md

Worktree: .claude/worktrees/railway-map, branch feat/railway-map, base 410f1d7. Spec: docs/superpowers/specs/2026-10-25-minxiong-railway-map-design.md (reachable).
Env: node v22.17.0, npm 10.9.2.

## Pre-flight scan

| Pair / task | Shared file or interface | Finding |
|---|---|---|
| T1 → T2 | constants.ts | T1 creates with OFFICIAL_SITE_URL; T2 adds LNG_RANGE, LAT_RANGE. Consistent. |
| T2 → T3 | types.ts, Place | T3 adds PlaceGroup to types.ts; Place from T2. Consistent. |
| T3 → T5 | PlaceGroup, initialBounds | Same signatures. Consistent. |
| T4 → T5/T7 | useSelectedId | Signature `[string\|null, (id)=>void]` used identically. |
| T5 → T7 | themes.ts, MapView props | T7 reads themes; props match. |
| T1 → T7 | App.test.tsx | T1 asserts text '民雄鐵路高架化'; T7 rewrites App. Conflict risk. |
| T1 steps 6-7, T8 steps 2-3 | push/merge to main, Pages setting | Side effects outside worktree. |
| T5 step 5, T7 step 5 | browser visual check | Implementer subagents have no browser. |
| T6 | links empty case | parsePlaces drops items lacking 查看更多, so empty links only via hand-made data; test is defensive. Consistent. |
| T3 test | bounds numbers | Verified against data: Taichung excluded (>10km); 講堂 (120.439,23.524) ~3.7km from median, stays; north<23.6 and west>120.4 hold. |
| T2 test | 24 ids distinct, 0 skipped | Verified by script against source JSON. |
| Per-task self-consistency | T1–T8 | Tests and signatures agree with their own text. |

Ruling: T7 keeps the text 民雄鐵路高架化 visible (in SiteHeader) so T1's App test stays valid — spec silent, avoids a broken test — cost if wrong: one test edit.
Ruling: T1 steps 6-7 and T8 steps 2-3 (push, Pages setting, live-URL check) are not executed by subagents; workflow file and README are written and committed on the branch only; push/merge/Pages happens at finishing-a-development-branch with the user — pushing to shared main is an outside-worktree side effect — cost if wrong: user does deploy steps later.
Ruling: worktree created manually from local HEAD (410f1d7) instead of EnterWorktree's default fresh-from-origin, because origin/main lacked the plan commit; .claude/worktrees/ and .superpowers/ added to .git/info/exclude of the main checkout (not committed) — cost if wrong: none to code; exclusion is local only.
Ruling: visual browser checks (T5 step 5, T7 step 5) are replaced for implementers by: curl the OpenFreeMap style URL for HTTP 200, build, tests; I and the user do the visual check at the end — no browser tool for subagents — cost if wrong: layout polish found late.
Task 1: dispatched (BASE 410f1d7, implementer sonnet)
Task 1: minor (deferred): vitest globals off → RTL auto-cleanup not registered (carry into first task with multiple component tests: add setupFiles with afterEach(cleanup))
Task 1: minor (deferred): deploy.yml on:push no branch filter → duplicate CI on PR; cancel-in-progress may cancel a running main deploy
Task 1: minor (deferred): App.test uses toBeTruthy (getByText already throws)
Task 1: complete (commits 410f1d7..f45b823, review clean)
Task 2: dispatched (BASE f45b823, implementer sonnet). Ruling: summary missing → '' and images may be empty (not skipped) — spec only requires coords/title/link — cost if wrong: cards with blank summary
Task 2: minor (deferred): skip test asserts index only, not reason strings
Task 2: minor (deferred): range/NaN/non-numeric coords and unextractable-id branch untested; catch branch unreachable
Task 2: complete (commits f45b823..f355c30, review clean)
Ruling: user asked (mid-run) for Tailwind + shadcn/ui + Radix and a frontend-design skill — UI stack added to global-constraints.md, setup folded into start of Task 5 as its own commit; Tasks 1–4 have no UI so unaffected — cost if wrong: dependency removal
Task 3: implemented b6a3e20; review: Needs fixes (1 Important: zero-size box when ≥2 kept points share coords)
Task 3: minor (deferred): DEFAULT_BOUNDS returned by reference (mutable shared state)
Task 3: minor (deferred): outlier test checks only N/W; kept.length===0 fallback untested; order test shallow
Task 3: fix round 1 dispatched (resume implementer), FIX_BASE b6a3e20
Task 3: fix round 1/5 (1 addressed, 0 open; commits b6a3e20..6474374). Fix report lacked raw test output; controller ran npm test: 17/17 pass.
Task 3: complete (commits f355c30..6474374, review clean)
Task 4: dispatched (BASE 6474374, implementer sonnet); carries Task 1 minor (RTL cleanup setupFiles). Note: frontend-design:frontend-design skill now installed — UI implementers (T5–T7) told to load it.
Task 4: minor (deferred): setter stores raw id; non-digit id would desync state vs hash (ids come from validated data)
Task 4: minor (deferred): hashchange test uses replaceState+synthetic event; no unmount-listener test
Task 4: complete (commits 6474374..bbf1b5b, review clean)
Task 5: dispatched (BASE bbf1b5b, implementer sonnet, with Tailwind/shadcn setup commit + frontend-design skill)
Task 5: implemented 37313ff,1e290c2 (DONE_WITH_CONCERNS: no browser check; shadcn -b radix; 'cn' npm pkg verified: maintainer shadcn, repo shadcn-ui/cn; chunkSizeWarningLimit 2000; one eslint-disable)
Task 5: review Needs fixes — 5 Important: transition-transform lag; markers recreated on select (focus loss); StylePreview extra in prod; async style failure blank map; partial-construction leak
Ruling: style/network error before `load` counts as "地圖初始化失敗" → fallback; errors after load ignored — spec says init failure shows hint, tile errors are routine — cost if wrong: fallback shown when map could have partially worked
Task 5: minor (deferred): Geist font without CJK stack (report inaccurate); unused shadcn dark/sidebar tokens; chunkSizeWarningLimit raised instead of dynamic import; h-full vs absolute inset-0
Task 5: fix round 1 dispatched (resume), FIX_BASE 1e290c2; also asked: drop flyTo essential, 44px hit area
Task 5: fix round 1/5 (5 addressed, 0 open; commits 1e290c2..5ba328a); controller npm test 43/43
Task 5: note for T7: MapView marker effect keyed on `groups` identity — App must memoize groups/bounds (module-level or useMemo) or markers rebuild and focus is lost
Task 5: complete (commits bbf1b5b..5ba328a, review clean)
Task 6: dispatched (BASE 5ba328a, implementer sonnet). Ruling: card shows first image only; selectedId not in group → first place; placeholder via BASE_URL — spec silent — cost if wrong: small UI change
Task 6: minor (deferred): close button scrolls out of view inside scrolling article (carried to T7 layout)
Task 6: minor (deferred): key={href} collides on identical links; empty group crash unguarded; hardcoded hex colors (consistent with existing)
Task 6: complete (commits 5ba328a..cdb7bb9, review clean)
Task 7: dispatched (BASE cdb7bb9, implementer sonnet); carries groups-identity note and T6 close-button minor. Ruling: unknown #p= → no card, URL not rewritten — spec says back to full map without error — cost if wrong: stale hash in URL bar
Task 7: review Needs fixes — 2 Important: mobile drawer hides map attribution; max-h 60% vs viewport. Also asked robust scroll wrapper, indentation, stronger warn test.
Task 7: minor (deferred): hardcoded hex colors duplicated App/PlaceCard; afterEach ordering
Task 7: fix round 1 dispatched (resume), FIX_BASE b392be1
Task 7: fix 8328714 done; controller npm test 61/61; re-review dispatched (FIX_BASE b392be1). User asked to move to Claude Code web — awaiting confirmation to push feat/railway-map + commit handoff doc.
Task 7: fix round 1/5 (4 addressed, 0 open; commits b392be1..8328714)
Task 7: complete (commits cdb7bb9..8328714, review clean)
Added .claude/settings.json enabling superpowers + frontend-design plugins (user request, for Claude Code web).
User: stop web migration; keep only .claude/settings.json (committed); finish T7/T8 locally. Handoff docs removed, nothing pushed.
Task 8: dispatched (BASE 0c4a98b, implementer sonnet) in existing worktree; only README + commit (no push/merge)
Task 8: minor (deferred): README skip list omits non-object/no-properties; hash digits-only not stated
Task 8: complete (commits 0c4a98b..58bc94b, review clean)
Final review: dispatching (MERGE_BASE 410f1d7)
