# Stage definitions

Read the stage you are about to run, not the whole file. Each stage lists: **scope**, **skill**,
**reads**, **writes**, **gate**, **hands to next**. Every stage also carries the max-work mandate from
SKILL.md and the rule that it may not touch anything outside its scope.

---

## Stage 0 — Ground truth and baseline
**Skill:** `webapp-testing`

**Scope.** Make the target measurable, then measure it. Nothing else. No design changes at all.

**Do.** Get the existing verification suite running — install the browser driver, fix hardcoded paths,
resolve module resolution, confirm it exits clean. If no suite exists, build the minimum one: walk
every scene at desktop and mobile width, capture a screenshot each, and report per scene: console
errors, node count, overlapping text pairs, text under the legible pixel floor, content outside its
own frame, NaN geometry, horizontal page overflow.

A suite that has silently not run for months is the single most common finding here. Check that it
actually executes on *this* machine before trusting any number in the repo's own docs.

**Writes.** `docs/skill-max/BASELINE.md` — the full findings table, plus the numeric fingerprint:
scene count, animation call-site count, the distinct duration set, the distinct easing set, dependency
list. Screenshots to a baseline directory, committed or at least preserved.

**Gate.** The suite runs to completion and the baseline file exists. This is the only stage whose gate
is not a comparison.

**Hands to next.** The collision list and the tiny-text list, scene by scene. Stages 1, 3 and 5 all
consume it.

---

## Stage 1 — Narrative, annotation, direct labelling
**Skill:** `visual-storytelling-design`

**Scope.** What each scene is *for*, and how many floating text objects it needs. Copy and label
placement strategy. Not visual style, not motion.

**Do.** Walk the scene sequence as a narrative arc and name any scene that carries no argument or
repeats the previous one. Then attack the collision list from stage 0 structurally: most overlapping
labels are a symptom of indirect labelling. A legend plus five floating captions becomes five direct
labels attached to their marks, and the collision disappears rather than being nudged. Apply the
one-change-at-a-time rule: a scene introducing two new ideas is two scenes.

**Writes.** `docs/skill-max/01-narrative.md` — per scene: the one thing it argues, the text objects it
needs after the pass, and which collisions this stage expects to have eliminated by removing the
label rather than moving it.

**Gate.** Overlapping-text count strictly decreases. Scene count may change; note it.

**Hands to next.** The final inventory of text objects per scene. Stage 5 solves placement only for
labels that survive this stage.

---

## Stage 2 — Aesthetic direction
**Skill:** `frontend-design`

**Scope.** One written direction for the whole artifact: type scale, weights, tracking, palette roles,
density, what the thing should feel like and what it must not look like. Decisions, not edits — apply
only global token changes here, never per-scene work.

**Do.** Write the direction *before* changing anything, so later stages have something to be judged
against. If the artifact already has a design-system doc, reconcile with it rather than replacing it,
and flag every place the code and the doc already disagree. Respect the target's standing rules
verbatim — if the project has banned something, the direction may not reintroduce it.

**Writes.** `docs/skill-max/02-direction.md` — the direction, the token table with real values, and an
explicit list of what is now forbidden.

**Gate.** No regression on contrast ratios or tiny-text count. Every token in the table resolves to a
real value used somewhere in the code.

**Hands to next.** The token table. Stages 3, 4, 5 and 6 all read it and none may invent a value
outside it.

---

## Stage 3 — Per-scene composition
**Skill:** `canvas-design`

**Scope.** The composition of each scene as a static image. Balance, focal point, negative space,
alignment, scale relationships. One scene at a time.

**Do.** Use the skill's design-philosophy-first discipline: the philosophy pass is not optional
ceremony, it is what stops the output reading as templated. Then go scene by scene against the stage 0
screenshots and name the actual compositional fault — dead space, competing focal points, a figure
floating with no ground, elements aligned to nothing. Fix in code with real coordinates.

**Writes.** `docs/skill-max/03-composition.md` — per scene: fault, fix, coordinates changed.

**Gate.** Frame-overflow count does not increase. Overlapping-text count does not increase. Re-shoot
the screenshots and diff them against baseline; every diff must be attributable to a listed fix.

**Hands to next.** Which scenes are still weak and why — usually because the scene needs a drawn
object it does not have. That is stage 4's queue.

---

## Stage 4 — Drawn things instead of boxes
**Skill:** `algorithmic-art`

**Scope.** Scenes where a unit of meaning is currently carried by a rectangle, a chip, a card or a
bulleted list drawn in vector form. Replace with a drawn object: a glyph, a mechanism, an instrument,
a real interface being recreated, a figure, a generated field.

**Do.** Take stage 3's weak-scene queue. For each, decide what the thing actually *is* and draw that.
Where the content is a distribution, a population, a flow or a field, generative geometry with seeded
randomness beats a diagram of it — and seeded means reproducible, so the verification suite stays
deterministic. Chrome of a recreated real interface is the one legitimate use of a box.

**Writes.** `docs/skill-max/04-illustration.md` — per scene: what was a box, what it is now, seed
values used.

**Gate.** Determinism: two consecutive runs of the suite produce identical geometry. Node count per
scene stays within a sane budget. No new console errors.

**Hands to next.** New geometry means stale camera frames and new collision risk. Stage 5 must re-fit.

---

## Stage 5 — Layout resolution and collisions
**Skill:** `gsap-utils` for the clamp/mapRange/snap math. Otherwise this is a code stage.

**Scope.** The remaining overlaps, the responsive type scale, and the camera fit. The stage that
actually closes out "overlapping and clunky".

**Do.** Three things, in this order:

1. **Fix the type-scale feedback loop if the target has one.** A scale factor that inflates small type
   to a legibility floor will, at its ceiling, paint a long centred caption at several times its
   authored width. That caption becomes the widest object on the stage; a camera fitter grows the
   frame to contain it; the larger frame shrinks the scale; every other element becomes a postage
   stamp in dead space. Wrapping long captions breaks the loop. Shortening the copy does not, because
   the next long caption reintroduces it. Fix the wrap, not the words.
2. **Solve placement, do not widen the frame.** Add a real collision pass over the surviving labels:
   build a quadtree or spatial hash of the painted text boxes, then resolve overlaps by displacement
   with a leader line where displacement exceeds a threshold. Iterate to a fixed point with a cap.
   The camera fitter runs *after* this, never as a substitute for it.
3. **Re-fit frames, then re-audit.** In that order. Fitting after auditing measures stale frames.

**Writes.** `docs/skill-max/05-layout.md` — the solver, its parameters, the before/after collision
counts per scene, and any collision it could not resolve with the reason.

**Gate.** Overlapping-text count at or near zero and strictly better than baseline. Tiny-text count
zero. Frame-overflow count zero. Both widths.

**Hands to next.** A stable layout. Motion stages may not move an element in a way that reintroduces
a collision in any intermediate frame, not just the end state.

---

## Stage 6 — Motion system
**Skill:** `motion-design`

**Scope.** The system, not the animations. Durations, curves, choreography rules, motion personality.
No implementation.

**Do.** Read stage 0's distinct-duration and distinct-easing sets. A sprawl of unrelated durations
with one curve doing every job is the mechanical signature of clunky motion, and it is fixed by a
scale, not by tuning individual tweens. Produce: a duration scale of four or five steps with a stated
purpose each; an easing set with a stated purpose each — entrances, exits, moves, emphasis, and one
for anything that encodes a quantity, which must not overshoot; a motion personality picked
deliberately; and the primary / secondary / ambient layering rule that says what may move at once.

Also decide what should *not* animate. A stage that adds motion everywhere has failed.

**Writes.** `docs/skill-max/06-motion-system.md` — the token table, the layering rule, the
do-not-animate list.

**Gate.** Every duration and curve in the table has a named purpose. Count of distinct durations and
curves in the *plan* is small; the code has not changed yet, so nothing to measure but the table.

**Hands to next.** The tokens. Stages 7, 8, 9 may not use a value outside them.

---

## Stage 7 — Motion implementation for SVG
**Skill:** `svg-animation`

**Scope.** Individual objects building on, changing, and leaving. Per scene.

**Do.** This is where a scene stops being a hard repaint and starts being a thing that assembles.
Stroke draw-on via dash offset for anything with a line — mechanisms, arrows, connections, borders of
recreated interfaces. Path morphing where one shape genuinely becomes another and the transformation
is the argument. Motion along a path where something travels. Animated gradients and filters for
ambient life, used sparingly and only in the ambient layer.

Every animation uses a stage 6 token. Anything encoding a quantity animates without overshoot.

**Writes.** `docs/skill-max/07-svg-motion.md` — per scene: what animates, technique, token used.

**Gate.** No new console errors. No collision in any intermediate frame: sample the collision check
mid-transition, not only after settle. Determinism preserved.

**Hands to next.** Per-object motion exists but is not yet choreographed against its neighbours.

---

## Stage 8 — Choreography and sequencing
**Skills:** `gsap-timeline`, `gsap-core`

**Scope.** The relationship *between* animations. Order, overlap, stagger, what waits for what.

**Do.** Read the stage 6 layering rule. Convert simultaneous fades into sequences with intent: the
thing that carries the argument arrives first and alone; supporting geometry follows on a stagger;
ambient motion never competes with either. Use the timeline concepts even if you are not using the
library — a position parameter and a nested timeline are ideas, not an API.

If the user declined library adoption, implement the same sequencing with the target's existing
transition layer and a small sequencing helper. Record the tradeoff rather than smuggling in a
dependency.

**Writes.** `docs/skill-max/08-choreography.md` — per scene: the sequence, with offsets in ms.

**Gate.** Total scene entrance duration within a stated budget. Nothing moves during a moment when
the reader is meant to be reading. Intermediate-frame collision check still clean.

---

## Stage 9 — Scroll binding
**Skills:** `gsap-scrolltrigger`, `gsap-plugins`

**Scope.** Only run this stage if the user adopted the library. Otherwise skip and record the skip.

**Do.** Replace hand-rolled intersection-observer stepping with proper scroll triggers: pinning,
scrub, and — the part hand-rolled steppers almost always get wrong — refresh on resize and teardown on
unmount. Register plugins explicitly. Where a scroll-driven animation encodes a quantity, scrub it
rather than triggering it.

**Writes.** `docs/skill-max/09-scroll.md` — trigger map, refresh and cleanup strategy.

**Gate.** Scene entry and exit fire exactly once per direction. Resize does not desync scenes. No
memory growth over a full scroll-through.

---

## Stage 10 — Performance
**Skill:** `gsap-performance`

**Scope.** Cost of what stages 7–9 added. No new motion.

**Do.** Transforms and opacity only for anything animating per frame. No layout-thrashing reads
interleaved with writes. `will-change` deliberately and temporarily, never blanket. Batch DOM and
attribute writes. Watch node counts on the heaviest scenes.

**Writes.** `docs/skill-max/10-performance.md` — the heaviest scenes, before/after frame cost, fixes.

**Gate.** No scene drops frames on the target's slowest supported width. Time-to-first-paint of a
scene not worse than baseline.

---

## Stage 11 — Accessibility and reduced motion
**Skills:** `gsap-core` (matchMedia and reduced-motion patterns) plus the target's own rules.

**Scope.** Everything stages 7–9 added must degrade correctly, and nothing earlier may have broken the
existing accessible surface.

**Do.** Every new animation honours reduced-motion, including the largest camera moves — degrade to an
instant, correct final state, never to a broken half-state. Re-verify the pre-existing accessible
surface end to end: roles, focus order, keyboard traversal, the text alternative to the visual, and
that announced values track what is currently drawn. Re-check contrast and colour-vision separability
against the stage 2 tokens, since stages 3–5 moved colour around.

**Writes.** `docs/skill-max/11-accessibility.md` — the reduced-motion matrix, the keyboard walk, the
contrast and CVD table.

**Gate.** Reduced-motion run produces the correct final state for every scene. Keyboard traversal
reaches every interactive element. Contrast at or above the target's stated floor.

---

## Stage 12 — Adversarial taste QA
**Skills:** `design-review`, `review-animations`

**Scope.** Look at it. Find what the metrics cannot see.

**Do.** Run the design review against the fresh screenshots with a hostile eye: spacing that is nearly
consistent, hierarchy that is nearly right, alignment to nothing, and the specific tells of
machine-generated visual work. Then review the motion as motion — does it feel intentional, is
anything gratuitous, does anything feel slow, does anything feel abrupt.

The output of this stage is a queue, not a set of edits. Fix the top items in place; anything larger
becomes a named follow-up rather than an unplanned fourteenth stage.

**Writes.** `docs/skill-max/12-qa.md` — findings ranked, fixed vs deferred.

**Gate.** All previous gates still pass after the fixes.

---

## Stage 13 — Final verification and close-out
**Skill:** `webapp-testing`

**Do.** Full suite, both widths, cold. Diff every metric against `BASELINE.md`. Screenshot diff every
scene against the baseline shots and confirm each visible change traces to a ledger entry. Then write
the close-out.

**Writes.** `docs/skill-max/RESULT.md` — the before/after metric table, one line per stage on what it
actually bought, the list of everything deliberately not done, and the honest verdict including
anything that got worse.

**Gate.** Every hard metric at or better than baseline. Any exception stated explicitly in RESULT.md
with a reason, not omitted.
