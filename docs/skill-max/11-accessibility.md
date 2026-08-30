# Stage 11 — accessibility

## Colour: the static half, done

Ran `color-accessibility-audit`'s scanners against the piece's real palette block rather than against
a screenshot, so the numbers are the authored tokens, not a JPEG's approximation of them. Background
is `PAPER #F8F6F1`.

| token | hex | actual ratio | AA body | carries text | worst CVD-simulated |
|---|---|---|---|---|---|
| `INK` | `#212E36` | **12.89** | pass | yes | 12.58 |
| `MUTE` | `#666666` | **5.32** | pass | yes | 5.31 |
| `GOLD` | `#8D5D1C` | **5.23** | pass | yes | 4.91 |
| `TEAL_D` | `#31756F` | **4.98** | pass | yes | 4.64 |
| `ALARM` | `#B8492E` | **4.82** | pass | yes | **4.23** (deuteranopia) |
| `RED` | `#D53F3B` | 4.22 | large only | no | 3.58 |
| `ACCENT` | `#F37940` | 2.55 | — | no | 2.27 |
| `TEAL` | `#7FCCC8` | 1.71 | — | no | 1.59 |
| `LINE` | `#DCD5C6` | 1.35 | — | no | 1.35 |
| `BLUE` | `#C3DCEB` | 1.32 | — | no | 1.28 |

**Every token that carries text passes AA body text.** That is a real pass, and it says the palette
work recorded in `docs/coethia-brand-palette.md` was done properly rather than asserted. `GOLD`
measures 5.23:1, which is exactly the figure its own code comment claims — the doc and the code agree.

The four low-ratio tokens carry no text. `TEAL`, `BLUE` and `LINE` are fills and a hairline; a 1.35:1
rule against paper is what a hairline *is*. `ACCENT` at 2.55 is below the 3:1 that SC 1.4.11 asks of
non-text content that conveys meaning, so it should not be the only thing distinguishing one state
from another — worth checking at the call sites, and not a text-contrast failure.

### The one finding, stated at its true severity

`ALARM #B8492E` carries text at **60 call sites**, authored between 5.6 and 19 units — overwhelmingly
small body text rather than large. It passes SC 1.4.3 at 4.82:1. Under **deuteranopia simulation** it
reads **4.23:1**, which is 0.27 short of the body-text threshold.

**This is not a WCAG conformance failure.** SC 1.4.3 is measured on the actual colours, and 4.82 ≥ 4.5.
CVD simulation is a beyond-conformance check, and calling it a violation would be overstating it.

It is still worth fixing, because it is nearly free. One shade darker in the same hue family clears
4.5 under all three simulations:

| candidate | actual | deuteranopia | protanopia | tritanopia | clears 4.5 under all CVD |
|---|---|---|---|---|---|
| `#B8492E` *(current)* | 4.82 | 4.23 | 6.08 | 4.85 | no |
| **`#AE4429`** | **5.31** | **4.68** | **6.68** | **5.35** | **yes** |
| `#A43F25` | 5.86 | 5.19 | 7.25 | 5.90 | yes |

`#AE4429` is the minimal change: same hue, one step darker, and it moves the piece from "conformant,
marginal beyond it" to "clears both". `ALARM` is a brand colour carried over from the deck and
`WARN` is aliased to it, so this is a design decision with an accessibility argument behind it rather
than a defect to silently patch — recorded here with the arithmetic so it can be decided rather than
guessed.

## Reduced motion — verified, and the new curve checked

`E_EXIT` is a curve the piece did not have before this pass, so it had never been checked under
reduced motion. Verified statically:

- Every motion token is `REDUCE`-aware: durations collapse to 1ms, staggers to 0, all four curves to
  `easeLinear`.
- Zero call sites still carry a redundant inline `REDUCE?1:` on a duration — the tokens carry it
  centrally, which is strictly better than 53 local copies of the same conditional.
- The stroke draw-on helper's `dur || CAMERA` looks unguarded and is not: the function returns early
  under `REDUCE` after snapping to the final state, so that duration is unreachable. Flagged by a
  naive check that read the duration argument without the guard above it — recorded because the next
  person will flag it too.

## No text alternative carries the figures — pieces 2 and 3

Checked all three explainers rather than assuming, because the README's accessibility section makes a
specific claim and I wanted to know which piece it belongs to:

| piece | table markup | "read the data as a table" affordance |
|---|---|---|
| `political-health-personas.html` | **yes** | **yes** |
| `belief-based-communication.html` | no | no |
| `faster-than-the-rumour.html` | no | no |

So **the README's claim is accurate and correctly scoped** — its Accessibility section sits under the
personas piece, which does carry a real table with every figure in it. Nothing is being
misrepresented.

But it does mean `faster-than-the-rumour.html` presents 59 scenes of cited epidemiology, coverage,
cost and workforce figures with no non-visual route to any of them. What it has instead is a single
`aria-label` on the `svg` — a 90-word prose summary of the whole argument. That is genuinely better
than nothing and it is not a substitute: it describes what the piece argues, not what any figure is.
A screen-reader user is told there is a coverage cliff at ninety-five percent and cannot reach the
$244,480 per case, the 412,000 views, or the five reasons and their shares.

Not fixed here, deliberately. A table for 59 scenes is scene-by-scene authoring with editorial
decisions about which figures are load-bearing, and the personas piece shows the repo already knows
how to do it. Recorded as the largest accessibility gap in this piece.

## What the interactive surface does right

Worth stating, because it is easy to only list faults. `setTabbing(sel, on)` flips `tabindex` between
0 and −1 per scene, so a scene's controls enter the tab order only while that scene is current. That
is the correct pattern for a 59-scene document — the alternative is a tab order hundreds of stops
long, most of it pointing at things nobody can see. Interactive groups also carry `role="button"` and
an `aria-label` built from their own content rather than a generic string.

## The keyboard tier — CLEAN, after four attempts at the instrument

**Every one of the 260 focusable objects across 59 scenes, at both viewports, is reachable by Tab,
carries an accessible name, and carries a role.** `a11y.js` in the repo root is the check.

That result took four runs, and every finding in the first three was **my own test**:

| run | findings | the bug |
|---|---|---|
| 1 | **289** | walk began with `#viz.focus()` — but `#viz` is `role="group"` with no `tabindex`, so `.focus()` is a silent no-op and the walk started from wherever focus already was. Budget of `controls + 4` presses. Reported 78 scenes with unreachable controls |
| 2 | **27** | visited-set keyed on `aria-label`, which is not unique. Twelve controls sharing four labels collapsed to four entries: "Tab reached 4 of 12" for a scene where all twelve were reachable |
| 3 | **1** | reset changed to `document.body.focus()` — **also a no-op**, `body` has no `tabindex` either. Focus stayed where the previous scene's 40-press walk had left it, past `#viz`, so Tab moved further away rather than back |
| 4 | **0** | reset targets the first genuinely focusable element in the document |

Runs 1 and 3 are the same root mistake twice: calling `.focus()` on something that cannot take focus.
It fails silently, and the resulting numbers got *more* plausible each time — 289 is obviously wrong,
27 looks like a finding, and 1 looks like a bug worth fixing. The third was the dangerous one.

The check was also pointed at a sharper hypothesis and **refuted** it: focusable controls buried in
`aria-hidden="true"` subtrees, which is a genuine defect pattern. 47 exposed, 0 buried — the
`aria-hidden` list correctly covers chrome groups only.

**The keyboard accessibility of this artifact was correct the whole time.** Four attempts at measuring
it produced 317 findings between them, all false.

### One real datum, reported and not asserted

176 focusable objects render under 24×24 CSS px across 54 scenes — worst `cliff` at 15×15 and
`descent` at 14×14. WCAG 2.2 SC 2.5.8 asks 24×24 of a pointer target, and it has exceptions (inline
targets, equivalent function available elsewhere) that a script cannot decide. Counted and listed,
deliberately not called failures.

## The largest accessibility finding of the pass, and it came from an anomaly

While confirming the accessibility tree I noticed both `five` and `desk` reporting their first button
as `"Seed one case"` — a control belonging to `cliff`. Following that rather than moving on:

**`opacity: 0` does not remove an element from the accessibility tree.** Only `aria-hidden`,
`display: none` or `visibility: hidden` do. Every control in every off-screen scene was therefore both
in the tab order and announced. Measured on `cliff`: **85 `role="button"` elements present, 2 actually
usable, 65 exposed** — including `"AK"` and `"ME"`, US state labels from a different scene.

`setTabbing()` could not fix this. It manages the tab *order*, and the accessibility tree does not
care about `tabindex`.

Two changes. `show()` now sets `aria-hidden` on the way out and clears it on the way in, both
immediately rather than on the transition, so a scene is announceable as it starts arriving and gone
from the tree as it starts leaving — and only an exact `0` hides, because `show(g, .16)` is a dim and a
dimmed thing is still there. Then `render()` enforces one invariant in one place:

```js
svg.selectAll('[aria-hidden="true"] [tabindex="0"]').attr('tabindex', -1);
```

**Nothing hidden from the tree is in the tab order.** That belongs in one sweep rather than at 30-odd
draw sites, because a sweep cannot be forgotten by the next scene someone adds.

### It also reframes my own earlier "CLEAN"

| | before | after |
|---|---|---|
| focusable objects | 260 | **64** |
| scenes exposing controls | 54 of 59 | **18 of 59** |
| SC 2.5.8 under-size targets | 176 | **13**, across 6 scenes |
| accessibility tree on `five` | 30 nodes, 19 buttons | 7 nodes, 5 buttons |

**196 of the 260 Tab stops were leaked controls from scenes the reader had already left.** The earlier
result — "every one of 260 focusable objects is reachable" — was true and close to meaningless. A tab
order of 260 stops where 196 land on invisible controls is not an accessible interface; it passes a
reachability check and fails a person.

The under-size count falling 176 → 13 is the same story: 163 of those were leaked too. The 13 that
remain are real and are still reported, not asserted.

Verified after: audit 6 findings and zero collisions, interact 12/12 with 0 console errors, reduced
motion CLEAN, and zero real keyboard findings — the one that appeared (`crosstab`, 5 of 7) was checked
against a focused probe on that single scene, which found 7 of 7.

## Not done

The rest of the hands-on tier. `accessibility-scan` and `accessibility-inspect` drive a live page, and the
measurement suite has been holding the browser; running two Chromium-driving tools at once is the one
thing this repo's own notes forbid, because they contend and die silently, which reads as a pass.

Specifically outstanding: keyboard traversal and focus order across all 59 scenes; screen-reader
names, roles and states from the accessibility tree; reflow and zoom at 200%; target sizes; and
confirming the largest camera moves degrade to an instant *correct* final state rather than a broken
half-state under `prefers-reduced-motion`. The last of those is the one I would check first — it is
the claim in the README with the most room to be quietly false.
