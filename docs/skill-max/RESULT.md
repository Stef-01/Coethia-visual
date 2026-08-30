# Skill Max — result

State of `faster-than-the-rumour.html` at close, verified by three suites run cold:

```
audit.js     59 scenes, 6 findings {tiny-text: 6}, ZERO text collisions, 0 console errors,
             0 NaN geometry, 0 empty stages, 0 frame overflow, 0 page overflow
interact.js  12/12 assertions pass, 0 console errors
motion.js    CLEAN — every scene reaches the same settled state under reduced motion
measure.js   --verify prints IDEMPOTENT;  --strict exits 0 (all 59 scenes converge)
```

The 6 remaining findings are one documented, measured exemption — see *What is deliberately
unfinished*. They are expected to keep being reported.

## Before and after

| metric | at the start | now |
|---|---|---|
| Suite runnable at all | **no** — hardcoded Windows path, `MODULE_NOT_FOUND` | yes |
| Text collisions | unknown, unmeasurable | **0** at both viewports |
| Fitter output | a function of how many times it had been run | a property of the source; asserts its own idempotence |
| Scenes the fitter cannot converge | 4, residuals 18–24 | **0** |
| Scene geometry | depended on draw history | pure per scene |
| Distinct animation durations | **25** across 53 sites | **5** tokens |
| Distinct per-item staggers | **43** | **3** tokens |
| Transitions with no explicit easing | **39 of 56** (d3's default is ease-in-**out**) | **0** |
| Entrances inside a 1200ms budget | not a concept | **47 of 47**, worst 1180ms |
| Reduced motion | claimed, never tested | tested every scene; one real defect found and fixed |
| Timer-driven scenes measured at final state | **never** | both, via a test-only span override |

## What each step actually bought

**Stage 0 — the suite.** It had been dead since the repo left the machine it was written on:
`require('C:/Users/stefa/Menu-app/node_modules/playwright')`. Every collision figure in the repo's own
docs was stale. Restoring it is the precondition for everything below.

**The fitter.** `measure.js` measured content at whatever type scale the *committed* frame implied,
fitted a new frame, and wrote it back — one step of a fixed-point iteration with the source file as
the iteration state. Two consecutive runs on a byte-identical file moved 15 of 118 frames, every delta
positive. It now solves `F(w*) = w*` in one run and ships `--verify`, which is the assertion that
makes every later before/after number mean anything.

**Two frames off the type-scale ceiling.** `quadrants` 999→854 and `grants` 837→768; `quadrants` came
off the `TK` ceiling of 3.0, the saturated state where legibility is bought with frame size. A full
refit was measured first and **rejected**: 118 values churned for an identical audit.

**Settle.** 17 of 50 transition sites finished after the 1500ms settle, the worst at 4140ms. A third
of the piece was measured mid-flight. Raising it to 4500 immediately exposed a real 57-unit frame
overflow on `r0` that had been invisible.

**Easing.** 39 of 56 transitions had no explicit curve, so they got d3's default — `easeCubic`, which
is cubic-in-**out**. 32 of those were entrances, and an entrance that eases *in* hesitates before it
moves, which at reading speed is indistinguishable from lag. Nothing used an ease-*in* curve either,
so things did not leave, they stopped being there. Four named curves now, one job each.

**Durations and staggers.** 25 and 43 distinct values is not a system, it is 68 local decisions. Five
duration tokens, three staggers, and a budget that every entrance now satisfies.

**The PRNG.** One un-reseeded global stream placed both the drawn geometry and the epidemic
simulation, so redrawing a scene moved its content. That single cause explains three symptoms
previously logged as three separate mysteries. Geometry now reseeds per draw; the simulation has its
own stream.

**Reduced motion.** The README claimed it; nothing tested it. `motion.js` walks every scene in both
modes and diffs the settled state. It found that `air`'s reduced path dropped the cited 55% figure and
the figure in the doorway — so a reader who asked for reduced motion was the only reader who never saw
the number, in a piece where every figure is real and cited.

**The timer scenes.** `air` and `twoclocks` run 13s and 16s `d3.timer` sequences and both *create
content at the end*. They appeared in no transition inventory and had **never** been measured at their
final state. The first audit that reached them found a real text collision that had been invisible for
the life of the project.

## What only looking found

Two defects that no metric in this repo can express, both found by opening a screenshot:

- The crossing annotation in `twoclocks` read **bottom-to-top**. Offsets of 1,2,3 × `cl2` stack upward,
  so the first line lands nearest the rule. True on the desk since the scene was written. Reading
  order is not a measurable property.
- The closing note was clipped by the frame's bottom edge — because the frame had been fitted while
  that note was still empty text.

Worth keeping: on `air`, the automated reduced-motion check pointed at the right scene **for the wrong
reason**. It saw a node-count delta that was the deliberate particle reduction. The real fault came
from reading the code the check had pointed to. A metric points; it does not diagnose.

## What is deliberately unfinished

**The six sub-7px findings.** `TK` is solved so base-7.2 text lands exactly on the floor — measured,
7.70px — and `CON_TK = 0.84` then multiplies *after* it, giving 6.47px. The floor and `CON_TK` are
mutually exclusive by construction. Solving the floor for the console was implemented, measured and
reverted: it cleared five of six and cost **eleven text collisions across ten scenes**. `audit.js` is
deliberately unchanged and still reports all six — six standing findings with a written reason is a
reminder; zero findings with a tuned threshold is a lie. The real fix is a mobile-specific console
layout, which is scene authoring, not a constant.

**Step 4, new scenes — blocked, not skipped.** The mechanical half is ready. What is missing is which
argument the piece does not yet make, and on 59 scenes of cited public-health argument that is not
mine to invent.

**Stage 11's hands-on tier.** Colour and reduced motion are done. Keyboard traversal, focus order,
screen-reader names and roles, reflow at 200% and target sizes are not. `accessibility-scan` and
`accessibility-inspect` are installed and the browser was held by the measurement suite for most of
this pass.

**Stage 12 beyond two scenes.** 59 screenshots are captured in `.shots/`. Two were examined closely
and both yielded a real defect, which is a hit rate worth continuing at — not a claim that the other
57 are clean.

**One review lens never ran.** The fitter's six-lens adversarial review lost `render-semantics` and
eight of nine refuters to a session limit. That half of the review is missing, not clean.

**`ALARM`'s deuteranopia margin.** It passes SC 1.4.3 at 4.82:1 and reads 4.23:1 under deuteranopia
simulation, 0.27 short of the body-text threshold — a beyond-conformance check, not a violation.
`#AE4429` clears 4.5 under all three simulations. Recorded with the arithmetic rather than applied,
because it is a brand colour with `WARN` aliased to it.

## Nothing got worse

No hard metric regressed at any point. Three changes were measured and reverted rather than argued
with: the `CON_TK` floor, the full refit, and an early `FLOW` change. Two near-misses were caught
before landing — a regex that would have rewritten layout coordinates into timing tokens, and a
write-back that would have deleted 57 frames.
