#!/usr/bin/env python3
"""Resolve the `visual-motion-pass` merge, hunk by hunk, with the reasoning recorded.

    cd ~/Coethia-visual
    git merge --no-commit --no-ff visual-motion-pass      # will conflict; expected
    python3 docs/skill-max/handoff/merge-visual-motion-pass.py

WHY THIS IS NOT `git merge` AND THEN "TAKE THEIRS"
-------------------------------------------------
`visual-motion-pass` is one commit from 2026-08-11 and main is 66 commits ahead of the
merge base. It touches three files; main has since touched two of the same three. A
straight merge is not a merge of new work into old -- in two hunks it is a REVERT of
main's newer fix back to the branch's older one.

The decisive example is the "the belief map" chip. Both sides fix the same overlap:

    branch   const bx = CLX + 100;
    main     sf._w14 = starRow.select('.rowlabel').node().getComputedTextLength() / (14*TK) * 14;
             const bx = (CLX - 42) + sf._w14 * (sz / 14) + 12;   // + a transition

Main MEASURES the label and rescales when the active-row bump changes its size. The
branch moves it by a guessed constant. Taking the branch here would replace a
measurement with a constant -- the exact defect class the ten fixes in the previous
commit were all instances of. So main wins that hunk, and it wins on merit, not recency.

WHAT EACH OF THE NINE HUNKS RESOLVES TO, AND WHY
------------------------------------------------
index.html (2)
  title + meta description   SYNTHESIS. The branch's rebrand is kept; its COPY is stale.
  h1 + lede                  The branch says "Two scrollytelling essays" and there are
                             now three -- faster-than-the-rumour landed on main after
                             this branch was cut. Taking the branch verbatim would
                             regress the index to describe a site that no longer exists.
                             Kept from the branch: the claim-first headline, and the
                             synthetic-data disclaimer, which main does not have and
                             which a page of invented figures should carry.

belief-based-communication.html (7)
  scene frames case->caseF   MAIN. Package deal with the three below; see FRAMES.
  6 scene entries            MAIN. Copy is byte-identical on both sides -- the only delta
                             is frame:'case' -> 'caseF', so this hunk carries no content.
  FRAMES / FRAMES_MOBILE     MAIN. The branch replaces `case` with a 940x860 `caseF` and
                             predates main's `appr` and `tiers`. Main also has per-frame
                             MOBILE crops the branch has no equivalent for
                             (case: '240 20 530 650' against the branch's '10 0 980 940').
                             Taking caseF's frame WITHOUT the branch's layout rewrite
                             would add 160 units of empty stage to a layout composed for
                             940x700 -- worse than either side alone. Frame and layout
                             are one decision.
  flank group restructure    MAIN. Main hides `text.flankhead` at narrow outright and
                             ghosts the art; the branch ghosts harder (.14 vs .3) and has
                             no mobile branch at all.
  chip bx                    MAIN. Measured, not guessed. See above.
  the walk                   MAIN. Carries the measured pill transition and `flank = 0`
                             at mobile.

political-health-personas.html
  no conflict                BRANCH, whole. Main never touched this file after the merge
                             base, and the branch fixes a real bug: stageFig opacity was
                             `step >= 1 + i`, so the reader's FIRST scroll under the words
                             "Before Any of the Data, Two People" met a blank 850x900
                             pane, which reads as a failed load. Verified still broken on
                             main before merging.

CARRIED ACROSS BY HAND, because taking main's side of a file drops it
--------------------------------------------------------------------
`overscroll-behavior-x`. Neither page on main has it. The branch's reasoning holds and is
checkable: neither page contains any navigation code, so a reader who lands in the other
explainer without clicking can only have triggered the browser's own horizontal-overscroll
history gesture -- which a page with no horizontal scroll of its own hands straight to the
browser. `none` at the document refuses it; `contain` on the one element that legitimately
scrolls sideways keeps its own scrolling and stops the overflow becoming navigation.

WHAT IS DELIBERATELY NOT LANDED, so it is not mistaken for done
--------------------------------------------------------------
The branch's case-study restructure: caseF's 940x860 frame, the flank band, ledger rows
held at .1 instead of hidden, and the tally on the summary step. Its observation is
specific and probably still true -- 940x700 in a pane taller than it is wide is
width-bound, so it letterboxes ~130px top and bottom. But that is a MEASUREMENT, and
measure.js is the instrument for it. Landing a 160-unit frame change on the strength of a
three-week-old note, into a layout that has since been rebuilt, is how the last regression
happened. Recorded as open in RESUME-HERE.md instead.
"""

import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[3]

# (file, old, new, why) -- every `old` must appear exactly once or nothing is written.
EDITS = [
    ('index.html',
     '<title>The Reachable — Visual Explainers</title>',
     '<title>The Belief Layer — Why Public Health Keeps Aiming at the Wrong Thing</title>',
     'index: masthead in the title'),

    ('index.html',
     '<meta name="description" content="Three scrollytelling visual essays: political '
     'health personas, the argument for belief-based health communication, and why the '
     'correction never arrives in time.">',
     '<meta name="description" content="Health campaigns buy who you are and almost never '
     'buy what you believe. Three scrollytelling essays on the missing layer: political '
     'health personas, the case for belief-based communication, and why the correction '
     'never arrives in time.">',
     'index: description, rebranded and kept at three pieces'),

    ('index.html',
     '<h1>Three Arguments About American Health, Told by Scrolling</h1>',
     '<h1>Public Health Has Been Aiming at the Wrong Layer</h1>',
     'index: headline leads with the claim'),

    ('index.html',
     '<p class="lede">Interactive visual essays in one shared design system: how to '
     'segment people by belief rather than label, how to speak to each of them, and — '
     'starting from a hospital room in Lubbock — why public health keeps losing the '
     'argument it is right about.</p>',
     '<p class="lede">Every campaign buys who you are. Almost none buys what you believe '
     '— and belief is the layer that decides whether the message lands. Three interactive '
     'essays on the layer health communication keeps skipping: how to segment people by '
     'belief rather than label, how to speak to each of them, and — starting from a '
     'hospital room in Lubbock — why the correction never arrives in time. Every figure is '
     'synthetic: these are arguments about <em>how to look</em>, not findings.</p>',
     'index: lede, branch framing at three pieces, disclaimer kept'),

    ('index.html',
     '<span>The Reachable</span>',
     '<span>The Belief Layer</span>',
     'index: wordmark'),

    ('belief-based-communication.html',
     '<a class="wordmark" href="index.html" aria-label="The Reachable — home">',
     '<a class="wordmark" href="index.html" aria-label="The Belief Layer — home">',
     'belief: wordmark link label'),

    ('belief-based-communication.html',
     '<span>The Reachable</span>',
     '<span>The Belief Layer</span>',
     'belief: wordmark'),
]


def main():
    # The merge must already be in progress and its conflicts resolved to main's side
    # for the two files this script edits. Check that rather than assume it.
    if not (ROOT / '.git' / 'MERGE_HEAD').exists():
        print('No merge in progress. Run first:')
        print('  git merge --no-commit --no-ff visual-motion-pass')
        print('  git checkout --ours index.html belief-based-communication.html')
        print('  git add index.html belief-based-communication.html')
        return 1

    src = {}
    problems = []
    for name in {f for f, *_ in EDITS}:
        p = ROOT / name
        if not p.exists():
            problems.append(f'  missing file: {name}')
            continue
        src[name] = p.read_text()
        if '<<<<<<<' in src[name]:
            problems.append(f'  {name} still has conflict markers -- resolve to main '
                            f'first: git checkout --ours {name}')

    for name, old, _new, why in EDITS:
        if name in src and src[name].count(old) != 1:
            problems.append(f'  {why}: {src[name].count(old)} match(es), expected 1')

    if problems:
        print('REFUSING TO PATCH:')
        print('\n'.join(problems))
        print('\nNothing was written. Read the file and rewrite the anchor; do not loosen it.')
        return 1

    # overscroll-behavior-x, inserted rather than substituted, so it is handled
    # separately and idempotently.
    for name in ('index.html', 'belief-based-communication.html'):
        if 'overscroll-behavior-x' in src[name]:
            print(f'  overscroll already present in {name}, leaving it')
            continue
        needle = 'html{'
        i = src[name].find(needle)
        if i < 0:
            problems.append(f'  {name}: no `html{{` rule to add overscroll-behavior-x to')
            continue
        src[name] = (src[name][:i + len(needle)]
                     + 'overscroll-behavior-x:none;'
                     + src[name][i + len(needle):])
        print(f'  applied: {name} overscroll-behavior-x:none')

    if problems:
        print('REFUSING TO PATCH:')
        print('\n'.join(problems))
        return 1

    for name, old, new, why in EDITS:
        src[name] = src[name].replace(old, new)
        print(f'  applied: {why}')

    for name, text in src.items():
        (ROOT / name).write_text(text)

    print('\nWritten. Now:')
    print('  grep -rn "The Reachable" *.html      # must only match the personas SEGMENT')
    print('  node syntax.js                       # the artifact is untouched, but check')
    print('  git add -A && git commit             # the merge commit')
    return 0


if __name__ == '__main__':
    sys.exit(main())
