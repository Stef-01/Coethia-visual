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
