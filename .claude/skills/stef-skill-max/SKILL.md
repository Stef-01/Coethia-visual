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

# Stef Skill Max — pointer

This repo carries a **pointer**, not a copy. The pipeline lives at the GitHub source named in
`SOURCE`, so every run picks up the current version rather than whatever was frozen in here the day
someone vendored it.

## Do this first, before anything else

```bash
scripts/bootstrap.sh
```

It prints a path — the fetched skill directory — and fetches from GitHub when the cache is older
than the TTL in `SOURCE`. **Read the `SKILL.md` at that path and follow it as the real protocol.**
Everything below is only the contract for getting there.

Then, as that protocol's Stage −1 instructs:

```bash
<fetched-path>/scripts/preflight.sh
```

## If bootstrap fails

It exits non-zero and prints what to try: check network, `GH_TOKEN` for a private source, install the
skill directly with the skills CLI, or ask for a `--full` vendor that commits a self-contained copy.

**Do not improvise a design pass from this file.** The stub deliberately does not contain the stage
definitions, the gate metrics or the fleet manifest, because a half-remembered version of a pipeline
whose entire value is ordering and measurement is worse than none — it produces the fleet thrash and
unmeasured taste the pipeline exists to prevent. Report the failure and stop.

## What you are about to run

Fourteen stages over one artifact, in a fixed order, with a re-measured gate between each. Ground
truth and baseline, then narrative and direct labelling, aesthetic direction, per-scene composition,
drawn things instead of boxes, layout and collision resolution, the motion system, SVG motion
implementation, choreography, scroll binding, performance, accessibility, adversarial taste QA, and
final verification. Stages may be skipped; they may not be reordered.

Any regression on a hard count reverts the stage that caused it. Two consecutive reverts stops the
run. The append-only ledger at `docs/skill-max/LEDGER.md` is the only handoff channel between stages.

## Pinning

`SOURCE` sets `REF`. A branch tracks latest; a tag or commit SHA pins. Pin when a run must be
reproducible — a pipeline that silently changed between two runs cannot explain a difference in
outcome. `TTL_HOURS=0` forces a fetch on every invocation.

Note the trust boundary: bootstrap downloads and the agent then follows instructions from that
download. Pin to a tag you have read if that matters to you.
