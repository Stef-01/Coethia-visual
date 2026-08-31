#!/usr/bin/env python3
"""The last two measured fits. Apply after `apply-remaining-halos.py`.

    cd ~/Coethia-visual && python3 docs/skill-max/handoff/finish-mobile-fits.py

Run order for the whole remaining set:

    node syntax.js
    python3 docs/skill-max/handoff/apply-remaining-halos.py
    python3 docs/skill-max/handoff/finish-mobile-fits.py
    node legible.js --all-views
    node audit.js && node interact.js && node boxes.js && node motion.js && node a11y.js
    node measure.js --verify --strict

Same guards as the other two scripts: exact anchors asserted once, backup, `node
syntax.js` afterwards, automatic restore if the page stops parsing.

WHAT THESE TWO ARE, AND WHY THEY ARE NOT HALOS
----------------------------------------------
Both labels OVERFLOW their container rather than merely having a mark under them, so a
halo would leave the text hanging off the object it belongs to -- readable, on the wrong
surface. They need measuring, like `daisy`'s tags and `ledger`'s body lines.

  afterwords  "It changed nothing." The phone is pw=168 with its inner screen from
              px+6, and the label starts at px+14, so it has pw-20 = 148 units. At 8.6
              units and mobile TK it paints about 170 and crosses the phone's right
              edge: 10.7:1 on the dark screen, 1.7:1 off it, which is P_WARN on the
              room's pale ground and unreadable. Both lines lift to clear the hand,
              whose path starts at py+ph-40 = py+260.

  parent      "2 month shots" on the fridge note. The note is
              roundRect(G, 226, 220, 96, 68, ...) so 84 units inside, and the label
              paints about 114. The halo in the companion script stops the note's
              border reading as a line through the words; this makes the words fit the
              note. Both are needed -- the halo alone leaves text hanging off a 96-unit
              note onto a dark room.
              THURSDAY moves up with it, because two wrapped lines at the old y would
              put line two's ink on the note's bottom edge at y=288.

MIND THE ROTATION. Both fridge labels carry rotate(-4,274,254), applied after the call.
A rotated label's screen AABB gains width*sin4, so it is tighter than its numbers look;
the same trap is worked through in the `pan()` comment in the `law` scene. The rotation
is preserved on every branch below -- check that it still is if you edit this.

NONE OF THIS HAS BEEN RUN. It was written with no working shell. The arithmetic above is
from reading the source, not from measuring the render, so treat the wrap points as a
starting position and look at the result.
"""

import pathlib
import shutil
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[3]
TARGET = ROOT / 'faster-than-the-rumour.html'
BACKUP = TARGET.with_suffix('.html.prefits')

EDITS = [
    (
        """    if (nar){
      label(H, px+14, py+216, 'March 2025', 8.4, 700, P_INK);
      label(H, px+14, py+244, 'It changed nothing.', 8.6, 700, P_WARN);
    } else {""",
        """    if (nar){
      /* Measured to the phone's inner width, and both lines lifted to clear the hand.
         The label had 148 units (pw-20) and "It changed nothing." paints about 170 at
         8.6 with mobile TK, so it crossed the phone's right edge -- 10.7:1 on the dark
         screen and 1.7:1 off it, where P_WARN on the room's pale ground is not
         readable. Wrapping needs a second line, and the hand's path starts at
         py+ph-40 = py+260, so both labels move up to make the room. */
      label(H, px+14, py+206, 'March 2025', 8.4, 700, P_INK);
      const punch = 'It changed nothing.';
      const pRoom = pw - 20;
      const pFirst = label(H, px+14, py+230, punch, 8.6, 700, P_WARN);
      let pWid = 0;
      try { pWid = pFirst.node().getComputedTextLength(); } catch (e) { pWid = 0; }
      if (pWid && pWid > pRoom){
        pFirst.remove();
        const pCap = Math.max(6, Math.floor(punch.length * pRoom / pWid));
        label(H, px+14, py+230, punch, 8.6, 700, P_WARN, 'start', pCap);
      }
    } else {""",
        "afterwords punchline",
    ),
    (
        """    haloed(label(G, 274, nar ? 238 : 246, 'THURSDAY', 8, 700, P_WARN, 'middle'), '#3A2B22').attr('transform','rotate(-4,274,254)');""",
        """    /* nar ? 234 : 246 -- one line higher on a phone, because "2 month shots" below
       now wraps to two lines and the note's bottom edge is at y=288. */
    haloed(label(G, 274, nar ? 234 : 246, 'THURSDAY', 8, 700, P_WARN, 'middle'), '#3A2B22').attr('transform','rotate(-4,274,254)');""",
        "parent THURSDAY lift",
    ),
    (
        """    } else haloed(label(G, 274, 268, '2 month shots', 8.4, 400, P_MUTE, 'middle'), '#3A2B22').attr('transform','rotate(-4,274,254)');""",
        """    } else {
      /* Measured to the note, which is roundRect(G, 226, 220, 96, 68, ...) -- 84 units
         inside it. At 8.4 with mobile TK this paints about 114, so it hung off the
         note onto the dark room. The rotate(-4) is applied on every branch, including
         the wrapped one: dropping it on one path would leave this label straight while
         the note it sits on is tilted. */
      const shots = '2 month shots', sRoom = 84;
      const sEl = haloed(label(G, 274, 256, shots, 8.4, 400, P_MUTE, 'middle'), '#3A2B22');
      let sWid = 0;
      try { sWid = sEl.node().getComputedTextLength(); } catch (e) { sWid = 0; }
      if (sWid && sWid > sRoom){
        sEl.remove();
        const sCap = Math.max(5, Math.floor(shots.length * sRoom / sWid));
        haloed(label(G, 274, 256, shots, 8.4, 400, P_MUTE, 'middle', sCap), '#3A2B22')
          .attr('transform','rotate(-4,274,254)');
      } else {
        sEl.attr('transform','rotate(-4,274,254)');
      }
    }""",
        "parent 2 month shots",
    ),
]


def main():
    if not TARGET.exists():
        print(f"no artifact at {TARGET}")
        return 1
    src = TARGET.read_text()

    problems = [f"  {why}: {src.count(old)} match(es), expected 1"
                for old, _new, why in EDITS if src.count(old) != 1]
    if problems:
        print("REFUSING TO PATCH - anchors do not match the file:")
        print("\n".join(problems))
        print("\nNothing was written. Re-read the target and rewrite the anchors;"
              " do not loosen them.")
        return 1

    shutil.copy2(TARGET, BACKUP)
    print(f"backed up -> {BACKUP.name}")
    out = src
    for old, new, why in EDITS:
        out = out.replace(old, new)
        print(f"  applied: {why}")
    TARGET.write_text(out)

    r = subprocess.run(['node', 'syntax.js'], cwd=ROOT, capture_output=True, text=True)
    print(r.stdout.strip() or r.stderr.strip())
    if r.returncode != 0:
        shutil.copy2(BACKUP, TARGET)
        print("\nSYNTAX CHECK FAILED - restored the backup. The artifact is unchanged.")
        return 1

    BACKUP.unlink()
    print("\nOK. Verify, and LOOK at these two -- the wrap points came from arithmetic")
    print("on the source, not from a render:")
    print("  node legible.js --only=afterwords,parent --all-views")
    print("  node audit.js       # tiny-text must stay at its baseline 6")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
