# Gate protocol

A gate is a re-measurement between two stages. It exists so that "it looks better" is never the only
evidence, and so a later stage cannot quietly undo an earlier one.

## The hard metrics

These are the metrics a gate compares against the previous stage and against `BASELINE.md`. They are
counts, not judgements, and they are measured at every supported width.

| Metric | Direction | Notes |
|---|---|---|
| Overlapping text pairs | must not increase; target zero by stage 5 | material overlap only — a threshold on the smaller box's area, not a one-pixel touch |
| Text below the legible pixel floor | must not increase; target zero | measured in physical pixels after every scale factor is applied |
| Content outside its own frame | must not increase; target zero | |
| Console errors per scene | must be zero | |
| NaN or Infinity in geometry | must be zero | a single one invalidates the stage |
| Empty or near-empty scenes | must not increase | |
| Horizontal page overflow | must be zero | |
| Distinct durations in use | must not increase after stage 6 | shrinking this is the point of stage 6 |
| Distinct easing curves in use | must not increase after stage 6 | |
| Determinism | identical geometry across two runs | breaks the moment unseeded randomness enters |

Stages 7–9 add one more: the collision check is sampled **mid-transition**, not only after animations
settle. An animation that flies a label through another label passes a settle-only check and still
looks broken.

## Running a gate

1. Run the measurement suite cold. Never reuse the previous run's output.
2. Compare to the previous stage's numbers and to baseline.
3. Classify:
   - **Pass** — no hard metric worse, at least one thing the stage promised is measurably better, or
     the stage was a pure-decision stage whose deliverable exists and is fully specified.
   - **Neutral** — nothing worse, nothing better. Record it as neutral. Do not relabel it a pass.
     Two neutral stages in a row means the plan's ordering is wrong; revisit the plan.
   - **Regression** — any hard metric worse. Revert.
4. Append the ledger entry either way. A reverted stage still gets an entry, including what it tried.

## Reverting

Revert the stage's changes, not the whole pipeline. Then choose one:

- **Retry once, narrower.** Usually the stage overreached its scope. Re-run against a subset.
- **Split the stage.** If the regression came from one scene, that scene becomes its own pass.
- **Record and move on.** If the regression is inherent to the approach, write it in the ledger as a
  known limitation and continue. This is a legitimate outcome and must not be hidden.

Two consecutive reverts is a stop condition. Report to the user instead of trying a third time.

## Sequencing hazards

Ordering mistakes that quietly corrupt a gate:

- **Fitting before auditing.** If the target has a camera or viewport fitter, it must run before the
  audit, or the audit measures stale frames and reports clean on broken output.
- **Auditing before settle.** Measuring before entrance transitions land reports phantom collisions
  and phantom empty stages.
- **Concurrent browser runs.** Two suites sharing one browser install contend and hang or die
  silently, which reads as a pass because no findings were emitted. Run them strictly one at a time,
  and never kill a browser process while one is running.
- **Trusting the repo's own docs about its verification.** Confirm the suite executes on this machine.
  A hardcoded absolute path from another operating system is the common cause, and it fails loudly on
  the first run and then silently in everyone's memory of the project.
