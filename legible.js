/* Text- and control-against-graphics legibility for faster-than-the-rumour.html
   Run: node legible.js [--only=key1,key2] [--all-views]

   WHY THIS EXISTS, AND WHY IT IS NOT PART OF audit.js
   ---------------------------------------------------
   audit.js has a text-collision check and it reports zero. That check compares
   text boxes against OTHER TEXT boxes, which is one of the two ways a label stops
   being readable and, on this page, the rarer one. Three scenes examined by hand
   after the audit came back clean had, between them: a dot from an animated ring
   sitting inside the word MEASLES; a dot inside the numerals of "R0 12-18"; three
   grey bars printed over the front of "replies: 0"; and two labels straddling the
   edge of a dark phone body so half of each was light-on-light. Every one of those
   is invisible to a text-vs-text comparison, and every one of them is what
   "clunky, overlapping and ugly" actually looks like in a screenshot.

   So the gap was not taste, and it was not diligence in reading screenshots. It
   was an instrument that measured one of two failure modes and was trusted for
   both. This measures the other one.

   THREE FAILURE MODES, DISTINGUISHED ON PURPOSE
   ---------------------------------------------
   occluded     an opaque filled shape painted AFTER the text lands on top of it.
                A glyph with a dot through it. The definite defect.
   straddled    an opaque filled shape painted BEFORE the text covers only PART of
                it, so one label sits on two backgrounds and is legible on one.
                The phone-bezel case.
   speckled     a SMALL filled shape painted BEFORE the text lands inside its
                x-height band. The glyphs win the paint order, so the text is
                technically readable and the word still looks broken, because a
                dot appears between two letters. This mode exists because the
                first run of this file found the four straddles in `trap` and
                missed both r0 defects -- a dot inside MEASLES and a dot inside
                the numerals of "R0 12-18" -- for the reason that they are painted
                UNDER the label rather than over it. "The text is on top" and "the
                text is legible" are different claims.
   low-contrast the text sits entirely on a fill it has no contrast against.
   clipped-control
                a CONTROL is partly covered by an opaque shape painted after it.
                Not about text at all, and here because it needs the same two
                things -- paint order and partial coverage -- and because two of
                this artifact's defects were exactly this and no instrument could
                see either: `trap`'s "Correct this" pill was centred on a meter 62
                units from the phone's edge, so 22 units of a 168-wide pill were
                drawn behind the phone body; and the ledger slider's track began at
                the card's right edge, so half the handle sat inside the card. Both
                were found by looking at a screenshot AFTER every check passed. A
                control with a corner cut off by an unrelated object reads as a
                rendering fault whether or not it still works, which is why
                interact.js passing 12/12 says nothing about it.

   They are reported separately because the fixes differ: occlusion is a paint-order
   or layout problem, straddling is a placement problem, contrast is a colour
   problem. One combined "unreadable" count would hide which.

   STROKES, AND A BLIND SPOT THAT LASTED ONE SCENE
   -----------------------------------------------
   The first version of this file measured filled shapes only, and said so in this
   comment, on the reasoning that a diagonal line's bounding box is its whole
   diagonal extent -- so a bbox test would report every long leader line as
   "overlapping" every label in its quadrant, and a check with that false-positive
   rate is unreadable. That reasoning is correct about BBOX TESTS and I let it
   stand as a reason to not check strokes at all.

   The very next scene examined by hand, `sequelae`, has the red SSPE leader drawn
   straight through the "0" of its "yr 4-10" tick label. At a glance the label
   reads "yr 4-1" and looks truncated. So the documented blind spot was not an
   acceptable narrowing of scope -- it was the defect, in the first place anyone
   looked. Documenting a gap is not the same as it being reasonable to have one.

   Strokes are now tested EXACTLY rather than by bbox: sample the geometry with
   getPointAtLength, map each sample through the element's screen CTM, and ask
   whether any sample lands in the label's x-height band, inflated by half the
   rendered stroke width. A diagonal's bbox is meaningless here because the
   diagonal itself is what gets measured. Bboxes are still used, but only as a
   cheap prefilter to decide which strokes are worth sampling -- a bbox is a
   superset of the geometry, so a prefilter on it cannot produce a false negative.

   NOTE ON COST: sampling is capped at 300 points per element and only runs for
   strokes whose bbox already intersects the label, which is a handful per label
   rather than every stroke in the scene.                                        */

const { chromium } = require('playwright');
const path = require('path');

/* LEGIBLE_URL exists so this check can be pointed at a DIFFERENT copy of the
   artifact -- specifically an older one. After the findings fell 100+ -> 14 -> 2 ->
   0, "clean" needed to be distinguished from "blind", and the only honest way to do
   that is a positive control: run the current instrument against the file as it was
   before the fixes and require it to still find them. A check that has quietly
   stopped detecting anything reports clean too. */
const URL = process.env.LEGIBLE_URL ||
  ('file:///' + path.resolve(__dirname, 'faster-than-the-rumour.html').replace(/\\/g, '/'));
const ONLY = (process.argv.find(a => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const ALL_VIEWS = process.argv.includes('--all-views');

/* audit.js's number, for the same reason: below it, a third of the piece is still
   in flight and this would measure where things are passing through. */
const SETTLE = 4500;

const VIEWS = ALL_VIEWS
  ? [{ name: 'desktop', width: 1440, height: 900 }, { name: 'mobile', width: 375, height: 780 }]
  : [{ name: 'desktop', width: 1440, height: 900 }];

/* ---------------------------------------------------------------- */
/* The probe, defined once and injected. The verify pass runs this
   IDENTICAL function rather than a second implementation, because a
   verifier that re-derives the rule can only ever confirm its own
   version of it.                                                    */
/* ---------------------------------------------------------------- */
const PROBE = function () {
  const svg = document.querySelector('#viz');
  if (!svg) return { hits: [], texts: 0, shapes: 0 };

  const eff = (el) => {
    let o = 1, p = el;
    while (p && p !== svg.parentNode) {
      const a = p.getAttribute && p.getAttribute('opacity');
      if (a != null && a !== '') o *= parseFloat(a);
      p = p.parentNode;
    }
    return o;
  };

  const rgb = (s) => {
    if (!s) return null;
    const m = s.match(/rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?/);
    if (!m) return null;
    return { r: +m[1], g: +m[2], b: +m[3], a: m[4] == null ? 1 : +m[4] };
  };
  const lum = (c) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const ratio = (a, b) => {
    const la = lum(a), lb = lum(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  };

  /* the same visible-top-level-group filter audit.js uses, so the two agree on
     which scene is on screen */
  const vis = [...svg.children].filter(g =>
    g.tagName === 'g' && +(g.getAttribute('opacity') ?? 1) > 0.05);

  const CTL_ROLES = ['button', 'slider', 'checkbox', 'radio', 'tab',
                     'link', 'switch', 'option', 'menuitem'];
  const ctlOf = (el) => {
    let n = el;
    while (n && n.getAttribute) {
      const r = n.getAttribute('role');
      if (r && CTL_ROLES.indexOf(r) >= 0) return n;
      n = n.parentNode;
    }
    return null;
  };
  const texts = [];
  const shapes = [];
  const strokes = [];
  const controls = [];
  /* PAPER is defined below for the fill checks; the stroke filter above needs it
     during collection, so the constant lives here and is aliased there. */
  const PAPER0 = { r: 248, g: 246, b: 241, a: 1 };
  let order = 0;

  for (const g of vis) {
    for (const n of g.querySelectorAll('*')) {
      if (n.closest('clipPath')) continue;
      const o = eff(n);
      const r = n.getBoundingClientRect();
      const idx = order++;

      /* Any interactive role, not just 'button'.
         Matching only role="button" meant the ledger slider was never collected --
         its thumb is role="slider" -- so the handle that sat half inside the ledger
         card, one of the two defects this whole mode exists for, was invisible to
         it. Caught by the positive control firing for `trap` and staying silent for
         `arithmetic`, which is the difference between a check that works and a check
         that works once. tabindex="0" is included because a focusable thing is a
         control whether or not anyone gave it a role. */
      const role = n.getAttribute && n.getAttribute('role');
      if ((role && CTL_ROLES.indexOf(role) >= 0)
          || (n.getAttribute && n.getAttribute('tabindex') === '0')) {
        if (o >= 0.3 && r.width >= 4 && r.height >= 4) {
          controls.push({ idx, r, node: n,
            label: (n.getAttribute('aria-label') || n.textContent || '').trim().slice(0, 28) });
        }
        /* fall through: a control's own label still gets measured as text */
      }
      if (n.tagName === 'text') {
        if (!n.textContent.trim()) continue;
        if (o < 0.3) continue;
        if (r.width < 1 || r.height < 1) continue;
        const cs = getComputedStyle(n);
        /* The INK box, not the line box. getBBox() on an SVG <text> returns the
           tight glyph extent; getBoundingClientRect() returns the line box, which
           carries leading above the caps and below the baseline. Mapped through the
           element's screen CTM so it is comparable with every other rect here. */
        let ink = null;
        try {
          const bb = n.getBBox(), m = n.getScreenCTM();
          if (bb && m && bb.width) {
            const px = [[bb.x, bb.y], [bb.x + bb.width, bb.y + bb.height]]
              .map(([a, b]) => ({ x: m.a * a + m.c * b + m.e, y: m.b * a + m.d * b + m.f }));
            ink = {
              left: Math.min(px[0].x, px[1].x), right: Math.max(px[0].x, px[1].x),
              top: Math.min(px[0].y, px[1].y), bottom: Math.max(px[0].y, px[1].y),
            };
          }
        } catch (e) { ink = null; }
        /* A HALO PROTECTS AGAINST WHAT IS UNDER THE TEXT.
           paint-order="stroke" with a stroke the colour of the background draws an
           opaque outline behind the glyphs -- the standard answer to placing a label
           inside a field of marks -- and it is invisible to a geometric check,
           because the dot still overlaps the label's box. Without this the halo
           cannot clear a single finding and the only ways to satisfy the check are to
           move labels out of the quadrants they name or reseed until nothing
           collides: both trade a correct composition for a clean report.

           Read from the ATTRIBUTE. paint-order is a presentation attribute and
           getComputedStyle() reports "normal" for elements carrying it, so reading
           the computed value detected no halo anywhere and waived nothing.

           Only `speckled` is waived -- a mark painted BENEATH the text, which the
           halo covers. Anything painted OVER the text is in front of the halo too, so
           occlusion still counts. And the stroke has to match the background: a
           contrasting outline is decoration, not protection. */
        let halo = false;
        const po = n.getAttribute('paint-order') || cs.paintOrder || '';
        if (po.indexOf('stroke') === 0) {
          const hs = rgb(cs.stroke);
          if (hs && cs.stroke !== 'none' && parseFloat(cs.strokeWidth || '0') > 0) halo = hs;
        }
        texts.push({
          idx, r, o, ink, halo,
          s: n.textContent.trim().slice(0, 28),
          fill: rgb(cs.fill),
          size: parseFloat(cs.fontSize) || 0,
          node: n,
        });
        continue;
      }
      if (['rect', 'circle', 'ellipse', 'path', 'polygon', 'line', 'polyline'].indexOf(n.tagName) < 0) continue;
      const cs = getComputedStyle(n);

      /* strokes: kept separately, because they are tested by sampling the
         geometry rather than by intersecting boxes */
      const sc = rgb(cs.stroke);
      const sw = parseFloat(cs.strokeWidth || '0');
      if (sc && cs.stroke !== 'none' && sw > 0) {
        const so = o * parseFloat(cs.strokeOpacity || '1') * sc.a;
        /* No paper comparison here. Whether a stroke is visible depends on what it
           is drawn ON, and the paper is only that for the scenes with nothing
           behind them. `afterwords` prints its caption on a dark card and the
           card's own border runs behind the text: a dark stroke on a dark fill
           cannot break a word, and filtering against the paper let it through as a
           1.8px stroke "crossing" a label that is perfectly clean.
           Same mistake as picking a background by area instead of paint order --
           measuring against a global constant instead of the local composite. The
           contrast test moves to the point of use, where the text's own background
           is known. */
        if (so >= 0.25) strokes.push({ idx, r, node: n, tag: n.tagName, w: sw,
                                       cover: so, fill: sc });
      }

      /* A <line> HAS NO INTERIOR AND CANNOT BE FILLED, and SVG's default fill is
         BLACK -- so every ln() in this artifact (rules, ticks, axes, leaders,
         hatching) was being collected as an opaque black rectangle the size of its
         bounding box. That is not a threshold judgement, it is a fact about the
         element. It produced seven false `clipped-control` findings in `lenses`
         reporting a "ground 19.4:1 from the paper" -- 19.4:1 is black on paper, and
         the thing was a hairline divider. It also stood to poison the background
         composite wherever a long diagonal line's bbox covered a label.
         polyline is left in: it can legitimately carry a fill. */
      if (n.tagName === 'line') continue;
      if (!cs.fill || cs.fill === 'none') continue;
      const f = rgb(cs.fill);
      if (!f) continue;
      const fo = parseFloat(cs.fillOpacity || '1');
      const cover = o * fo * f.a;
      /* ONE opacity gate per mode, not one gate for the file.
         The first version admitted a shape only at cover >= 0.55, on the reasoning
         that anything sheerer cannot hide text. True, and it silently disqualified
         the two r0 defects this file was written to catch: the ring dots are pale,
         around 0.4, so they were dropped before any check ran and the run came back
         reporting only `trap`. "Can this hide a glyph" and "is this visible enough
         to break a word" are different questions with different answers, and a
         single threshold can only ask one of them. Admitted from 0.18; each mode
         applies its own floor below. */
      if (cover < 0.18) continue;
      if (r.width < 1 || r.height < 1) continue;
      shapes.push({ idx, r, fill: f, node: n, tag: n.tagName, cover });
    }
  }

  const PAPER = PAPER0;
  const inter = (a, b) => {
    const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
    const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    return (w > 0 && h > 0) ? w * h : 0;
  };

  /* Where the offending element IS, in the detail line.
     Added after a finding in `comments` could not be adjudicated from the report:
     the message said a circle's left edge crossed a username, and the screenshot
     showed the comment rows laid out correctly with no overlap. Diagnosing it with
     a separate throwaway script was worse than useless -- that script walked
     svg.querySelectorAll('*') instead of only the visible scene groups, so it
     "found" a pale teal circle from the loop diagram and an r0 dust dot, neither
     of which the real check ever considered, and it sent me looking for a
     cross-scene leak that does not exist. A debug path that is not the code path
     produces confident answers about a different program. The box goes in the
     finding itself now. */
  const bx = r => '[' + Math.round(r.left) + ',' + Math.round(r.top)
                + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) + ']';

  const hits = [];
  /* One element can trip two modes against one label: in `trap` the phone body's
     FILL straddles four annotations and the same body's STROKE crosses the same
     four, so the first run with strokes reported eight findings for four things to
     fix. A count that double-reports is a count you stop trusting, and the
     temptation is then to raise a threshold until the number looks right, which
     loses real defects. Deduped on (label, element) instead, keeping the more
     descriptive diagnosis -- see the collapse below. */
  for (const t of texts) {
    const tArea = t.r.width * t.r.height;
    /* The band where the glyphs actually are: THE INK BOX.

       Two models preceded this and both were wrong in opposite directions. The
       middle 70% of the line box reached into leading, so the BUDGET paper's corner
       -- below the desk title's baseline, clear of every letter -- reported as a
       stroke through the title. The middle 50% fixed that and lost `sequelae`'s red
       leader through the "0" of "yr 4-10", a real defect and one of the reasons this
       file exists; the positive control caught the regression in the same run that
       confirmed the fix. Deriving the band from cap-height and descender ratios was
       better and still a model: it did not restore the leader either, because the
       leader grazes the last glyph and a modelled box is not where the ink is.

       A line box carries leading, which is a property of the leading and not of the
       type size, so NO fraction of it locates glyphs at both 6.4px and 13px. SVG
       will simply say where the ink is. Ask it.                                  */
    const core = t.ink ? {
      left: t.ink.left, right: t.ink.right, top: t.ink.top, bottom: t.ink.bottom,
    } : {
      left: t.r.left, right: t.r.right,
      top: t.r.top + t.r.height * 0.2,
      bottom: t.r.bottom - t.r.height * 0.2,
    };
    const coreArea = (core.right - core.left) * (core.bottom - core.top);

    const tCtl = ctlOf(t.node);
    const unders = [], overs = [];
    for (const sh of shapes) {
      if (sh.node === t.node) continue;
      if (sh.node.contains(t.node) || t.node.contains(sh.node)) continue;
      if (!inter(t.r, sh.r)) continue;
      (sh.idx > t.idx ? overs : unders).push(sh);
    }

    /* ---- what this label is actually sitting on: the COMPOSITE ----
       Two wrong answers preceded this one, and the second was worse than the first
       because it looked reasonable.

       First it was "whichever covering shape has the largest intersection area".
       That breaks the moment text sits inside two nested shapes: both
       intersections equal the text's own area exactly, `>` keeps the earlier one,
       and earlier in document order is the OUTERMOST. Every white avatar initial
       in the console scenes was measured against the white card 792 units wide
       behind the 20-unit teal circle it was printed on, and reported at 1.00:1.

       Then it was "the topmost fully-covering shape, if it is at least 55% opaque".
       Correct for opaque layers and blind to the mechanism this artifact actually
       uses to keep white text readable over imagery: the phone draws a black scrim
       at opacity .42 across the bottom of its screen, exactly so the caption can
       sit over a figure. At .42 that scrim failed the opacity floor, was discarded,
       and the caption's contrast was computed against the raw purple of the
       figure's shoulder -- 1.8:1 reported where the screen actually shows about
       7:1. Eight findings across reel, swipe, anatomy, counterpost and trap, all
       false, and the "fix" they invited was to add a scrim that was already there.

       A background is not one layer. It is what you get by painting all of them.
       Composite in paint order and the special cases dissolve: a shape hidden
       behind a later opaque one contributes nothing because the opaque one's alpha
       zeroes it, which is what the nearest-layer guard was hand-coding. */
    const comp = list => list.reduce((acc, sh) => ({
      r: acc.r * (1 - sh.cover) + sh.fill.r * sh.cover,
      g: acc.g * (1 - sh.cover) + sh.fill.g * sh.cover,
      b: acc.b * (1 - sh.cover) + sh.fill.b * sh.cover,
      a: 1,
    }), PAPER);
    /* 0.9: a layer has to cover essentially the whole label to be part of its
       background. Anything covering less is a straddle candidate, tested below. */
    const covering = unders
      .filter(sh => inter(t.r, sh.r) / tArea >= 0.9)
      .sort((a, b) => a.idx - b.idx);
    const bgAll = comp(covering);
    /* The paint index of the topmost effectively-opaque layer under this label.
       Compositing handles buried FILLS on its own -- an opaque layer's alpha zeroes
       whatever is beneath it -- but a stroke is tested by sampling its geometry, and
       geometry knows nothing about what was painted over it. `afterwords` prints its
       caption on an opaque dark panel, and the video card BEHIND that panel is
       narrower than the caption, so the card's two vertical edges pass through the
       label's band and reported as strokes crossing a line of text that is visibly
       clean. Anything painted below this index cannot be seen where the label is. */
    const opaqueIdx = covering.reduce((m2, sh) => sh.cover >= 0.9 ? Math.max(m2, sh.idx) : m2, -1);

    /* IS THIS LABEL ON SCREEN AT ALL?
       `comments` slides an opaque sheet over the feed, and everything the sheet
       covers -- the right rail's counters and their icons, the post's avatar --
       is still in the DOM with a live bounding box. Eleven findings came from that
       one scene: three occlusions where a feed icon overlaps a feed counter behind
       the sheet, and eight straddles against a 74x74 avatar circle that cannot be
       seen because the sheet is painted over it. All eleven describe geometry that
       is real and pixels that are not.
       A label under a modal has no legibility to assess. Skip the whole label. */
    /* only `overs` can bury it -- `unders` is by definition everything painted
       BEFORE this text, so the first draft's extra `unders.some(... sh.idx > t.idx)`
       clause could never be true. Removed rather than left in as harmless: a dead
       condition in a check reads as a case someone thought about. */
    if (overs.some(sh => sh.cover >= 0.9 && inter(t.r, sh.r) / tArea > 0.92)) continue;

    /* ---- occluded: something opaque painted PARTLY over the glyphs ----
       Partly is the operative word. `comments` opens a sheet over the feed, and
       that sheet covers the right rail's counters -- 412K, 8,204, 22.4K --
       completely and on purpose, which the first version of this check reported as
       three occlusion defects. Full coverage is the overlay pattern: a modal is
       SUPPOSED to hide what is under it, and a label at 100% under one is not
       illegible, it is not on screen. A dot sitting in the middle of a word is the
       defect this mode is for, and that is always partial.
       Whether covered content is correctly hidden from the accessibility tree is a
       real question and a11y.js owns it; it is not answerable from geometry. */
    for (const sh of overs) {
      const ovCore = inter(core, sh.r);
      if (ovCore >= 9 && sh.cover >= 0.55 && ovCore / coreArea <= 0.92) {
        hits.push({
          kind: 'occluded', text: t.s, tag: sh.tag, el: sh.idx,
          detail: Math.round(ovCore) + 'sq px of the x-height band ' + bx(sh.r),
          cover: +(ovCore / coreArea).toFixed(3),
        });
      }
    }

    for (const sh of unders) {
      const shArea = sh.r.width * sh.r.height;
      const ovCore = inter(core, sh.r);

      /* ---- speckled: a mark small enough to be debris, inside the word ----
         Bounded above at 30% of the label area so a pill, card or panel the label
         is deliberately sitting ON is not mistaken for debris landing IN it. */
      const haloCovers = t.halo && ratio(t.halo, bgAll) < 1.6;
      /* A control's own contents are not debris landing in its label. The chrome
         exclusion already covered STROKES -- a pill's border reporting itself -- and
         missed fills, so `cliff`'s "Seed one case" was flagged against the play
         glyph drawn inside that same button. Pill, glyph and label are siblings
         inside the control's group, so `contains` does not relate them; a shared
         interactive ancestor does. */
      const sameCtl = tCtl && ctlOf(sh.node) === tCtl;
      /* AGAINST THE LOCAL COMPOSITE, NOT AGAINST THE PAPER -- and the argument for
         this is already written twenty lines up, in the stroke collector, where it
         says: "Whether a stroke is visible depends on what it is drawn ON, and the
         paper is only that for the scenes with nothing behind them... measuring
         against a global constant instead of the local composite." The stroke test
         then does the right thing (`ratio(st.fill, bgAll) < 1.6 -> continue`) and
         this one, four lines away, kept comparing to PAPER.
         `comments` is what it cost: a 21x21 circle filled #241c18 inside a comment
         line, on a sheet that is itself #241c18. Against paper that is a huge ratio
         and it reported as debris in the word; against the sheet it is about 1.0 and
         cannot be seen at all. Dismissed as a false positive twice on the strength of
         a render that was, correctly, showing nothing.
         Same shape as the ink-box/line-box split: a lesson learned once and applied
         to one of the two places it belongs. */
      if (!haloCovers && !sameCtl
          && shArea < tArea * 0.30 && ovCore >= 5
          && sh.r.width >= 2 && sh.r.height >= 2
          && sh.cover >= 0.25
          && ratio(sh.fill, bgAll) > 1.6) {
        hits.push({
          kind: 'speckled', text: t.s, tag: sh.tag, el: sh.idx,
          detail: Math.round(ovCore) + 'sq px inside the word ' + bx(sh.r),
          cover: +(ovCore / coreArea).toFixed(3),
        });
      }

      /* ---- straddled: the label spans this shape's BOUNDARY ----
         Tested on the edges, not on a coverage fraction. The fraction version
         asked "does this shape cover between 10% and 90% of the label", and a text
         box includes leading and descender space the glyphs do not use, so a label
         sitting comfortably inside a dark card measured as 89% covered and was
         reported as straddling it -- 25 findings across `comments`, `counterpost`,
         `swipe`, `reel` and `anatomy`, none of them real. Widening the band would
         have missed real ones; narrowing it would have missed more. The fraction
         was the wrong quantity. An edge passing through the x-height band is the
         thing itself.

         And it is only a LEGIBILITY defect if the label survives on one side and
         not the other, which is asked directly rather than through a
         shape-versus-paper threshold. Dark text half on paper and half on a pale
         tint reads fine and is not reported; white text half on a dark card and
         half on paper is invisible for half its length and is. */
      /* A shape can only straddle this label if it is the NEAREST layer under it.
         The avatar circle in `comments` is painted before the sheet that hides it,
         so by paint order it looked like a candidate background even though the
         text never touches it. Anything painted below the topmost full-coverage
         background is behind that background, not beside the text. */
      if (shArea > tArea * 1.5 && sh.cover >= 0.55 && t.fill) {
        const vCross = x => x > core.left + 1 && x < core.right - 1
                            && sh.r.top < core.bottom && sh.r.bottom > core.top;
        const hCross = y => y > core.top + 0.5 && y < core.bottom - 0.5
                            && sh.r.left < core.right && sh.r.right > core.left;
        const edges = [];
        if (vCross(sh.r.left)) edges.push('left');
        if (vCross(sh.r.right)) edges.push('right');
        if (hCross(sh.r.top)) edges.push('top');
        if (hCross(sh.r.bottom)) edges.push('bottom');
        if (edges.length) {
          /* both sides composited: the stack WITH this shape spliced in at its own
             paint index, against the stack without it. A scrim painted above the
             shape then applies to both sides, which is the point. */
          const withSh = covering.concat([sh]).sort((a, b) => a.idx - b.idx);
          const cIn = ratio(t.fill, comp(withSh)), cOut = ratio(t.fill, bgAll);
          if (Math.min(cIn, cOut) < 3.0 && Math.max(cIn, cOut) >= 3.0) {
            hits.push({
              kind: 'straddled', text: t.s, tag: sh.tag, el: sh.idx,
              detail: edges.join('+') + ' edge through the word; '
                    + cIn.toFixed(1) + ':1 on it, ' + cOut.toFixed(1) + ':1 off it '
                    + bx(sh.r),
              cover: +(1 / Math.min(cIn, cOut)).toFixed(3),
            });
          }
        }
      }
    }

    /* ---- strokes crossing this label, tested on the geometry ---- */
    /* A control's pill and its label are SIBLINGS inside the control's group, so
       `contains` does not relate them and the pill's own border read as a stroke
       crossing the label it encloses -- `cliff`'s "Seed one case" button reporting
       itself. If a stroke and a label share a control ancestor, the stroke is that
       control's chrome. */
    /* ctlOf, not closest('[role]').
       closest('[role]') was a silent no-op that disabled this entire check. The svg
       root carries role="group", so it is the nearest role-bearing ancestor of every
       text AND every stroke in the document -- the equality held everywhere, every
       stroke was skipped against every label, and the check reported clean without
       throwing. It survived because it did NOT hold in the one case involving a real
       control (the desk's clickable papers resolve to their own role="button"), so
       the exclusion permitted exactly the case it was written to exclude and
       suppressed everything else. The visible symptom was `sequelae`'s leader
       vanishing from the positive control while a false positive stayed.
       Only interactive roles count. role="group" is a grouping label, not a
       control. */
    for (const st of strokes) {
      if (st.node === t.node) continue;
      if (st.node.contains(t.node)) continue;
      if (tCtl && ctlOf(st.node) === tCtl) continue;
      if (st.idx < opaqueIdx) continue;          /* buried under an opaque layer */
      if (!inter(core, st.r)) continue;          /* cheap superset prefilter */
      let m = null, len = 0;
      try { m = st.node.getScreenCTM(); len = st.node.getTotalLength(); } catch (e) { continue; }
      if (!m || !(len > 0)) continue;
      const k = Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) || 1;
      const pad = (st.w * k) / 2;
      const band = {
        left: core.left - pad, right: core.right + pad,
        top: core.top - pad, bottom: core.bottom + pad,
      };
      const step = Math.max(len / 300, 1.2);
      let inBand = 0, yLo = Infinity, yHi = -Infinity;
      for (let d = 0; d <= len; d += step) {
        let q; try { q = st.node.getPointAtLength(d); } catch (e) { break; }
        const x = m.a * q.x + m.c * q.y + m.e;
        const y = m.b * q.x + m.d * q.y + m.f;
        if (x >= band.left && x <= band.right && y >= band.top && y <= band.bottom) {
          inBand++;
          if (y < yLo) yLo = y;
          if (y > yHi) yHi = y;
        }
      }
      if (!inBand) continue;
      if (inBand < 2 && st.w * k < 1.6) continue;
      /* TRANSVERSE, not tangential.
         A stroke running ALONG a line of type at its descender depth is an
         underline; a stroke crossing it is a broken word. Both put samples in the
         band, so counting samples cannot tell them apart -- which is how the BUDGET
         paper's near-horizontal top edge, sitting just under the desk title, kept
         reporting as a stroke through the title however the band was defined.
         The distinguishing quantity is vertical penetration: a tangential graze
         spans almost none of the band's height, a crossing spans most of it. */
      const bandH = band.bottom - band.top;
      if (bandH > 0 && (yHi - yLo) < bandH * 0.35 && st.w * k < bandH * 0.5) continue;
      /* invisible against what this label is sitting on -> cannot break the word */
      if (st.fill && ratio(st.fill, bgAll) < 1.6) continue;
      /* a halo covers strokes painted UNDER the text, same as it covers fills */
      if (st.idx < t.idx && t.halo && ratio(t.halo, bgAll) < 1.6) continue;
      hits.push({
        kind: st.idx > t.idx ? 'occluded' : 'speckled',
        text: t.s, tag: st.tag + ':stroke', el: st.idx,
        detail: 'a ' + (st.w * k).toFixed(1) + 'px stroke crosses the word ' + bx(st.r),
        cover: +(inBand * step / len).toFixed(3),
      });
    }

    if (t.fill) {
      const c = ratio(t.fill, bgAll);
      /* 2.5, not 4.5. a11y.js already owns the WCAG colour pass and its
         thresholds; duplicating them here would re-litigate settled decisions and
         bury the modes above in noise. This floor only catches text that is close
         to invisible on what it is sitting on. */
      if (c < 2.5) {
        hits.push({
          kind: 'low-contrast', text: t.s, tag: 'fill', el: -1,
          detail: c.toFixed(2) + ':1 at ' + Math.round(t.size) + 'px',
          cover: 1,
        });
      }
    }
  }
  /* Overlays that are the content, not a defect.
     `gate` draws a hatched "EXTERNAL COMMUNICATIONS PAUSED" bar ACROSS the five
     desks of the approval chain -- that is the scene's whole argument, and the bar
     crossing the controls is the image. No geometry distinguishes an overlay that
     means something from one that is a mistake, so it is named here with its reason,
     the way motion.js names its intended reductions. One entry, stated, beats a
     threshold quietly tuned until the five findings disappear along with whatever
     else that threshold was catching. */
  const INTENDED_OVER = { gate: 'the PAUSED bar is drawn across the chain on purpose' };
  const sceneKey = (document.querySelector('.step[data-key]') && (function(){
    /* the on-screen scene: the visible top-level group's own key is not recorded in
       the DOM, so fall back to the step nearest the viewport centre */
    let best = null, bd = Infinity;
    for (const el of document.querySelectorAll('.step[data-key]')) {
      const r = el.getBoundingClientRect();
      const d = Math.abs((r.top + r.bottom) / 2 - window.innerHeight / 2);
      if (d < bd) { bd = d; best = el.dataset.key; }
    }
    return best;
  })()) || null;

  /* ---- controls that span something they should not ----
     WHAT THIS MODE ORIGINALLY TESTED WAS THE WRONG THING, and a positive control
     is what caught it. It looked for a control partly covered by an opaque shape
     painted AFTER it, on the belief that `trap`'s "Correct this" pill had 22 units
     of itself hidden behind the phone body. Run against the pre-fix file it found
     nothing, so the artifact was rendered and looked at: the pill is painted ON TOP
     of the phone. Its left arc is fully visible, crossing the dark shell, and what
     actually looks broken is that the pill's INTERIOR is dark for its first 15% and
     paper for the rest -- a straddle, not an occlusion. The comment in the artifact
     saying "behind the phone body" was wrong too, and is corrected there.

     A control is reported when either:
       a filled shape painted under it has an edge through it, and that shape's
       ground is materially different from the paper -- so part of the control sits
       on one surface and part on another; or
       a stroke crosses its interior -- which is how the ledger slider's handle was
       cut by the card border it was sitting on top of.

     Both now reproduce on the pre-fix file, which is the only reason to trust
     either. */
  for (const c of controls) {
    if (sceneKey && INTENDED_OVER[sceneKey]) break;
    /* Inset before testing. ctl() wraps its pill in padHit(..., 5), so a control's
       bounding box is 5 units larger than anything you can see on all four sides --
       on a 168x34 pill that invisible ring is 27% of the box. Without the inset a
       shape grazing only the padding reports as covering a quarter of the control,
       and a brand-new check whose first run is full of findings nobody can see is
       the failure mode this file has already been through four times. 6px, so the
       margin is discounted at both widths. */
    const cr = {
      left: c.r.left + 6, right: c.r.right - 6,
      top: c.r.top + 6, bottom: c.r.bottom - 6,
    };
    if (cr.right - cr.left < 8 || cr.bottom - cr.top < 8) continue;

    /* A control that draws NOTHING of its own cannot be clipped by anything.
       `swipe`'s "next video" is a transparent tap target over the whole phone, and
       `anatomy`'s four annotations are text plus a transparent padHit rect -- so
       every shape in the scene crosses them by construction, and six findings said
       so. Whatever visible content such a control has is text, which the text modes
       above already cover. A control is only clippable if it paints a shape. */
    let paints = false;
    for (const q of c.node.querySelectorAll('rect,circle,ellipse,path,polygon,polyline')) {
      const qs = getComputedStyle(q);
      const qf = rgb(qs.fill), qk = rgb(qs.stroke);
      if ((qf && qs.fill !== 'none' && qf.a > 0.05) ||
          (qk && qs.stroke !== 'none' && qk.a > 0.05 && parseFloat(qs.strokeWidth || '0') > 0)) {
        paints = true; break;
      }
    }
    if (!paints) continue;

    for (const sh of shapes) {
      if (c.node.contains(sh.node) || sh.node.contains(c.node)) continue;
      if (sh.cover < 0.55) continue;
      if (!inter(cr, sh.r)) continue;
      const vCross = x => x > cr.left + 2 && x < cr.right - 2
                          && sh.r.top < cr.bottom && sh.r.bottom > cr.top;
      const hCross = y => y > cr.top + 2 && y < cr.bottom - 2
                          && sh.r.left < cr.right && sh.r.right > cr.left;
      const edges = [];
      if (vCross(sh.r.left)) edges.push('left');
      if (vCross(sh.r.right)) edges.push('right');
      if (hCross(sh.r.top)) edges.push('top');
      if (hCross(sh.r.bottom)) edges.push('bottom');
      if (!edges.length) continue;
      const split = ratio(sh.fill, PAPER);
      if (split < 2.0) continue;          /* same ground either side of the edge */
      const ov = inter(cr, sh.r);
      /* and enough of the control has to be on the other ground to see it. The
         edge test alone reported 1% grazes, which is a hit target's padding
         touching a neighbour, not a control with a bite out of it. */
      if (ov / ((cr.right - cr.left) * (cr.bottom - cr.top)) < 0.04) continue;
      hits.push({
        kind: 'clipped-control', text: c.label || '(unlabelled control)',
        tag: sh.tag, el: sh.idx,
        detail: edges.join('+') + ' edge through the control; '
              + Math.round(ov / ((cr.right - cr.left) * (cr.bottom - cr.top)) * 100)
              + 'pc of it sits on a ground ' + split.toFixed(1) + ':1 from the paper '
              + bx(sh.r),
        cover: +(ov / ((cr.right - cr.left) * (cr.bottom - cr.top))).toFixed(3),
      });
    }

    for (const st of strokes) {
      if (c.node.contains(st.node) || st.node.contains(c.node)) continue;
      /* Painted AFTER the control, or it is behind the control's own fill and
         cannot be seen. Without this the desk surface's border reported as running
         through all three paper controls that lie ON the desk and cover its edge --
         and the ledger card's border reported as cutting the slider handle, which
         is a filled circle drawn over it. Both hidden, both were findings.
         Consequence worth stating: the ledger slider's real defect -- a control
         straddling the boundary of a panel it does not belong to, where both
         grounds are near-white so there is no contrast signal -- is COMPOSITIONAL
         and this file cannot detect it. Better an instrument with a stated blind
         spot than one that appears to cover the case by way of an invisible line. */
      if (st.idx <= c.idx) continue;
      if (!inter(cr, st.r)) continue;
      let m = null, len = 0;
      try { m = st.node.getScreenCTM(); len = st.node.getTotalLength(); } catch (e) { continue; }
      if (!m || !(len > 0)) continue;
      const k = Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) || 1;
      const step = Math.max(len / 300, 1.2);
      let inside = 0, xLo = Infinity, xHi = -Infinity, yLo = Infinity, yHi = -Infinity;
      for (let d = 0; d <= len; d += step) {
        let q; try { q = st.node.getPointAtLength(d); } catch (e) { break; }
        const x = m.a * q.x + m.c * q.y + m.e;
        const y = m.b * q.x + m.d * q.y + m.f;
        if (x > cr.left + 2 && x < cr.right - 2 && y > cr.top + 2 && y < cr.bottom - 2) {
          inside++;
          if (x < xLo) xLo = x; if (x > xHi) xHi = x;
          if (y < yLo) yLo = y; if (y > yHi) yHi = y;
        }
      }
      if (inside < 2) continue;
      /* TRAVERSES the control, rather than touching it.
         `translate`'s four route cards are joined to the hub by connector curves
         that TERMINATE on each card's corner -- the intended attachment, and two
         findings said a stroke ran through the control. A rule crossing k280's
         button spans its entire width; a connector meeting a corner spans a few
         pixels. Half the control in one axis is the line between arriving at
         something and passing through it.
         Note the limit: this is per-stroke. A dense hatch of short strokes that
         collectively cross a control will not trip it -- which happens to be the
         right answer for `gate`, where the hatched PAUSED bar is drawn over the
         chain on purpose, but it is right there by luck rather than by reasoning. */
      const cw = cr.right - cr.left, ch = cr.bottom - cr.top;
      if (Math.max((xHi - xLo) / cw, (yHi - yLo) / ch) < 0.5) continue;
      hits.push({
        kind: 'clipped-control', text: c.label || '(unlabelled control)',
        tag: st.tag + ':stroke', el: st.idx,
        detail: 'a ' + (st.w * k).toFixed(1) + 'px stroke runs through the control '
              + bx(st.r),
        cover: +(inside * step / len).toFixed(3),
      });
    }
  }

  /* collapse per (label, element). Rank is the usefulness of the DIAGNOSIS, not
     the severity: "this label straddles a dark panel edge" tells you what to move,
     "a stroke crosses it" is the same fact with less in it. */
  const rank = { straddled: 0, occluded: 1, speckled: 2, 'clipped-control': 3, 'low-contrast': 4 };
  const keep = new Map();
  for (const h of hits) {
    const k = h.text + '|' + h.el;
    const cur = keep.get(k);
    if (!cur || rank[h.kind] < rank[cur.kind]) keep.set(k, h);
  }
  return { hits: [...keep.values()], texts: texts.length, shapes: shapes.length,
           controls: controls.length,
           ctlBoxes: controls.slice(0, 4).map(c => c.label + ' ' + bx(c.r) + ' idx' + c.idx) };
};

/* ---------------------------------------------------------------- */
(async () => {
  const browser = await chromium.launch();
  const found = [];
  let scenes = [];

  /* ---- LIVENESS: THIS CHECK MUST NOT BE ABLE TO PASS A BLANK PAGE ----
     It already did. An edit to the artifact deleted the `if` branch of an if/else
     and left the `else` orphaned -- a syntax error, so the page's entire inline
     script stopped parsing, #viz got no viewBox and no children, and nothing was
     drawn at all. This file walked 59 steps (they are static HTML, so the walk
     succeeded), found zero painted labels, had nothing to report, and printed
     "CLEAN - every label is readable against what is behind it" with exit code 0.
     audit.js and interact.js crashed outright on the same page one minute later.

     The positive control did not save it either, because the control points at a
     COPY of the artifact from before the fixes: that file was fine, the instrument
     was fine, and the file under test was rubble. A control that exercises the
     check cannot tell you the subject arrived.

     So: collect page errors, count what was actually painted, and refuse to report
     anything if the page did not render. An instrument's most dangerous output is a
     pass it was not entitled to give. */
  const pageErrors = [];
  let paintedTexts = 0, sceneWalks = 0;

  const openPage = async (view) => {
    const page = await browser.newPage({ viewport: { width: view.width, height: view.height } });
    page.on('pageerror', e => pageErrors.push('PAGEERROR ' + e.message));
    page.on('console', m => { if (m.type() === 'error') pageErrors.push('CONSOLE ' + m.text()); });
    await page.addInitScript(() => { window.__fastTimers = true; });
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForTimeout(1200);
    return page;
  };
  const settleOn = async (page, key) => {
    await page.evaluate(k => {
      document.querySelector('.step[data-key="' + k + '"]')
        .scrollIntoView({ behavior: 'auto', block: 'center' });
    }, key);
    await page.waitForTimeout(SETTLE);
  };

  for (const view of VIEWS) {
    const page = await openPage(view);
    scenes = await page.$$eval('.step', els => els.map(e => e.dataset.key));
    const targets = ONLY.length ? scenes.filter(k => ONLY.indexOf(k) >= 0) : scenes;

    for (const key of targets) {
      await settleOn(page, key);
      const r = await page.evaluate(PROBE);
      paintedTexts += r.texts || 0;
      sceneWalks++;
      if (process.env.LEGIBLE_DEBUG) console.log('  ~debug ' + key + ': ' + r.controls
        + ' controls, ' + r.shapes + ' shapes, ' + r.texts + ' texts | '
        + JSON.stringify(r.ctlBoxes));
      /* one line per (text, kind), worst cover kept -- a label with four dots on
         it is one defect to fix, not four */
      const best = new Map();
      for (const h of r.hits) {
        const k = h.kind + ' ' + h.text;
        if (!best.has(k) || best.get(k).cover < h.cover) best.set(k, h);
      }
      for (const h of best.values()) found.push({ view: view.name, key, ...h });
    }
    await page.close();
  }

  /* -------- self-verify: every hit re-checked from a fresh page --------
     a11y.js reported 289, then 27, then 1, then 0 real findings across four
     versions, and every one of those collapses was state leaking across a
     59-scene walk. A hit that does not reproduce in isolation is not reported. */
  const byScene = new Map();
  for (const f of found) {
    const k = f.view + '|' + f.key;
    if (!byScene.has(k)) byScene.set(k, []);
    byScene.get(k).push(f);
  }
  const confirmed = [], dropped = [];
  for (const [k, list] of byScene) {
    const parts = k.split('|');
    const view = VIEWS.find(v => v.name === parts[0]);
    const page = await openPage(view);
    await settleOn(page, parts[1]);
    const r = await page.evaluate(PROBE);
    const seen = new Set(r.hits.map(h => h.kind + ' ' + h.text));
    for (const f of list) (seen.has(f.kind + ' ' + f.text) ? confirmed : dropped).push(f);
    await page.close();
  }
  await browser.close();

  console.log('scenes: ' + scenes.length + (ONLY.length ? ' (only ' + ONLY.join(',') + ')' : ''));

  /* refuse to grade a page that did not render */
  const perScene = sceneWalks ? paintedTexts / sceneWalks : 0;
  if (pageErrors.length || sceneWalks === 0 || perScene < 3) {
    console.log('NOT MEASURED - the page did not render, so nothing here is a verdict');
    console.log('  scenes walked: ' + sceneWalks
      + ', painted labels seen: ' + paintedTexts
      + ' (' + perScene.toFixed(1) + ' per scene, expected well over 3)');
    if (pageErrors.length) {
      console.log('  ' + pageErrors.length + ' page error(s), first 3:');
      [...new Set(pageErrors)].slice(0, 3).forEach(e => console.log('    ' + e.slice(0, 200)));
    }
    process.exitCode = 2;
    return;
  }
  console.log('measured ' + paintedTexts + ' painted labels across '
    + sceneWalks + ' scene-views');
  if (dropped.length) {
    console.log('dropped ' + dropped.length + ' hit(s) that did not reproduce in isolation:');
    dropped.forEach(d => console.log('  ~ [' + d.view + '] ' + d.key + '  ' + d.kind + '  "' + d.text + '"'));
  }
  if (!confirmed.length) { console.log('CLEAN - every label is readable against what is behind it'); return; }

  const byKind = {};
  confirmed.forEach(f => (byKind[f.kind] = (byKind[f.kind] || 0) + 1));
  console.log('findings: ' + confirmed.length + '  ' + JSON.stringify(byKind));
  const rank = { occluded: 0, 'clipped-control': 1, speckled: 2, straddled: 3, 'low-contrast': 4 };
  confirmed.sort((a, b) => (rank[a.kind] - rank[b.kind]) || b.cover - a.cover);
  for (const f of confirmed) {
    console.log('  [' + f.view + '] ' + f.key.padEnd(14) + ' ' + f.kind.padEnd(13)
      + ' ' + ('"' + f.text + '"').padEnd(32) + ' ' + f.tag.padEnd(7) + ' ' + f.detail);
  }
  process.exitCode = confirmed.some(f =>
    f.kind === 'occluded' || f.kind === 'speckled' || f.kind === 'clipped-control') ? 1 : 0;
})();
