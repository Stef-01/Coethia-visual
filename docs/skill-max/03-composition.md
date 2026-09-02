# Stage 3 — Per-scene composition

Philosophy first, in `03-philosophy.md` — **Stacked Register**: evidence accumulates upward in bands,
not outward in containers. `canvas-design`'s discipline applied to the artifact; its own output
contract is a standalone `.pdf`/`.png` art object, and producing one would have been ceremony when the
thing needing composition is six scenes inside a 400KB explainer. The philosophy pass is kept because
it is the part that stops the result reading as templated.

**Queue: 6 scenes. Fixed: 3. Declined with reason: 2. Assessed and unchanged: 1.**

---

## `tiers` — 41% coverage, aspect 2.58. FIXED.

**Fault, and it was the clearest violation of the repo's headline rule in the whole piece.** Three
`rx=16` rects at `x=200/500/800`, heights hardcoded `h:150/212/274`, each containing only a title at
13/700 and three lines at 10.5/400, all centre-anchored. *"No rounded rectangle may be the primary
carrier of an idea"* — this was three of them carrying the entire scene. The heights are an arithmetic
sequence (+62) chosen to look like a rise; **they encode no quantity, there is no axis and no source.**

Also: ~24% of the frame empty above the content and ~48% below; a dashed ascent line asserting the
same rise the staircase already asserted, overhanging past the last card to the frame edge (which is
why the content bbox measured 850 wide); and the punchline floating ~200 units below everything in
open paper.

**`boxes.js` reported CLEAN on it.** Its rule requires the boxes be *identically sized*, so it
classified these as *"data marks (dimensions encode a quantity — the rule permits these)"* purely
because they differ. **Differing size is not evidence of encoding.** The instrument built to catch
this pattern was defeated by the pattern being drawn slightly better than its worst case.

**Fix.** Three registers stacked down a common left axis at `AX=250` (mobile 180), separated by
`LINE #DCD5C6` rules at 1.2 units rather than enclosed by borders — a plate, not a dashboard. A rule
separates without enclosing, which is the whole distinction. Depth is carried by a **graduated strata
gauge**: `t.dep` filled cells of three at `20×14` (mobile `26×18`), stacked upward, `TEAL_D #31756F`
filled and `LINE` outlined, with an `n/3` mono readout at 6.4. The filled count *is* the quantity the
card heights pretended to be. The ascent path is deleted, and its animation line with it rather than
left to select nothing. The punchline sits under the last rule on the type axis.

**Every dimension derived, after two passes that were not:**

| pass | constant | what the render showed |
|---|---|---|
| 1 | `GLASS` / `DIM` | `Cannot access 'GLASS' before initialization`. Declared ~3444; this scene builds in a load-time IIFE ~2555. `const` hoists into a temporal dead zone but does not initialise. Now `TEAL_D` and `LINE`, both declared at 973. **Found by `shot.js` printing its page-error count even when zero.** |
| 2 | `BW = 600` | Text stopped ~40% short of the band's right edge — the emptiness moved *from* the frame *into* the object, which Stage 2's own governing sentence forbids. Now `GW + max(getComputedTextLength) + 34`. |
| 3 | `RH = 155` | Tiers 1 and 3 carry two body lines, Tier 2 carries three, so two of three bands held ~60 units of dead bottom. Now derived from line count and the gauge's stack height, whichever is taller. |

Passes 2 and 3 are the assumed-dimension bug for the **sixteenth and seventeenth** time in this file.

**Coordinates changed:** `T[]` restructured (`x`/`h` removed, `dep` added, copy re-broken to
2/3/2 lines); `AX 250/180`, `GAP 20/30`, `TOP 120/100`, `GW 62/78`, `TX = AX+GW`, `TY 34/52`,
`BY 62/92`, `LEAD 19/30`; `BW` and each `rh` measured; `LASTRULE` derived.

---

## `measure` — 42% coverage, aspect 2.49. FIXED.

**Fault: aspect only.** Six instrument tiles, each with a drawn glyph (a coin, an ascent arrow, a
gauge, an eye, a radiating signal) — which is a legitimate use of a rounded rect as chrome and which
`boxes.js` correctly exempts. The composition was never wrong. **3 columns × 2 rows at 250 wide is 786
units across against 316 tall**, an aspect of 2.49 into a 1.054 stage, so 58% of the frame was margin
the composition never asked for.

**Fix.** `layoutDash()` reflowed to `COLS = 2` at desktop, grid centred under the heading at
`x0 = round(500 - gw/2)`, giving `518×296` and — with head and foot — about `510×386`, aspect **1.32**.
Within 25% of the stage instead of 136% over it. No tile changed; the tiles are self-contained, which
is what made the reflow free.

The footer's `y` was hardcoded `470`, correct for two rows and inside the third once reflowed. Now
`210 + rows*(h+22) + 30`, derived from the row count.

**Coordinates changed:** `layoutDash()` — `COLS`, `gw`, `x0`, and `text.dfoot`'s `y`.

---

## `translate` — 54% coverage, aspect 1.96. FIXED (banned pattern, not aspect).

**Fault.** The four route cards were `rx=14` rects containing four centre-anchored labels and nothing
else — the same banned pattern as `tiers`. **Step 10 fixed the hub** (a text-only pill became a drawn
book, fault F6) **and left the four cards.** The fix arrived on one path and not its sibling: the third
instance of that exact shape in this pass, after `legible.js`'s contrast-vs-composite and `opaqueIdx`.

**Fix.** One drawn object per route, because each route is a mechanism and a mechanism can be drawn:

| route | what is drawn, and why it is that |
|---|---|
| Autonomy-oriented | a fork with **both** branches drawn and neither marked — "choice kept" is the claim, so an arrow choosing a branch would contradict the label |
| Clinician-trusting | a stethoscope — the messenger is the variable this route changes, not the message |
| Overwhelmed | four contradictory claims crossing in `MUTE` at 1.1, and one adjudicating line through them in `INK` at 1.8 — the label says this audience needs adjudication, not another claim, so the hierarchy states which is which |
| Low-access | a route with stops ending at a clinic cross — the barrier is logistics, so the drawing is the journey, not the belief |

Every stroke is `INK` or `MUTE` at 1.1–1.8 units. No new colour.

The card text also moves off centre onto a left axis at `-cw2/2 + 78` (mobile 92), with the glyph
column at `-cw2/2 + 40`. Four centred blocks give ragged left *and* right; an axis is a decision where
centring is the absence of one.

**Open instrument question, recorded rather than guessed.** `boxes.js` did not report these, and they
are identically sized and text-only, which is exactly its stated rule. It is *not* `padHit`'s
transparent rect providing an exemption — `boxes.js` exempts a rounded rect "accompanied by a path,
circle, polygon, image or line", and a `rect` is not on that list. Why they were missed is unresolved.

---

## `weeks` — 49% coverage, aspect 2.15. DECLINED.

A twelve-week Gantt. **Time on the x-axis is the semantic**, with week gridlines at every second week
and five phase bars spanning `SPANS[i]`. Verticalising it would destroy the thing the scene exists to
show, and aspect 2.15 is what a twelve-week timeline is. Declining to serve a coverage metric by
breaking the content.

## `sequelae` — 48% coverage, aspect 2.22. DECLINED.

A time axis from infection to death, `TX=540, TY=300, TW=330`, with the SSPE drop at the axis end. Same
reason: the horizontal is elapsed time. The scene's whole argument is *how long after* — that is an
axis, and an axis has a direction.

## `gate` — 53% coverage, aspect 1.97. ASSESSED, UNCHANGED.

The hatched "EXTERNAL COMMUNICATIONS PAUSED" bar across five lanes. The bar is already measured to its
own banner (`max(320, getComputedTextLength() + 44)`) and `data-pin`ned so the type does not scale
against fixed chrome. Its width is the five lanes it crosses; narrowing it would detach the bar from
what it interrupts. No compositional fault found that is not the frame.

---

## The correction this stage owes

**The option preview I gave the owner said "No `measure.js` re-run needed." That was wrong.**
`stages.md` says it plainly: *"New geometry means stale camera frames and new collision risk. Stage 5
must re-fit."* Every frame in this file was fitted to the old content. `tiers` was fitted to 850×329
and is now roughly 590×430; `measure` was fitted to 786×316 and is now ~510×386.

So the compositions are better and **the coverage numbers will not improve — and may read worse —
until the frames are re-fitted.** That is `measure.js --verify --strict`, and it is the honest cost of
this stage rather than something to omit from the report.

## Completeness pass

**Examined:** all six queued scenes at 1440×900, against renders rather than source. `room` left
untouched per its standing exemption — the emptiness there is the subject.

**Uncovered:**

- The 53 other scenes were not re-examined this stage; the queue was built by measured aspect and
  three scenes outside it (`gate`, `weeks`, `sequelae`) turned out to need nothing or to be
  semantically horizontal, so aspect alone is a good filter for the frame and a poor one for
  the banned pattern. **`translate` at 1.96 held the second-worst instance of it.** A pattern sweep
  is not an aspect sweep, and only the aspect sweep was run.
- Whether any of the remaining 53 scenes carries the banned pattern. `boxes.js` is now known to miss
  it in at least two forms (differing sizes; and whatever caused `translate` to pass), so its CLEAN
  is not evidence.
- Mobile renders of the three changed scenes were not inspected by eye, only gated.
