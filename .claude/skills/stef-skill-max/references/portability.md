# Portability

This skill is designed to be vendored into a repo and read by someone else's agent on
someone else's machine. Three consequences that shape how every stage must be written.

## 1. The fleet is a manifest, not an assumption

`fleet.tsv` is the single source of truth for which specialist skill backs which stage.
Never name a skill in SKILL.md, in a stage, or in a script without a row in that file.
`fleet-optional.tsv` holds skills that may or may not exist in a given environment, each
with the portable fallback a stage must use when it is absent. `fleet-npm.tsv` holds the
two non-skill dependencies.

Stage −1 runs `scripts/preflight.sh`, which reads all three and reports. A missing required
skill is a **planning input**, not a failure: the stage that needed it is marked SKIPPED in
`PLAN.md` with the missing skill named as the reason. What must never happen is a stage
reported as done when the specialist it depends on was not present — that is how a
pipeline whose entire purpose is measured, attributable improvement turns into a
plausible-looking narrative.

## 2. No stage may depend on a locally-installed toolchain

Some environments have `gstack` (`design-review`, `review-animations`, `improve-animations`)
or a claude.ai skill catalog (`dataviz`). Most do not. Every stage that would reach for one
of those names its portable substitute in `fleet-optional.tsv`. Stage 12 is the load-bearing
case: it falls back from `design-review` to `audit-ai-design-slop` plus
`frontend-design-review`, both of which install from public repos anywhere.

## 3. The target's own rules outrank this skill

A vendored pipeline arriving in an unfamiliar repo is a guest. Before stage 0, read the
repo's `CLAUDE.md`, its README, and any design-system or standing-rules doc, and copy those
rules into `PLAN.md` verbatim. If a stage's normal output would violate one, the rule wins
and the conflict goes in the ledger. A standing project rule — a banned pattern, a fixed
palette, a required citation format — is the accumulated judgement of people who know the
artifact better than a fresh agent does.

## Vendoring

```bash
~/.claude/skills/stef-skill-max/scripts/vendor-into-repo.sh /path/to/repo
```

Copies the skill to `<repo>/.claude/skills/stef-skill-max/` and appends a trigger block to
the repo's `CLAUDE.md`. Project-scope skills are auto-discovered, so anyone who clones the
repo gets both the skill and the instruction on what "run Stef skill max" means. Commit
both paths.

Re-running is safe: the skill directory is replaced, and the `CLAUDE.md` block is left
alone if its marker is already present.

**Which half actually travels.** The project-scope skill is the load-bearing trigger:
`.claude/skills` is auto-discovered by any agent that opens the repo, and the skill's own
description matches "run Stef skill max". The `CLAUDE.md` block is a second layer whose job
is to say what *not* to do instead — improvise a design pass. Many repos gitignore
`CLAUDE.md`, and some ignore `.claude/` wholesale; the vendor script checks both with
`git check-ignore` and warns, because a vendored pipeline nobody else can see is worse than
none — it looks shared and isn't.

## Distribution as a plugin

For sharing outside a single repo, `~/stef-skill-max/` is a Claude Code plugin marketplace
holding the same skill. Push it, then anyone runs `/plugin marketplace add <owner>/stef-skill-max`
and installs `stef-skill-max`. Use this when several repos should track one shared copy
rather than each vendoring its own; `sync.sh` in that repo re-copies from the live skill so
the two never drift.

## What a portable run may not do

- Install anything into the target repo without saying so. `preflight.sh` reports the two
  npm dependencies; it does not add them.
- Write outside `docs/skill-max/` and the files a stage's scope names.
- Reorder stages. Skipping is portable; reordering breaks the gates.
