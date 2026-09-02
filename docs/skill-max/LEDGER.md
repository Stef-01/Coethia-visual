# Skill Max ledger — faster-than-the-rumour.html

## Stage −1 — Preflight and house rules — PASS

**Ran.** `scripts/preflight.sh`
**Changed.** Nothing. 21/29 fleet skills present at start of run; 29/29 by the end.
**Declined.** Nothing.
**Uncovered.** none.
**For the next stage.** Standing rules copied verbatim into `PLAN.md`.

## Stage 0 — Ground truth and baseline — PASS

**Ran.** `webapp-testing`
**Changed.** `playwright` added as a dev dependency; the three suite scripts' requires changed from
`C:/Users/stefa/Menu-app/node_modules/playwright` to `require('playwright')`. No change to the
artifact. `measure.js` deliberately not run — it writes `FIT`/`FIT_M` back, and the committed values
are what readers see today.

**Metrics.** Baseline captured: 59 scenes, 43 findings — 34 text collisions (2 desktop, 32 mobile),
9 scenes with sub-7px text, and zero console errors, NaN geometry, empty stages, frame overflow or
page overflow. Full analysis in `BASELINE.md`.

**Declined.** Nothing.
**Uncovered.** `interact.js` not run — its 12 assertions are stage 13's job.
**For the next stage.** Desktop is 2 findings in 59 scenes. The defect is mobile type scale, not
composition. Depth narrowed to stages 5, 6, 13 on that evidence, with the user's agreement.

## Stage 5 — Layout resolution and collisions — REVERTED, AND THE MEASUREMENT IS INVALID

**Ran.** Code stage; `gsap-utils` not needed in the end.

**Step 1 — the Class B contradiction, resolved.** This part stands and is worth keeping. The comment
at line 955 is wrong on three counts, established by direct measurement of every sub-7px node:

| Comment claims | Measured |
|---|---|
| "a 752-unit frame into a 375px stage" | the stage is **339×467**, not 375 wide — it used viewport width, not stage width |
| "so sc is 0.499" | **0.4508** |
| "TK is pinned at 3 on a phone" | **2.372** in console scenes. `TK = clamp(7.7/(7.2·sc), 1, 3)` only pins at 3 when `sc ≤ 0.3565` |

And the real mechanism, which the comment misses entirely: `TK` is solved so that base-7.2 text lands
exactly on `MIN_LABEL_PX`. Measured: 7.2 × 2.372 × 0.4508 = **7.70px**, the floor, precisely. Then
`CON_TK = 0.84` multiplies *after* that. 7.70 × 0.84 = **6.47px** — exactly what the probe measures in
`segments`, `listen`, `placement`, `grants`. So the 7px floor and `CON_TK` are **mutually exclusive by
construction**. This is arithmetic, not a tuning problem, and no value of `CON_TK` below 1.0 can
satisfy the floor as currently composed.

Two scenes fail by a different mechanism: `decided` (`sc` 0.3119, frame 1087 wide) and
`backtotheroom` (`sc` 0.282, frame 1202 wide) sit below the 0.3565 pin threshold, so `TK` clamps at 3
and the floor becomes unreachable: 6.74px and 6.26px measured. The widest frames in the piece.

A third, undocumented factor: the provenance stamp carries `data-tk="0.55"` at base 10.5, landing at
5.78–6.18px in five scenes. It is not covered by `CON_TK` or by the comment.

**Step 2 — the attempted fix, and why it is void.** `label()` already has a `FLOW` mechanism that
pushes stacked centred labels apart, but it only *records* into `FLOW` for blocks that wrapped or were
themselves pushed. Two short stacked captions therefore never register, which is why
`'ONE EVIDENCE'`/`'BASE'` at line 1789 — 16 units apart at size 10, painted ~30 units tall each on a
phone — collides in five scenes. The change was to record every eligible centred label.

Re-audit read 43 → 37. **That number is not attributable and must not be believed.**

**Concurrency: another agent session was editing this repo during the run.** Commit `af95cd2`, authored
2026-08-28 20:07:19 — between my baseline audit and my re-audit — fixes a real bug in `measure.js` and
`audit.js`: they skipped elements *inside* a `<clipPath>` but not elements *clipped by* one, and
`getBBox()` reports unclipped geometry, so invisible content was growing camera frames. It shrank the
phone frames substantially (`comments` 1033 → 435 units) and reports its own 43 → 38. It also swept my
uncommitted `playwright` fix and my `FLOW` patch into itself.

So my 43 → 37 conflates their frame fix with my label fix, and the two new regressions the re-audit
showed — `translate` 5× → 18× collisions plus a new frame overflow, and `tiers` 0 → 10× — cannot be
assigned to either change. Both possible causes are live and neither is isolated.

**Reverted.** The `FLOW` patch is out of the working tree. Their `measure.js`/`audit.js` fix is
correct and stays. I did not touch git history or commit into a repo another agent is actively
committing to.

**Metrics.**
| Metric | Baseline (mine, pre-concurrency) | After (uninterpretable) |
|---|---|---|
| Findings | 43 | 37 |
| Text collisions | 34 | 27 |
| Sub-7px scenes | 9 | 9 |
| Frame overflow | 0 | 1 |

**Declined.** Did not attempt the `MIN_LABEL_PX` / `CON_TK` reconciliation. It is a visible global
type-size change and there is no trustworthy baseline to measure it against right now.

**Uncovered.** The 8-or-so remaining collision authoring sites were never individually examined:
`weeks`, `tiers`, `measure`, `cases`, `fit`, `five`, `lenses`, `translate`. Also unexamined: why
`quadrants` reported 5 sub-7px nodes to `audit.js` while the direct probe found none at the same
viewport — which on its own suggests scene rendering depends on scroll history.

**For the next stage.** Re-baseline before doing anything else, on a quiet repo. Then the wheel at line
1789 needs a design decision, not a nudge: at `TK = 3` three stacked labels need ~120 units and the
circle is 120 units tall, so they cannot fit. Enlarge the circle on mobile, or drop to one line, or
move the caption outside it.

---

# Re-baselined run, 2026-08-29

## Stage 0 — Ground truth, re-established — PASS

**Ran.** `webapp-testing`
**Precondition checked first.** HEAD 5.5 hours old, no `node` process against the repo, all three
suite scripts parse, and the other session's `userBox()` helper is defined *and* called in both
`audit.js` and `measure.js` — complete work, not a mid-edit. Their uncommitted changes were kept and
never touched.

**Changed.** Nothing in the artifact.

**Metrics.** 59 scenes, **13 findings**: 2 desktop collisions, 2 mobile collisions, 7 scenes with
sub-7px text, 4 frame overflows. Zero console errors, NaN geometry, empty stages, page overflow.

The previous 43-finding baseline is void and `BASELINE.md` has been rewritten. It was taken against
frames computed before the other session's fix for content *clipped by* a `<clipPath>` and for
`getBBox()` reporting transformed groups in their own user space. Tighter frames → larger render scale
→ lower `TK` → less inflation → the collisions largely disappear. **Most of what read as a labelling
problem was a measurement problem.**

**Uncovered.** `interact.js` still not run.

## Stage 5 — Layout resolution — BLOCKED on a tooling defect

**Step 1 — re-fit the frames.** Ran `measure.js`, then `audit.js`. 13 → 10 findings: frame overflow
**4 → 0**, collisions 4 → 2, sub-7px scenes 7 → 8 (`decided` returned — its refitted frame is wider,
so `TK` re-pins at its ceiling). Recorded as a regression inherent to fitting rather than reverted,
because reverting would restore four frame overflows.

**Step 2 — the `CON_TK` change was never applied.** The patch aborted on its own guard assertion
before writing (the assertion was over-strict — it matched the word `MIN_LABEL_PX` in a comment I had
just written, not a code reference). The artifact was unchanged. But `measure.js` and `audit.js` ran
anyway, and the audit came back **11 findings, not 10**, on identical code. `twoclocks` gained 8
sub-7px nodes; `backtotheroom` gained 2 collisions and lost its sub-7px finding.

**That accident is the most valuable result of the run.** It says the numbers move without the code
moving.

**Step 3 — `measure.js` is a divergent feedback amplifier.** Tested directly: two consecutive runs on
a byte-identical file. **15 of 118 frames moved** — 13 mobile, 2 desktop. Widths:

```
k280   757 -> 850  (+93)     subsidy  940 ->  995  (+55)
lenses 716 -> 766  (+50)     money    909 ->  951  (+42)
grants 790 -> 798   (+8)     anatomy  498 ->  504   (+6)
descent 696 -> 698  (+2)     law      586 ->  588   (+2)
axes   944 -> 946   (+2)     trap     594 ->  595   (+1)
decided, laws, backtotheroom: width unchanged, origin moved
```

**Every delta is positive. Frames only ever grow.** That is a ratchet, not jitter, and the mechanism is
the documented type-scale loop with `measure.js` as its driver rather than its victim: frame grows →
`sc` shrinks → `TK` grows → type inflates → measured content extents grow → the next fit grows the
frame again. Two of the four large movers (`k280`, `lenses`) are `POKE` scenes, but `subsidy` and
`money` are not, so the interactive-state pokes are not the sole cause.

**Consequence, stated plainly.** Any measurement of this artifact is a function of how many times
`measure.js` has been run against it. A before/after comparison at ±2 findings resolution is not
meaningful, and `k280` alone can move by 12% of its width. This also explains the repo's own history —
three commits in one evening about the type-scale loop, each reporting a different set of numbers.

My gate protocol lists determinism — identical geometry across two runs — as a hard metric. **It fails
on this target**, and it fails as a *precondition*, which means it should have been checked before
stage 0 rather than discovered in stage 5.

**Reverted.** `git checkout -- faster-than-the-rumour.html`. The artifact is byte-identical to HEAD.
Net change to the artifact from this entire run: **none.** Four fitted variants are preserved for
comparison. `audit.js` and `measure.js` retain the other session's uncommitted work, untouched.

**Metrics.**
| Metric | Baseline | After 1 fit | After 2 fits (no code change) |
|---|---|---|---|
| Findings | 13 | 10 | 11 |
| Collisions | 4 | 2 | 3 |
| Sub-7px scenes | 7 | 8 | 8 |
| Frame overflow | 4 | 0 | 0 |
| Determinism | — | — | **FAIL: 15/118 frames move** |

**Declined.** Did not rewrite `measure.js`. It carries another session's uncommitted changes and
converting a one-pass fitter into a convergent one is a substantive change to a file I do not
currently own.

**Uncovered.** The 2 remaining collision sites and the `CON_TK` reconciliation, both deliberately
untouched until the fitter converges. Why `quadrants` reported 5 sub-7px nodes to `audit.js` while a
direct probe found none — now most likely the same non-determinism.

**For the next stage.** Fix the fitter first; nothing downstream can be measured until then. Three
approaches, cheapest first: (1) quantise frames to a coarse grid so sub-threshold measurement
differences stop propagating — absorbs the six small movers but not `k280`'s 93 units; (2) iterate
inside a single `measure.js` run until a scene's frame stops moving, with a cap and damping; (3) clamp
growth — refuse to grow a frame beyond a small epsilon, and treat a scene that wants more as an
authoring problem to surface rather than a frame to enlarge. (3) is the one that actually breaks the
loop, because the loop's whole pathology is that growth is always permitted.

---

## Stage 5, second attempt — the fix is built and correct; the repo is not mine to land it in

**Ran.** Code stage.

### What I built

`measure.js` rewritten as a convergent, history-independent fitter.
Preserved at `docs/skill-max/handoff/measure-v2-convergent.js`, with a ready-to-apply
`measure-v2-convergent.patch` and the one-pass version it replaces alongside it.

**First, a correction to my own previous entry.** I called the old fitter a "divergent feedback
amplifier". That was wrong, and the difference matters. It converges — just monotonically from below,
one step per run, with a gain close to 1. The file itself is the iteration state, so each run advances
the iteration by one step, which is why every delta was positive and why the output depended on how
many times the generator had ever run. Slow monotone convergence, not divergence. The user-visible
symptom is identical; the maths is not, and "iterating a divergent loop converges on nothing" (which I
wrote into the skill's gate protocol) was a false statement. Corrected there too.

**The structure of the problem.** Content geometry depends on the frame *only* through `TK` —
`isNarrow()` is viewport-based, `wrapFor()` never reads `TK`, `conMetrics()` is frame-independent. So
this is a one-dimensional fixed point: find `w*` with `F(w*) = w*`, where `F(w)` is the fit width
obtained by rendering at the `TK` a frame of width `w` induces. `F` is monotone non-decreasing and,
because `TK` is clamped to `[1, 3]`, flat outside a bounded band — so **a fixed point is guaranteed to
exist**, and `[wTK1, wTK3]` brackets it with both signs known a priori.

The fitter also needs no copy of the page's constants: `TK` is read back off the DOM as
`font-size / (data-fs · data-tk)`, so it cannot drift from them.

**Three dead ends, all of which looked right, all recorded in the file.**

1. Bracketing on `[wTK1, wTK3]` and *assuming* `ga = wTK1 − wTK1 = 0`. Reads as "already at the root"
   and silently collapses false position to bisection. Every scene reported SLOW.
2. Bracketing on `[W_SMALL, W_LARGE]`, where real `g` values are already in hand. `g(W_LARGE) ≈
   −23000`, so the secant is dominated by the far endpoint and creeps. Textbook false-position
   stagnation; left mobile residuals of 20–47 units and made the answer depend on the search path.
3. Never testing the endpoints. When `TK` clamps, the root *coincides with* a bracket endpoint, and no
   interval method can land on its own endpoint — it halves toward it forever and reports a stale
   interior best as converged. This is what produced `OK` statuses carrying 11–24 unit residuals.

Final structure: probe both extremes, short-circuit TK-insensitive scenes, measure `g` at both
endpoints (catching `CLAMPED_LO` and `CLAMPED_HI`, which is most scenes), then false position between
them. Residuals of ±2–3 units are irreducible sub-pixel text metrics, which `TOL = 3` and `GRID = 2`
absorb. Also carries a `GROWTH_CAP`: a scene whose fixed point needs more than 1.9× its uninflated
width keeps its committed frame and is reported `UNFITTABLE`, because growing the frame is the symptom
and not the treatment. And `--verify`, which runs two full passes in one process and asserts identical
output — the determinism gate, self-hosted.

Verified converging on the four worst scenes: desktop `resid 0` in 4 evals.

### Why it was not landed

**The concurrent session is still active.** I was told it had finished. It has not: six commits
between 02:19 and 04:25 tonight, on a branch merged to `main` four minutes before I checked.

```
04:25  885ac25  Merge: the third explainer back on the series light system, zero collisions
04:10  380dcc7  Zero collisions at the strict threshold
03:45  2e8ff43  Strict threshold: clear the last collisions in the console
03:10  17f40e7  Screenshot pass: fix what the audit was passing, then tighten the audit
02:37  a498e17  Zero text collisions at both viewports
02:19  78549a5  Zero mobile collisions: correct the coordinate space, then the last scenes
```

It has been solving the same problem by a different route, has tightened `audit.js`'s threshold, and
claims zero collisions at both viewports. During that window a stray run of a fitter — not mine, and
not one I can account for — left six mobile frames altered by 1–26 units in the working tree.

**Reverted.** `faster-than-the-rumour.html` and `measure.js` both restored to HEAD.
**Net change to tracked files in this repo from the entire Skill Max run: none.**

**Declined.** Overwriting `measure.js` while another agent is committing to it. My own gate protocol
makes exclusive ownership a precondition; landing a 238-line rewrite of a file someone edited 80
minutes ago and may edit again is precisely the failure the precondition exists to prevent.

**Uncovered.** I have not independently verified their "zero collisions" claim. Running the audit means
launching Chromium against a repo whose owner may launch one at the same moment, and two Playwright
suites contending for one browser install hang or die silently — which reads as a pass because no
findings are emitted.

**For the next stage.** Land the fitter when the repo is quiet: `git apply
docs/skill-max/handoff/measure-v2-convergent.patch`, then `node measure.js --verify`, which must print
`IDEMPOTENT`. That single assertion is the thing worth having — it is what makes every later
before/after number on this artifact mean something.

---

## Stage 5, third attempt — landed in an isolated worktree, not on main

**Ran.** Code stage, plus a six-lens adversarial review of my own fitter.

**Isolation.** All work in a separate git worktree on branch `fix/convergent-fitter`, with
`node_modules` symlinked. `main` was never touched and stayed at `885ac25` with a clean tree
throughout. This is how the concurrent-editing problem from the previous two attempts was avoided
rather than merely noted.

### Three bugs found by inspection before the first run

1. **Destructive write-back.** `--only=a,b` produced a two-scene map and the write replaced the
   *whole* `FIT` block — deleting the other 57 scenes' frames. The same path silently deleted the
   frame of any scene reported `UNFITTABLE`, the exact opposite of what that status is for. Now the
   committed blocks are parsed back out of the file and merged.
2. **Probe centre read from the current viewBox**, making the search path a function of the committed
   frames. Now a fixed `PROBE_CENTRE`.
3. **Missing endpoint probes.** The root coincides with a bracket endpoint whenever `TK` clamps, and
   no interval method can land on its own endpoint. This was producing `OK` statuses carrying 11–24
   unit residuals — a false claim in my own status field.

### First verification: IDEMPOTENT, and the claim was still overstated

`node measure.js --verify` — two full passes, 59 scenes × 2 viewports — returned
**`IDEMPOTENT: both passes produced identical frames`**, exit 0. Most scenes resolved at
`CLAMPED_LO` with residual 0 in 3 evaluations, the theoretical minimum.

Then the review found that this proved less than I said it did.

### The review, and the finding that invalidated six scenes

Six independent lenses; five returned before a session limit killed the rest (`render-semantics` and
eight of the nine refuters never ran, so most findings are unverified — that half of the review is
simply missing, not clean).

**`conKey`.** `renderConsole()` is memoised: `if (!sc || conKey === key) return;`. The page clears
that memo in its own resize path (`conKey = null`), but `conKey` is a module-scope `let`, so `APPLY`
cannot reach it. Consequence: a console scene was drawn once and then returned that first render
forever, at whatever `TK` it happened to be. Proof, from two runs differing only in scene subset:

| scene | full run | targeted run |
|---|---|---|
| `segments` mobile | `FLAT` 768 | `CLAMPED_LO` band 768–772 |

**Same scene, different answer depending on what was measured before it.** So `F` was not a pure
function of `w`, and `--verify` was proving *replay-repeatability*, not the history-independence the
file claims — both passes visit scenes in the same order with fresh pages, so an order-dependent
function still reproduces exactly. Two reviewers said precisely this. They were right and I was wrong.

Fixed by bouncing through a different console scene, forcing the memo off the target key. Re-tested
with the visit order reversed: **identical results at both viewports.** Order-invariance restored.

**`GROWTH_CAP` was unreachable for the class it exists to refuse** — flagged independently by four of
five lenses. The cap sat only on the interior exit, so `CLAMPED_HI`, whose box is by construction the
`TK=3` saturated extent (the widest a scene can ever be), was exempt. Now gated on every exit that
yields a box.

**A genuinely idempotent run reported failure** — the one finding a refuter confirmed. `String.replace`
returns an equal string both when the pattern misses *and* when the replacement is byte-identical, and
`s === before` conflated the two. So the run that demonstrates the headline property printed
`could not find the FIT block to replace` and exited 1. Now the pattern is tested explicitly and an
unchanged file reports `frames already at the fixed point`.

Also fixed: a non-finite extent could pass every gate and be serialised into the source as a frame;
and two 10-character statuses were glued to the scene key in the output.

### Not fixed, and not hidden

- **`subsidy` mobile does not converge** — residual 24.4 after 11 evaluations. `TK` is at its 3.0
  ceiling, so `F` should be flat there and the endpoint probe should have caught it. It did not, which
  means `F` is not purely a function of `TK` for this scene — something in it is positioned from the
  frame. The 1-D model is an approximation, and for this scene a poor one.
- **`SETTLE = 1500` may be shorter than the longest animation** — two lenses flagged `axes` and a 7s
  timer chain in `cliff`. Unverified; their refuters died with the session limit.
- **A global un-reseeded PRNG** was alleged to make `F` impure via visit order. Unverified.
- **The review is half-missing.** One lens and eight of nine refuters never ran.

### Status

**Not merged.** `main` is untouched. The fitter lives on `fix/convergent-fitter` in the worktree, and
the full two-pass verification has not been re-run since the eight review fixes — so `IDEMPOTENT` is
currently proven for the pre-review version only. Merging on the strength of a superseded verification
would be the same category of error as the 43 → 37 reading.

**For the next stage.** Re-run `node measure.js --verify` on the fixed version; it must print
`IDEMPOTENT` again. Then resolve `subsidy`, then re-run the missing review lens. Only then merge.

### Outcome — MERGED (tool only)

Re-verification after the eight review fixes: **`IDEMPOTENT: both passes produced identical frames`**,
exit 0, 59/59 scenes at both viewports.

The `FLAT`-at-768 cluster that made me suspect the console scenes turned out to be correct.
`conMetrics()` sets the narrow console to `CON = {x:150, y:104, w:700, h:920}`; with `PAD = 34` that
is `x = 116, w = 768`. The console chrome is a fixed-size rect that does not scale with TK, so it
bounds the extent and those scenes genuinely are TK-insensitive. It matches the committed frames
exactly (`listen:'116 35 768 1058'`). Suspicion was warranted, the finding was not.

Merged to `main` as `663f8eb` after confirming HEAD had not moved in 11.5 hours. **Diff is
`measure.js` only — 324 insertions, 43 deletions, and not one byte of the artifact.** The committed
frames are the ones the concurrent session tuned to zero collisions; the fitter's output differs from
them for some scenes and there is no audit evidence yet that its frames are better. Landing the tool
is safe; re-fitting is a separate step that has to be gated on the audit, not on the fitter's own
opinion of itself. Worktree removed, branch deleted, tree clean.

**Deliberately not fixed, to land exactly what was verified:** the process still exits 0 however many
scenes were refused or failed to converge (a reviewer's finding, correct). Changing it would have
invalidated the verification that had just passed.

**Still open.** `subsidy`, `map`, `lenses`, `quadrants` do not converge on mobile (residuals 11–24) —
for those, extent is not purely a function of TK, so the 1-D model is an approximation. `SETTLE = 1500`
may be shorter than the longest entrance animation, and an alleged un-reseeded global PRNG may make
`F` impure via visit order; both unverified, their refuters died with a session limit. One of six
review lenses never ran at all.

### Stage 5 — frames: full refit REJECTED, narrow apply KEPT

Decision rule fixed before the measurement, so the result could not be rationalised afterwards:
worse than baseline → revert; equal → revert anyway; better → keep and name the scenes.

**Baseline on `main` @ `663f8eb`, using the concurrent session's own tightened threshold:**
`59 scenes, 6 findings {tiny-text: 6}` — **zero collisions at both viewports.** Their claim verified
independently. That collapsed stage 5's remaining scope from 34 collisions to 6 sub-7px findings.

**Full refit: rejected.** 46 desktop and 56 mobile frames would move, almost all by ±1–2 units of
`GRID` snapping noise. Audit after: `6 findings {tiny-text: 6}`, identical scenes, identical per-scene
counts (2, 1, 3, 6, 2, 4). Equal, so reverted per the rule. 118 churned values on frames just tuned to
zero collisions, for no measured gain, is not an improvement.

**Narrow apply: kept.** Only two scenes disagreed by more than noise, and both wanted *tighter* frames:

| scene | before | after | Δ | sc | TK |
|---|---|---|---|---|---|
| `quadrants` mobile | 999×1376 | 854×1176 | −14.5% | 0.339 → 0.397 | **3.00 → 2.63** |
| `grants` mobile | 837×1153 | 768×1058 | −8.2% | 0.405 → 0.441 | 2.64 → 2.42 |

`quadrants` was pinned at the `TK` ceiling — the saturated state where legibility is bought with frame
size and everything else becomes a postage stamp in dead space. It is now off the ceiling. `grants`
lands on exactly 768, the console chrome's own width (`CON.w` 700 + `PAD` 34 either side), so it is
framed to the object it contains. Audit unchanged: 6 findings, zero collisions.

The gain is invisible to the audit by construction: a 7px cutoff cannot register text moving from 7.2px
to 8.5px. This is a case where "no metric moved" and "nothing improved" are not the same statement, and
saying so is more honest than either claiming a win the audit denies or discarding a real one because
the threshold is blind to it.

**Also verified in production:** the write-back merge fix works — `--only=quadrants,grants` reported
`57 committed desktop frame(s) left untouched` and the diff was exactly 4 lines. Before the fix that
same command would have deleted 57 frames.

**Caveat, kept in the commit message too:** `quadrants` did not converge (residual 18.3 after 11
evaluations). Its extent is not purely a function of `TK` — something in it is positioned from the
frame — so the 1-D model is an approximation for that scene. The written frame is the best of the
search, reproducibly so, and no hard metric regressed.

---

## Step 5 — Publish `stef-skill-max` — DONE

**Ran.** No fleet skill; this is plumbing.

**Changed.** Nothing in this repo. `~/stef-skill-max` pushed to
**https://github.com/Stef-01/stef-skill-max** (public, `main`, 5 commits).

Pre-publish scan first, because publishing is not reversible in the way a commit is: every tracked
file grepped for credentials, absolute local paths and email addresses. Clean — the only hits were the
word "token" in design-token context. No `/Users/...` paths (the scripts use `$HOME`), no addresses in
file contents.

**Verified end to end**, in a throwaway directory rather than in this repo, because this repo's suite
was mid-run:

```
./bootstrap.sh
  -> stef-skill-max: fetched Stef-01/stef-skill-max@main
preflight.sh from the fetched copy
  -> 35/35 required skills present
./bootstrap.sh   (again)
  -> using cached copy, ref main
```

So the durable-pointer mechanism works: fetch, extract, preflight, and TTL cache on the second call.

**Declined.** Switching this repo's vendored copy from `--full` to `--link`. It is a one-command
change but it rewrites `.claude/skills/stef-skill-max/` while `measure.js` is running against the
artifact, and there is no reason to do it in that window.

**Uncovered.** `/plugin marketplace add Stef-01/stef-skill-max` not exercised — it needs an
interactive session. The marketplace JSON validates and the layout matches the documented shape, but
that is not the same as having installed it.

**For the next stage.** Once the fit lands: re-vendor with the default `--link` mode and confirm
`bootstrap.sh` resolves from inside this repo. Note that `CLAUDE.md` is gitignored here, so the
trigger block stays local either way — the skill still travels because `.claude/skills/` is tracked
and the skill's own description is what fires it.

## Reduced motion after the token rewrite — verified, no change needed

Checked statically rather than assumed, since `E_EXIT` is a curve the piece never had:

- Every motion token is `REDUCE`-aware — durations collapse to 1ms, staggers to 0, curves to
  `easeLinear`.
- Zero sites still carry a redundant inline `REDUCE?1:` on a duration; the tokens now carry it
  centrally, which is strictly better than 53 local copies of the same conditional.
- One apparent gap, `.duration(dur || 900)` in the stroke draw-on helper, is not one: the function
  returns early under `REDUCE` after snapping to the final state, so that duration is unreachable.
  The static check flagged it because it read the duration argument without the guard above it.
  The literal stays — it is a default parameter rather than a call-site timing decision, and renaming
  it would change every draw-on's feel for no measured gain.

---

## Step 1 — `CON_TK` versus the legibility floor — REVERTED, and the reversal is the result

**Ran.** Code stage.

**What was tried.** Solve the floor for the console, the tightest consumer:
`PX_FLOOR = 7.0` with `TK = clamp(PX_FLOOR / (BASE_LABEL · CON_TK · sc), 1, 3)`, referencing `CON_TK`
inside `computeTK()` so the two cannot drift. Console text then lands on 7.00px and all other mobile
text on 8.33px, which is above its own floor and therefore harmless in isolation.

**Metrics.** Measured in two stages, because ~8% larger type changes every extent and judging it
before refitting would have been judging the wrong thing.

| | baseline | floor solved | and refitted |
|---|---|---|---|
| findings | 6 | 8 | **12** |
| text collisions | **0** | 6 | **11** |
| sub-7px scenes | 6 | **1** | **1** |
| frame overflow | 0 | 1 | 0 |
| scenes the fitter cannot converge | 4 | — | **20** |

It works, in the narrow sense: five of the six sub-7px scenes clear. It costs eleven text collisions
across ten scenes and takes the fitter from four non-converging scenes to twenty. Eight percent more
type is eight percent less room, and this piece does not have it.

**Reverted**, per the gate. Trading zero collisions for eleven to clear five sub-7px scenes inside a
recreated desktop console is a worse artifact, not a better one.

**Kept from the attempt**, because it is true regardless of the code: the corrected arithmetic. The
old comment above `CON_TK` was wrong three ways and that is why the conflict went unnoticed for as
long as it did — it assumed a 375px stage (the stage is **339px**; 375 was the viewport), derived
`sc = 0.499` from that (measured **0.4508**), and assumed `TK` pins at 3 on a phone (measured
**2.372**; `TK` only pins at 3 when `sc ≤ 0.3565`). Every figure in the chain was off, so its
conclusion that 0.84 clears the floor was too.

**Documented rather than hidden.** `docs/coethia-brand-palette.md` now carries the exemption with the
table above. Two things follow from that, and both are deliberate:

- **`audit.js` is unchanged and still reports all six.** Lowering the threshold for console scenes
  would have made the number go to zero without making the artifact better, and would have hidden a
  true fact. Six standing findings with a written reason is a reminder; zero findings with a tuned
  threshold is a lie.
- There is a real case that 6.47px is *correct* here rather than merely tolerated. The console is a
  recreation of a desktop product at desktop density, and the piece's own stated reason for `CON_TK`
  is that the sheet should read "as what it is: a desktop tool, seen small." A phone rendering of a
  desktop console that is fully legible at phone type sizes has stopped being a recreation of it.

**Declined.** Raising the `TK` ceiling above 3.0 for the two scenes where the clamp binds
(`decided`, `backtotheroom`). That inflates type further in exactly the scenes with the widest frames,
which is the feedback loop this repo already documents, and the measurement above shows which
direction that goes.

**Uncovered.** The one thing that would actually fix these six scenes was not attempted, because it is
not a type-scale change: a mobile-specific console layout — fewer rows, larger type, same object.
That is scene authoring and belongs to a composition pass. Recorded in the brand-palette doc as the
real fix.

**For the next stage.** The 6-finding, zero-collision state is the floor for this artifact until
someone re-authors the console for narrow. Do not attempt to close those six with a constant.

---

## Step 3 — the last three entrances — DONE

**Ran.** `motion-design` / `animation-systems` reasoning; the Remotion harness from Step 2 is what
made the layering question answerable rather than a matter of taste.

**Changed.** Three call sites. Each was decided by which layer it belongs to, not by shaving numbers
until the check passed — that distinction matters, because a budget satisfied by arbitrary trimming
would pass the same gate and feel worse.

| site | was | now | why |
|---|---|---|---|
| warning dots | 620 delay + 620 | 240 + 240 | supporting geometry; it was queueing behind the primary instead of following it |
| figure on the curve | 620 delay + 620 | 240 + 620 | a person arriving is a beat, so it keeps `T_ENTER`'s weight; only the wait goes |
| receding cards | 1245ms on `E_ENTER` | 785ms on `E_EXIT` | it is a dim, not an arrival |

**Metrics.** Entrances inside the 1200ms budget: 44/47 → **47/47**, worst 1245ms → **1180ms**. Audit
6 findings unchanged, zero collisions, 0 console errors, interact 12/12.

**A classifier bug found and bounded.** The receding-cards site had the entrance curve because the
curve-assignment pass read `bk.attr('opacity',1).transition()…attr('opacity',.45)` and took the
pre-set `1` — the *initial state* — as a target, so `max(1, .45) > 0.5` resolved to an entrance.
Checked across the whole file rather than assumed local: three sites set an opacity before
`.transition()`, and only this one was misclassified; the other two pre-set 0 and target 1, which
resolves correctly either way.

**Uncovered.** The harness was used to reason about layering, not to step every one of the 47
entrances frame by frame. Doing that properly is a `remotion studio` session with a human watching,
which is the one thing in this pipeline an agent cannot substitute for.

## Step 4 — New scenes — BLOCKED, and deliberately not attempted

The mechanical half is ready: the token scale exists, the harness renders it deterministically, and
a new scene's motion could arrive with real timings rather than placeholders.

**What is missing is editorial direction, and it is not mine to invent.** This piece is 59 scenes of
cited public-health argument, rebuilt specifically to answer eight named faults recorded in
`docs/PLAN-faster-than-the-rumour.md` — the founder's verdict on the previous version. Adding scenes
without knowing which gap they fill would be speculation dressed as work, and on this subject matter
speculation is worse than absence: every figure in the piece is real and cited except the recreated
Ads console, which says so.

**What would unblock it,** in one sentence: which argument the piece currently does not make, or
makes too thinly. Given that, the scene follows — drawn in the repo's own idiom, obeying the standing
rule that no rounded rectangle carries an idea, passing the layout and accessibility gates in its own
right.

**Skipping to Step 6** rather than sitting on this, since Steps 6 through 9 need no such input.

---

## Step 6 — Finish the fitter's review — DONE

**Ran.** Own analysis rather than a second review fleet — the earlier six-lens pass lost one lens and
eight of nine refuters to a session limit, and re-running it was not the cheapest way to resolve what
those refuters had claimed. Two of the claims were testable directly from the source.

**The un-reseeded PRNG claim: CONFIRMED, and it was the largest remaining defect.**
`_s = 20260825` is set once at load and never reset. `rnd()` is consumed inside four `draw*`
functions — smoke particles, the cliff path's jitter, the quadrant scatter, the loop nodes. So every
drawn position was a function of how many times anything had been drawn or run before it: **redrawing
a scene moved its content.**

That one cause explains three things previously recorded as three separate mysteries:

- `quadrants` never converging in the fitter — each pass redrew it and measured different geometry.
- the audit and a direct probe disagreeing about that scene's text sizes at the same viewport. The
  ledger recorded this as "scene rendering may depend on scroll history". Correct, and this is why.
- `--verify` reporting `IDEMPOTENT` while the artifact was not. Both passes consumed the stream in the
  same order, so they agreed with each other and with nothing else.

Fixed: every geometry draw reseeds on entry, so a scene is a pure function of itself. The epidemic
simulation moved to its own stream — clicking "run" is meant to be stochastic, but on a shared stream
it also silently moved the smoke, the cliff and the scatter, which are not.

Verified order-invariant: `quadrants` measures identically fitted alone or after `descent`.

**The `SETTLE` claim: already resolved**, in the commit that raised it to 4500. Re-checked against the
new token values: the longest entrance is now 1180ms and the longest sweep 2800ms, both well inside it.

**The `Math.random` half of the PRNG claim: refuted at the source.** There is no `Math.random` in the
file. The generator is a seeded LCG, exactly as the README says — the defect was that it was seeded
*once*, not that it was unseeded.

**`--strict` added**, the one refuter-confirmed finding still outstanding. Without it the process exits
0 however many scenes were refused or failed to converge, so a CI step reads a partial fit as a clean
one. Verified: unconverged scene exits 1, converged exits 0, and the flagless default stays 0.

**Uncovered.** The `render-semantics` lens still has not run as an independent review. Its subject —
whether `APPLY` truly re-establishes geometry at the new TK — was substantially answered by the
`conKey` and PRNG findings, but "substantially" is not "audited", and I am not claiming otherwise.

## Step 7 — The four scenes that would not converge — DONE, and the fault was mine

**Suspected cause was wrong.** The roadmap said to look for something positioned *from* the frame —
`drawConFrame`, `layoutDash`, a draw-time `viewBox` read. There is none: `placeStamp` is the only
frame-positioned thing and it is excluded from measurement. The 1-D model was sound.

**Found by adding a diagnostic rather than by more guessing.** `measure.js --curve=<key>` samples
`F(w)` across the bracket and prints the map. On `subsidy` at mobile:

```
     w      F(w)     g=F-w      TK
   768       816     +48.5    2.42
   951       995     +43.9    3.00
   971       994     +23.1    3.00   <- F decreased
```

`g` is **positive across the entire bracket**, so no root existed in it. `F(24000) = 971` while
`F(971) = 994`: `wTK3` was not the maximum of `F`, and the sign guarantee `g(wTK3) ≤ 0` that the
bracket depends on was simply false.

**Cause.** `W_LARGE = 24000` pinned `TK` at its ceiling — which is what it was for — and rendered the
scene at `sc ≈ 0.014`, where the composed `getScreenCTM` in `userBox()` loses precision and reports
the extent tens of units short. The probe corrupted the measurement it existed to enable.

**Fixed** by climbing 1.4× per step while `TK` is still rising and stopping at the ceiling, so the
upper probe sits at `TK = 3` *and* inside the regime where the renderer measures accurately.

| scene | residual before | after | status |
|---|---|---|---|
| `subsidy` | 24.4 | **0** | CLAMPED_HI |
| `map` | 17.8 | **0.1** | CLAMPED_HI |
| `lenses` | 17.9 | **0.5** | CLAMPED_HI |
| `quadrants` | 20.4 | **−0.6** | CLAMPED_HI |

`CLAMPED_HI` is also the honest classification: all four have a saturated type scale, so legibility
there is being bought with frame size.

**Declined.** Re-running the full review fleet to re-derive what one diagnostic answered in a single
pass.

**Uncovered.** Whether the same precision cliff affects any *other* extreme-scale path in the suite.
`audit.js` never renders at an absurd width, so it should not — but that is reasoning, not a test.

## Step 9 (continued) — Stage 12 adversarial taste QA: the F6 boxes finding — PARTIAL, backfilling a gap

**This entry is bookkeeping, not new work.** Commit `c734de9` (`Add boxes.js`) and
`docs/skill-max/12-qa.md` did real work under this step — screenshots of all 59 scenes at `29cfd78`,
a dedicated static check for standing rule 5's rounded-rectangle prohibition, and a finding — but
neither the ledger nor the roadmap's Step 9 row was updated afterward. Standing rule 6 says a step
with no ledger entry did not happen; this closes that gap on the record rather than leaving it open
going into Step 10's own gate, which depends on what Step 9 found.

**What `boxes.js` checked.** Every `roundRect` in the piece, classified as chrome — accompanied by a
path, circle, polygon, image or line, or a data mark whose siblings vary in size (a proportional bar,
a gantt span, an escalating tier) — versus a box carrying only words. Three passes, each correcting an
overcount: 37 (every text-only box, including proportional bars) → 21 (added the sibling-variance
distinction, still counted controls and a cartogram) → 7 (exempted controls and the four scenes that
recreate a real interface: `segments`, `subsidy`, `placement`, `privacy`).

**Finding.** `measure` — the "What a Coethia report leads with" dashboard — is six identically-sized
250×84 cards, each a mono eyebrow over a cited number ($41, $12, +18pt, −11pt, plus two "not
celebrated" nulls), with no drawn thing anywhere in the scene. It is independently also the emptiest
frame in the piece, 36% coverage, 786×316 content in an 854×810 frame. Two unrelated measures landing
on the same scene is the strongest signal Stage 12 has produced.

**Open question, recorded rather than resolved.** `boxes.js` exempts anything with `role="button"` as
interface chrome, which also removes `cases` — three identical 240×250 cards — because they're
clickable. But `cases` is named explicitly in the founder's F6 verdict ("three `roundRect`s with
chips"), and a clickable card is still a card. The honest count is 7 or 10 depending on whether an
interactive box earns the chrome exemption. Not resolved here either; recorded for whoever picks it up.

**Not attempted, and correctly so.** Fixing `measure` needs four new drawn things — a coin or receipt
line for cost, a before/after pair for the comprehension delta, a moved needle for belief movement —
inventing visual metaphors for cited public-health figures on a piece whose whole premise is that
every number is real except the one console that says so. That is authoring, not QA, and it is
exactly what Step 10 is gated on.

**Uncovered.** 55 of 59 screenshots still not examined for the broader adversarial-taste sweep
(composition, hierarchy, generic-pattern audit) that Step 9 also calls for — `boxes.js` only checked
the one named rule, not general taste. The `cases` / `role="button"` exemption question above.
Whether `translate`'s single box-only card (found alongside `measure`, 1 × 273×66) is worth fixing on
its own even while `measure` waits on illustration work — not evaluated either way.

## Step 10 — Stages 1–4 — BLOCKED

**Its own gate, read literally.** Step 10 runs "only if Step 9 justifies them... with its findings as
their scope, not as a general pass." Step 9 has now produced exactly one finding of that shape:
`measure`'s six box-only cards, above. The other two Step-9 findings on record — 41% mean frame
emptiness, and the `cases` exemption question — are named as the owner's call in their own writeups,
not handed over as a scope for drawing work.

**Why blocked rather than attempted.** Closing the `measure` finding means choosing four specific
visual metaphors for cited figures in a piece the founder's own verdict already condemned once for
inventing box-shaped stand-ins for content (fault F6, the fault this whole rebuild exists to remove).
Step 4 declined new-scene work on exactly this basis: "editorial direction... is not mine to invent."
Re-illustrating an existing scene's central visual device, on a public-health argument where every
other figure is real and cited, is the same category of decision — not a mechanical fix — so the same
reasoning holds for an unattended run with no owner present to approve the metaphors.

**What would unblock it.** The owner picks or approves the four illustrations for `measure`, and rules
on the `cases` / interactive-box exemption question above. After that, Step 10's scope is exactly
those choices, drawn in the repo's existing hand-illustration style (~30 precedents already in the
piece), gated by Step 1's floor, the collision check, and Stage 11's accessibility walk — same as any
other drawn content.

**Gate.** No scene code changed this step. `node audit.js` — 59 scenes, 6 findings {tiny-text: 6},
zero collisions, 0 console errors — and `node interact.js` — 12/12 — both reproduce the roadmap's
recorded baseline exactly, confirming the ledger backfill and this block decision changed nothing on
disk that the gate can see.

**Uncovered.** Everything Step 9 has not covered (see above). Step 10 stays blocked on the same input
regardless of how much of the remaining 55 screenshots get examined, unless one of them surfaces a
second finding shaped the same way `measure`'s is.

## Step 10 — Stages 1–4 — UNBLOCKED, done for the two findings `boxes.js` produced

**Overridden by direct instruction.** The previous entry blocked this step on an owner picking the
illustration concepts, on the reasoning that choosing them was an editorial call this run shouldn't
make alone. Told directly to proceed anyway. Scope stays exactly what `boxes.js` justified — the two
scenes it flagged — not a general Stage 1–4 pass.

**`measure` — six identical 250×84 cards, now six cards each with one drawn thing.** Added
`measureGlyph()`, in the same idiom as the file's existing small glyph functions (`reasonGlyph`,
`stationGlyph`: `pth`/`ln`/`circle`/`label` composed at a nominal ±16 scale, then positioned). Five
glyphs, chosen to illustrate what each card already says rather than to add anything:

- Cost per appointment booked, cost per eligibility check — a coin (circle + `$`). Same glyph for
  both deliberately: they are the same kind of measure (a cost), and the existing text already
  distinguishes which one.
- Comprehension (post-exposure) +18pt — two bars, one short and muted, one taller and accented, with
  a small arrow up. This is itself a permitted data mark by the check's own rule (dimensions vary
  across siblings), not just decoration next to one.
- False-belief movement −11pt — an arc with two needle positions: one ghosted where it was, one solid
  where it moved to.
- Impressions, Reach (the two "not celebrated" nulls) — a thin eye and a thin radiating signal, drawn
  in the same muted stroke the cards already use for de-emphasis, so the illustration doesn't
  contradict the card's own "not celebrated" framing by looking celebrated.

No cited number changed. Icon color follows the card's existing on/off state (`TEAL_D` or `#8A8474`).

**`translate` — the one box `boxes.js` still flagged after `measure` was fixed.** The "ONE EVIDENCE
BASE" hub pill got an open-book glyph (two curved covers + four short lines) to its left, inside the
existing pill, text untouched. Checked afterward that this was in fact the only remaining violation —
the four route cards below it are identically sized too, but they carry `role="button"` and are
exempt as controls, which is the same exemption `boxes.js`'s writeup already flagged as unresolved for
`cases`. Not revisited here; still open, see the previous entry.

**Verified, not asserted.** `node boxes.js` re-run after each fix: `measure` alone → CLEAN except
`translate`; both fixed → `59 scenes scanned … CLEAN — no identically sized box is carrying an idea`.
Screenshotted both scenes at desktop (1440×900) and mobile (390×844) and looked at them — glyphs sit
inside their cards/pill with no text overlap at either width.

**Gate.** `node audit.js` — 59 scenes, 6 findings {tiny-text: 6}, zero collisions, 0 console errors,
identical to the roadmap's recorded baseline. `node interact.js` — 12/12, 0 console errors. The first
`audit.js` attempt of this run crashed with `page.waitForTimeout: Target page, context or browser has
been closed` while ~50 of this session's own background shells were live and the system was hitting
`fork: Resource temporarily unavailable` on unrelated processes — a host resource issue, not a page
regression. A second clean attempt, after letting those background tasks finish, passed. Recorded so
a future run doesn't mistake that crash shape for the "second consecutive revert" the roadmap says to
stop on — it wasn't a gate failure, the gate never ran.

**Declined.** The `cases` / `role="button"` exemption question — genuinely a policy call about
whether an interactive card still needs a drawn thing, not something either fix above needed to
answer. The 41%-mean-frame-emptiness composition question. Any scene outside the two `boxes.js`
actually named.

**Uncovered.** Whether the five new glyphs read correctly to someone who has never seen this repo's
visual language — checked by eye once, by one reviewer, not user-tested. The 55/59 screenshots Stage
12's general taste sweep still hasn't examined, which could still surface a second Step-10-shaped
finding.

---

## Step 12 — The Remotion video, and the token module under it

**Asked for, and missing.** The brief included a Remotion accessory video. What existed was a token
probe and a handful of PNG stills; no video had ever been rendered. Now: `ColdOpen`, 750 frames,
1920×1080, h264, 25.045s.

**`video/src/tokens.ts` is the substance of the change.** Colours, easings and stagger steps are copied
from `faster-than-the-rumour.html` and imported everywhere, so the claim that this is an artefact OF
the piece rather than a video that shares its palette is checkable rather than asserted. The cubics are
written out as polynomials instead of mapped onto Remotion's `Easing.bezier` approximations of them:
d3's `easeCubicOut` is exactly `1-(1-t)³`, Remotion's bezier of it is close and not equal, and an
approximation is the one thing that cannot be allowed here — a curve that is nearly the page's looks
right while being wrong, and every later comparison inherits the error.

**Two content decisions, both the second answer.**

- **No person appears in the room, at any point.** The scene it is built from is titled "What Was in
  the Room After She Left It" and the obvious staging is a small figure walking out through the door.
  That is a misrepresentation: the six-year-old in Lubbock did not walk out of the room. The page uses
  the empty room to explain a property of the virus — it stays infectious in a room "a case walked
  through ninety minutes ago" — and the emptiness is not a frame around the subject, it is the subject.
- **Nothing thins out over the two hours.** Decaying the particles gives the clock something to do and
  reads as progress, and it inverts the argument: the force of the two-hour figure is that the air does
  *not* clear on any timescale a person in the room could act on. The dust holds undiminished and the
  clock is the only thing that moves, which is precisely the complaint.

**Five defects found by probing stills before rendering — which is why stills were rendered first.**

| defect | what it was |
|---|---|
| every beat drew nothing | `Sequence` wraps children in an `AbsoluteFill` — a `<div>` — unless given `layout="none"`. A `<div>` inside `<svg>` is not an error, it is simply not an SVG element. Eight probe frames came back with **two** distinct hashes: frame 40, and "every other frame", differing only in the page chrome's fade sitting at 0.9993 rather than 1 |
| the clock blinked out twice | the sweep was `(minutes/120)*720 % 360`, two revolutions of a real clock face. That expression is zero at minutes=60 **and** at minutes=120 — so the arc vanished at the end of the first hour and at the exact instant the two hours completed. The two frames the shot exists to deliver were the two frames with nothing drawn |
| a label never landed with its number | "STILL INFECTIOUS" was gated on `swept >= 1`, true only on the final frame or two, because cubicOut approaches 1 asymptotically. The counter reads 120 for about a second first. Gated on the readout instead |
| the bed floated | its legs stopped 78 units above the floor |
| strike-throughs overshot | `s.length * 20.5` — characters times a guessed average advance — overshot past the full stop on two of three lines, because an estimate cannot know that `l` is narrow and `m` is wide. Now `measureText`. Same reason the page has a fitter instead of a hand-tuned size |

**And one defect introduced while fixing another, in the same commit, by the comment that claimed to
rule it out.** The bed needed a raised head panel — without one the object is a flat slab on four legs,
which is a table. It was drawn as a `<rect>` with `rotate(-24)` about its bottom-left corner, and this
comment was written next to it: *"it cannot float, because it meets the mattress along its entire lower
edge."* Rotation does not do that. It fixes one **point**; the rest of the edge swings off the line it
started on. The near corner stayed and the far corner lifted 25 units clear, so the panel hung in the
air off the end of the bed — the same defect as the door diagonal deleted four lines earlier for
meeting the drawing at one end only. It is now a quadrilateral with two vertices on the mattress top,
where the contact is in the coordinates instead of in an argument about the transform. **Stating an
invariant is not the same as having it.**

**A figure that overstated the source.** The third statistic read "0 — of those three had been
vaccinated". The page records the two Lubbock children as unvaccinated and says only that the third
death was "an adult in New Mexico", with no status given. Zero-across-three invents the missing data
point to complete the pattern, which is the move this piece is an argument against. Replaced with the
two the page documents.

**Verified by pulling frames back OUT of the encoded mp4** rather than re-rendering them: h264,
1920×1080, 750 frames, 30fps, 25.045s, and frame 330 of the file matches frame 330 of the design.
`out/` stays gitignored; the video is reproducible from source.

---

## Step 13 — `legible.js`, and the 55 screenshots Step 9 left unexamined

The previous entry's own "Uncovered" note said the 55/59 unexamined screenshots *"could still surface a
second Step-10-shaped finding"*. They did, and the reason they did is worth more than the fixes.

**The suite measured one of two failure modes and was trusted for both.** `audit.js` has a
text-collision check and it reported **zero collisions across 59 scenes**. That check compares text
boxes against **other text boxes**. Three scenes then examined by hand had, between them: a dust-ring
dot inside the word MEASLES; another inside the numerals of "R₀ 12–18"; four annotations straddling the
edge of a dark phone body; and a red leader drawn through the "0" of "yr 4–10" so the label read as
truncated. Every one is invisible to a text-vs-text comparison, and every one is what "clunky,
overlapping and ugly" means in a screenshot. **The gap was not taste and it was not diligence in
reading screenshots. It was an instrument.**

`legible.js` measures the other mode, in four kinds — `occluded`, `speckled`, `straddled`,
`low-contrast` — reported separately because the fixes differ, and with the same self-verify pass
`boxes.js` uses.

**Building it cost four full 59-scene runs, one per wrong idea:**

| run | what was wrong |
|---|---|
| found only `trap` | shapes were admitted at `cover >= 0.55`, on the reasoning that anything sheerer cannot hide text. True, and it disqualified the pale ring dots the check was written for. "Can this hide a glyph" and "is this visible enough to break a word" are different questions; one threshold can only ask one. One floor per mode |
| missed `sequelae` entirely | strokes were excluded, **and the exclusion was documented in the file**, because a diagonal's bbox is its whole diagonal extent and a bbox test would flag every leader against every label in its quadrant. Correct about bbox tests. The next scene examined had a leader through a label. Now sampled with `getPointAtLength`, with the bbox demoted to a prefilter — which, being a superset, cannot produce a false negative. **Documenting a gap is not the same as it being reasonable to have one** |
| ~30 false low-contrast | the background of a label is the **topmost** layer under it, not the largest. Picked by intersection area, and when text sits inside two nested shapes both intersections equal the text's own area exactly — so a `>` comparison keeps the first, and first in document order is the outermost. Every white avatar initial in the console scenes was measured against the white card 792 units wide *behind* the 20-unit teal circle it was printed on, and reported at 1.00:1 |
| 25 false straddles | "does this shape cover between 10% and 90% of the label" is a proxy for "does the label span its edge", and a text box includes leading the glyphs do not use — so a label sitting comfortably inside a dark card measured as 89% covered. Test the edge. And a straddle only matters if the label survives on one side and not the other, so both contrasts are compared rather than inventing a shape-versus-paper threshold |

**Progression: 100+ findings → 14 → 2, artifact unchanged throughout.** The two survivors were both
real and both had been confirmed by eye first. The 100+ run *contained* those two; acting on it would
have meant editing forty things that were not broken. Also added: a modal is not an occlusion — content
a sheet deliberately covers is off-screen, not illegible, so full coverage skips the label.

**A debug path that is not the code path.** One finding could not be adjudicated from the report, so a
throwaway script was written to explain it. That script walked `svg.querySelectorAll('*')` where the
real check walks only the visible scene groups — so it "found" a circle from the loop diagram and a
dust dot from `r0`, neither of which the check had ever considered, and sent half an hour after a
cross-scene leak that does not exist. The remedy was to put the offending element's box into the
finding itself. **Recorded because the wrong answer was confident and cost more than the bug.**


### Step 13, continued — two more instrument errors, and the control that caught them

**The scrim the check could not see.** After the fixes above, `legible.js` reported eight findings
across `reel`, `swipe`, `anatomy`, `counterpost` and `trap`: the post caption and handle straddling the
figure's shoulder at 1.8:1. The phone already draws a black scrim at `opacity .42` across the bottom of
its screen, *precisely so* a white caption can sit over a figure. At 0.42 that scrim failed the check's
opacity floor, was discarded as "too sheer to hide anything", and the contrast was computed against the
raw purple underneath — 1.8:1 reported where the screen actually shows about 7:1. **The fix the report
invited was to add a scrim that was already there.**

A background is not one layer; it is what you get by painting all of them. The check now composites
every covering layer in paint order, and the straddle test composites both sides — so a scrim above a
shape applies to both, which is the point. Two hand-coded special cases dissolved into that: the
"nearest layer wins" rule and the "skip shapes behind the topmost opaque background" guard are both
just what alpha compositing does, because an opaque layer's alpha zeroes whatever is under it.

**Then the findings hit zero, and that was the moment to stop trusting them.** 100+ → 14 → 2 → 0 is the
progression this repo's own gate notes describe as the dangerous one: *the numbers got more plausible as
they got smaller, and no more true.* "Clean" and "blind" produce identical output.

So `LEGIBLE_URL` was added and the current instrument was pointed at the artifact **as it was before the
fixes**, extracted from `git show HEAD:`. It found 13 findings there — `sequelae`'s leader through
"yr 4–10", both `r0` ring dots, all four `trap` straddles with correct on/off contrasts, `room`'s
"BED 4" at 2.3:1 on the window against 5.3:1 on the paper, and `middle`'s glyph through "free.".
13 on the old file, 0 on the new one, same instrument, same run. That is a fixed artifact, not a broken
check — and it is the only form of evidence that distinguishes the two.

**And the positive control immediately failed for the mode added last.** `clipped-control` was written
to catch two defects found by eye: `trap`'s "Correct this" pill and the ledger slider's handle. Against
the pre-fix file it found **neither**.

- It tested for a control partly covered by a shape painted *after* it, because the commit message and
  the code comment both said the pill was "behind the phone body". **It is not.** Rendering the pre-fix
  scene and looking at it settles it: the pill is painted on top of the phone, its left arc is fully
  visible crossing the dark shell, and what looks broken is that its *interior* is dark for the first
  13% and paper for the rest. A straddle, not an occlusion. The artifact comment has been corrected.
- And it matched only `role="button"`, so the ledger slider — whose thumb is `role="slider"` — was never
  collected at all. The defect that motivated half the mode was invisible to it.

Reframed as a straddle-plus-stroke-through test over every interactive role. Both now reproduce on the
pre-fix file: `trap` "Correct this", right edge through the control, 13% on a ground 18.1:1 from the
paper; `arithmetic` "confirmed cases", a 1.3px stroke running through the control, which is the ledger
card's own border cutting the handle. **A check whose positive control has never been run is a check
that works once, on the example you wrote it from.**

**Also fixed, structurally:** `audit.js --shots` wrote desktop screenshots only. That one condition is
why the mobile view had been examined a fraction as much — there was never a mobile screenshot to look
at — and it showed up as 27 of 30 findings being mobile on an artifact whose desktop composition has
been through a dozen passes. Both widths now.

**A false alarm of my own, recorded.** From a downscaled mobile contact sheet I read the handle
`@themindfulmother_` as colliding with the Follow pill in four scenes and started looking for the cause.
Measuring it gave an 8.8px gap at mobile and 13.9px at desktop — the "collision" was thumbnail
resampling merging two adjacent runs of text. The code had measured the handle correctly with
`getComputedTextLength()` all along. **A contact sheet is for deciding what to look at, never for
deciding what is wrong.**

### Step 13, mobile — the type scale versus a fixed-width device

Once `audit.js` started writing mobile screenshots, `counterpost` at 375px turned out to be the worst
thing in the piece, and badly so: **five separate runs of text spilled off the phone onto the paper**,
where white-on-paper is invisible. The account name lost its last two letters, "TUESDAY 2:15 PM ·
SPONSORED? NO" ran most of its length onto the page, and "MEASLES VACCINATION CLINIC" overflowed the
device by about 90 units on each side.

**One cause, and it is structural.** `typed()` paints every label at `size * TK`, and TK reaches 3 on a
narrow viewport. That is correct for text on the page — it is what keeps type above the legible pixel
floor when the camera is wide — and wrong for text inside a *recreated device*, because the device is a
fixed 232 units across at mobile and does not grow with TK. So an 11-unit headline became 26 units of
type inside a 232-unit screen.

The page already has a damping constant for exactly this, `CON_TK = 0.84`, used by the console islands.
It is not enough here: 0.84 of 2.4 is still 2.0, and the string needed to come down by 1.8.

**Not fixed by tuning the strings.** Shortening five labels, or adding mobile variants of them, is the
hand-tuned-instead-of-measured habit that the camera fitter in this repo exists to replace, and it
re-breaks the moment anyone edits the copy. `clampPhoneText()` measures instead: after the scale is
applied, any label anchored inside the screen rect that is wider than the room it has gets its own
`data-tk` scaled down until it fits. One pass over the phone group, self-maintaining.

Two details that are the whole correctness of it:

- **The bound is the anchor point being inside the screen, not the text overlapping it.** `gPhone` also
  holds annotations that legitimately sit outside the device — `anatomy`'s four leader labels, `trap`'s
  meter column, the mobile reach readout under the phone — and squeezing those to the device's width
  would be a new defect. Text drawn inside the device stays inside the device; text drawn on the page is
  the page's business.
- **It runs in a wrapper, not at the end of the draw.** `drawPhoneSceneInner` returns from nine
  branches, so a post-pass appended to its end would have run for exactly one of them.

**And the fix immediately exposed a bug of the same family.** The verified badge was drawn at
`S.x + 52 + 128` — the account name's width at desktop, hard-coded. Correct until the label could be a
different width, which it now can, so the first render after the clamp put the blue tick between
"Public" and "Health". Measured and re-placed in the same post-pass. This is the third instance today of
one thing positioned from an assumed text width (the strike-throughs in the video, the Follow pill I
wrongly accused, this badge) and the remedy is the same every time.

**Three "weak glyph" findings withdrawn.** Reading the 59 desktop screenshots as a downscaled contact
sheet produced a list of illustrations that looked broken: three of the six `measure` dashboard glyphs,
two of the five `five` reason glyphs, and the `@themindfulmother_` handle apparently colliding with the
Follow pill in four phone scenes. Every one of those dissolved on inspection at full resolution — the
`measure` gauge and arrow are legible, `five`'s "Could not" reads clearly as a blocked route to a
clinic, and the handle has an 8.8px gap from the pill which `getComputedTextLength()` had been
maintaining correctly all along. Resampling had merged adjacent strokes and adjacent runs of text.

The contact sheet was still the right tool: it is how `counterpost`'s genuine mobile breakage was found
in the first place, out of 118 screenshots nobody was going to open one at a time. **It decides what to
look at. It cannot decide what is wrong.** Both defects it pointed at that survived full-resolution
inspection — `counterpost` and `desk` — were confirmed before anything was edited, and the five that
did not survive would have cost five unnecessary rewrites of working illustration.

### Step 13, round three — six more wrong ideas in one check, and what found each

The first full run of the corrected instrument reported 30 findings: 28 mobile, 2 desktop. Both desktop
findings were checked at full resolution before any edit and **both were false** — the BUDGET paper's
top corner sits below the desk title's baseline, clear of every letter, and `afterwords` prints a white
caption on a dark panel with nothing crossing it. Chasing those two produced six corrections, and the
sequence is the point: **not one of them was found by reading the code. Every one was found by the
positive control failing.**

| # | wrong idea | what exposed it |
|---|---|---|
| 1 | the glyph band is a fixed fraction of the line box | 70% reported the desk paper's corner as crossing the title. Tightening to 50% fixed that and **lost `sequelae`'s leader**, a real defect. A line box carries leading, which is a property of the leading and not of the type size, so no single fraction locates glyphs at both 6.4px and 13px. Modelling it from cap-height and descender ratios was better and still a model, and still did not restore the leader. SVG's `getBBox()` on a `<text>` simply returns where the ink is. |
| 2 | a stroke is visible if it contrasts with the PAPER | `afterwords`'s caption sits on a dark card whose own border runs behind the text. A dark stroke on a dark fill cannot break a word. Same error as picking a background by area instead of paint order: measuring against a global constant instead of the local composite. Moved to the point of use. |
| 3 | `closest('[role]')` finds a control | **The svg root carries `role="group"`.** So it is the nearest role-bearing ancestor of every text AND every stroke in the document, the equality held everywhere, and every stroke was skipped against every label. The check reported CLEAN without throwing. It survived one run because it did *not* hold in the single case involving a real control — the desk's clickable papers resolve to their own `role="button"` — so the exclusion permitted exactly the case it was written for and suppressed everything else. A textbook silent no-op, and the reason the gate notes say to hunt them. |
| 4 | samples in the band mean the stroke crosses the word | A stroke running ALONG a line of type at descender depth is an underline; one crossing it is a broken word. Both put samples in the band, so no count distinguishes them, which is why the BUDGET paper kept reporting however the band was defined. The distinguishing quantity is vertical penetration — a graze spans almost none of the band's height, a crossing spans most of it. |
| 5 | a stroke overlapping a control clips it | Paint order was never checked, so the desk surface's border reported as running through all three paper controls lying ON the desk and covering its edge. |
| 6 | compositing handles buried strokes | It handles buried FILLS — an opaque layer's alpha zeroes what is beneath it — but a stroke is tested by sampling geometry, and geometry knows nothing about what was painted over it. `afterwords`'s video card sits behind an opaque caption panel and is narrower than the caption, so its two vertical edges passed through the label's band. |

**A capability given up, on purpose.** Adding paint order to the control test means the ledger slider's
defect is no longer detected: a control straddling the boundary of a panel it does not belong to, where
both grounds are near-white so there is no contrast signal, is a COMPOSITIONAL problem and this file
cannot see it. The earlier version appeared to catch it, by way of the card's border passing invisibly
behind an opaque handle. **Better an instrument with a stated blind spot than one that seems to cover a
case through a line nobody can see** — the first kind gets checked by eye, the second does not.

Final positive control across the nine scenes verified by eye: every real defect reproduced on the
pre-fix file (`sequelae`'s leader, both `r0` dots, `room`'s "BED 4", `middle`'s glyph, all four `trap`
annotations, `trap`'s pill), and zero false positives in `desk`, `afterwords` or `cliff`.

### Step 13, round four — the reporting pipe hid the worst findings

Every sweep in this session was read through `node legible.js --all-views 2>&1 | tail -30` (later
`tail -40`), because the runs are long and backgrounded and the interesting part is at the end. It is
not at the end. The findings are printed sorted by severity, `occluded` first — so `tail` discarded
exactly the entries that matter most, along with the `findings: N {...}` header that would have shown
the total and made the loss obvious.

The counts reported from those runs — "30 findings", "41 findings" — were **floors, not totals**. The
first sweep after an unrelated fix surfaced three occlusions that had never appeared: `privacy`
"Your infrastructure strips all identifying" under a 159x131 panel at **358 sq px** of its x-height
band on DESKTOP, `subsidy` "Contextual pre-roll" under a bar at 93 sq px, and `segments` "YouTube" at
12. None were caused by that fix; they had been in every run and cut off every time.

Two things to carry:

- **A summariser that sorts by severity and a reader that takes the tail are a bad pair.** Either print
  a total the truncation cannot remove, or write the full output to a file and query it. The count line
  existed and `tail` ate it, which is the whole failure in one sentence.
- **This is the same shape as the silent no-op.** No error, no warning, a plausible number, and the
  thing it was hiding was the thing worth knowing. The gate notes say to ask what the output would look
  like if the instrument were broken; the same question has to be asked of the *reporting path*, not
  just the check.

Recorded because the instrument was right every time and the pipe was wrong every time, and the pipe is
not something a self-verify pass or a positive control can catch — both of those exercise the check.
### One defect class, five instances: positioned from an assumed text width

Found separately, in five places, over one session:

| where | the assumption |
|---|---|
| the Remotion cold open | strike-throughs at `s.length * 20.5` — characters times a guessed average advance. Overshot the full stop on two of three lines, because an estimate cannot know that `l` is narrow and `m` is wide |
| `countyPost`'s verified badge | `S.x + 52 + 128`, where 128 was the account name's width **at desktop**. Correct until the name could be a different width, which it became the moment `clampPhoneText` started shrinking over-wide phone text |
| `reelUI`'s Follow pill | placed after the handle from a measurement taken *before* the clamp shrank the handle, so the pill kept the old gap and pushed off the screen edge |
| `reach`'s verified badge | `x + 94 + p.n.length * 5.3` — character count times a guessed per-character width |
| `mandate`'s circling oval | `rx=112, ry=26` chosen by eye against a text block about 169 wide. An ellipse's ends taper, so it needs `(halfW/rx)² + (halfH/ry)² ≤ 1`, and this did not satisfy it |

**The remedy is the same every time and it is not "pick a better constant".** Measure the thing
(`getComputedTextLength`, `measureText`, `getBBox`), and if anything downstream depends on that width,
re-derive it whenever the width can change — which on this page means after `applyTypeScale` and after
any clamp, not at draw time.

Two structural helpers came out of it rather than five patches:

- **`data-pin`** — a label whose size is set by the FIXED graphic it sits inside is exempt from the type
  scale. Three instances: the console avatar's initials (spilling off a 10px circle at mobile), the
  reel's Follow pill, `gate`'s bar label. In a facsimile the graphic is the authority and the type
  answers to it; the alternative, scaling the graphic with TK, grows a fixed piece of a recreated
  interface and is the wrong direction.
- **`data-reserve`** — a label declares how much room to its right is already spoken for, so a clamp
  shrinks it enough for its neighbour too instead of shrinking only until *it* fits and pushing the
  neighbour off the edge.

Worth stating plainly: **three of these five were introduced or exposed by a fix made earlier the same
day.** A measured fix that leaves an unmeasured dependency downstream has moved the bug, not removed it.
### Step 13, round five — the check passed a blank page

The worst failure of the session, and the one every other lesson here was supposed to prevent.

An edit to `descent` moved a label so it would paint after the data points instead of before. The line it
moved was the `if` branch of an `if (nar) ... else { ... }`, so removing it left the `else` orphaned.
That is a syntax error: **the page's entire inline script stopped parsing.** `#viz` got no viewBox and
no children. Nothing was drawn at all.

`legible.js` then walked all 59 scenes — the `.step[data-key]` elements are static HTML, so the walk
succeeded — found zero painted labels, had nothing to report, and printed:

```
scenes: 59
CLEAN - every label is readable against what is behind it
```

with exit code 0. It was reported as "CLEAN across all 59 scenes at both widths, 87 findings → 0".

`audit.js` and `interact.js` crashed outright on the same page about a minute later, which is the only
reason it was caught. **The sweep that was supposed to be the verification was the one instrument that
did not notice.**

**And the positive control did not save it.** That control points at a copy of the artifact taken from
`git show HEAD:` before the fixes; it duly found its 20 findings and exited 1. The file was fine, the
instrument was fine, and the file under test was rubble. *A control that exercises the CHECK cannot tell
you the SUBJECT arrived.* Two different questions:

| question | answered by |
|---|---|
| does this check still detect defects? | positive control against a known-bad copy |
| did the thing under test actually render? | **nothing, until now** |

`legible.js` now collects page errors, counts painted labels, and refuses to grade a page that did not
render — printing `NOT MEASURED - the page did not render, so nothing here is a verdict` and exiting 2.
Verified by deliberately re-breaking a throwaway copy the same way: exit 2 on the broken page, exit 0 on
the good one. **An instrument's most dangerous output is a pass it was not entitled to give.**

Two things generalise beyond this file:

- **Every check needs a liveness assertion, not just a correctness one.** "Zero defects found" and
  "nothing was there to look at" are the same output unless the check is made to distinguish them. The
  cheapest form is a plausibility floor on what it measured — labels seen per scene, nodes walked,
  bytes read — printed on every run so a collapse is visible even when the verdict is not.
- **A syntax error in a bundled artifact is silent to anything that does not execute it.** `node --check`
  on the extracted inline script would have caught this in under a second, and nothing in the suite did
  that. It is now the first thing to run after any edit to the page, before any browser starts.

---

## Step 14 — Merging `visual-motion-pass`, and a merge that would have been a revert

One commit from 2026-08-11. Nine conflict hunks. Main 66 commits ahead of the merge base. The obvious
reading is "old branch, new main, take main" and the second-most obvious is "the user wrote it, take
theirs". Both are wrong, and which hunk proves it is the interesting part.

Both sides independently fixed the same defect — the "the belief map" chip overlapping a creator card:

```js
// branch, 2026-08-11
const bx = CLX + 100;

// main, since
sf._w14 = starRow.select('.rowlabel').node().getComputedTextLength() / (14 * TK) * 14;
const sz  = (st.active.includes(sf.id) && key!=='caseSum' ? 15.5 : 14) * TK;
const bx  = (CLX - 42) + sf._w14 * (sz / 14) + 12;
```

Main measures the label, caches the measurement at a reference size, and rescales it when the
active-row bump changes the type size — then transitions the pill and its text to the new x. The
branch moves it by a guessed constant.

**The commit immediately before this one was ten instances of that exact mistake.** Positioning
something from an assumed text width, found in ten separate places, with the conclusion written down
that *the remedy is never a better constant*. Merging this branch wholesale would have reinstated the
defect class on the same day it was removed, in a file the commit never mentions, and every gate would
have passed — `audit.js` does not look at that page.

So: resolved per hunk, and the resolution recorded next to the code rather than in a commit message
nobody re-reads. Main won all seven belief hunks. The branch won the personas file whole, because main
never touched it after the base and its fix is real: `stageFig` opacity was `step >= 1 + i`, so under
the words "Before Any of the Data, Two People" the reader's first scroll met a blank 850×900 pane.

### The half that was deliberately not landed

The branch's case-study restructure — a 940×860 `caseF` frame, a flank band, ledger rows held at .1
instead of hidden. Its observation is specific and probably still true: a 940×700 viewBox in a pane
taller than it is wide is width-bound, so it letterboxes ~130px top and bottom.

It did not land because **frame and layout are one decision.** Taking `caseF`'s extra 160 units without
the layout composed to fill them produces a worse frame than either side alone — a taller pane with the
same content and more emptiness. And the letterboxing is a *measurement*: `measure.js` is the instrument
for it and has never been pointed at that page. Landing a three-week-old note as a fact, into a layout
that has since been rebuilt, is the shape of the regression this whole session was about.

**Uncovered.** Whether the letterboxing claim is still true. `measure.js` has not been run against
`belief-based-communication.html` at all — every frame-fit number in this ledger is about
`faster-than-the-rumour.html`. The other three pages in this repo have never been measured by any
instrument here.

## The diagnosis that was wrong for two sessions

Recorded because the wrong cause was written down twice, acted on twice, and implied a remedy that
could never have worked.

**Symptom.** Chromium cannot start; then the shell cannot fork; then `echo` fails. Three sessions.

**What was written here before:** self-inflicted — dozens of background Bash tasks and Monitor loops
launched and killed, leaving ~2048 zombies. Remedy: use fewer background tasks.

**What it actually was:**

```
$ ps -u $(id -u) | wc -l                                        # 2673
$ grep -c "^Z" ps.txt                                           # 2062 zombies
$ awk '/^Z/{c[$2]++} END{for(p in c) print c[p], p}' ps.txt
  1810 2087   .../Pioneer/FwUpdateManager/.../FwUpdateManagerd
   252 2074   .../Pioneer/DDJ-FLX10/.../DDJ-FLX10 AutoLauncherd
```

Two Pioneer DJ-controller daemons, **up 41 days**, forking a device poll and never `wait()`ing on it.
A zombie holds its PID slot until its parent reaps it, so those two had taken 2062 slots out of the
table before this project started a single process. `kill 2087 2074` → `launchd` adopts and reaps the
orphans → 2673 processes became 613 and the blocked `git push` went through on the next attempt.

Two things this got wrong that are worth naming:

- **The evidence for "self-inflicted" was that it happened while I was running background tasks.** That
  is co-occurrence. The zombie count was never checked, and it was one `grep -c "^Z"` away — the same
  shape as trusting `audit.js`'s zero text-collisions because it was the check that was running.
- **The remedy followed from the cause, so a wrong cause produced a remedy that felt responsible and
  did nothing.** Two sessions of being careful with background tasks, and the table stayed 2062 short.
  It recurred each time, and each recurrence was read as confirmation rather than as refutation.

Expect it again: the leak is in those daemons, not in anything fixable from this repo. **Check the
zombie count first.**

## The two checks that had never been run against this page

`boxes.js` — CLEAN. 59 scenes, 4 exempt as recreated interfaces, and `middle 3` / `tiers 3` correctly
classified as data marks whose dimensions encode a quantity. Its last result before this was not a
failure but *nothing*: it died mid-run on a Playwright connection error, and a crash had been sitting
in the record where a verdict looked like it should be.

`motion.js` — CLEAN. 59 scenes walked under both `no-preference` and `reduce`, 0 page errors in each,
every scene reaching the same settled state. Two intended reductions are reported as such rather than
silently exempted: `air` draws 26 aerosol particles instead of 64, and `twoclocks` does not auto-play
because auto-playing it would be the defect.

**Uncovered.** `a11y.js` and `measure.js --verify --strict` at time of writing. Nothing in this entry
is a claim about the screen-reader tree, zoom, contrast under colour-vision simulation, or frame fit.

## Two confident diagnoses of the same instrument, both wrong, both caught by the control

The two surviving `legible.js` findings had been recorded as "verified false positives, diagnose the
instrument, do not bend the scene" — through two sessions and one commit. So: diagnose them. Both
diagnoses were specific, both were argued from the code, and both were wrong. The interesting part is
that they were wrong in the direction that would have felt like progress.

### `placement` — "the background filter uses the line box"

The argument, and it was a good one. `legible.js` carries a long comment establishing that a line box
carries leading the glyphs do not use, that no fraction of it locates type at both 6.4px and 13px, and
that `getBBox` should be asked instead. Three checks were built on the ink box. Then the filter that
decides **what the background is** used the line box:

```js
const covering = unders.filter(sh => inter(t.r, sh.r) / tArea >= 0.9)
```

And `placement`'s Ad badge is measured to its label and 22 units tall, shorter than the label's line
box — so coverage lands near 0.7, under the 0.9 bar, the badge drops out of the background, and dark
type on a white badge reports 1.00:1 against the player's dark body. The lesson had been applied to the
tests that ask *where the ink is* and never to the one that asks *what is behind it*. Self-consistent,
grounded in the file's own reasoning, and it names a real asymmetry.

**It did not fix the finding.** Changed to `inter(core, sh.r) / coreArea` and `placement` still reports
1.00:1. So the badge fails the coverage test for some other reason, and the line/ink asymmetry — which
is real — is not what is producing this number.

### `comments` — "5 sq px of overlap is not 'inside the word'"

`speckled` claims a mark appears BETWEEN TWO LETTERS and tests `ovCore >= 5` — five square pixels, a
2.2×2.2 patch, which a 9×9 avatar circle grazing the first glyph satisfies while sitting beside the
text. So require the mark's CENTRE to be in the band, which is what the claim actually says.

**It did not fix the finding either** — the circle reports 53 sq px inside a 10×10 bbox, so it is more
than half inside the ink box and its centre is comfortably in the band. Which also means the earlier
hand-waiver was reasoning from the wrong picture: the mark is geometrically inside the label's ink box.
The likely truth is that an ink BBOX is one rectangle spanning a whole string, so a dot in the gap
between two words is inside the box and touches no letter — and the honest test is per-glyph extents
via `getExtentOfChar`, not a tighter threshold on the same rectangle.

### What the control did, which is the whole point of having one

| instrument | control (pre-fix page) | subject (current page) |
|---|---|---|
| committed | **20 findings** | 2 findings |
| with both edits | **19 findings** | 3 findings |

The lost one:

```
[desktop] middle speckled "You need to reach the other " path 86sq px inside the word [722,674 18x10]
```

A real defect — the person glyph printing through the last line of the argument, one of the ~50 this
pass fixed. The glyph is 18×10, wide and flat, so it straddles the ink box's bottom edge and its centre
falls outside: `centreInWord` deleted a true positive. And the `core`/`coreArea` change introduced a
new `cliff` finding — the slider thumb over the tick it reports, which is the known non-defect reverted
earlier in this same pass.

So the two edits: cleared neither target, lost one true positive, added one false positive. **Reverted,
per the roadmap's rule that a regression is not argued with.** Both findings stand exactly where they
were, and the record now says the two published diagnoses are disproved rather than pending.

**Uncovered.** What actually makes `placement`'s badge fail the coverage test. It is not the line/ink
asymmetry. Next step is a probe that prints `inter(core, badge)/coreArea` for that one label rather
than another argument from the source — three sessions of reading this code have now produced three
wrong answers about it, which is itself the finding: **this file is at the point where reading it is a
worse instrument than measuring it.**

And: whether either is a defect in the PAGE at all is still open. The "verified false positive" label
rests on renders whose viewport was not recorded, and both findings are `[mobile]`. `shot.js` exists
for exactly this and takes about forty seconds.

### And then both were rendered at the width the findings are actually reported at

The waiver had been asserted twice on renders whose viewport was never written down, while both findings
are `[mobile]`. So the label "verified false positive" was not established — it was a conclusion with
its evidence missing, which is the same failure as an unmeasured constant. `shot.js`, `W=375`, 3×, forty
seconds. Both images are kept at `docs/skill-max/evidence/` rather than described, because a described
screenshot is a claim and a committed one is a check.

  `placement`  "Ad · 0:15" is dark type on a WHITE badge with clear margin on all four sides — the
               badge is visibly wider and taller than the words. Reported at 1.00:1 against the
               player's dark body, which the render shows it is nowhere near. FALSE POSITIVE, confirmed
               at the reported width.
  `comments`   "before my 12 month. i just went along with it" is clean; no mark in any word. The
               avatar circle is well LEFT of where the text starts, and the reported bbox
               [253,385 10x10] maps to image x 759–789 / y 1155–1185, which is empty sheet past the end
               of the line. FALSE POSITIVE, confirmed at the reported width.

So the artifact is clean on both and the conclusion is unchanged. What changed is that it is now
supported. Worth separating, because "I was right" and "I had shown it" were being reported as the same
thing, and only one of them was true.

**The instrument bug is therefore real and belongs to `legible.js`, not to either scene.** For
`placement` the render also rules out the remaining geometric theories: the badge covers the ink box
with margin on every side, so `inter(core, badge)/coreArea` is 1.0 and the reason it is missing from
`covering` is not coverage at all. Candidates left are collection-time — the badge never entering
`shapes`, or entering with an `idx` that puts it in `overs` — and both are one `page.evaluate` away.
Do that instead of reading the file a fourth time.

## Probing the instrument instead of reading it: one real page defect, one real check defect

Written after `probe-bg.js`, which prints the numbers `legible.js` is actually working from
for one label. It settled in one run what three readings of the source got wrong, two of
which became edits a positive control rejected. **Both surviving findings were real. The
"verified false positive" label, which sat in a commit message and in RESUME-HERE.md
telling the next session not to look, was wrong on both.**

### `placement` — a defect in the PAGE, and the same defect class as the other ten

```
idx   tag   fill      cover  box(l,t,w,h)     inkFrac  side   in?
116   rect  #ffffff   1      51,195 39x10     0.862    under  -
117   <- the label, ink y 193.28..203.28
```

The badge IS collected, opaque, in `unders`, and covers 0.862 of the ink box against a 0.9
bar. The entire shortfall is a 1.72px strip at the TOP: badge y 195..205, ink from 193.28.
So the tops of the capitals hang above the white badge onto the player's dark #202124,
`covering` resolves to #202124, and dark-on-dark reports 1.00:1.

Round two of this fix measured the badge's WIDTH and left its height at a hardcoded 22.
**A measured width beside an assumed height is still an assumed box.** Both axes now come
from `getBBox()` with padding, so the badge cannot come apart from its label at any type
scale. Verified by re-probe: box `51,195 39x10` -> `50,191 39x14`, inkFrac 0.862 -> 1.0,
`in=Y`, and the finding is gone from the sweep.

### `comments` — a defect in the CHECK, which the file already argues against

`speckled` compared a mark's fill to `PAPER`, a global constant. Twenty lines above, the
stroke collector says why that is wrong -- *"whether a stroke is visible depends on what it
is drawn ON, and the paper is only that for the scenes with nothing behind them... measuring
against a global constant instead of the local composite"* -- and the stroke test then does
it correctly. The fill test, four lines away, did not. Same shape as the ink-box/line-box
split: a lesson learned once and applied to one of the two places it belongs.

Measured for that label: `covering` composites to **#1b1512**, and the 21x21 mark is
**#241c18** -- a ratio of about 1.08, invisible. Now correctly skipped.

**It did not clear the finding, and that is the fourth wrong diagnosis of `comments`.** The
reported mark is not the dark circle; on the probe's numbers the best match is idx 1622, a
7x7 `#6e5343` avatar glyph at about **2.56:1** against the sheet -- genuinely visible, so it
passes the colour gate on merit. It sits at x 254..261 while the label's ink box runs to
270.9, i.e. inside the ink box near its right end, and the render shows the visible glyphs
stopping around x 252. So the open question is why the ink box is ~19px wider than the text
that is drawn, and the fix is not another threshold.

The `bgAll` change is kept anyway, on its own merits: it is what the file already argues
for, and the control confirms it costs nothing (20/20, identical breakdown).

### `cliff` — deterministic, expected, and the consequence of a deliberate revert

Ran `--only=cliff --all-views` twice: byte-identical, same 19 sq px, same box. Not flaky.

It is the slider thumb over the "95" tick at mobile, and it is there because earlier in this
same pass the tick labels were moved to `y+38` to clear the thumb, that move caused two real
text-collisions, and it was reverted to `y+26` as intended. The argument for leaving it
stands -- a handle covering the tick it rests on is what every real slider does, because that
tick IS the value it reports -- so the finding is expected output, not a regression.

Deliberately NOT fixed by editing the instrument. Extending the control-chrome exclusion
from `speckled` to `occluded` would waive it, and would also waive any real occlusion
inside any control, which is a worse trade than one documented expected finding. Three
instrument edits this session have been wrong; the roadmap's rule is to stop and report.

**Uncovered.** Why `comments`'s ink box exceeds its drawn text by ~19px. That is the live
thread and it is a `getBBox`/`getExtentOfChar` question about the label, not a threshold
question about the mark. And whether the probe's coordinates drift from `legible.js`'s --
they disagree on the mark's size (21x21 vs a reported 10x10) and on the overlap (30 vs 53
sq px), which means one of them is measuring a different scroll position and that has to be
resolved before either number is trusted.

### A transient console error, chased, and what it exposed

`interact.js` reported `net::ERR_NAME_NOT_RESOLVED` where every previous run reported zero
console errors. Chased rather than waved through, because "one new console error" and "one
harmless console error" are not distinguishable without looking.

It is transient DNS on the Google Fonts request. A network check on the same page
immediately afterwards: **0 failed requests, 4 responses at 200** -- the `css2` stylesheet
plus three `woff2` faces -- with Libre Franklin loaded. Corroborated by the audit's
per-scene tiny-text counts being byte-identical across the two runs; had the type fallen
back to Helvetica the metrics would have shifted and those counts with them.

**What it exposed, which is not transient.** The artifact makes four network requests on
load, for type. d3 is local, with a CDN fallback that only fires if the local copy fails,
so the library is self-contained. The fonts are not.

This does not violate standing rule 7, which is about there being no build step, and there
is none. But it means: every measured fit in this piece is computed against whatever font
actually loaded, and every number in this ledger -- tiny-text counts, legible findings --
is only comparable across runs if font loading was consistent between them. Measuring
rather than assuming is what makes the LAYOUT self-correcting; it does not make the
METRICS run-to-run stable, and I had been treating cross-run deltas as if it did.

**Uncovered.** Whether blocking `fonts.googleapis.com` changes the audit's tiny-text count.
One run with request interception settles it. If it does, every cross-run comparison here
carries a caveat and the fix is to vendor the two faces next to `d3.v7.min.js` -- which is
also the only way this piece renders identically offline, and there is a font-licensing
question attached to redistributing them that is the owner's to answer, not mine.

## `comments`, on the sixth diagnosis: it was paint order, and it was never the mark

Five wrong answers, all of them about the MARK, all of them derived by reading the source:

| # | hypothesis | how it died |
|---|---|---|
| 1 | the mark is beside the text, not in it | the probe: it overlaps the ink box by 179 sq px |
| 2 | `ovCore >= 5` is too permissive, require the centre in the band | control 20 → 19: it deleted `middle`'s person glyph, a true positive |
| 3 | `covering` filters on the line box, not the ink box | did not clear it; added a false `cliff` finding |
| 4 | the mark is invisible against the sheet (`PAPER` vs `bgAll`) | TRUE and worth fixing -- #241c18 on #1b1512 is 1.08:1 -- but did not clear it, because a second, visible mark was also in range |
| 5 | the ink box overhangs the drawn glyphs, so a gap counts as "inside" | `getExtentOfChar` on all 44 characters: the box ends **-0.0px** past the final glyph |

**Sixth, and measured rather than reasoned.** The two circles overlapping that label are at
paint indices 1621 and 1622. The sheet covering the whole label is idx **1626**. They are
behind it. Cropped at 8x at the reported coordinates, "nt along with it" is perfectly clean,
because there is nothing there to see -- `docs/skill-max/evidence/crop-comments-8x-clean.png`.

`legible.js` already computes the thing that decides this, and its own comment is where the
error lives:

```
/* The paint index of the topmost effectively-opaque layer under this label.
   Compositing handles buried FILLS on its own -- an opaque layer's alpha zeroes
   whatever is beneath it -- but a stroke is tested by sampling its geometry... */
const opaqueIdx = covering.reduce((m, sh) => sh.cover >= 0.9 ? Math.max(m, sh.idx) : m, -1);
```

"Compositing handles buried fills on its own" is true of building `bgAll` and false of the
`speckled` test, which walks `unders` directly and never consults `opaqueIdx`. One condition,
`sh.idx > opaqueIdx`, and it is gone.

### The pattern, now with two instances, which is what makes it a pattern

Both `legible.js` bugs found today are the same shape: **a rule written for STROKES and
skipped for FILLS**, with the correct reasoning documented in the stroke path both times.

  contrast against the local composite   `ratio(st.fill, bgAll)` for strokes;
                                         `ratio(sh.fill, PAPER)` for fills
  burial under an opaque layer           `opaqueIdx` consulted for strokes;
                                         ignored for fills

Strokes were added to this file second, after a documented blind spot was found to BE the
defect. So the stroke path got the careful treatment and the fill path kept the assumptions
it was written with. **A file's newest code can be its most correct code, and the danger is
then the old code that looks settled.**

### RESULT

```
control  20/20 findings, identical breakdown, middle's person glyph present
subject  1 finding  {occluded: 1}  -- cliff only, the documented expected one
         2046 painted labels across 118 scene-views
```

87 -> 1, and the one remaining is deliberate.

**Uncovered.** `cliff` stays as expected output rather than being waived, because waiving it
means extending the control-chrome exclusion to `occluded`, which would also hide any real
occlusion inside any control. And the general lesson is unpaid: the 8x crop that settled this
took forty seconds and would have killed four of the five wrong hypotheses immediately. The
cheapest instrument was the last one reached, six times running.

## SC 2.5.8: hit targets solved for CSS px, and a count turned into ten addresses

`a11y.js` had been printing `13 focusable objects render under 24x24 CSS px` and then
listing the worst four. **A count beside a truncated list is the shape that has already
cost this project twice** -- findings sorted by severity and read through `tail`, so the
number was a floor and the rest were never seen. It prints all of them now, and it prints
`f.id`, which the first version of the check already collected and never showed.

That one field is the difference between a number and an address:

```
  [mobile] k280         73x17    Now all of them
  [mobile] twoclocks    42x16    Play
  [mobile] arithmetic   23x23    confirmed cases
  [mobile] lenses       19x108   Demographic
  [mobile] lenses       19x114   Geographic          (and five more)
```

Before it was printed, locating these took a grep through twenty `padHit` call sites and
produced a wrong guess about rounding. **The identifier was already in the array.**

### The page fix: `padHit` was solving in the wrong unit

```js
.attr('x', x-pad).attr('width', w+2*pad)     /* pad is in STAGE units */
```

A 16-unit control padded by 5 is 26 units: 27 CSS px at desktop and **11.7 at mobile**,
because the padding shrinks with the stage and the finger does not. SC 2.5.8 asks for 24
*CSS* px of pointer target, and CSS px has nothing to do with the viewBox, so a hit area
authored in stage units cannot satisfy it at more than one width. All 13 were at mobile.

`renderScale()` already returns CSS px per user unit, so: `need = 24 / sc`, with the
authored `pad` kept as a floor so desktop is untouched. **13 -> 10, gated.** The slider
thumb got a separate transparent circle rather than a bigger visible one -- growing the
drawn thumb to 24px would put a 24px disc on a 5px track and make it a lollipop, so the
target grows and the drawing does not.

Fourth instance of this defect class in this artifact, after the ten label positions, the
Ad badge's height, and `mono()`'s container budget. **A fixed constant behind something
that scales.**

### And a wrong fix, made and reverted inside ten minutes

`arithmetic` reported 23x23 -- one px under on both axes -- so I attributed it to my own
arithmetic losing a fraction through the user-unit round trip and set `need = 24.5 / sc`
with a comment explaining the rounding. Re-measured: **still 23x23.** The control does not
route through `padHit` at all, so the rounding story was fiction and the epsilon was slack
with a false explanation attached to it. Reverted. A change whose comment asserts a
disproved mechanism is worse than no change, because the next reader inherits the fiction
rather than the question.

### Measured and open: the seven lens toggles

```js
const L = gRig.append('g')...attr('tabindex',-1).attr('role','button')
padHit(L, x-22, cy-128, 44, 256, 2);
```

`padHit` inserts its rect as the first child of `L`, and `L` **is** the focusable element,
so the 44x256 rect is inside the bbox `a11y.js` measures. It still reports 19 CSS px wide,
and 19 is exactly 44 user units at this scale -- i.e. the padding is not landing at all.
Two candidates, both testable and neither guessed at here:

  1. `renderScale()` returns a different value during `drawLensScene` than at measure
     time, so the rect was sized for the wrong scale and never recomputed on resize.
     `padHit` runs once at draw; nothing re-runs it.
  2. `a11y.js` measures the focusable element's bbox, and for 2.5.8 the right box is the
     POINTER target. If those ever diverge the check is measuring the wrong rectangle.

**Uncovered, and stated as a limit rather than a finding.** 2.5.8's spacing exception is
not implemented: a target under 24x24 conforms if a 24px circle centred on it does not
overlap another target's circle. Seven toggles in a row at 19px wide may already conform
entirely on their gaps. So the ten are **undetermined, not failing** -- and widening them
blindly risks making adjacent hit areas overlap, which is a worse defect than a small
target and is exactly the trade `cliff` already punished. The count went down; the
remainder is not closed, and the check saying so is it being honest.

## SC 2.5.8 to zero, and four wrong fixes for one stale input

13 -> 10 -> 1 -> **0**. Every focusable object across 59 scenes clears 24x24 CSS px at
both widths. The fix is four lines; getting to it took four wrong attempts, and each one
addressed a real cause that was not sufficient.

| # | fix | why it failed |
|---|---|---|
| 1 | solve in `padHit` at draw time | the stage scale changes afterwards |
| 2 | re-solve in `applyTypeScale` | gated on `TK !== prevTK`, so skipped for most scenes |
| 3 | pass the target frame, as `computeTK` does | right frame, but the default fallback still read the live viewBox |
| 4 | `ResizeObserver` on the svg | **watched the wrong object** -- `svgW 339 x svgH 467` never changes |

Only instrumenting `sizeHit` to log its own inputs produced the answer:

```
frameArg  null
vbNow     "77.12 -290.43 845.86 1165.06"   <- interpolated, mid-camera
settled   "18 -192 963 1327"                <- 1.139x wider
sc        0.4008  where the answer is 0.3519
```

The scene change TRANSITIONS the viewBox over `CAMERA` ms, so the live attribute during
that window belongs to no scene. `sizeAllHits` now resolves the scene's target frame
itself, so no caller can solve against an interpolation. The `ResizeObserver` was removed
rather than left as harmless: an element resize observer cannot observe an attribute
change, and its comment asserted a mechanism that does not exist.

### The last one was a second mechanism for a job that already had one

`arithmetic` held at 23x23 after the other twelve cleared. It is the slider thumb, and
earlier in this same pass I gave it a hand-rolled transparent circle:

```js
thumb.insert('circle', ':first-child')
  .attr('r', Math.max(14, 12 / (renderScale() || 1)))
```

`renderScale()` sampled once at draw time -- the exact staleness `padHit` was being fixed
for -- and, not being a `rect[data-hit]`, invisible to `sizeAllHits`, so it could never be
re-solved. It sat at 23 while the seven lens cells beside it went to 24. Now routed
through `padHit`.

**Third instance today of a rule fixed on one path and left on its sibling**, after
`legible.js`'s two (contrast-vs-composite and `opaqueIdx`, both correct for strokes and
wrong for fills). The generalisation is not "be more careful": it is that a second
implementation of one job is where the fix fails to arrive, and the tell is a hand-rolled
version of something the file already has a helper for.

### Two false rationales written and reverted, in one sitting

`need = 24.5 / sc`, with a comment explaining a rounding loss that measurement disproved.
And the `ResizeObserver`, with a comment explaining a resize that never happens. Both were
reverted. **A change whose comment asserts a disproved mechanism is worse than no change**,
because the next reader inherits the fiction instead of the question -- and this file's
comments are load-bearing, which is exactly why a wrong one is expensive.

### GATE

```
a11y      CLEAN. No SC 2.5.8 findings at all -- the whole block is absent because the
          count is zero. Reflow at 320px: 0px horizontal overflow. Tree named and roled.
audit     59 scenes, 12 findings, all tiny-text, ZERO text-collisions, per-scene counts
          byte-identical to the pre-change run
interact  12/12, 0 console errors
```

`interact` mattered more than usual: `padHit` now inserts materially larger transparent
rects at mobile, and a hit area that swallowed a neighbouring control would break
interaction while every geometric check stayed green.

**Uncovered.** The count is zero; conformance is still not asserted. 2.5.8's spacing
exception remains unimplemented, so `a11y.js` can say a target is under 24x24 and cannot
say whether it fails. Widening the lens toggles to 24 sidesteps that question rather than
answering it, and if a future control legitimately needs to be smaller, the check will
report it as a finding with no way to clear it honestly.

---

# RUN 2 — composition and taste, on a green suite

## Stage −1 — preflight

```
stef-skill-max fleet: 54/54 required skills present
optional absent: dataviz (documented fallback)
repo dep absent: avoid-overlap (stage 5, out of scope this run)
```

No stage degraded by a missing specialist. Owner scoped the run to stages **2, 3, 4, 12, 13**; the
nine already-passed stages are recorded with their metric rather than re-performed. **Stage 9 is
dropped permanently** — standing rule 7 forbids a build step and the piece must open from `file://`,
so GSAP cannot be adopted; stages 8 and 10 apply as principles only.

## Phase A — and three corrections before a single number could be trusted

The owner was offered a choice built on an inherited claim, and the claim was wrong.

**1. I offered a fix for a defect that does not exist.** "`fit()` forces stage aspect 1.054" came from
`ROADMAP.md`, not from reading `measure.js`. `fitBox` expands the short side to match the stage and its
own comment says *"margins, not letterbox"*. Fitting content of one aspect into a viewport of another
necessarily leaves margin; the alternatives are distorting and cropping. `12-qa.md` had already
concluded exactly this — *"So this is a composition decision, not a fitter defect"* — and had already
named the two honest answers. The option I put in front of the owner was not one of them.

**2. Two hand-rolled probes, both returning impossible numbers.** First: mean emptiness **−69.5%**,
i.e. content larger than its frame in all 59 scenes. Cause — scenes here are hidden by `opacity` on
their GROUP, and `getComputedStyle` on a child does not inherit that, so every hidden scene counted.
Second, after walking the opacity chain: still **14 scenes with negative emptiness**, because the probe
measured all descendants where `measure.js` filters top-level scene groups and excludes the provenance
stamp.

**3. The repo had already written down the rule I was breaking.** `12-qa.md`'s method note:

> The first coverage measurement reported 80% mean and **145% for three scenes** — impossible... The
> fix was to copy `measure.js`'s `MEASURE` **verbatim. Reuse the instrument; do not re-derive it.**
> This was the fifth time in this pass that a finding turned out to be my own measurement.

I read past that note and then made its exact mistake twice. **The failure was not the probe. It was
not searching the repo before measuring.** An impossible number is the instrument confessing, and both
probes confessed immediately; what cost the time was writing the second one instead of reading the doc.

### The measurement that held

`MEASURE` copied verbatim, with a coverage-over-100% assertion the earlier attempts would have failed:

```
59 scenes | sanity check passes (0 scenes over 100%)
stage aspect 1.054 | mean coverage 71.9%
content aspect: min 0.56 (cliff) | median 1.49 | max 2.58 (tiers)
46 of 59 wider than the stage, 13 taller
```

**71.9% is not comparable to `12-qa.md`'s 59%** — this omits `PAD`, that included it. No improvement is
claimed. Different measurement, not a better number.

Coverage reduces exactly to `min(c,A)/max(c,A)`, so the optimal stage aspect is computable rather than
a matter of taste: **1.520, giving 79.9%.** Rejected, and rejected with the numbers rather than on
instinct — it buys 7.9 mean points by making 20 scenes worse: `laws` 90→62, `notone` 81→56, `k280`
78→54, `loop`/`coethia`/`stations`/`close` 73→51, `cliff` 53→37. The losers are phone and console
facsimiles, tall because a phone is tall. **A mean that improves while its worst cases collapse is the
wrong objective.** The owner chose per-scene recomposition instead.

## Stage 2 — Aesthetic direction

**Deliverable:** `docs/skill-max/02-direction.md`, 269 lines. Direction carried by `impeccable`;
`ui-ux-pro-max`, `design-system` and `high-end-visual-design` held as reference only, per `stages.md`'s
requirement that exactly one skill carry the direction.

**Gate: PASSED, and asserted rather than assumed.** `git diff --quiet HEAD --
faster-than-the-rumour.html` returns clean — the artifact is byte-identical, so contrast ratios and the
tiny-text count cannot have moved. `package.json` untouched (`npm install --no-save`). `syntax.js` OK.

### The finding: the palette doc is not the authority it looks like

| | count |
|---|---|
| hexes declared in `docs/coethia-brand-palette.md` | 37 |
| distinct hexes in the code | **120** |
| declared but unused | 16 |
| used but **undeclared** | **99** (501 occurrences) |
| undeclared and used **exactly once** | **52** |

All 16 declared-but-unused values are the **espresso-era dark edition** — the doc still documents a
theme the piece no longer has.

Three specifics worth more than the totals:

- **`#8A8474` is used 92 times and is in no document.** It is `DIM`, the structural line weight inside
  every illustration. The most load-bearing colour in the piece is undocumented.
- **`#B8492E` appears 12× as a raw literal** while `ALARM` exists as a named constant; `#3A5D74` 26×
  and `#DCD5C6` 16× likewise. **Token bypass** — which is also why freezing `ALARM` is the cheaper
  call: a one-hex palette change is not a one-hex edit.
- **`#2E6B2B`, 41 uses, undeclared and unnamed.** A green with no role in any document.

**52 values used exactly once is the real finding.** That is not a palette, it is ad-hoc picking, and
it is the argument for forbidding new colours before Stage 3 starts adding geometry.

### And a 360-line surface no instrument has ever measured

All eight verification scripts measure `#viz`. The page-chrome CSS — masthead, `.kicker`, `h1`,
`.deck`, `.step p`, `.btn`, `.methods`, `.outro`, `.cta`, and 60 lines of `@media print` — is measured
by none of them. `a11y.js` covers reflow and the tree, not the chrome's contrast or typography.

Found only because `impeccable`'s detector was pointed at the file. It returned three findings and
**all three are false positives**, each verified individually:

- `low-contrast :hover 1.5:1, #000000 on #212e36` — composes a `@media print` `color:#000` with a
  screen `.btn:hover{background:var(--ink)}`. On screen the colour is `#FFFFFF` (≈13:1); in print the
  background is `none`. The combination cannot occur.
- `all-caps-body on 57 chars` — `.kicker`, 13px mono at `.12em`. The detector's own description
  permits uppercase for short labels.
- `tight-leading 1.16x` — `.deck` at `clamp(20px,2.4vw,30px)`, display type. Real body is `.step p`
  at **1.76** and `body` at **1.85**.

The detector had to be un-degraded first: it ran with `htmlparser2`, `css-select`, `css-tree` and
`domutils` absent, printed `[]`, and **said so** — *"findings are an undercount, not a clean bill of
health."* Installed into the skill's own `node_modules`, since Node resolves from the script's
directory rather than `cwd`. `[]` became three real evaluations. **An empty result from a degraded
instrument is not a pass, and this one was honest enough to announce it** — which is more than the
blank-page `legible.js` run managed earlier in this project.

**Uncovered.** The 52 single-use hexes were counted as a class, not traced to a scene each. `#2E6B2B`
(41 uses) and `#E74D4E` (18 uses) have no role assigned in the direction because I could not determine
one without reading every call site — they are real tokens with no name. Per-scene typographic
conformance is Stage 12's, not asserted here. The three sibling explainers share this design system and
have never been measured by any instrument in this repo. The 60-line print stylesheet has never been
rendered.

## Stage 3 — Per-scene composition. 6 queued, 3 fixed, 2 declined, 1 clean.

Philosophy first (`03-philosophy.md`, **Stacked Register** — evidence accumulates upward in bands, not
outward in containers). `canvas-design`'s discipline, not its output contract: that skill produces a
standalone `.pdf`/`.png` art object and the thing needing composition was six scenes inside a 400KB
explainer, so the philosophy pass was kept and the canvas was not. Recorded rather than quietly
substituted.

### `tiers` — the banned pattern in its purest form, and boxes.js excused it

Three `rx=16` rects at `x=200/500/800`, heights hardcoded `h:150/212/274`, each holding only a title
and three centred lines. *"No rounded rectangle may be the primary carrier of an idea"* — three of
them carried the whole scene. **The heights are an arithmetic sequence (+62) with no quantity behind
them, no axis and no source.**

`boxes.js` reported CLEAN because its rule requires the boxes be *identically sized*, so it filed
these under *"data marks (dimensions encode a quantity — the rule permits these)"* purely because they
differ. **Differing size is not evidence of encoding.** The instrument written to catch this pattern
was defeated by the pattern being drawn slightly better than its worst case. Confirmed by the gate:
`data marks` went from `middle 3, tiers 3` to `middle 3` — the excuse disappeared with the rects.

Now three registers down a common left axis, separated by `LINE` rules rather than enclosed, with a
graduated strata gauge (`dep` of 3 cells, `TEAL_D` filled / `LINE` outlined, `n/3` mono readout). The
filled count IS the quantity the heights pretended to be. Ascent path deleted, and its animation line
with it rather than left selecting nothing.

**Three of my own constants had to be measured out of it, each caught by the render and not the code:**

| pass | constant | what it did |
|---|---|---|
| 1 | `GLASS`/`DIM` | `Cannot access 'GLASS' before initialization` — declared ~3444, scene builds in a load-time IIFE ~2555. `const` hoists into a temporal dead zone. Found because `shot.js` prints its page-error count even when zero. |
| 2 | `BW = 600` | text stopped ~40% short of the band edge — **moved the emptiness from the frame INTO the object**, which Stage 2's own governing sentence forbids |
| 3 | `RH = 155` | Tiers 1 and 3 have two body lines, Tier 2 three — two bands carried ~60 units of dead bottom |

Sixteenth and seventeenth instances of the assumed-dimension bug in this file.

### `measure` — the composition was never wrong, the aspect was

Six instrument tiles each with a drawn glyph: legitimate chrome, correctly exempted by `boxes.js`.
But 3 columns × 2 rows at 250 wide is `786×316` into a 1.054 stage — 58% of the frame was margin the
composition never asked for. Reflowed to `COLS=2`, centred under the heading. **The fitter confirms
it: `w* 786 → 586`.** No tile changed; self-contained tiles are what made the reflow free. The
footer's hardcoded `y=470` was correct for two rows and inside the third once reflowed — now derived
from the row count.

### `translate` — the fix that arrived on one path and not its sibling

Four route cards were `rx=14` rects holding four centred labels and nothing else. **Step 10 fixed the
hub** (a text-only pill became a drawn book, fault F6) **and left the four cards.** Third instance in
this pass of a rule fixed on one path and left on its sibling, after `legible.js`'s
contrast-vs-composite and `opaqueIdx`.

Each route now gets the mechanism it is: a fork with **both** branches drawn and neither marked (an
arrow choosing one would contradict "choice kept"); a stethoscope (the messenger is the variable, not
the message); four contradictory claims crossing in `MUTE` 1.1 with one adjudicating line through them
in `INK` 1.8 (the label says this audience needs adjudication, not another claim); a route with stops
ending at a clinic cross (the barrier is logistics, so the drawing is the journey). Card text moved off
centre onto a left axis — four centred blocks give ragged left *and* right.

### Declined, with the reason

`weeks` (aspect 2.15) is a twelve-week Gantt and `sequelae` (2.22) is a time-to-death axis. **The
horizontal is elapsed time.** Verticalising either to serve a coverage metric would break the thing
the scene exists to show — the mandate's "may not weaken a metric to make the deliverable look better",
pointed the other way. `gate` (1.97) assessed and left: its bar is already measured to its own banner
and `data-pin`ned, and its width is the five lanes it crosses.

### The correction this stage owes, and the regression that proved it

**My option preview told the owner "No `measure.js` re-run needed." That was wrong.** `stages.md`:
*"New geometry means stale camera frames and new collision risk. Stage 5 must re-fit."* The gate then
produced exactly that: **`frame-overflow: 0 → 1`**, `tiers`' registers stacking past a frame fitted to
the old 850×329 row. Predicted, measured, and the re-fit is the remedy rather than a revert.

Everything else held across the change: `legible` 1 finding / 2047 painted labels, `a11y` CLEAN with
SC 2.5.8 at zero, `interact` 12/12 with 0 console errors, `tiny-text` 12 with byte-identical per-scene
counts.

### A static sweep, because boxes.js's CLEAN is not evidence here

`boxes.js` missed `tiers` (differing sizes read as quantitative encoding) and missed `translate` for a
reason still unexplained — it is *not* `padHit`'s transparent rect, since `boxes.js` exempts on
"path, circle, polygon, image or line" and a `rect` is not on that list. So the pattern was swept
statically across all 59 scenes: 30 candidate sites, all legitimate on inspection — the recreated Ads
console (`GBLUE`/`GBORD`/`GSURF`), data bars whose dimension encodes a quantity, facsimile chrome —
except `translate`, already fixed.

**Uncovered.** Why `boxes.js` passed `translate`. My static sweep's own limitation: it only sees
drawing calls into the *same* target, so `fit` and `cases` came up as candidates because their glyphs
are drawn into sub-groups — two false positives out of thirty, and the same class of bug as everything
else this session. Mobile renders of the three changed scenes were gated but not inspected by eye. The
53 scenes outside the aspect queue were not re-examined for composition; `translate` at 1.96 held the
second-worst instance of the banned pattern, so **an aspect sweep is a good filter for the frame and a
poor one for the pattern**, and only the aspect sweep was run.
