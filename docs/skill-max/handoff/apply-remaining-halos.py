#!/usr/bin/env python3
"""The last two safe halo fixes. Apply when a shell is available.

    cd ~/Coethia-visual && python3 docs/skill-max/handoff/apply-remaining-halos.py

WHY PATTERN-LOCATED RATHER THAN EXACT-ANCHORED
----------------------------------------------
The earlier staged patch (`apply-mobile-fits.py`) quoted its anchors verbatim, which is
stricter and better -- but it was written while the file's line numbers were known. This
one was written with no working shell at all: no grep, no way to search 7,000 lines
except by reading them. So each edit is located by a substring that is unique in the
file, asserted to appear exactly once, and then transformed by wrapping the whole
statement it sits in.

Same three safety properties as the other script:

  1. every pattern must match EXACTLY ONCE, and the located statement must end in `);`
     -- otherwise nothing is written;
  2. the file is backed up first;
  3. `node syntax.js` runs after, and the backup is restored if the page stops parsing.

WHAT THESE TWO ARE
------------------
Both are `speckled` findings: a mark painted BENEATH a label, which a halo covers. The
halo has to be the colour of what the label actually sits on -- `legible.js` waives the
finding only when the halo matches the composited background, and a mismatched halo is
a visible ring round the words as well as a finding that stays.

  oldnew  "WHAT IT LEARNED"  over the green wheel's spokes, on paper -> PAPER
  reel    the post caption   on the phone's dark screen             -> #141010

NOT DONE HERE, AND WHY
----------------------
  afterwords  "It changed nothing." STRADDLES its card: 10.7:1 on the card, 1.7:1 off
              it. A halo in the card's colour would make it read uniformly, and
              legible.js's straddle test does not consider halos, so the finding would
              survive a fix that worked. It wants the text measured to the card, which
              needs the card's width -- go and read it. The label is
              `label(H, px+14, py+244, 'It changed nothing.', 8.6, 700, P_WARN);`
              so the card is the group `H` it is drawn into.

A HALO IS ONLY HALF THE PARENT FIX. The note is 96 units wide, so 84 inside it, and
"2 month shots" at 8.4 units with mobile TK about 2 paints roughly 114 -- it overflows
the note as well as being crossed by its border. The halo stops it looking broken; the
text still wants measuring to 84 units, the way the `daisy` tags and the `ledger` body
lines now are. Do that second, with a shell, and re-check.

And mind the `rotate(-4)`: a rotated label's screen AABB gains `width * sin4`, so this
label is tighter than its numbers suggest. The same trap is worked through at length in
the `pan()` comment in the `law` scene.

Do not guess a halo colour. In the wrong colour it looks like a mistake AND fails to
clear the check, so the next person reads it as evidence the approach does not work.
"""

import pathlib
import re
import shutil
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[3]
TARGET = ROOT / 'faster-than-the-rumour.html'
BACKUP = TARGET.with_suffix('.html.prehalo')

# (unique substring, halo colour expression, why)
FIXES = [
    ("'WHAT IT LEARNED'", 'PAPER',
     "oldnew: over the wheel's spokes, on paper"),
    ("cap.forEach((c,i)=> label(g, bx, by + 26 + i*lead, c, 8.4, 400, '#EDEAE4'));",
     "'#141010'",
     "reel caption: on the phone's dark screen, so the halo is the screen"),

    # parent's fridge note. Located and its colours read off the source:
    #   roundRect(G, 226, 220, 96, 68, 3, '#3A2B22', '#7A6656', 1.3)
    #       .attr('transform','rotate(-4,274,254)')
    # so the note is 96 wide filled #3A2B22 with a #7A6656 border, and the border is
    # what crosses these labels. The halo is therefore #3A2B22: invisible on the note,
    # opaque over its own rim, and it matches the composited background so the waiver
    # fires. Both labels are centred at x=274 and carry the same rotate(-4), which is
    # applied AFTER the call and so survives the wrap unchanged.
    ("'THURSDAY', 8, 700, P_WARN, 'middle'", "'#3A2B22'",
     "parent: THURSDAY on the fridge note"),
    ("'2 month shots', 8.4, 400, P_MUTE, 'middle'", "'#3A2B22'",
     "parent: the mobile '2 month shots' line"),
]


def wrap_statement(src, needle, colour, why):
    """Wrap the innermost label(...)/mono(...) call on the line holding `needle`."""
    n = src.count(needle)
    if n != 1:
        return None, f"  {why}: pattern found {n} times, expected 1"

    i = src.index(needle)
    line_start = src.rindex('\n', 0, i) + 1
    line_end = src.index('\n', i)
    line = src[line_start:line_end]

    m = re.search(r'\b(label|mono)\(', line)
    if not m:
        return None, f"  {why}: no label()/mono() call on that line: {line.strip()[:70]}"
    call_start = m.start()

    # walk to the matching close paren
    depth, j, in_str, quote = 0, m.end() - 1, False, ''
    while j < len(line):
        ch = line[j]
        if in_str:
            if ch == quote and line[j - 1] != '\\':
                in_str = False
        elif ch in "'\"":
            in_str, quote = True, ch
        elif ch == '(':
            depth += 1
        elif ch == ')':
            depth -= 1
            if depth == 0:
                break
        j += 1
    if depth != 0:
        return None, f"  {why}: call is not closed on one line -- edit it by hand"

    call = line[call_start:j + 1]
    if 'haloed(' in line:
        return None, f"  {why}: already haloed, nothing to do"

    new_line = (line[:call_start]
                + f'haloed({call}, {colour})'
                + line[j + 1:])
    return src[:line_start] + new_line + src[line_end:], f"  applied: {why}"


def main():
    if not TARGET.exists():
        print(f"no artifact at {TARGET}")
        return 1

    src = TARGET.read_text()
    out = src
    notes, problems = [], []
    for needle, colour, why in FIXES:
        nxt, msg = wrap_statement(out, needle, colour, why)
        if nxt is None:
            problems.append(msg)
        else:
            out, _ = nxt, None
            notes.append(msg)

    if problems:
        print("REFUSING TO PATCH:")
        print("\n".join(problems))
        print("\nNothing was written. Locate these by hand rather than loosening the"
              " patterns.")
        return 1

    shutil.copy2(TARGET, BACKUP)
    print(f"backed up -> {BACKUP.name}")
    TARGET.write_text(out)
    print("\n".join(notes))

    r = subprocess.run(['node', 'syntax.js'], cwd=ROOT, capture_output=True, text=True)
    print(r.stdout.strip() or r.stderr.strip())
    if r.returncode != 0:
        shutil.copy2(BACKUP, TARGET)
        print("\nSYNTAX CHECK FAILED - restored the backup. The artifact is unchanged.")
        return 1

    BACKUP.unlink()
    print("\nOK. Verify:")
    print("  node legible.js --only=oldnew,reel,swipe,anatomy,comments --all-views")
    print("\nA halo only waives `speckled` -- a mark UNDER the text. If either of these"
          " still reports, check whether the mark is painted OVER the label instead,"
          " in which case it needs reordering, not a halo.")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
