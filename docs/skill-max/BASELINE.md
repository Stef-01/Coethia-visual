# Stage 0 — baseline (re-established 2026-08-29)

**The first baseline in this file was invalid and has been replaced.** It was captured while another
agent session was editing the repo, against camera frames computed by a version of `measure.js` that
mis-measured clipped and transformed geometry. Its headline number — 43 findings, 34 text collisions —
described a state that no longer exists and was never a clean read. The analysis it produced about the
type-scale arithmetic survives and is kept below; the counts do not.

## Repo state this baseline was taken against

```
HEAD  af95cd2  2026-08-28 20:07:19 -0700   "Stop clipped geometry from driving the camera frame"
 M  audit.js                    uncommitted, another session's CTM fix — kept, not touched
 M  measure.js                  uncommitted, same fix + PAD 26 -> 34 — kept, not touched
 M  faster-than-the-rumour.html this pipeline's revert of a rejected label change
```

Verified quiescent before measuring: HEAD 5.5 hours old, no `node` process running against the repo,
all three suite scripts parse, and the other session's `userBox()` helper is defined *and* called in
both files — complete work, not a mid-edit.

Their fix matters to every number here. `getBBox()` reports a bbox in the element's **own** user space,
so anything inside a transformed group was measured in the wrong place — the route cards are
`translate(500, y)` groups whose children report `x −204..204`, so the camera was fitted from −212
instead of 290. `userBox()` composes the screen CTMs to map into svg user space instead. Combined with
their committed fix for content *clipped by* a `<clipPath>` (which `getBBox()` also reports unclipped),
the phone frames shrank dramatically — `comments` 1033 → 435 units.

That is the whole reason the collision count collapsed. Tighter frame → larger render scale → lower
`TK` → less type inflation → the overlaps disappear. **Most of what looked like a labelling problem
was a measurement problem.**

## Findings — 13 across 59 scenes

| Metric | Desktop 1440×900 | Mobile 375×780 |
|---|---|---|
| Text collisions | **2** | **2** |
| Text under 7px | 0 | **7 scenes** |
| Frame overflow | 0 | **4** |
| Console errors | 0 | 0 |
| NaN / Infinity geometry | 0 | 0 |
| Empty or near-empty stages | 0 | 0 |
| Horizontal page overflow | 0 | 0 |

### Collisions — 2 sites
- `segments` desktop, 2×: `+ vaccine exemption fo / Audiences built on a s`, `+ free clinic near me / Audiences built on a s`
- `subsidy` mobile, 2×: `QUALITY SCORE / EQUAL-RANK BID` twice

### Frame overflow — 4, newly *revealed* rather than newly caused
`twoclocks` L11 R35 · `decided` L53 R35 · `map` R6 · `backtotheroom` R118

These are true positives that the old coordinate handling hid: content genuinely outside its frame was
being measured into the wrong space and read as inside. They are the fitter's job, not a layout bug.

### Text under 7px — 7 scenes
`subsidy` 6 of 27 · `privacy` 4 of 17 · `segments` 3 of 29 · `listen` 2 of 19 · `placement` 2 of 24 ·
`grants` 1 of 18 · `backtotheroom` 1 of 6. `decided` and `quadrants` dropped off with the frame fix.

## The type-scale arithmetic — carried over, still holds

Measured directly on every sub-7px node. The comment at line 955 is wrong on three counts:

| Comment claims | Measured |
|---|---|
| "a 752-unit frame into a 375px stage" | the stage is **339×467** — it used viewport width, not stage width |
| "so sc is 0.499" | **0.4508** |
| "TK is pinned at 3 on a phone" | **2.372** in console scenes; `TK = clamp(7.7/(7.2·sc), 1, 3)` pins at 3 only when `sc ≤ 0.3565` |

And the mechanism it misses: `TK` is solved so base-7.2 text lands *exactly* on `MIN_LABEL_PX`.
Measured: 7.2 × 2.372 × 0.4508 = **7.70px**, the floor, precisely. Then `CON_TK = 0.84` multiplies
after it. 7.70 × 0.84 = **6.47px** — exactly what the probe reads in `segments`, `listen`, `placement`
and `grants`.

**The 7px floor and `CON_TK` are mutually exclusive by construction.** No value of `CON_TK` below 1.0
can satisfy the floor as currently composed. This is arithmetic, not tuning, and it is the entire
remaining Class B story now that the frame fix has removed the frames that were too wide.

A third, undocumented factor: the provenance stamp carries `data-tk="0.55"` at base 10.5, landing at
5.78–6.18px. Covered by neither `CON_TK` nor the comment.

## Fingerprint

| Metric | Value |
|---|---|
| Scenes | 59 |
| Animation call sites (`.transition()`) | 32 |
| Distinct durations (ms) | 460, 500, 520, 600, 640, 700, 760, 900, 1100, 1300, 1400, 2600 |
| Distinct easing curves | `easeCubicOut` ×12, `easeCubicInOut` ×3, `easeLinear` ×1 |
| Dependencies | d3 v7.8.5 vendored + CDN fallback; Google Fonts (Libre Franklin, IBM Plex Mono) |

## Handoff

Stage 5's worklist is now small and specific: re-fit the 4 overflowing frames, resolve the
`CON_TK`-versus-floor conflict for 7 console scenes, and fix 2 collision sites. Stage 6's case is
unchanged — 32 transitions across 59 scenes, 12 unrelated durations, one curve doing every job.
