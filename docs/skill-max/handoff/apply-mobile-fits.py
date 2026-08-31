#!/usr/bin/env python3
"""Prepared fix for the mobile text-fitting cluster. Apply when a shell is available.

    cd ~/Coethia-visual && python3 docs/skill-max/handoff/apply-mobile-fits.py

WHY THIS IS A SCRIPT AND NOT AN EDIT ALREADY IN THE FILE
--------------------------------------------------------
It was written in a session that ran out of processes: no shell, no browser, no way to
run a single check. Editing the artifact blind is precisely what produced the worst
failure of that session -- a deleted `if` branch left an orphaned `else`, the page's
script stopped parsing, and the legibility sweep reported CLEAN on a blank page.

So the edits are staged here instead, with three properties that make applying them
safe even unattended:

  1. every anchor must match EXACTLY ONCE or nothing is written at all;
  2. the file is backed up first;
  3. `node syntax.js` runs after patching, and if the page stops parsing the backup
     is restored automatically. This script cannot leave the artifact broken.

WHAT IT FIXES
-------------
`mono()` decides where to wrap from a hardcoded 600-unit container budget:

    cap = clamp(round(600 * 0.72 / base), 14, 46)

That is right for a full-width caption and wrong for every narrower container. The
ledger card is 480 units wide with about 442 inside it, and its 51-character eyebrow
wraps at 46 characters -- so line one is 44 characters, which paints
44 * 6.2 * 2.5 * 0.72 = 492 units at mobile TK and still runs off the card, while the
orphaned second line lands on one of the card's ruled lines.

`mono()` gains an optional container width. Given one, the cap comes from that width
and the current type scale instead of from 600, and wrapping is permitted inside a
console or at desktop -- the same reasoning `wrapFor`'s `force` already uses: only the
caller knows how wide its container is, and a caller that says so should be believed.

Expected effect: the six `ledger` / `arithmetic` findings, and probably the three
`daisy` date-card findings, since those cards are narrower still.

WHAT IT DOES NOT FIX
--------------------
The rest of the mobile cluster. `comments` and `counterpost` depend on whether the
clamp's authored-size floor contains them -- that change was made after the last
measurement and is unverified. The "?" and "$" glyph-in-a-circle findings are the
fixed-graphic case and want `data-pin` or nothing. See RESUME-HERE.md.
"""

import pathlib
import shutil
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[3]
TARGET = ROOT / 'faster-than-the-rumour.html'
BACKUP = TARGET.with_suffix('.html.prepatch')

EDITS = [
    # ---- mono() takes an optional container width -------------------------
    (
        """function mono(g, x, y, txt, size, fill, anchor){""",
        """function mono(g, x, y, txt, size, fill, anchor, maxW){""",
        "mono signature",
    ),
    (
        """  if (INCON || !isNarrow() || typeof txt !== 'string') return mk(y, txt);""",
        """  if (typeof txt !== 'string') return mk(y, txt);
  /* maxW overrides both guards, for the reason wrapFor's `force` overrides its own:
     only the caller knows how wide its container is. Without a width this keeps its
     old behaviour exactly -- no wrapping inside a console, none at desktop. */
  if ((INCON || !isNarrow()) && !maxW) return mk(y, txt);""",
        "mono guards",
    ),
    (
        """  const cap = Math.max(14, Math.min(46, Math.round(600 * 0.72 / base)));""",
        """  /* From the container's own width when the caller supplies one.
     The fallback is a 600-unit budget, which is right for a full-width caption and
     wrong for anything narrower: the ledger card has about 442 units inside it, and
     the 600 budget let a 51-character eyebrow wrap at 46, so line one still painted
     492 units at mobile TK and ran off the card while line two landed on a rule.
     0.72em per glyph is mono's advance plus its .14em tracking. */
  const cap = maxW
    ? Math.max(8, Math.floor(maxW / (0.72 * base * TK)))
    : Math.max(14, Math.min(46, Math.round(600 * 0.72 / base)));""",
        "mono cap",
    ),

    # ---- the ledger card's two eyebrows now state their container --------
    (
        """  mono(gLed, lx+30, 176, 'PUBLIC HEALTH RESPONSE · ONE INTRODUCED CASE ONWARD', 6.2, MUTE);""",
        """  /* lw-60: the card is lw wide with 30 units of padding each side. */
  mono(gLed, lx+30, 176, 'PUBLIC HEALTH RESPONSE · ONE INTRODUCED CASE ONWARD', 6.2, MUTE, 'start', lw - 60);""",
        "ledger eyebrow",
    ),
    (
        """  mono(gLed, lx+30, AY, 'THE SAME MONEY, IN AD GRANTS INVENTORY', 6.2, GOLD);""",
        """  mono(gLed, lx+30, AY, 'THE SAME MONEY, IN AD GRANTS INVENTORY', 6.2, GOLD, 'start', lw - 60);""",
        "ledger inventory eyebrow",
    ),
]


def main():
    if not TARGET.exists():
        print(f"no artifact at {TARGET}")
        return 1

    src = TARGET.read_text()

    # 1. every anchor must be unambiguous BEFORE anything is written
    problems = []
    for old, _new, why in EDITS:
        n = src.count(old)
        if n != 1:
            problems.append(f"  {why}: {n} match(es), expected 1")
    if problems:
        print("REFUSING TO PATCH - anchors do not match the file:")
        print("\n".join(problems))
        print("\nThe file has moved on since this was written. Re-read the target and"
              " rewrite the anchors; do not loosen them.")
        return 1

    # 2. back up
    shutil.copy2(TARGET, BACKUP)
    print(f"backed up -> {BACKUP.name}")

    out = src
    for old, new, why in EDITS:
        out = out.replace(old, new)
        print(f"  applied: {why}")
    TARGET.write_text(out)

    # 3. the artifact must still parse, or this never happened
    r = subprocess.run([sys.executable and 'node', 'syntax.js'],
                       cwd=ROOT, capture_output=True, text=True)
    print(r.stdout.strip() or r.stderr.strip())
    if r.returncode != 0:
        shutil.copy2(BACKUP, TARGET)
        print("\nSYNTAX CHECK FAILED - restored the backup. The artifact is unchanged.")
        return 1

    BACKUP.unlink()
    print("\nOK. Now verify, in this order:")
    print("  node legible.js --only=ledger,arithmetic,daisy --all-views")
    print("  node audit.js            # tiny-text must stay at its baseline 6")
    print("  node legible.js --all-views")
    print("\nlegible.js must print 'measured N painted labels'. If it prints"
          " 'NOT MEASURED', the page did not render and nothing it says is a verdict.")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
