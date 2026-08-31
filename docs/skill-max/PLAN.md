# Skill Max plan — faster-than-the-rumour.html

**Target.** `faster-than-the-rumour.html` · single-file HTML/CSS/JS, D3 v7 vendored, inline SVG,
no build step · 59 scenes · transitions driven by two `IntersectionObserver`s
**Verification.** own Playwright suite: `measure.js` → `audit.js` → `interact.js` · runs today:
**yes, as of this run** — it required a Windows absolute path and had been dead since the repo left
that machine
**Standing rules this target already has** — these outrank every stage below:
- *"No rounded rectangle may be the primary carrier of an idea."* Every unit of meaning gets a drawn
  thing. A box is allowed only as the chrome of an interface being recreated.
- One shared light design system across all three explainers and the index. The dark skin was tried
  and reverted; two islands stay exempt (the recreated Google Ads console, and the phone/bedroom
  scenes) because you draw the object, not a diagram of it.
- Epidemiology, coverage, cost and workforce figures are real and cited beneath the scenes that use
  them. Only the recreated Ads console carries synthetic numbers, and it says so.
- Accessibility is load-bearing: `role="group"` not `role="img"`, focusable persona columns, a real
  data table, `prefers-reduced-motion` honoured including the largest camera moves, marks encoding a
  quantity animate without overshoot, five persona colours checked for deuteranopia and protanopia.

## Baseline fingerprint

| Metric | Value |
|---|---|
| Scenes | 59 |
| Animation call sites | 32 |
| Distinct durations | 12 |
| Distinct easing curves | 3 (`easeCubicOut` ×12 of 16) |
| Text collisions (desktop / mobile) | **2 / 32** |
| Text under 7px | 0 desktop / **9 scenes** mobile |
| Frame overflow | 0 |
| Console errors, NaN geometry, empty stages, page overflow | 0 |
| Dependencies | d3 vendored + CDN fallback, Google Fonts ×2 |

Full analysis and the two root causes: `BASELINE.md`.

## Decisions needed before Phase B

| Decision | Recommendation | Consequence |
|---|---|---|
| Adopt GSAP? | **No.** The repo is deliberately no-build, no-dependency, vendored-D3. ScrollTrigger is better than a hand-rolled stepper, but adopting it means a new dependency and rewriting the scene stepper — a large change the baseline does not justify | Stage 9 dropped; stages 8 and 10 run as principles against the existing D3 transition layer |
| Palette and type system | **Fixed.** `docs/coethia-brand-palette.md` is a considered document and the dark experiment was already tried and reverted | Stage 2 becomes reconciliation, not redesign: find where code and that doc already disagree |
| Depth | **Stop-the-bleeding first: stages 5, 6, 13.** 41 of 43 findings are one mobile mechanism. Run those, re-measure, then decide whether the aesthetic stages are worth it | Stages 1–4 deferred, not cancelled |

The third row is the one that matters, and it is a change from the default. The audit says this
artifact does not have the general ugliness problem the brief assumed — desktop is 2 findings in 59
scenes. Running a full 14-stage aesthetic pass would be working on the wrong thing.

## Stages

### Stage −1 — Preflight and house rules — DONE
- 21/29 fleet skills present at time of run; 8 missing (MengTo reveals, AccessLint set,
  `color-accessibility-audit`, `frontend-design-review`). Recorded, not blocking.
- Standing rules copied above, verbatim.

### Stage 0 — Ground truth and baseline — DONE
- **Deliverable.** `docs/skill-max/BASELINE.md`; suite restored; `playwright` added as a dev dep
- **Gate.** Suite runs to completion — PASS

### Stage 5 — Layout resolution and collisions — NEXT
- **Skill.** `gsap-utils` for the clamp/mapRange math; otherwise a code stage
- **Scope.** The ~8 authoring sites behind the 32 mobile collisions, and the Class B sub-7px
  contradiction. In order: (1) resolve whether island text reaches `ctk()` at all — the comment at
  line 955 predicts 10.8·CON_TK px and the audit measures under 7, so one of them is wrong;
  (2) derive stacked-label gaps from `size · ctk()` instead of literals, starting with the wheel at
  line 1789 which alone accounts for five findings; (3) wrap long centred captions rather than
  shortening the copy — shortening does not break the feedback loop, the next long caption
  reintroduces it; (4) only then re-run `measure.js`, then re-audit.
- **Not in scope.** Any change to copy, colour, illustration content, or motion.
- **Deliverable.** `docs/skill-max/05-layout.md` — the per-site fix, before/after counts, and any
  collision left unresolved with the reason
- **Gate.** Mobile collisions at or near zero and strictly better than 32. Sub-7px zero. Desktop not
  worse than 2. Frame overflow stays 0.
- **Expected cost.** The largest stage on this target, and the one that buys the most.

### Stage 6 — Motion system
- **Skill.** `motion-design`, corroborated by `animation-systems`
- **Scope.** Replace 12 unrelated durations and one curve-doing-every-job with a scale of 4–5 steps
  and an easing set with a stated purpose each, including one for marks that encode a quantity, which
  must not overshoot — the repo already commits to that in its README and should be able to point at
  the token that enforces it. Also decide what must *not* animate: 32 transitions across 59 scenes
  means most scenes are hard repaints, and the fix is not motion everywhere.
- **Not in scope.** Adding new animations. That is stage 7, and it is deferred.
- **Deliverable.** `docs/skill-max/06-motion-system.md` — token table, layering rule, do-not-animate list
- **Gate.** Distinct durations and curves both decrease. Every token has a named purpose.

### Stage 13 — Final verification and close-out
- **Skill.** `webapp-testing`
- **Scope.** Full suite cold at both widths, `interact.js` included — its 12 assertions have not run
  in months either. Diff every metric against `BASELINE.md`.
- **Deliverable.** `docs/skill-max/RESULT.md`
- **Gate.** Every hard metric at or better than baseline, exceptions stated not omitted.

### Stages 1, 2, 3, 4, 7, 8, 10, 11, 12 — DEFERRED
- **Why.** The baseline does not support them yet. Desktop is 2 findings in 59 scenes; there is no
  frame overflow, no empty stage, no NaN geometry, no console error. Stage 1's structural
  contribution (direct labelling deletes a colliding caption rather than moving it) is real and
  should be reconsidered *after* stage 5, when it will be clear which collisions were authoring
  errors and which are genuinely too many labels for the space. Running the aesthetic stages now
  would be motion and composition work on an artifact whose measured defect is one type-scale bug.

### Stage 9 — Scroll binding — SKIPPED
- **Why.** Recommending against GSAP adoption on this target. Revisit only if that decision changes.

---

# Plan revision — 2026-08-29

## What changed since the plan above was written

The baseline in the original plan (43 findings, 34 text collisions) was invalid — measured while
another session was editing the repo, against frames from a fitter that mis-measured clipped and
transformed geometry. **The collision problem is now solved and independently verified.** Audit on
`main` at `663f8eb`, using that session's own tightened threshold:

```
scenes: 59
findings: 6  {"tiny-text":6}     <- zero collisions, both viewports
```

Their six commits between 02:19 and 04:25 did that work. Stage 5's remaining scope collapsed
accordingly — from 34 collisions to 6 sub-7px findings.

Stage 5 also produced a tool rather than an artifact change: `measure.js` is now a fixed-point solver
whose output is a property of the source rather than of how many times it has been run, with
`node measure.js --verify` asserting idempotence. Merged as `663f8eb`, `measure.js` only, not one byte
of the artifact.

## Revised stage list

### Stage 5 — Layout resolution — TOOL LANDED, ARTIFACT UNTOUCHED
The `CON_TK`-versus-floor arithmetic is the whole of what remains, and it is unchanged: `TK` is solved
so base-7.2 text lands exactly on the floor (measured 7.70px), then `CON_TK = 0.84` multiplies after
it, giving 6.47px. **The floor and `CON_TK` are mutually exclusive by construction.** Six scenes sit
there. The fix is a decision between raising `PX_FLOOR` to `7.0/CON_TK` (all mobile type ~8% larger)
and exempting the console islands explicitly and documenting it. Owner's call; it is visible either way.

### Stage 6 — Motion system — NOT STARTED
Unchanged and still justified: 32 `.transition()` call sites across 59 scenes, 12 unrelated durations,
`easeCubicOut` doing 12 of 16 jobs.

### Stage 13 — Final verification — PARTIAL
`audit.js` run. `interact.js`'s 12 assertions still have not been run.

### Stage 14 — New scenes and motion refinement via Remotion — ADDED, NOT STARTED
**Skills:** `remotion-best-practices` (load first, it routes), `remotion-markup`, `remotion-create`,
`remotion-studio`, `remotion-render`, `remotion-docs`. All installed.

**The constraint, stated before the plan.** Remotion is React compiled to video frames through
headless Chromium. This repo's defining property, claimed in its own README, is *"Open any file in a
browser — no build step, no server required"* and vendored D3 so it runs with no network. Remotion
cannot add a scroll-driven interactive scene to that, and adding React and a bundler to the artifact
would destroy the property the piece is built around.

**So: the Remotion project lives in a sibling `video/` directory with its own `package.json`, and is
never added to the explainer's dependency graph.** With that boundary, three uses, best first:

1. **A motion prototyping harness — the reason to run this stage.** `remotion-studio` gives
   frame-accurate scrubbing: step one frame at a time over a timeline you control. A scroll-driven page
   cannot do that, which is why motion in this repo was authored by guesswork — 12 durations with no
   scale behind them is the visible result. Compose a scene's entrance in Remotion, tune it where each
   frame is actually visible, read off the frame numbers and curves, port those numbers to the D3
   transitions. This is the honest version of "refine the animations", and it feeds stage 6 directly.
2. **Video deliverables.** Title sequence, social cut-downs, a linear explainer-video edition. New
   artifacts standing beside the piece, carrying none of its risk.
3. **Embedded video for genuinely linear scenes.** Usually a bad trade here. This repo deliberately has
   `role="group"` not `role="img"`, five focusable persona columns, a real data table, and
   `prefers-reduced-motion` honoured including the largest camera moves. A scene rendered to video
   loses all of it. Not for any scene with controls; defensible only for pure cinema, and then the loss
   gets written down.

**New scenes** are still authored in the repo's own idiom and still obey its standing rule — no rounded
rectangle as the primary carrier of an idea. Stage 14's contribution is that a new scene's motion
arrives with real timings instead of placeholders. A new scene still passes the stage 5 and stage 11
gates; being new does not exempt it.

**Gate.** The artifact's suite unchanged from stage 13 — stage 14 must not move a single hard metric,
because moving one would mean it changed the artifact. Dependency graph verified unchanged. Ported
timings match their composition by arithmetic (frames ÷ fps = duration). **Renders deterministic:**
render twice, compare hashes — a render that differs run to run makes every claim about it
unattributable, which is the fitter's failure in another medium.

---

# RUN 2 — 2026-08-31. Composition and taste, on a green suite.

Prior runs closed stages 0, 1, 5, 6, 7, 8, 10, 11, 13. This run is scoped by the owner to
**stages 2, 3, 4, 12, 13**; the nine already-passed stages are recorded with their current
metric rather than re-performed. Stage 9 is dropped permanently: standing rule 7 forbids a
build step and the piece must open from `file://`, so GSAP cannot be adopted, and stages 8
and 10 therefore apply as principles only.

## Stage −1 — preflight

```
stef-skill-max fleet: 54/54 required skills present
optional absent: dataviz (fallback: frontend-design + visual-storytelling-design)
repo dep absent: avoid-overlap (stage 5 — out of scope this run)
```

No stage is degraded by a missing specialist.

## House rules carried in verbatim — these outrank every stage

From `CLAUDE.md` and `ROADMAP.md`:

1. Exclusive ownership: check `git log -1` and `git status` before touching the repo.
2. Never two Playwright runs at once.
3. `SETTLE` stays at 4500 in `audit.js` and `measure.js`.
4. Gate every step; any regression on a hard count reverts the stage.
5. No rounded rectangle as the primary carrier of an idea. One shared light design system.
   Real cited figures except the recreated Ads console, which says so. The accessible
   surface is not negotiable.
6. Append to `LEDGER.md` after every stage, including the *Uncovered* field.
7. **Remotion never enters the explainer's dependency graph.** No build step; `file://`.

## Owner decisions taken at the end of Phase A

| decision | answer |
|---|---|
| Palette / type tokens | **FIXED.** Stage 2 writes direction only, no token edits. `ALARM #B8492E` stays at 4.23:1 deuteranopia, recorded as an accepted exception. Type scale not reopened, so the 12 mobile tiny-text findings stay documented, not fixed. |
| Frame emptiness | **Recompose the wide scenes.** Stage aspect and `fitBox` untouched. |
| Depth | Stages 2, 3, 4, 12, 13. |

### The emptiness measurement, corrected twice before it was trusted

`12-qa.md` recorded 41% mean emptiness and I initially described the cause as a `fit()`
defect. **It is not.** `fitBox` expands the short side to match the stage aspect and its own
comment says *"margins, not letterbox"* — fitting content of one aspect into a viewport of
another necessarily leaves margin. `12-qa.md` already said so, and already named the two
honest answers. I offered the owner a fix for a defect that does not exist.

Two hand-rolled probes were then written to re-derive the number and both returned
**impossible results** — mean emptiness of −69.5%, then 14 scenes with negative emptiness.
`12-qa.md`'s own method note prescribes the remedy and I had read past it:

> The fix was to copy `measure.js`'s `MEASURE` **verbatim. Reuse the instrument; do not
> re-derive it.** This was the fifth time in this pass that a finding turned out to be my
> own measurement.

Third measurement, with `MEASURE` copied verbatim and a coverage-over-100% assertion that
the earlier attempts would have failed:

```
59 scenes, sanity check passes (0 scenes over 100% coverage)
stage aspect 1.054 | mean coverage 71.9% | content aspect: min 0.56, median 1.49, max 2.58
```

**71.9% is NOT comparable to 12-qa.md's 59%** — this omits `PAD` and that included it. No
improvement is claimed; it is a different measurement.

Coverage reduces exactly to `min(c,A)/max(c,A)`, so the optimal stage aspect is computable:
**1.520, giving 79.9% mean.** Rejected, with numbers: it buys 7.9 mean points by making 20
scenes worse — `laws` 90%→62%, `notone` 81%→56%, `k280` 78%→54%, `loop` 73%→51%,
`cliff` 53%→37%. The losers are phone and console facsimiles that are tall because a phone
is tall. A mean that improves while its worst cases collapse is the wrong objective.

## Stage 2 — Aesthetic direction

**Skill:** `impeccable` carries the direction. `ui-ux-pro-max`, `design-system` and
`high-end-visual-design` are reference only, per `stages.md`: exactly one skill carries the
direction or the stage reproduces the fleet thrash the pipeline exists to prevent.

**Scope.** One written direction for the whole artifact. **Decisions, not edits — and this
run, not even token edits.** Reconcile with `docs/coethia-brand-palette.md` and flag every
place the code and the doc already disagree.

**Not in scope.** Any change to a colour, a type size, `TK`, `MIN_LABEL_PX`, `BASE_LABEL`
or `CON_TK`. Any per-scene work.

**Deliverable.** `docs/skill-max/02-direction.md` — direction, token table with real
values, explicit forbidden list, and the code-vs-doc disagreements.

**Gate.** No file other than the deliverable changes. Contrast ratios and tiny-text count
therefore cannot move; assert that rather than assume it.

## Stage 3 — Per-scene composition

**Skill:** `canvas-design`.

**Queue — measured, content aspect ≥ 1.80 against a 1.054 stage:**

| scene | aspect | content | coverage |
|---|---|---|---|
| `tiers` | 2.58 | 850×329 | 41% |
| `measure` | 2.49 | 786×316 | 42% |
| `sequelae` | 2.22 | 753×340 | 48% |
| `weeks` | 2.15 | 863×402 | 49% |
| `room` | 2.12 | 780×368 | 50% |
| `gate` | 1.97 | 818×415 | 53% |
| `translate` | 1.96 | 840×428 | 54% |

Mean coverage in the queue: **48%**, against 71.9% for the piece.

**`room` is EXEMPT, on a standing prior decision.** The ledger's Stage 14 entry argues it
directly: the scene is built from "What Was in the Room After She Left It", the page uses the
empty room to explain that the virus persists in a room "a case walked through ninety minutes
ago", and *"the emptiness is not a frame around the subject, it is the subject."* Filling that
frame would contradict the scene's argument. Six scenes to work.

**Not in scope.** The stage aspect. `fitBox`. Any scene outside the queue. Any colour.

**Deliverable.** `docs/skill-max/03-composition.md` — per scene: fault, fix, coordinates.

**Gate.** frame-overflow 0→0; text-collision 0→0; `legible.js` 1→1; `interact.js` 12/12;
`a11y.js` CLEAN with SC 2.5.8 at zero. Re-shoot both widths and attribute every diff to a
listed fix.

## Stage 4 — Drawn things instead of boxes

**Skill:** `algorithmic-art`. Input is stage 3's weak-scene queue, not a fresh survey.
`boxes.js` currently reports CLEAN, so this stage starts from "no box is carrying an idea"
and only acts on what stage 3 hands it.

**Gate.** Determinism — two consecutive suite runs produce identical geometry. Node count
per scene within budget. No new console errors.

## Stage 12 — Adversarial taste QA

**Skills:** `design-review`, `audit-ai-design-slop`, `frontend-design-review`.

Fresh screenshots at both widths via `audit.js --shots`. Output is a **ranked queue, not a
set of edits**. The 28.1% emptiness question goes to this stage as a subject: does it read
as a fault to a reviewer who has not been told about it?

## Stage 13 — Close-out

Full suite, then `RESULT.md`: before/after table, what each stage bought, what was
deliberately not done, and the honest verdict including anything that got worse.
