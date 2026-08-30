# LEDGER.md template

Append-only, at `docs/skill-max/LEDGER.md`. One entry per stage, written *after* the gate runs. This
is the only channel through which stage N+1 learns what stage N did, so write it for a reader who has
none of the context.

```markdown
## Stage <n> — <name> — <PASS / NEUTRAL / REVERTED>

**Ran.** <skill name>
**Scope as planned.** <one line>

**Changed.** <what actually changed, with file references and counts — "18 of 59 scenes", not "several">

**Metrics.**
| Metric | Before | After |
|---|---|---|
| | | |

**Declined.** <what was in scope but deliberately left alone, and why — one line each>

**Uncovered.** <what this stage did not examine at all; the completeness pass goes here>

**For the next stage.** <the specific thing the next stage needs to know: new geometry that invalidates
frames, tokens it must not exceed, scenes still weak, a hazard discovered>
```

## Rules

- Numbers, not adjectives. "Reduced collisions from 41 to 6" beats "greatly improved overlap".
- A reverted stage gets a full entry including what it tried and why the gate rejected it. That entry
  is often the most useful one in the file, because it stops a later stage retrying the same thing.
- The **Uncovered** field is mandatory and may not be empty. If a stage genuinely covered everything,
  write "none — all <N> scenes examined" and be prepared to have that checked.
- Never edit a previous entry. If a later stage proves an earlier claim wrong, say so in the later
  entry.
