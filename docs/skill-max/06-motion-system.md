# Stage 6 — motion system

## The inventory, measured not estimated

56 `.transition()` call sites across 59 scenes.

| | count | distinct |
|---|---|---|
| durations | 53 | **25** |
| delay base offsets | 24 | 14 |
| per-item staggers | 75 | **43** |

```
durations  200 220 240 260 280 300 320 340 360 380 400 420 440 460 500 520
           600 640 700 760 900 1100 1300 1400 2600
staggers   2 3 5 7 11 14 15 17 18 19 22 24 30 32 34 36 37 38 46 66 70 80 90
           92 104 110 120 130 136 140 152 160 170 180 214 220 230 260 270 280
           282 330 420
```

25 durations and 43 staggers is not a system, it is 56 local decisions. There is no value in the
list that another value in the list could not have been.

## Two defects that are causes, not symptoms

**1. Thirty-nine of fifty-six transitions use an ease-in-out curve for an entrance.**

| easing | sites |
|---|---|
| *(none — d3 default `easeCubic`, which is cubic-in-**out**)* | **39** |
| `d3.easeCubicOut` | 11 |
| `d3.easeCubicInOut` | 3 |
| `VALUE_EASE` | 3 |

d3's default ease is `easeCubicInOut`. An entrance on an in-out curve *starts slow* — the object
hesitates before it moves. Read at speed that is indistinguishable from lag, and it is applied to
39 of 56 sites, nearly all of which are entrances (`.attr('opacity', 1)` on an arriving group).
This is the single most likely mechanical cause of the piece reading as clunky, and it is a
one-token fix rather than a redesign.

Note also that **nothing in the piece uses an ease-*in* curve**, which is what an exit wants. Exits
are currently either instant or on the same in-out curve as everything else, so things do not leave,
they stop being there.

**2. Seventeen of fifty call sites finish after the measurement window.**

`measure.js` and `audit.js` settled 1500ms before measuring. Worst offenders, computed from source
for an eight-item stagger:

```
4140ms   .transition().duration(520).delay(260 + i*420)
3980ms   .transition().delay(1200 + i*260 + k*140).duration(700)
2940ms   .transition().delay(200 + i*280).duration(500)
2860ms   .transition().duration(900).delay(200 + i*220)
2600ms   .transition().duration(2600).ease(d3.easeCubicOut)
```

So every frame fit and every collision count was taken while a third of the piece was still in
flight, reporting the positions and extents of content that had not arrived. **This is why the
motion system is not a cosmetic stage on this target: the timings determine whether the measurements
mean anything.** `audit.js` and `measure.js` are now at 4500ms. That is correct but about three times slower, and
it is permanent — see the gate at the bottom for why it cannot come back down.

Raising it immediately surfaced a real defect that had been invisible: **`r0` desktop overflowed its
frame by 57 units** once its animation landed. Refitting `r0` at the correct settle moved its frame
from `193 38 685 650` to `102 -6 776 736` — 91 units wider. One scene, hidden for as long as the
suite settled early.

## The scale

Five durations, each with one job it is for.

| token | ms | for |
|---|---|---|
| `T_TAP` | 140 | feedback on a control the reader just touched — must feel like the control, not a response to it |
| `T_QUICK` | 240 | one small object arriving, or a value stepping |
| `T_MOVE` | 400 | one object travelling a real distance across the stage |
| `T_ENTER` | 620 | a composed group arriving — the default entrance |
| `CAMERA` | 900 | the camera frame itself. Already exists at this value; unchanged |
| `T_SWEEP` | 1400 | **one object making a long deliberate traverse, where the travel itself is the content.** Two sites qualify and both are intentional, not drift: a beam rotating 11° into position, and a key turning 340°. The key keeps 2600ms — `T_SWEEP` doubled — because 340° of rotation needs the time. A sweep is not an entrance and the entrance budget does not apply to it |

Three staggers, chosen by what the sequence is for rather than by how many items there are.

| token | ms | for |
|---|---|---|
| `S_TIGHT` | 14 | dense grids of hundreds of cells — reads as a wipe, not a sequence |
| `S_ROW` | 55 | rows and list items — reads as a sequence the eye can follow |
| `S_BEAT` | 120 | a handful of major objects where each one is meant to be noticed |

Four curves, each with one job.

| token | curve | for |
|---|---|---|
| `E_ENTER` | `easeCubicOut` | anything arriving. Decelerates into place |
| `E_EXIT` | `easeCubicIn` | anything leaving. Accelerates away. **New — the piece has no exit curve today** |
| `E_MOVE` | `easeCubicInOut` | an object travelling between two positions it holds at both ends |
| `E_VALUE` | `easeCubicOut` | a mark encoding a quantity. Must not overshoot, so a bounce or an elastic is forbidden here regardless of how it looks. Exists today as `VALUE_EASE`; renamed for consistency, value unchanged |

## The budget, which is the point

**delay + (n−1)·stagger + duration ≤ 1200ms**, for every *entrance* in the piece. Deliberate
`T_SWEEP` moves are exempt by definition — they are the content of their scene, not its arrival.

| case | arithmetic | total |
|---|---|---|
| 5 major objects on `S_BEAT` | 4×120 + 620 | 1100 |
| 12 rows on `S_ROW` | 11×55 + 240 | 845 |
| 60 grid cells on `S_TIGHT` | 59×14 + 240 | 1066 |

Every shape the piece actually uses fits, with margin. That is what lets `SETTLE` return to 1500 and
makes every subsequent measurement sound. The budget is not an aesthetic preference — it is the
constraint that reconnects the motion to the verification.

## Layers — what may move at once

- **Primary.** The one object carrying the scene's argument. Arrives first and alone, `T_ENTER` +
  `E_ENTER`. If a reader can only watch one thing, this is it.
- **Secondary.** Supporting geometry, labels, scaffolding. Follows on a stagger at `T_QUICK`.
- **Ambient.** Texture and atmosphere. Only after both have landed, and never competing with either.

A scene with two things in the primary layer has two arguments and should be two scenes.

## Do not animate

- **Anything that encodes a quantity may not overshoot.** A band must never briefly draw a share
  nobody has. The repo already commits to this in its README; `E_VALUE` is what enforces it.
- **Nothing moves while the reader is reading.** No looping or ambient motion on a scene whose job is
  a text argument.
- **Chrome never animates on scene change** — the provenance stamp, the progress bar, the grain.
- **Do not add motion to a scene that reads correctly still.** 56 transitions across 59 scenes means
  most scenes are hard repaints, and the fix for that is not motion everywhere; it is motion where a
  change of state would otherwise be invisible.

## Gate

- Distinct durations 25 → 5, distinct staggers 43 → 3, curves explicit at every site.
- Every entrance inside the 1200ms budget, checkable from source by the same arithmetic used above.
- `audit.js` findings unchanged — timings do not move geometry, so any change here means something
  else broke.
- `interact.js` 12/12.
- `SETTLE` **stays at 4500.** This was going to come back to 1500 once entrances fit the budget, and
  it cannot: the key's 340° rotation runs 2600ms and a rotating object's bounding box changes
  throughout the turn, so measuring it at 1500 measures a different shape. Correctness costs about
  three times the suite runtime and that is the right trade. Recorded here so nobody "optimises" it
  back and silently reintroduces mid-flight measurement.
