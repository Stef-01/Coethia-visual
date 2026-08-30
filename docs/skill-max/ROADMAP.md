# Skill Max roadmap — the consolidated plan

One file, one ordered list. Each step is self-contained: a fresh session with no memory of the
conversation should be able to pick up the next unchecked step and finish it. **Do one step per run
and finish it completely** — a half-done step with a passing gate is worse than an untouched one,
because the ledger then claims ground that was not taken.

## Standing rules — these outrank every step below

1. **Exclusive ownership.** Before touching the repo: `git log -1 --format='%ci %h %s'` and
   `git status --short`. If HEAD moved inside this run, or files you did not touch are dirty, **stop
   and re-baseline.** A second agent worked this repo concurrently on 2026-08-28 and produced a
   43→37 reading that belonged to neither change.
2. **Never two Playwright runs at once.** They contend for one browser install and die silently,
   which reads as a pass because no findings emit. `audit.js`, `measure.js` and `interact.js` run
   strictly one at a time.
3. **`SETTLE` stays at 4500** in both `audit.js` and `measure.js`. The key in the scale scene turns
   340° over 2600ms and a rotating object's bbox changes throughout the turn. Lowering this
   reintroduces mid-flight measurement, which hid a real 57-unit frame overflow on `r0` for months.
4. **Gate every step.** `node audit.js` then `node interact.js`. Hard metrics: text collisions,
   sub-7px count, frame overflow, console errors, NaN geometry, empty stages, page overflow. Any
   regression → revert that step, do not argue with it. Two consecutive reverts → stop and report.
5. **The repo's own rules win.** No rounded rectangle as the primary carrier of an idea. One shared
   light design system. Real cited figures except the recreated Ads console, which says so. The
   accessible surface — `role="group"`, focusable persona columns, the data table,
   `prefers-reduced-motion` on the largest camera moves — is not negotiable.
6. **Append to `LEDGER.md` after every step**, including the mandatory *Uncovered* field. A step with
   no ledger entry did not happen.
7. **Remotion never enters the explainer's dependency graph.** It lives in `video/` with its own
   `package.json`. The piece opens from a `file://` URL with no build step; that is the property the
   whole thing is built around.

## Where it stands right now

```
HEAD 96c8a50
audit    59 scenes, 6 findings {tiny-text: 6}, zero collisions, 0 console errors
interact 12/12 pass
fitter   node measure.js --verify prints IDEMPOTENT
fleet    35/35 required skills present
```

Done: the suite restored and made honest; a convergent fitter; two frames off the type-scale ceiling;
settle past the slowest entrance; four named easing curves; one duration scale and three staggers.

---

## Progress — the single source of truth for "what's next"

Update this table at the END of a step, only after its gate passed and its ledger entry is written.
A step is `DONE` when the gate passed; `REVERTED` when it was tried and its gate rejected it — which
is a real outcome and must not be relabelled; `BLOCKED` when it cannot proceed and why.

| # | step | status |
|---|---|---|
| 1 | `CON_TK` — close the last six findings | REVERTED — measured, documented as an exemption |
| 2 | Remotion project as a sibling | DONE |
| 3 | Prototype remaining motion, port the numbers | DONE — 47/47 inside budget |
| 4 | New scenes | BLOCKED — needs owner direction, see ledger |
| 5 | Publish `stef-skill-max`, switch to pointer | DONE |
| 6 | Finish the fitter's review | DONE |
| 7 | The four scenes that do not converge | DONE — all four at residual ≈0 |
| 8 | Stage 11 — accessibility | PARTIAL — colour+reduced-motion done; hands-on tier outstanding |
| 9 | Stage 12 — adversarial taste QA | PARTIAL — 59 shots captured, 2 real defects found by looking |
| 10 | Stages 1–4, only if 9 justifies them | TODO |
| 11 | Close out | DONE — see RESULT.md |

---

## Step 1 — Close the last six findings: the `CON_TK` conflict

All 6 remaining findings are one piece of arithmetic. `TK` is solved so base-7.2 text lands exactly
on `MIN_LABEL_PX` — measured, 7.2 × 2.372 × 0.4508 = **7.70px**, the floor, precisely. Then
`CON_TK = 0.84` multiplies *after* it: 7.70 × 0.84 = **6.47px**, which is what `segments`, `listen`,
`placement` and `grants` measure. **The floor and `CON_TK` are mutually exclusive by construction.**
No value of `CON_TK` below 1.0 satisfies the floor.

Do the measured option first: replace `MIN_LABEL_PX = 7.7` with a floor solved for the console, the
tightest consumer — `PX_FLOOR = 7.0` and `TK = clamp(PX_FLOOR / (BASE_LABEL · CON_TK · sc), 1, 3)`.
Console text then lands at 7.00px and non-console text at 8.33px, which is above its own floor and
therefore harmless. Reference `CON_TK` inside `computeTK()` rather than folding it into a constant so
the two cannot drift.

Also correct the comment above `CON_TK`. It is wrong three ways and its arithmetic is why nobody
caught this: it assumes a 375px stage (the stage is **339px** — that was the viewport), derives
`sc = 0.499` from it (measured **0.4508**), and assumes `TK` pins at 3 on a phone (measured **2.372**;
`TK` only pins at 3 when `sc ≤ 0.3565`).

**Gate.** Sub-7px count → 0. Collisions stay 0. Frame overflow stays 0. Then re-fit and re-audit,
because ~8% larger mobile type changes every extent. **If collisions appear, revert** and take the
second option instead: exempt the recreated-console islands from the floor explicitly, document the
exemption in `docs/coethia-brand-palette.md`, and raise `audit.js`'s threshold for those six scenes
only — a documented exemption is honest, a silent 6.47px is not.

## Step 2 — Stage 14a: the Remotion project, as a sibling

`npm create video@latest` (or `remotion-create`) into `video/`, its own `package.json`, added to
`.gitignore`? No — commit it, it is a deliverable. Load `remotion-best-practices` first; it routes.

Build one composition that reproduces an existing scene's entrance — `five` or `weeks`, both of which
have real staggers — using the same token values (`T_ENTER 620`, `S_BEAT 80`, `E_ENTER`). The point is
a side-by-side: the composition and the scene should feel identical. If they do not, the tokens are
not describing what the page actually does and that is the finding.

**Gate.** `git diff` touches nothing outside `video/`. The explainer still opens from `file://` with
no build. `node audit.js` unchanged — if it moved, something leaked. Two renders of the same
composition produce identical hashes.

## Step 3 — Stage 14b: prototype the remaining motion, port the numbers

Three entrances are still over the 1200ms budget (worst 1245ms) and two sweeps are exempt by
assertion rather than by inspection. In `remotion-studio`, step them frame by frame — which is the
thing a scroll-driven page cannot do and the reason the piece had 25 durations in the first place.
Decide each one where it can actually be seen, then port the frame numbers back.

**Gate.** Every entrance inside 1200ms, checkable from source by `delay + (n−1)·stagger + duration`.
`audit.js` unchanged. `interact.js` 12/12. Ported timings match their composition by arithmetic:
frames ÷ fps = the duration in the page.

## Step 4 — Stage 14c: new scenes

New scenes are authored **in the page's own idiom** — its drawing kit, its type scale, its standing
rules — not as embedded video. Remotion's contribution is that a new scene's motion arrives with real
timings instead of placeholders.

Before drawing anything, read `docs/PLAN-faster-than-the-rumour.md`. It records the founder's verdict
on the previous version and the eight named faults; a new scene that reintroduces one of them is worse
than no new scene. In particular: no rounded rectangles carrying meaning, and no scene that starts at
the vendor rather than the issue.

**Gate.** Each new scene passes Step 1's floor, the collision check, and Stage 11's accessibility walk
in its own right. Being new exempts nothing.

## Step 5 — Publish `stef-skill-max` and switch this repo to the pointer

```
gh repo create stef-skill-max --public --source ~/stef-skill-max --push
~/.claude/skills/stef-skill-max/scripts/vendor-into-repo.sh ~/Coethia-visual
cd ~/Coethia-visual && ./.claude/skills/stef-skill-max/scripts/bootstrap.sh
```

The vendored copy here is currently `--full` because `Stef-01/stef-skill-max` does not exist yet, so
the pointer would be a broken promise. Once it exists, the default `--link` mode makes every repo that
points at it track one shared copy.

**Gate.** `bootstrap.sh` resolves and prints a path. `preflight.sh` from that path reports 35/35. Note
that `CLAUDE.md` is gitignored in this repo, so the trigger block stays local — the skill still travels
because `.claude/skills/` is tracked and the skill's own description is what fires it.

## Step 6 — Finish the fitter's review

One of six lenses (`render-semantics`) and eight of nine refuters never ran — a session limit killed
them, so that half of the review is missing, not clean. Re-run them. Then address what survives, and
add the one confirmed finding still outstanding: **the process exits 0 however many scenes were
refused or failed to converge.** Add `--strict` for CI; keep the default at 0 so nothing breaks.

Two claims from the dead refuters are worth resolving on their own merits: that `SETTLE` is still
shorter than something (it is now 4500 — check against the new token values), and that an un-reseeded
global PRNG makes `F` impure via visit order. The second is testable: run `--only=X` twice with
different preceding scenes and diff.

## Step 7 — The four scenes that do not converge

`subsidy` (resid 24.4), `map` (17.8), `quadrants` (18.3), `lenses` (11.2). For these, extent is not
purely a function of `TK`, which means something in them is positioned *from the frame* — so the 1-D
fixed point the fitter solves is an approximation there. Find what it is: candidates are the provenance
stamp (already excluded), `drawConFrame`, `layoutDash`, or anything reading `svg.attr('viewBox')` at
draw time. Either make it frame-independent or document the limitation with the scene list, in
`measure.js` where the model is described.

## Step 8 — Stage 11: accessibility, properly

`accessibility-scan` then `accessibility-inspect` (keyboard, focus order, screen-reader names and
roles), plus `color-accessibility-audit`, whose `scan_svg.py` checks fill/stroke contrast on inline
SVG and simulates protanopia, deuteranopia and tritanopia — which is exactly the manual work in
`docs/coethia-brand-palette.md`, automated.

Specifically re-verify what the motion work touched: **`E_EXIT` is new**, so every exit needs a
reduced-motion check it has never had. And confirm the largest camera moves still degrade to an
instant correct final state rather than a broken half-state.

**Gate.** Reduced-motion run produces the correct final state for every scene. Keyboard traversal
reaches every interactive element. Contrast and CVD separability at or above the documented floor.

## Step 9 — Stage 12: adversarial taste QA

`audit-ai-design-slop` and `frontend-design-review` against fresh screenshots, plus gstack
`design-review` if present. Use `stitched-full-page-capture` — a naive screenshot of a scroll page
returns one scene.

Output is a **ranked queue, not a set of edits**. Fix the top items; anything larger becomes a named
follow-up rather than an unplanned Step 10.

## Step 10 — Stages 1–4, only if Step 9 justifies them

Narrative and direct labelling, aesthetic direction, per-scene composition, drawn things instead of
boxes. These were deferred on evidence: desktop was 2 findings in 59 scenes, so there was no measured
composition problem. If Step 9's eyes find one the metrics cannot see, that is when these run — with
its findings as their scope, not as a general pass.

## Step 11 — Close out

`docs/skill-max/RESULT.md`: the before/after metric table, one line per step on what it actually
bought, everything deliberately not done, and the honest verdict including anything that got worse.
Then re-read this roadmap and delete what is finished.
