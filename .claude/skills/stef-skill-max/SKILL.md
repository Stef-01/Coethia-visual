---
name: stef-skill-max
description: >
  Runs the whole design and motion skill fleet over one visual artifact, one skill at a time, in an
  order where each stage compounds on the last instead of overwriting it. First writes a comprehensive
  staged plan for the specific target, then executes it stage by stage with a measured gate between
  every stage. Use when the user says a visual, page, deck, chart, explainer or app "looks clunky",
  "looks ugly", "has overlapping content", needs a full design pass, needs the animations fixed, or
  asks to run all the design/animation skills, do a maximum-effort polish pass, or "skill max" /
  "stef skill max" anything.
---

# Stef Skill Max

A conductor, not a performer. This skill does almost no design work itself. Its job is to make
thirteen specialist skills act like one long, disciplined pass over a single artifact, where stage
N+1 reads what stage N decided and pushes it further, and nothing silently undoes earlier work.

## The two failure modes this exists to prevent

1. **Fleet thrash.** Ten design skills invoked ad hoc each optimise a different axis and overwrite
   each other. Motion advice arrives before the layout is stable; typography is retuned after the
   camera frames were fitted to the old type. Net movement: zero, or negative.
2. **Unmeasured taste.** "Looks better now" with no baseline. Every claim of improvement in this
   pipeline must survive a re-run of the target's own verification, or it gets reverted.

## Non-negotiables

- **Ground truth before opinion.** Stage 0 makes the target's verification loop actually runnable and
  captures a baseline. If there is no way to measure the artifact, build one before touching pixels.
  Never start at stage 1 because stage 0 looked like plumbing.
- **One stage at a time.** Never run two stages in the same turn. Never invoke two of the fleet skills
  concurrently. The whole value is serialisation.
- **Every stage passes a gate.** Re-measure after each stage. A stage that regresses a hard metric is
  reverted, not argued with. See `references/gates.md`.
- **Everything lands in the ledger.** One append-only file, `docs/skill-max/LEDGER.md`, is the handoff
  channel between stages. A stage that writes no ledger entry did not happen.
- **Report honestly.** If a stage found nothing, say so. If a stage was skipped because it does not
  apply to the target, record why. Never pad the ledger to make the pass look thorough.
- **The fleet is a manifest, never an assumption.** `fleet.tsv` is the single source of truth for
  which specialist backs which stage. A skill named anywhere in this pipeline without a row in that
  file is a bug. A stage whose specialist is absent is marked SKIPPED with that as the reason — never
  quietly performed by your own judgement and reported as done.

## Stage −1 — preflight

The first action of every run, before reading the target:

```bash
scripts/preflight.sh
```

It reports how many of the 29 required fleet skills are present, which are missing and from where,
which optional skills this environment happens to have, and whether the two repo-level npm
dependencies are installed. `--install` adds the missing ones; it runs serially because concurrent
`skills add` invocations race, and each re-clones its source, so it takes minutes rather than seconds.

Then read the target repo's own `CLAUDE.md`, README, and any design-system or standing-rules
document, and carry those rules into `PLAN.md` verbatim. **They outrank every stage below.** A
vendored pipeline arriving in an unfamiliar repo is a guest; a standing project rule is the
accumulated judgement of people who know the artifact better than you do.

Missing skills are a planning input, not a blocker. Say plainly which stages are degraded before
starting, so nobody reads the close-out as a complete pass.

## Phase A — recon, then write the plan

Do not invoke any fleet skill during Phase A.

1. Read the target. Identify: rendering technology, how many distinct scenes/screens/views, what
   drives transitions, what verification already exists, and whether it runs.
2. Take the measurements that name the problem numerically. Examples that have earned their place:
   count of animation call sites vs count of scenes; the set of distinct durations in use; the set of
   distinct easing curves; overlapping-text findings; text below the legible pixel floor; console
   errors per scene; external dependencies.
3. Write `docs/skill-max/PLAN.md` from `references/plan-template.md`, instantiated for this target:
   every stage gets a concrete scope, a named deliverable file, a gate, and an explicit
   *not-in-scope*. Drop stages that genuinely do not apply and say why in the plan.
4. Show the user the plan's stage list, the baseline numbers, and the two or three decisions that
   need their call (see **Decision gates** below). Then start stage 0.

## Phase B — execute

For each stage in order:

1. Announce the stage and read the prior ledger entries.
2. Invoke the stage's skill via the Skill tool. Hand it the max-work mandate below.
3. Write the stage's deliverable file. Apply the changes.
4. Run the gate. Revert on regression.
5. Append the ledger entry: what changed, what the metrics did, what the next stage should know,
   what was deliberately left alone.

Full stage definitions, in order, with inputs, outputs and gates: `references/stages.md`.
Gate mechanics and the hard metrics: `references/gates.md`. Running this in someone else's repo, on
someone else's machine: `references/portability.md`.

| # | Stage | Skill |
|---|---|---|
| −1 | Preflight and house rules | `scripts/preflight.sh` |
| 0 | Ground truth and baseline | `webapp-testing` |
| 1 | Narrative, annotation, direct labelling | `visual-storytelling-design` |
| 2 | Aesthetic direction | `frontend-design` |
| 3 | Per-scene composition | `canvas-design` |
| 4 | Drawn things instead of boxes | `algorithmic-art` |
| 5 | Layout resolution and collisions | `gsap-utils` (math) — mostly code |
| 6 | Motion system: durations, curves, layers | `motion-design` |
| 7 | Motion implementation for SVG | `svg-animation` |
| 8 | Choreography and sequencing | `gsap-timeline`, `gsap-core` |
| 9 | Scroll binding (only if adopted) | `gsap-scrolltrigger`, `gsap-plugins` |
| 10 | Performance | `gsap-performance` |
| 11 | Accessibility and reduced motion | `gsap-core` + target's own rules |
| 12 | Adversarial taste QA | `design-review`, `review-animations` |
| 13 | Final verification and close-out | `webapp-testing` |

## The max-work mandate

Give this to every stage verbatim in the invoking prompt. It is what "apply itself to the fullest"
means operationally:

> Cover the entire target, not a representative sample. Enumerate every instance you find, then say
> how many you found and how many you fixed. Where you decline to change something, say why in one
> line. Produce specific values — actual durations in ms, actual curves, actual coordinates, actual
> hex or OKLCH — never a principle without a number. Before you finish, do one completeness pass:
> name the scenes, screens or cases you did not examine, and either examine them or record them as
> uncovered in the ledger. Do not stop at the first plausible fix if more of the same class exists.

Two hard limits on that mandate: a stage may not change anything outside its scope as written in the
plan, and a stage may not weaken a metric to make its own deliverable look better.

## Decision gates for the user

Some choices are the user's, and asking after the work is wasted work. Surface these at the end of
Phase A, not mid-pipeline:

- **Library adoption.** Stages 8–9 are much stronger with GSAP, but for a no-build, no-dependency
  artifact adopting it is a real refactor of the transition layer. Ask before planning around it. If
  the answer is no, stages 8 and 10 still apply as principles and stage 9 is dropped.
- **Scope of visual change.** Is the existing palette and type system fixed, or open? Stage 2 is a
  different job in each case.
- **Depth.** Full pass, or stages 0 and 5 and 13 only (the "stop the bleeding" subset).

## Sharing this pipeline

To make a repo carry the pipeline for everyone who clones it — any Claude account, any agent that
reads `.claude/skills` — vendor it in:

```bash
scripts/vendor-into-repo.sh /path/to/repo
```

That copies the skill to `<repo>/.claude/skills/stef-skill-max/` and appends a trigger block to the
repo's `CLAUDE.md` saying what "run Stef skill max" means and that preflight comes first. Commit both
paths. `~/stef-skill-max/` is a Claude Code plugin marketplace holding the same skill, for the case
where several repos should track one shared copy instead of each vendoring its own. Details in `references/portability.md`.

## Stop conditions

Stop and report rather than continuing if: stage 0 cannot produce a runnable measurement loop; two
consecutive stages are reverted by their gates; a gate metric regresses more than 20% and the cause
is not obvious; or the target's own standing design rules conflict with a stage's output. In all four
cases the ledger plus the plan is the deliverable, and it is a real one.

One more, specific to a vendored run: if preflight reports more than a third of the fleet missing and
`--install` cannot fix it, do not run a thinned pipeline and call it Skill Max. Report what is
installable and let the user decide.
