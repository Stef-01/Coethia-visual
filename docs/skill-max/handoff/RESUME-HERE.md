# Resume here

Written at the end of a session that ended without a commit, because the machine ran out of
processes. Everything below is on disk in the working tree. Nothing is lost and nothing is committed.

## First, three commands, in this order

```bash
cd ~/Coethia-visual
node syntax.js                       # ~0.1s. If this fails, nothing else means anything.
node legible.js --all-views          # must print "measured N painted labels", not just a verdict
node audit.js && node interact.js && node boxes.js && node motion.js && node a11y.js
node measure.js --verify --strict    # slowest by far; run it last
```

`syntax.js` is new this session and exists because a syntax error in this file is invisible to every
check that does not execute it. See LEDGER "the check passed a blank page".

## Why the session stopped — and this was diagnosed WRONG twice

The symptom is real and it recurred three times: Chromium cannot start, then the shell cannot fork at
all, and `echo` fails. What was written here before was that it was **self-inflicted** — dozens of
background Bash tasks and Monitor loops launched and killed, leaving 2048 zombies. That was wrong, and
it is worth correcting rather than quietly overwriting, because the wrong cause implies the wrong
remedy and "use fewer background tasks" was never going to fix this.

Measured, finally:

```
$ ps -u $(id -u) | wc -l                      # 2673
$ grep -c "^Z" ps.txt                         # 2062 zombies
$ awk '/^Z/{c[$2]++} END{for(p in c) print c[p], p}' ps.txt
  1810 2087    /Applications/Pioneer/FwUpdateManager/.../FwUpdateManagerd
   252 2074    /Applications/Pioneer/DDJ-FLX10/.../DDJ-FLX10 AutoLauncherd
```

**Both parents have been up 41 days.** Two Pioneer DJ-controller daemons fork a child — a device poll
or a firmware check — and never `wait()` on it. A zombie holds its PID slot until its parent reaps it,
so over 41 days these two have taken 2062 slots out of the table and never given one back.

So the table was already ~2062 short before this project launched a single process. Chromium wants
dozens of PIDs per instance and `audit.js` runs it across 59 scenes at two widths, which is what pushed
it over — but the headroom had been eaten by something with nothing to do with this repo. That also
explains the part that never fitted the old story: it "recovered when orphaned tasks were reaped", i.e.
reclaiming my own **live** processes helped, while the zombie count never moved.

**The remedy** is to reap them, which only their parent can do — so kill the parent and `launchd`
adopts and reaps the orphans:

```bash
kill 2087 2074      # PIDs change; re-derive them with the awk line above
```

Both are launch agents and macOS restarts them; a fresh instance starts with zero zombies. Nothing is
lost. It will come back, because the leak is in those daemons and not in anything fixable from here —
so expect to do this again, and check the zombie count FIRST next time rather than assuming the cause.

Being careful with background tasks is still right, and it is no longer the explanation.

## State of the artifact

`faster-than-the-rumour.html` — **uncommitted, passes `node syntax.js`.**

Last trustworthy measurement, taken after the syntax error below was fixed and the liveness assertion
was added:

```
scenes: 59
measured 2037 painted labels across 118 scene-views
findings: 51  {"speckled":35,"straddled":6,"low-contrast":6,"occluded":4}
```

48 mobile, 3 desktop. **This is the real number.** An earlier report of "CLEAN, 87 → 0" was false —
see below.

One change was made AFTER that measurement and is therefore unverified: `clampPhoneText`'s floor was
moved from `MIN_LABEL_PX` back to `1/TK` (the authored size). Expect the six `counterpost`/`comments`
`straddled` and `low-contrast` findings to disappear and the mobile tiny-text count to stay at its
baseline 6, but **that has not been confirmed.** Confirm it before anything else.

## The false CLEAN, so it is not repeated

An edit moved a label in `descent` so it would paint after the data points. The line it moved was the
`if` branch of an `if (nar) ... else { ... }`, so removing it left the `else` orphaned. The page's
entire inline script stopped parsing; nothing rendered. `legible.js` walked all 59 steps (they are
static HTML), found zero painted labels, had nothing to report, and printed
`CLEAN - every label is readable against what is behind it` with exit code 0.

The positive control did not catch it: that control points at a copy of the artifact from before the
fixes, which rendered fine. **A control that exercises the check cannot tell you the subject arrived.**

Both holes are now closed — `syntax.js`, and a liveness assertion in `legible.js` that prints the
painted-label count on every run and exits 2 with `NOT MEASURED` if the page did not render. Verified
by deliberately re-breaking a throwaway copy: exit 2 broken, exit 0 good.

## What is fixed and verified

Every one of these was confirmed by eye before editing, and all of them reproduce on the pre-fix copy
(`git show HEAD:faster-than-the-rumour.html`) when `legible.js` is pointed at it via `LEGIBLE_URL` —
20 findings there, which is the evidence that the fixes are real rather than the check being blind.

| scene | defect |
|---|---|
| `sequelae` | SSPE leader drawn through the "0" of its own "yr 4-10" tick; terminal dot unlabelled. Drop moved to the end of the axis, dot labelled `death` |
| `r0` | dust ring occupies radius 150-192 and MEASLES / "R0 12-18" were placed at 190 / 196, i.e. inside the band |
| `trap` | four annotations right-aligned into a 48-unit gap needing 117; "Correct this" pill overlapping the phone; the four-click line drawn inside the phone |
| `desk` | keypad `Math.floor(k/3)*0` — nine dots on one row; a handset cord ending in mid-air; the "pen" a bare line |
| `quadrants` | level beam with unequal pans; post spiking through its own fulcrum; each dish closed with `Z`, drawing a chord across it; a stray arc; a route stopping 13 units short of the clinic |
| `facets` | chips showed each facet's ABSENCE category — a struck-through card, an empty box; infant cradle arc scaled on y only |
| `mandate` | circling annotation ran through the words; then, after the fix, an ellipse whose tapering ends cut the ascenders — now sized from `getComputedTextLength`, desktop-only |
| `tiers` | ascent line floating 20+ units clear of the cards at both ends |
| `room` (×5) | "BED" on paper, "4" on the dark window at 2.3:1 |
| `middle` | a person glyph printing through "free."; two sub-labels rendering as "persuadedreachable" |
| `money` | a bare diagonal at the FY2026 bar, under a comment claiming a "stack being sliced" |
| `ledger` | slider track beginning exactly at the card's right edge, half the handle inside the card |
| `reach` | "Following" white-on-white at 1.00:1; verified badge at `p.n.length * 5.3` |
| `subsidy` | a benchmark value drawn in its own pale bar's colour at 1.59:1 |
| `k280` | the classroom card's bottom border running through the "Now all of them" button |
| `privacy` | ALL THREE cards' body text overflowing on desktop — `wrapFor` had `if (!isNarrow()) return null`, so nothing wrapped at desktop, force or not |
| `descent` | the end label colliding with "the walker who walks off it", placed at that same point |
| `gaps` | desk labels left at full opacity while the objects they name dimmed to .16 |
| `axes` | quadrant names painted BEFORE the hundred figures that fly into them |
| `counterpost` | five runs of text spilling off the phone onto the paper at mobile |
| `gate` | bar label bursting its bar; bar now sized from the measured label |

## The open question, which is a composition call and not a defect list

Most of the 48 mobile findings share one root cause: **`typed()` scales every label by TK (up to 3 at
375px), and a recreated device is a fixed width that does not scale with it.** An 11-unit headline
becomes 26 units of type inside a 232-unit phone screen.

Three floors for `clampPhoneText` were tried and each was measured:

| floor | desktop | mobile |
|---|---|---|
| none | audit 6 → 15, DESKTOP tiny-text appears in counterpost and reach | contained |
| `MIN_LABEL_PX` | fixed | text stops at 7px and overflows onto paper — counterpost/comments at 1.2:1 |
| `1/TK` (authored size) — **current** | fixed | contained, and the chrome renders at 4-6 physical px |

**None of them makes the text both legible and contained**, because those devices are too small in
stage units for the copy they carry. The resolutions are compositional and each has a cost:

1. **Widen the devices at mobile.** Blocked as drawn: a phone wide enough (≈380 units) would be ~825
   tall and the mobile frame is ~795.
2. **Tighten the mobile frames.** `measure.js` fits frames to content extent, and the captions above
   and below the phone are what set the width, so this means moving them.
3. **Shorten the phone and console copy at mobile**, and wrap it. `wrapFor` now honours an explicit cap
   at any width, and `privacy` shows the pattern: draw, measure with `getComputedTextLength`, and only
   wrap if it actually overflows. This is what a real phone UI does and is the recommended route.

The current floor is a holding position, chosen so the residue stays visible to `legible.js` rather
than settled by whichever setting quiets the checks.

## Also open, unchanged from before this session

- `ALARM` `#B8492E` is 4.23:1 under deuteranopia against a 4.5 target; `#AE4429` clears it. A one-hex
  change that shifts the palette's temperature — owner's call.
- ~41% mean frame emptiness on desktop: `fit()` forces stage aspect 1.054 on wide-short compositions.
- `visual-motion-pass`: **merged**, per-hunk rather than wholesale — see
  `docs/skill-max/handoff/merge-visual-motion-pass.py` for which side won each of the nine hunks and
  why. Landed: the masthead rebrand across all four pages, `overscroll-behavior-x`, and the personas
  blank-opening fix. Not landed: the branch's case-study restructure, because main had already fixed
  two of its three complaints by measuring rather than by the branch's guessed constant.
- **Still open from that branch, and it is a measurement not an opinion:** the branch's note that
  `case`'s 940×700 frame letterboxes ~130px top and bottom, because a 940×700 viewBox in a pane taller
  than it is wide is width-bound. `measure.js` is the instrument for that, and it has not been pointed
  at the belief piece's case frames. If it confirms the letterboxing, the fix is a taller frame AND the
  layout to fill it — they are one decision, which is why half of it was not landed.
- Step 4 new scenes: blocked on editorial direction.
- The six mobile `tiny-text` audit findings: the documented `CON_TK` exemption. Reverting it cost 11
  collisions when measured, and that is recorded.

## New files this session, all uncommitted

| file | what it is |
|---|---|
| `syntax.js` | parses the inline script, 0.1s, maps errors to HTML lines. Run it first, always |
| `shot.js` | shoots ONE scene at ONE width at 3×, for when a single finding is on the table and the question is whether it is real. `audit.js --shots` is the tool for a sweep; this is the tool for a verdict. `K=comments,placement W=375 O=/tmp node shot.js` |
| `legible.js` | text- and control-against-graphics legibility: `occluded`, `speckled`, `straddled`, `low-contrast`, `clipped-control`. Self-verify pass, `LEGIBLE_URL` for positive controls, liveness assertion |
| `audit.js` | modified — `--shots` now writes BOTH widths. Desktop-only screenshots are why mobile had been examined a fraction as much |
| `docs/skill-max/LEDGER.md` | +~450 lines |
| `docs/skill-max/ROADMAP.md` | steps 12 and 13 added; step 9 marked superseded |

The `stef-skill-max` skill and its published repo are committed and pushed — two commits, the
text-vs-graphics metric and the liveness rule.

## Commit message

`docs/skill-max/handoff/COMMIT-MSG.txt`, in the repo rather than in a scratch directory that a reboot
takes with it. Do not commit until `syntax.js` passes **and** the gate has run on a page confirmed to
render — those are two conditions, and the second one is the one that was skipped last time.

---

# Second pass — 51 findings down to about 7

Everything below was applied after the measurement above, each one verified by a targeted
`node legible.js --only=<scene> --all-views` run. **What has NOT been run since is a full sweep, or
audit / interact / boxes / motion / a11y / measure.** The per-scene results are real; the whole-file
result is not yet established. Start with the three commands at the top of this file.

The shell became unusable again at the end (same fork exhaustion), which is why this stops here rather
than at a commit.

## Applied and verified per scene

| scene | was | fix |
|---|---|---|
| `counterpost` | ~10 | the clamp's floor moved back to the authored size. `MIN_LABEL_PX` had let captions stop at 7px and spill onto paper at 1.2:1 — legible SIZE on the wrong background is not legible |
| `ledger`, `arithmetic` | 6 | `mono()` gained an optional container width; its wrap point came from a hardcoded 600-unit budget, wrong for a 480-unit card. Eyebrows authored shorter at mobile rather than wrapped into the inventory blocks beneath them. Body lines measured, and the second placed from the first's line count |
| `daisy` | 4 | headline wrapped clear of the room's window (its "2025" was sitting on #22304D navy); tag text measured to its card; card heights derived from the wrapped line count and the two cards stacked from those heights instead of a fixed +104 |
| `cliff` | 3 | halo on the R-number eyebrow; the control-chrome exclusion extended to FILLS, so a button's own play glyph no longer reports against its own label; slider tick labels moved down at mobile, where the thumb does not scale with the type and was covering the number it reports |
| `listen`, `grants`, `segments`, `subsidy`, `privacy` | 5 | halo on the `?` in the help ring — a glyph centred in an r=8.5 circle that does not scale with TK |
| `subsidy` | 2 | benchmark bars start at CX0+210 on a phone. The label column is 150 units and "Search interception" paints ~183, so the bar covered the end of its own row label |
| `parent` | 2 | note widened to 132 units at mobile and the label measured to `noteW - 12`, so the note and its text cannot drift apart; both labels haloed in the note's own `#3A2B22` |
| `afterwords` | 1 | punchline measured to `pw - 20` and both lines lifted to clear the hand, whose path starts at `py+ph-40` |
| `states`, `cases`, `r0`, `law`, `decided` | 6 | paper halos where a label sits inside a field of marks; `decided`'s annotation wrapped at desktop too and lifted, since centred between the two lanes it reached far enough into the department lane to print over the Management pill |
| `measure` | 1 | halo on the `$` inside its coin ring |
| `trap` | 1 | halo on "Follow", in the screen's own dark rather than paper |
| `segments` | 1 | surface bars start at px+96 on a phone for the same reason as `subsidy` |
| `placement` | 1 | the Ad badge is measured to its label and inserted behind it — see the note below |

## Still open — two findings, and both are the instrument

`gaps`, `oldnew`, `parent` and `afterwords` are done and are in the table above. What is left is two
findings that were each rendered at the reported position and cropped, and neither is a defect in the
page. **Diagnose the instrument; do not bend the scene to satisfy it.** A check that is wrong twice and
gets "fixed" by moving the artwork has taught the artwork to lie.

Both are now confirmed at **375px**, which is the width the findings are reported at and not the width
the earlier waivers were checked at. Images committed at `docs/skill-max/evidence/`:

- **`placement`** — `low-contrast 1.00:1`. The render shows dark type on a WHITE badge, visibly wider
  and taller than the words, clear margin on all four sides.
- **`comments`** — `speckled`, 53 sq px "inside the word". The line is clean; the avatar circle is well
  left of where the text starts, and the reported bbox maps to empty sheet past the end of the line.

**Do not attempt either of the two obvious fixes. Both were tried, measured, and reverted:**

| tried | why it looked right | what the control said |
|---|---|---|
| `covering` filtered on the ink box instead of the line box | the file argues at length that a line box carries leading the glyphs do not use, then uses `t.r` in the one filter that decides what the background IS | did not clear `placement`; ADDED a false `cliff` finding |
| `speckled` requires the mark's centre in the band | the mode claims a dot appears BETWEEN TWO LETTERS, and `ovCore >= 5` is a 2.2×2.2 patch | did not clear `comments`; DELETED a true positive — `middle`'s person glyph, 18×10, straddles the ink box's bottom edge so its centre is outside. Control 20 → 19 |

The `placement` render also rules out coverage as the cause: the badge covers the ink box with margin on
every side, so `inter(core, badge)/coreArea` is 1.0 and the badge is missing from `covering` for a
reason that is not geometric. What is left is collection-time — the badge never entering `shapes`, or
entering with an `idx` that puts it in `overs`.

**Measure it; do not read it.** Three sessions of reading this file have produced three wrong answers
about this one label. One `page.evaluate` that prints the badge's `idx`, `cover` and
`inter(core, sh.r)/coreArea` settles it.

## The unparsed edit — resolved

The `gaps` halo (`#FBE3D2` rather than paper) was applied with no shell, so nothing had parsed it. It
parses: `node syntax.js` now reports `OK - 4 inline block(s), 393,310 chars, all parse`.

Worth keeping the reasoning, because it was the right shape of argument and it was still not sufficient:
a balanced statement swapped for a balanced statement cannot change whether a file parses, and that is
true. It is also exactly what was believed about the edit that orphaned an `else` and stopped the whole
page parsing while a check reported CLEAN. The claim was sound and the previous claim had been sound
too. **Run the 0.1s check anyway.** An argument about a file is not a measurement of it.

## One instrument change made in this pass

`legible.js`'s control-chrome exclusion now covers fills as well as strokes. A control's pill, its glyph
and its label are siblings inside the control's group, so `contains` does not relate them; a shared
interactive ancestor does. Without it, `cliff`'s "Seed one case" reported against the play glyph drawn
inside that same button.

The positive control has not been re-run since these changes. Run it:

```bash
LEGIBLE_URL="file:///tmp/prefix.html" node legible.js --only=r0,sequelae,trap,room,middle,arithmetic,k280,mandate,privacy,descent
```

extracting the pre-fix copy first with `git show HEAD:faster-than-the-rumour.html > /tmp/prefix.html`.
It found 20 findings there before this pass; it must still find them, or a fix has quietly broken the
check rather than the defect.

