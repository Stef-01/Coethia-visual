# Stage 2 — Aesthetic direction

**Decisions, not edits.** No line of `faster-than-the-rumour.html` changed in this stage; the owner
froze the palette and type system for this run. Stages 3, 4 and 12 read the token table below and may
not invent a value outside it.

Direction carried by `impeccable`. `ui-ux-pro-max`, `design-system` and `high-end-visual-design` were
reference only — `stages.md` requires exactly one skill to carry the direction, or the stage
reproduces inside itself the fleet thrash the pipeline exists to prevent.

---

## 1. What the piece is, and what it must feel like

A 59-scene scrollytelling argument about why a measles correction never arrives in time, opening in a
hospital room in Lubbock where a six-year-old died. Every figure is real and cited except one
deliberately recreated Google Ads console, which says so on screen.

**It should feel like a well-made print explainer that happens to move** — a broadsheet science page,
not a dashboard and not a deck. Specifically:

| it should read as | it must not read as |
|---|---|
| paper, with ink on it | a screen with panels on it |
| an argument that accumulates | a series of slides |
| instruments and drawn things | charts with chart chrome |
| quiet, with two or three loud moments | uniformly emphatic |
| one voice | a component library |

**The governing sentence, for stages 3 and 4:** *the emptiness around a subject is composition; the
emptiness inside a frame is a fault.* Those are different, and Stage 3's queue was built to tell them
apart — `room` is exempt from that queue precisely because there the emptiness IS the subject.

---

## 2. Palette roles — which token means what

**These are roles, not new colours.** Every value below already exists in the code.

### Structure

| token | value | contrast on PAPER | role — the ONLY thing it may mean |
|---|---|---|---|
| `PAPER` | `#F8F6F1` | — | the ground. Every scene sits on it. Never a fill for an object. |
| `INK` | `#212E36` | 12.6:1 | primary text, and the line weight of anything structural |
| `MUTE` | `#666666` | 5.74:1 | secondary text — captions, sub-labels, anything the eye may skip |
| `LINE` | `#DCD5C6` | 1.29:1 | rules, ticks, axes, table borders. **Never text.** |
| `DIM` | `#8A8474` | 3.45:1 | structural line *inside* an illustration — the drawn-object equivalent of `LINE` |

### Voice

| token | value | contrast | role |
|---|---|---|---|
| `ALARM` / `WARN` | `#B8492E` | 5.24:1 | the argument's alarm. Deaths, failures, the thing going wrong. **Aliased, so a single meaning.** |
| `ACCENT` | `#F37940` | 2.44:1 | attention without alarm — kicker rules, the wordmark. **Large or decorative only; never body text.** |
| `GOLD` | `#8D5D1C` | 5.23:1 | annotation and provenance — leaders, source stamps, mono labels |
| `RED` | `#D53F3B` | 3.99:1 | data series red, distinct from `ALARM`. **Never used for a warning.** |

### Data

| token | value | contrast | role |
|---|---|---|---|
| `TEAL` | `#7FCCC8` | 1.72:1 | fill only — a series body, never its label |
| `TEAL_D` | `#31756F` | 5.02:1 | the label for a `TEAL` series |
| `BLUE` | `#C3DCEB` | 1.36:1 | fill only, same rule as `TEAL` |
| `GLASS` | `#3A5D74` | 6.49:1 | lit glass, lit signal — the "installed / working" state |

**The fill/label pair rule.** `TEAL`, `BLUE` and `PAPER` are fills whose contrast is too low to carry
type. Every one of them has a designated label colour. A label may never take its own series' fill
colour — that is the `subsidy` defect, where a benchmark value was drawn in its own pale bar's colour
at 1.59:1.

### Accepted exception, recorded rather than fixed

`ALARM #B8492E` is **4.23:1 under deuteranopia** against a 4.5 target. `#AE4429` clears it at 4.52:1.
**The owner has chosen to keep `#B8492E`.** Recorded here as an accepted exception with its reason:
the token is aliased to `WARN` and used 12× as a literal besides, the change shifts the palette's
temperature across the whole piece, and the piece is not a safety-critical interface. It is not an
open defect and stages 3, 4 and 12 may not "fix" it.

---

## 3. Type — roles, real values, and the one loop that governs everything

Two families, both already loaded: **Libre Franklin** (sans) and **IBM Plex Mono** (mono). A serif is
referenced as `var(--serif)` in the page chrome for display type.

### The feedback loop, stated because every later stage trips over it

```
TK      = clamp(MIN_LABEL_PX / (BASE_LABEL * scale), 1, 3)
leading = size * TK * 1.32
MIN_LABEL_PX 7.7   BASE_LABEL 7.2   CON_TK 0.84   MIN_SANS 8.0   MIN_MONO 7.2
```

`TK` reaches **3.0** at 375px and **1.0** at desktop. **Every size below is an AUTHORED size, which
`typed()` multiplies by `TK`.** A stage that reads a number here and treats it as pixels will be wrong
by up to 3×. This is the single most common error against this file.

### Scale, by role

| role | authored | weight | family | tracking | notes |
|---|---|---|---|---|---|
| scene title | 19 | 700 | sans | −0.01em | one per scene, never two |
| big figure | 26–34 | 700 | sans | −0.01em | the number the scene exists to show |
| body / annotation | 11 | 400 | sans | 0 | the default; anything unmarked is this |
| sub-label | 9–9.4 | 400 | mono/sans | 0 | under a label it qualifies |
| axis / tick | 8–8.6 | 400 | sans | 0 | at `MIN_SANS 8.0`, the floor |
| eyebrow | 6.2–6.8 | 500 | mono | .14–.18em | uppercase permitted — this is the label case |
| console chrome | ×`CON_TK 0.84` | — | — | — | recreated-interface type, exempt from the floor |

### The mobile trade, stated as a trade

12 `audit.js` findings are mobile text under 7px, **all inside recreated phone and console chrome**.
Three clamp floors were measured and none makes that text both legible and contained at 375px, because
those devices are too small in stage units for the copy they carry. The six console scenes sit at their
exact prior baseline (`listen 2, grants 1, segments 3, subsidy 6, placement 2, privacy 4`). The owner
did not reopen the type scale this run, so this stays **documented, not fixed.**

---

## 4. Density and negative space

**Measured, this run, with `measure.js`'s `MEASURE` copied verbatim:**

```
59 scenes | stage aspect 1.054 | mean frame coverage 71.9%
content aspect: min 0.56 (cliff)  median 1.49  max 2.58 (tiers)
46 of 59 scenes are WIDER than the stage; 13 are taller
```

Coverage is exactly `min(c,A)/max(c,A)` for content aspect `c` and stage aspect `A`. The optimal stage
aspect is **1.520 → 79.9% mean**, and it was **rejected with numbers**: it buys 7.9 mean points by
making 20 scenes worse — `laws` 90→62, `notone` 81→56, `k280` 78→54, `loop` 73→51, `cliff` 53→37. The
losers are phone and console facsimiles that are tall because a phone is tall.

**Policy.** The stage aspect is fixed at 1.054. Density is corrected per scene, by composing content
toward the stage's near-square proportion — not by moving the stage. A scene at aspect 2.5 is a scene
that should have been two rows.

---

## 5. Motion — already set, not reopened

`T_ENTER 620ms`, `S_BEAT 80ms`, `CAMERA 900ms`; `E_ENTER easeCubicOut` (arriving decelerates),
`E_EXIT easeCubicIn` (leaving accelerates), `E_MOVE easeCubicInOut` (travelling between held
positions). `motion.js` reports CLEAN under both `no-preference` and `reduce`. Stages 3 and 4 may not
introduce a duration or curve outside this set.

---

## 6. FORBIDDEN LIST — binding on stages 3, 4 and 12

1. **No rounded rectangle as the primary carrier of an idea.** Repo standing rule. Chrome of a
   recreated real interface is the one legitimate exception, and the `.btn` CTA pill in the page
   chrome is chrome, not an idea-carrier.
2. **No new colour.** Section 2 is the complete set. 52 one-off hexes is already the problem (§7).
3. **No new duration or easing curve.** §5 is the complete set.
4. **No dark mode, no second theme.** One shared light system.
5. **No `TEAL`, `BLUE` or `PAPER` as a text colour**, and no label in its own series' fill colour.
6. **No `ACCENT #F37940` on body text** — 2.44:1. Large or decorative only.
7. **No `LINE #DCD5C6` as text** — 1.29:1.
8. **Do not "fix" `ALARM`.** Accepted exception, §2.
9. **Do not widen the stage or touch `fitBox`.** Measured and rejected, §4.
10. **No number treated as pixels.** Authored sizes are multiplied by `TK` up to 3×.
11. **No filling `room`'s frame.** The emptiness is the subject; the ledger argues it directly.
12. **No new runtime dependency, no build step, no web font.** The piece opens from `file://`.
13. **No figure without a citation**, except the recreated console that says so on screen.
14. **No `Z` on an open arc.** It draws a chord across it — the `quadrants` dish defect and the
    hand-rolled torn ovals, one act apart.
15. **No positioning from an assumed text width.** Measure it — `getComputedTextLength`, `getBBox` —
    and re-derive after `applyTypeScale` and after any clamp. Ten instances of this were fixed in one
    commit; five more were found afterwards.

---

## 7. Code vs the palette doc — every disagreement, counted

`docs/coethia-brand-palette.md` is **not the authority it appears to be.**

| | count |
|---|---|
| hexes declared in the doc | 37 |
| distinct hexes used in the code | **120** |
| declared but **unused** | 16 |
| used but **undeclared** | **99** (501 occurrences) |
| undeclared and used **exactly once** | **52** |

**16 declared-but-unused, and they are all one thing:** `#271C16 #283944 #293C31 #31241D #3E694F
#423327 #443328 #483930 #6C9C7F #72AC89 #8A7767 #A79C93 #B8CAD6 #BDB4AC #DCD4CB #E0A272` — the
espresso-era dark edition. The doc still documents a theme the piece no longer has.

**The 18 undeclared values actually carrying the design:**

```
#8A8474 x92   #2E6B2B x41   #C9C3B6 x27   #3A5D74 x26   #EFEAE0 x23   #55606A x19
#E74D4E x18   #6F6F6F x17   #3A4750 x17   #DCD5C6 x16   #E7F2F1 x15   #B9B2A4 x13
#B8492E x12   #DCEBF5 x8    #FBE3D2 x8    #5B7B9A x6    #C25236 x6    #141010 x5
```

Three specific findings in that list:

- **`#8A8474` is used 92 times and is not in the doc.** It is `DIM`, a real structural token. The most
  load-bearing colour in the illustrations is undocumented.
- **`#B8492E` appears 12× as a raw literal** although `ALARM` is a named constant, and `#DCD5C6` 16×
  and `#3A5D74` 26× likewise. **Token bypass**, which is why a one-hex palette change is not a one-hex
  edit — and part of why the owner's decision to freeze `ALARM` is the cheaper call.
- **`#2E6B2B` is used 41 times, undeclared and unnamed** — a green with no role in any document.

**52 values used exactly once is the real finding.** That is not a palette; it is ad-hoc picking, and
it is the strongest argument for forbidding new colours (§6.2) before Stage 3 starts adding geometry.

**Not fixed this stage, by scope.** Reconciling the doc is an edit and this stage makes none. Recorded
for the owner as the largest open design-system item in the repo.

---

## 8. A surface no instrument covers

The eight verification scripts — `audit`, `legible`, `boxes`, `motion`, `a11y`, `interact`, `measure`,
`syntax` — all measure `#viz`, the SVG. **The ~360 lines of page chrome CSS are measured by none of
them:** masthead, wordmark, `.kicker`, `h1`, `.deck`, `.step p`, `.btn`, `.methods`, `.creedlist`,
`.outro`, `.cta`, and the whole `@media print` block. `a11y.js` covers reflow and the accessibility
tree; it does not check the chrome's contrast or typography.

Found because `impeccable`'s mechanical detector was pointed at the file. It returned three findings
and **all three are false positives**, verified individually:

| finding | verdict |
|---|---|
| `low-contrast :hover 1.5:1 — #000000 on #212e36` | **False.** Composes a `@media print` `color:#000` with a screen `.btn:hover{background:var(--ink)}`. On screen the colour is `#FFFFFF` (≈13:1); in print the background is `none`. The combination cannot occur. |
| `all-caps-body on 57 chars` | **False.** `.kicker` — 13px mono, `.12em` tracking, one line. The detector's own description permits uppercase for short labels. |
| `tight-leading 1.16x` | **False.** `.deck` at `clamp(20px,2.4vw,30px)`, display type. Real body is `.step p` at **1.76** and `body` at **1.85**. |

The detector also had to be un-degraded first: it ran with `htmlparser2`, `css-select`, `css-tree` and
`domutils` missing, printed `[]`, and said so — *"findings are an undercount, not a clean bill of
health."* Installing the four into the skill's own `node_modules` (Node resolves from the script's
directory, not `cwd`) turned `[]` into three real evaluations. **An empty result from a degraded
instrument is not a pass**, and this one was honest enough to say so.

**So the finding is not the three false positives. It is that a 360-line surface has never been
measured**, and a detector with a 3-for-3 false-positive rate is still the only thing that has ever
looked at it.

---

## 9. Completeness pass

**Examined:** the full token block (lines 971–979, 3444–3446), the type-scale loop (1037–1085, 1488),
the motion tokens (909–962), all 120 distinct hexes with usage counts, the complete page-chrome CSS
(lines 42–360), `docs/coethia-brand-palette.md` in full, and the aspect/coverage of all 59 scenes.

**Not examined, recorded as uncovered:**

- **The 52 single-use hexes individually.** Counted and named as a class; not traced to a scene each.
  Doing so is the natural first half of a palette-reconciliation stage.
- **`#2E6B2B` (41 uses) and `#E74D4E` (18 uses) have no assigned role in §2**, because I could not
  determine one from the code without reading every call site. They are real tokens with no name.
- **Per-scene typographic hierarchy.** §3 gives the scale by role; whether each of the 59 scenes obeys
  it is Stage 12's job and is not asserted here.
- **The three other explainers in this repo** (`index.html`, `belief-based-communication.html`,
  `political-health-personas.html`) share the design system and were out of scope. They have never
  been measured by any instrument here.
- **Print stylesheet output.** Never rendered to paper or PDF; `@media print` is 60 lines of untested
  CSS.

**Changed in this stage: nothing but this file.** Gate is trivially satisfied — contrast ratios and
tiny-text count cannot move when no source line changed — and is asserted rather than assumed in the
ledger entry.
