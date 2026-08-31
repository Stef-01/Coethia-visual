/* Print the numbers legible.js is actually working from, for ONE label.
   Run: K=placement T="Ad ·" W=375 node probe-bg.js

   WHY THIS EXISTS
   ---------------
   Two findings survived a legibility pass and were waived by hand as false positives,
   twice, on the strength of renders that showed nothing wrong. Then three separate
   attempts to explain them by READING legible.js produced three wrong answers, and two
   of those became edits that a positive control rejected -- one of them deleted a true
   positive. Reading a 900-line instrument to predict its own output had become less
   reliable than asking it.

   It took one run of this to settle both, and both were real:

     placement  the badge IS collected, opaque, in `unders`, and covers 0.862 of the
                label's ink box against a 0.9 bar. The entire shortfall is a 1.72px
                strip at the TOP -- badge y 195..205, ink from 193.28 -- so the caps
                hang over the badge onto the player's dark body and `covering` resolves
                to #202124. A DEFECT IN THE PAGE: the badge's width was measured and
                its height left at a hardcoded 22.
     comments   the mark is a 21x21 circle filled #241c18 on a sheet that is itself
                #241c18. Invisible. `speckled` was comparing it to PAPER, a global
                constant, where that is a huge ratio. A DEFECT IN THE CHECK, and one
                the file already argues against in its stroke collector.

   Neither was findable from a screenshot, because in both cases the screenshot was
   right and the inference from it was wrong.

   HOW IT WORKS, AND WHY IT IS A COPY RATHER THAN AN IMPORT
   --------------------------------------------------------
   It replicates legible.js's collection loop -- same tag filter, same `cover`
   derivation, same skip conditions -- and reports, per candidate shape, which
   condition would drop it. A copy is the point: importing the code under test would
   make the probe agree with it by construction, including where it is wrong. The cost
   is that the two can drift, so if this ever disagrees with legible.js about a shape,
   check the loop above against the real one before believing either.                */

const { chromium } = require('playwright');
const path = require('path');

const URL = 'file:///' + path.resolve(__dirname, 'faster-than-the-rumour.html').replace(/\\/g, '/');
const KEY = process.env.K || 'placement';
const NEEDLE = process.env.T || 'Ad';
const W = +(process.env.W || 375), H = +(process.env.H || 780);

(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: W, height: H } });
  const errs = [];
  pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(() => { window.__fastTimers = true; });
  await pg.goto(URL, { waitUntil: 'load' });
  await pg.waitForTimeout(1500);
  await pg.evaluate(k => {
    const el = document.querySelector('.step[data-key="' + k + '"]');
    if (el) el.scrollIntoView({ block: 'center' });
  }, KEY);
  await pg.waitForTimeout(4500);

  const out = await pg.evaluate((needle) => {
    const svg = document.querySelector('#viz');
    if (!svg) return { err: 'no #viz' };

    const rgb = (s) => {
      if (!s) return null;
      const m = s.match(/rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?/);
      return m ? { r: +m[1], g: +m[2], b: +m[3], a: m[4] == null ? 1 : +m[4] } : null;
    };
    const eff = (el) => {
      let o = 1, p = el;
      while (p && p !== svg.parentNode) {
        const a = p.getAttribute && p.getAttribute('opacity');
        if (a != null && a !== '') o *= parseFloat(a);
        p = p.parentNode;
      }
      return o;
    };
    const hex = c => c ? '#' + [c.r, c.g, c.b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('') : 'none';
    const inter = (a, b2) => {
      const w = Math.min(a.right, b2.right) - Math.max(a.left, b2.left);
      const h = Math.min(a.bottom, b2.bottom) - Math.max(a.top, b2.top);
      return w > 0 && h > 0 ? w * h : 0;
    };

    /* Same walk order as legible.js, so idx values are comparable to its output. */
    const all = svg.querySelectorAll('*');
    let target = null, idx = -1;
    const rows = [];

    for (let i = 0; i < all.length; i++) {
      const n = all[i];
      if (n.tagName === 'text') {
        if (!target && (n.textContent || '').indexOf(needle) >= 0) {
          const r = n.getBoundingClientRect();
          const cs = getComputedStyle(n);
          let ink = null;
          try {
            const bb = n.getBBox(), m = n.getScreenCTM();
            if (bb && m && bb.width) {
              const p2 = [[bb.x, bb.y], [bb.x + bb.width, bb.y + bb.height]]
                .map(([a, b3]) => ({ x: m.a * a + m.c * b3 + m.e, y: m.b * a + m.d * b3 + m.f }));
              ink = { left: Math.min(p2[0].x, p2[1].x), right: Math.max(p2[0].x, p2[1].x),
                      top: Math.min(p2[0].y, p2[1].y), bottom: Math.max(p2[0].y, p2[1].y) };
            }
          } catch (e) { ink = null; }
          target = { i, text: n.textContent.trim().slice(0, 30), r: {left:r.left,right:r.right,top:r.top,bottom:r.bottom},
                     ink, fill: hex(rgb(cs.fill)), size: cs.fontSize, o: eff(n) };
          idx = i;
        }
        continue;
      }
      if (['rect','circle','ellipse','path','polygon','line','polyline'].indexOf(n.tagName) < 0) continue;
      rows.push({ i, n });
    }

    if (!target) return { err: 'no text containing "' + needle + '"' };
    const core = target.ink || {
      left: target.r.left, right: target.r.right,
      top: target.r.top + (target.r.bottom - target.r.top) * 0.2,
      bottom: target.r.bottom - (target.r.bottom - target.r.top) * 0.2,
    };
    const coreArea = (core.right - core.left) * (core.bottom - core.top);

    /* Every shape whose box touches the ink box, with the reason legible.js would
       drop it -- reported per shape rather than summarised, because the summary is
       what has been wrong three times. */
    const cands = [];
    for (const { i, n } of rows) {
      const r = n.getBoundingClientRect();
      if (inter(core, r) <= 0) continue;
      const cs = getComputedStyle(n);
      const o = eff(n);
      const f = rgb(cs.fill);
      const fo = parseFloat(cs.fillOpacity || '1');
      const cover = f ? o * fo * f.a : 0;
      const drop = [];
      if (n.tagName === 'line') drop.push('is a <line> (skipped: no interior)');
      if (!cs.fill || cs.fill === 'none') drop.push('fill is none');
      if (!f) drop.push('fill unparseable');
      if (cover < 0.18) drop.push('cover ' + cover.toFixed(3) + ' < 0.18');
      if (r.width < 1 || r.height < 1) drop.push('degenerate box');
      const frac = inter(core, r) / coreArea;
      cands.push({
        idx: i, tag: n.tagName, fill: hex(f), cover: +cover.toFixed(3),
        box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)],
        coversInkFrac: +frac.toFixed(3),
        inCovering: frac >= 0.9 && i < idx && !drop.length,
        side: i < idx ? 'under' : 'over',
        droppedBy: drop.length ? drop.join('; ') : null,
      });
    }
    cands.sort((a, b2) => b2.coversInkFrac - a.coversInkFrac);
    return { target, core, coreArea: Math.round(coreArea), labelIdx: idx, cands };
  }, NEEDLE);

  console.log(JSON.stringify(out, null, 2));
  console.log('page errors: ' + errs.length);
  await b.close();
})();
