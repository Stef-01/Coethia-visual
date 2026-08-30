# PLAN.md template

Write this to `docs/skill-max/PLAN.md` at the end of Phase A. Replace every angle-bracket field with a
real value for the target. A plan with a placeholder left in it is not finished.

```markdown
# Skill Max plan — <target name>

**Target.** <file or directory> · <technology> · <N> scenes/views · <how transitions are driven>
**Verification.** <suite name, or "none — building one in stage 0"> · runs today: <yes / no, why>
**Standing rules this target already has.** <quote them; they override every stage>

## Baseline fingerprint

| Metric | Value |
|---|---|
| Scenes | |
| Animation call sites | |
| Distinct durations | |
| Distinct easing curves | |
| Overlapping text pairs (desktop / mobile) | |
| Text under legible floor | |
| Frame overflow | |
| Console errors | |
| External dependencies | |

## Decisions taken before starting

| Decision | Choice | Consequence |
|---|---|---|
| Library adoption | | stage 9 <runs / dropped> |
| Palette and type system | <fixed / open> | stage 2 scope |
| Depth | <full / stop-the-bleeding subset> | stages included |

## Stages

For each stage that will run:

### Stage <n> — <name>
- **Skill.** <skill name>
- **Scope.** <one or two sentences, specific to this target>
- **Not in scope.** <the thing it must not touch>
- **Deliverable.** `docs/skill-max/<nn>-<slug>.md` + the code changes
- **Gate.** <the metrics that must move or hold>
- **Expected cost.** <rough, so the user can stop early with a clear picture>

For each stage that will not run:

### Stage <n> — <name> — SKIPPED
- **Why.** <reason specific to this target, not "not applicable">
```

## Rules for writing the plan

- Every stage's scope names actual scenes, files or components in this target. A scope that would read
  identically for a different project is too vague to gate.
- Every stage has exactly one *not in scope* line. This is what prevents fleet thrash.
- Skipped stages stay in the document with their reason. Silently dropping a stage makes the pass look
  more complete than it was.
- Order is fixed. Stages may be skipped but not reordered — the order is the mechanism.
