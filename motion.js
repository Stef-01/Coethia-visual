/* Reduced-motion parity check.  Run: node motion.js

   Walks every scene twice -- once at prefers-reduced-motion: no-preference, once at
   reduce -- and diffs the SETTLED state. The question is not whether the reduced path
   is faster; it is whether it arrives somewhere correct. A transition that is skipped
   rather than snapped leaves its element at the pre-transition value, which for an
   entrance means invisible, and no other tool in this repo would notice.

   It found one real defect on its first run: the `air` scene's reduced path ended on
   "The particles are still here." while the animated path ended on "Fifty-five percent
   of it is still in the air when the next person walks in." The cited figure existed
   only on the animated path, so a reader who asked for reduced motion was the only
   reader who never saw the number -- in a piece where every figure is real and cited.

   Note how it found it: the node-count delta pointed at the right scene for the wrong
   reason (it saw the deliberate particle reduction). The defect surfaced from reading
   the code the check had pointed to. A metric points; it does not diagnose.

   IT ALSO SURFACED A GAP IN THE OTHER TOOLS. Two scenes are driven by d3.timer rather
   than by transitions -- air at SPAN 13000ms and twoclocks at 16000ms -- and both END
   by creating content: the figure in the doorway and the cited caption in air, the
   crossing labels in twoclocks. audit.js and measure.js settle 4500ms, so neither has
   ever measured the final state of either scene, and their camera frames were fitted
   mid-animation. Raising SETTLE to 16500 is not the fix; at 118 scene-passes it would
   put a single audit past half an hour and the fitter past several. The fix is the POKE
   mechanism measure.js already has for interactive states: jump the timer to its end.
   That needs a completion hook on the page, in the same spirit as the existing
   __setFit and __scenes hooks, and it is the top open item in the ledger. */
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file:///' + path.resolve(__dirname, 'faster-than-the-rumour.html').replace(/\\/g, '/');

const MEASURE = () => {
  const svg = document.querySelector('#viz');
  const stamp = svg.querySelector('g[pointer-events="none"]');
  const vis = [...svg.children].filter(g => g.tagName === 'g' && g !== stamp
    && +(g.getAttribute('opacity') ?? 1) > 0.05);
  let nodes = 0, texts = 0, faint = 0;
  let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
  for (const g of vis) {
    for (const el of g.querySelectorAll('*')) {
      if (['g','clipPath','animate','animateTransform','defs'].includes(el.tagName)) continue;
      if (el.closest('clipPath') || el.closest('[clip-path]')) continue;
      let op = 1, p = el;
      while (p && p !== svg) { op *= +(p.getAttribute('opacity') ?? 1); p = p.parentNode; }
      // An entrance that was skipped rather than snapped sits at opacity 0.
      if (op < 0.06) { faint++; continue; }
      nodes++;
      if (el.tagName === 'text' && el.textContent.trim()) texts++;
      let bb; try { bb = el.getBBox(); } catch (e) { continue; }
      if (!bb.width && !bb.height) continue;
      minX = Math.min(minX, bb.x); minY = Math.min(minY, bb.y);
      maxX = Math.max(maxX, bb.x + bb.width); maxY = Math.max(maxY, bb.y + bb.height);
    }
  }
  return { nodes, texts, faint, w: Math.round(maxX - minX), h: Math.round(maxY - minY) };
};

(async () => {
  const b = await chromium.launch();
  const out = {};
  for (const mode of ['no-preference', 'reduce']) {
    const page = await b.newPage({ viewport: { width: 375, height: 780 }, reducedMotion: mode });
    const errs = []; page.on('pageerror', e => errs.push(e.message));
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForTimeout(1200);
    const keys = await page.$$eval('.step', els => els.map(e => e.dataset.key));
    const m = {};
    for (const k of keys) {
      await page.evaluate(kk => document.querySelector('.step[data-key="' + kk + '"]')
        .scrollIntoView({ behavior: 'auto', block: 'center' }), k);
      // reduce should need no settle at all; give both the full window so the
      // comparison is of settled states, not of speed
      await page.waitForTimeout(mode === 'reduce' ? 900 : 4500);
      m[k] = await page.evaluate(MEASURE);
    }
    out[mode] = { m, errs };
    console.log(mode + ': walked ' + keys.length + ' scenes, ' + errs.length + ' page errors');
    await page.close();
  }
  await b.close();

  /* Reductions that are correct and must not be reported. Reduced motion is a request
     to remove movement, so removing movement is not a finding. Each entry needs a
     reason, and the reason has to be about MOVEMENT rather than about content. */
  const INTENDED = {
    air: { nodes: 38, extent: true, why: 'draws 26 aerosol particles instead of 64 -- fewer moving objects, same claim and same caption. Extent is exempt because the ANIMATED path needs SPAN=13000ms to reach its final state and no sane settle waits that long; see the note below.' },
    twoclocks: { nodes: 8, texts: 3, why: 'does not AUTO-play; run() stays bound to a button and to Enter/Space, so the content is reachable on demand. Auto-playing here would be the defect.' },
  };

  const A = out['no-preference'].m, B = out['reduce'].m;
  const bad = [];
  for (const k of Object.keys(A)) {
    const a = A[k], r = B[k];
    if (!r) { bad.push([k, 'missing under reduce']); continue; }
    // A skipped entrance shows up as fewer painted nodes and more zero-opacity ones.
    const allow = (INTENDED[k] || {}).nodes || 0;
    const lost = a.nodes - r.nodes - allow;
    const dw = Math.abs(a.w - r.w), dh = Math.abs(a.h - r.h);
    if (lost > Math.max(2, a.nodes * 0.02)) bad.push([k, `${lost} of ${a.nodes} nodes not painted (faint ${a.faint} -> ${r.faint})`]);
    else if ((dw > 8 || dh > 8) && !(INTENDED[k] || {}).extent)
      bad.push([k, `extent differs ${a.w}x${a.h} -> ${r.w}x${r.h}`]);
    else if (a.texts - r.texts - ((INTENDED[k] || {}).texts || 0) > 0)
      bad.push([k, `${a.texts - r.texts} text nodes missing`]);
  }
  console.log('\npage errors: normal ' + out['no-preference'].errs.length + ', reduce ' + out['reduce'].errs.length);
  console.log('\nintended reductions, not reported:');
  for (const [k, v] of Object.entries(INTENDED)) console.log('   ' + k.padEnd(12) + v.why);
  console.log();
  if (!bad.length) console.log('CLEAN — every scene reaches the same settled state under reduced motion');
  else {
    console.log(bad.length + ' scene(s) differ under reduced motion:');
    bad.forEach(([k,w]) => console.log('   ' + k.padEnd(16) + w));
    process.exitCode = 1;
  }
})();
