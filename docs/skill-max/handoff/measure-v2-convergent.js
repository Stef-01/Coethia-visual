/* Frame fitter for faster-than-the-rumour.html  —  convergent, history-independent.
   Run: node measure.js [--dry] [--verify] [--only=k1,k2] [--report=path.json]

   WHAT THIS SOLVES

   The camera frame and the type scale are coupled, and the coupling is a loop:

       frame width w  ->  render scale sc = stageW / w  ->  TK = clamp(FLOOR/(BASE*sc), 1, 3)
                      ->  text painted at base*TK  ->  content extent grows  ->  wider frame

   The previous version of this file measured the content at whatever TK the
   *committed* frame implied, fitted a new frame to it, and wrote that back. That
   is one step of a fixed-point iteration, with the source file as the iteration
   state. So every run took another step, the output depended on how many times
   the generator had ever been run, and because the step always moved the same
   way the frames only ever grew. Measured on a byte-identical file: two
   consecutive runs moved 15 of 118 frames, every delta positive, k280 by +93
   units (12% of its width) in a single run. Every number the audit produced was
   therefore a function of the generator's own history rather than of the source.

   THE FIX

   Content geometry depends on the frame ONLY through TK -- isNarrow() is
   viewport-based, wrapFor() does not read TK, conMetrics() is frame-independent.
   So this is a one-dimensional fixed point: find w* with F(w*) = w*, where F(w)
   is the fit width obtained by rendering at the TK that a frame of width w
   induces. F is monotone non-decreasing in w and, because TK is clamped to
   [1, 3], F is flat outside a bounded band -- so a fixed point is GUARANTEED to
   exist, and bracketing it is straightforward:

       g(SMALL) = F(SMALL) - SMALL > 0     F(SMALL) is the TK=1 extent, >> SMALL
       g(LARGE) = F(LARGE) - LARGE < 0     F(LARGE) is the TK=3 extent, << LARGE

   Root-find g by false position. The result is a property of the source file, not
   of this generator's history, so running it twice is a no-op. `--verify` asserts
   exactly that.

   REFUSING GROWTH

   A fixed point can still be absurd: a scene whose inflated content needs far
   more room than its uninflated content is an authoring problem, and quietly
   handing it a huge frame is how the loop above stayed invisible for so long.
   Those scenes keep their committed frame and are reported as UNFITTABLE rather
   than fitted. Growing the frame is the symptom, not the treatment.               */

const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const FILE = path.resolve(__dirname, 'faster-than-the-rumour.html');
const URL = 'file:///' + FILE.replace(/\\/g, '/');

const PAD          = 34;    // breathing room around the composition, in units
const SETTLE       = 1500;  // let entrance transitions land before measuring
const TOL          = 3;     // units; |F(w) - w| below this counts as converged
const ITERS        = 8;     // root-finding steps after the two bracket probes
const GRID         = 2;     // quantise the written frame; kills sub-unit chatter
const GROWTH_CAP   = 1.9;   // w* / w_at_TK1 above this -> UNFITTABLE, keep old frame
const W_SMALL      = 40;    // forces TK to its floor of 1
const W_LARGE      = 24000; // forces TK to its ceiling of 3

const DRY    = process.argv.includes('--dry');
const VERIFY = process.argv.includes('--verify');
const ONLY   = (process.argv.find(a => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const REPORT = (process.argv.find(a => a.startsWith('--report=')) || '').slice(9);

/* scenes whose interactions move content outward — measured in their widest state */
const POKE = {
  lenses:  p => p.evaluate(() => { LAYERS.forEach(l => lensOn.add(l.id)); drawLensScene(false); }),
  ledger:  p => p.evaluate(() => { cases = 100; drawLedger('ledger', false); }),
  arithmetic: p => p.evaluate(() => { cases = 100; drawLedger('arithmetic', false); }),
  cliff:   p => p.evaluate(() => { cov = 88; paintGrid(); }),
  swipe:   p => p.evaluate(() => { reelIx = 4; drawPhoneScene('swipe', false); }),
  trap:    p => p.evaluate(() => { corrections = 6; drawPhoneScene('trap', false); }),
  k280:    p => p.evaluate(() => { roomsWide = true; drawRoomsScene(false); }),
  crosstab:p => p.evaluate(() => { facetA = 'age'; facetB = 'edu'; drawFacetScene('crosstab', false); }),
  facets:  p => p.evaluate(() => { facetA = 'inc'; drawFacetScene('facets', false); })
};

/* ---- in-page measurement. The two skip rules below are load-bearing; see the
   comments at each. ---------------------------------------------------------- */
const MEASURE = () => {
  /* getBBox() reports a bbox in the element's OWN user space, so anything inside
     a transformed group is measured in the wrong place -- the route cards are
     translate(500,y) groups whose children report x -204..204, and the camera
     was being fitted from -212 instead of 290. Map through the element's CTM
     relative to the svg instead. */
  const userBox = (el, svg) => {
    let bb; try { bb = el.getBBox(); } catch (e) { return null; }
    if (!bb || (!bb.width && !bb.height)) return null;
    /* getCTM() maps to the VIEWPORT, which folds in the viewBox scale and
       collapses every frame to a few hundred units. Compose the screen CTMs
       instead: svg-screen inverse times element-screen gives element user
       space -> svg user space, which is the coordinate system the frame is
       expressed in. */
    let m = null;
    try {
      const es = el.getScreenCTM(), ss = svg.getScreenCTM();
      if (es && ss) m = ss.inverse().multiply(es);
    } catch (e) { m = null; }
    if (!m) return bb;
    const pt = svg.createSVGPoint();
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [px, py] of [[bb.x, bb.y], [bb.x + bb.width, bb.y],
                            [bb.x, bb.y + bb.height], [bb.x + bb.width, bb.y + bb.height]]) {
      pt.x = px; pt.y = py;
      const q = pt.matrixTransform(m);
      if (q.x < x0) x0 = q.x; if (q.y < y0) y0 = q.y;
      if (q.x > x1) x1 = q.x; if (q.y > y1) y1 = q.y;
    }
    return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
  };
  const svg = document.querySelector('#viz');
  const r = svg.getBoundingClientRect();
  let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9, n = 0;
  // the provenance stamp is chrome positioned FROM the frame, so measuring it
  // would make the fit circular
  const stamp = svg.querySelector('g[pointer-events="none"]');
  const vis = [...svg.children].filter(g => g.tagName === 'g' && g !== stamp
    && +(g.getAttribute('opacity') ?? 1) > 0.05);
  for (const g of vis) {
    for (const el of g.querySelectorAll('*')) {
      if (['g','clipPath','animate','animateTransform','defs'].includes(el.tagName)) continue;
      if (el.closest('clipPath')) continue;
      // Content clipped by a clip-path is bounded on screen by the clip
      // region, but getBBox() reports it unclipped. Measuring it grew the
      // frame to fit text nobody can see -- the comment sheet inside the
      // phone runs 346 units past the screen it is clipped to, which is why
      // the phone was rendering as a thumbnail. The clip region is a real
      // painted rect and gets measured on its own, so skipping these is safe.
      if (el.closest('[clip-path]')) continue;
      if (el.getAttribute('fill') === 'transparent' && !el.getAttribute('stroke')) continue;
      let op = 1, p = el;
      while (p && p !== svg) { op *= +(p.getAttribute('opacity') ?? 1); p = p.parentNode; }
      if (op < 0.06) continue;
      if (el.tagName === 'text' && !el.textContent.trim()) continue;
      let bb = userBox(el, svg); if (!bb) continue;
      if (!bb.width && !bb.height) continue;
      minX = Math.min(minX, bb.x); minY = Math.min(minY, bb.y);
      maxX = Math.max(maxX, bb.x + bb.width); maxY = Math.max(maxY, bb.y + bb.height);
      n++;
    }
  }
  // TK read back off the DOM rather than recomputed here, so this file needs no
  // copy of the page's constants and cannot drift from them.
  const t = svg.querySelector('[data-fs]');
  const tk = t ? +t.getAttribute('font-size') / (+t.getAttribute('data-fs') * (+t.getAttribute('data-tk') || 1)) : null;
  return { minX, minY, maxX, maxY, n, tk, aspect: r.width / r.height };
};

/* Apply a candidate frame to one scene and force a full redraw at the TK it
   induces. Mirrors the page's own resize path, which is the only sequence that
   re-runs the draw functions -- applyTypeScale() alone re-lays wrapped lines but
   leaves label()'s stack offsets baked at the previous TK. */
const APPLY = ([key, frame]) => {
  window.__setFit({ [key]: frame }, { [key]: frame });
  const svg = d3.select('#viz');
  conMetrics(); drawConFrame();
  /* render() no-ops when asked for the key it is already showing, so it has to be
     bounced through a different scene first. That scene must not be the target --
     bouncing 'room' through 'room' silently skips the redraw and the measurement
     then describes the previous TK. */
  const other = (window.__scenes.find(s => s.key !== key) || {}).key;
  if (other) render(other);
  render(key);
  svg.interrupt('frame').attr('viewBox', frame);   // snap past the camera transition
  layoutDash();
};

const fitBox = (m, aspect, pad) => {
  let x = m.minX - pad, y = m.minY - pad;
  let w = (m.maxX - m.minX) + pad * 2, h = (m.maxY - m.minY) + pad * 2;
  // expand the short side so the frame matches the stage — margins, not letterbox
  if (w / h > aspect) { const nh = w / aspect; y -= (nh - h) / 2; h = nh; }
  else { const nw = h * aspect; x -= (nw - w) / 2; w = nw; }
  return { x, y, w, h };
};
const snap = (b, g) => [b.x, b.y, b.w, b.h].map(v => Math.round(v / g) * g).join(' ');
const frameOfWidth = (w, aspect, cx, cy) =>
  [Math.round(cx - w / 2), Math.round(cy - w / aspect / 2), Math.round(w), Math.round(w / aspect)].join(' ');

async function fitScene(page, key, aspect, seedCentre) {
  const cache = new Map();
  let evals = 0;
  /* F(w): render at the TK a frame of width w induces, measure, return the fit. */
  const F = async (w) => {
    const k = Math.round(w / GRID) * GRID;
    if (cache.has(k)) return cache.get(k);
    await page.evaluate(APPLY, [key, frameOfWidth(k, aspect, seedCentre.x, seedCentre.y)]);
    await page.waitForTimeout(SETTLE);
    let m = await page.evaluate(MEASURE);
    if (POKE[key]) {                       // union with the widest interactive state
      await POKE[key](page); await page.waitForTimeout(500);
      const m2 = await page.evaluate(MEASURE);
      if (m2.n) m = m.n ? { n: m.n + m2.n, aspect: m.aspect, tk: m.tk,
        minX: Math.min(m.minX, m2.minX), minY: Math.min(m.minY, m2.minY),
        maxX: Math.max(m.maxX, m2.maxX), maxY: Math.max(m.maxY, m2.maxY) } : m2;
    }
    evals++;
    const res = m.n ? { box: fitBox(m, aspect, PAD), tk: m.tk, n: m.n } : { box: null, tk: m.tk, n: 0 };
    cache.set(k, res);
    return res;
  };

  const lo = await F(W_SMALL);          // TK pinned to 1: the smallest the scene can be
  if (!lo.box) return { key, status: 'EMPTY', evals };
  const hi = await F(W_LARGE);          // TK pinned to 3: the largest it can be
  if (!hi.box) return { key, status: 'EMPTY', evals };

  const wTK1 = lo.box.w, wTK3 = hi.box.w;
  // A scene whose extent does not move with TK has no loop to solve.
  if (Math.abs(wTK3 - wTK1) <= TOL)
    return { key, status: 'FLAT', box: lo.box, wTK1, wTK3, tk: lo.tk, evals };

  /* Bracket is [wTK1, wTK3], and both signs are known WITHOUT evaluating there:
     F is monotone non-decreasing and bounded to [wTK1, wTK3], so for any
     w <= wTK1, F(w) >= wTK1 >= w  =>  g >= 0, and for any w >= wTK3,
     F(w) <= wTK3 <= w  =>  g <= 0.

     Two dead ends worth recording, because both look right:

     1. Bracketing on [wTK1, wTK3] and *assuming* ga = wTK1 - wTK1 = 0 reads as
        "already at the root" and collapses false position to bisection.
     2. Bracketing on [W_SMALL, W_LARGE], where real g values are already in hand,
        stalls instead: g(W_LARGE) is about -23000, so the secant is dominated by
        the far endpoint and creeps toward the root a few percent at a time. That
        is ordinary false-position stagnation, and on mobile it left residuals of
        20-47 units and made the answer depend on the search path -- the same
        history-dependence this file exists to remove.

     So: correct bracket, and no secant until there are two real interior values
     to draw it through. Bisection until then, which always halves. */
  let a = wTK1, b = wTK3, ga = null, gb = null;
  let best = null, converged = false;
  for (let i = 0; i < ITERS; i++) {
    let c = (ga === null || gb === null || ga === gb)
      ? (a + b) / 2
      : a - ga * (b - a) / (gb - ga);
    if (!(c > a && c < b)) c = (a + b) / 2;
    const r = await F(c);
    if (!r.box) break;
    const gc = r.box.w - c;
    if (!best || Math.abs(gc) < Math.abs(best.gc)) best = { c, r, gc };
    if (Math.abs(gc) <= TOL) { converged = true; break; }
    if (gc > 0) { a = c; ga = gc; } else { b = c; gb = gc; }
    if (b - a <= TOL) { converged = true; break; }
  }
  if (!best) return { key, status: 'EMPTY', evals };

  // The frame that actually gets written is the measured fit at the fixed point,
  // not the fixed point itself -- w* is only the input that reproduces it.
  const box = best.r.box;
  const status = (box.w / wTK1 > GROWTH_CAP) ? 'UNFITTABLE' : (converged ? 'OK' : 'SLOW');
  return { key, status, box, wTK1, wTK3, wStar: box.w, tk: best.r.tk, residual: +best.gc.toFixed(1), evals };
}

async function fitAll(browser) {
  const out = {}, log = {};
  for (const [name, vw, vh, mapName] of [['desktop', 1440, 900, 'FIT'], ['mobile', 375, 780, 'FIT_M']]) {
    const page = await browser.newPage({ viewport: { width: vw, height: vh } });
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForTimeout(1200);
    const aspect = await page.evaluate(() => {
      const r = document.querySelector('#viz').getBoundingClientRect(); return r.width / r.height;
    });
    let keys = await page.$$eval('.step', els => els.map(e => e.dataset.key));
    if (ONLY.length) keys = keys.filter(k => ONLY.includes(k));
    const map = {}, rows = [];
    for (const key of keys) {
      // Seed the probe frames on the scene's own current centre so the render
      // stays in a sane neighbourhood. The centre does not affect the extent --
      // only w and h feed the render scale -- so it cannot bias the result.
      await page.evaluate(k => document.querySelector('.step[data-key="' + k + '"]')
        .scrollIntoView({ behavior: 'auto', block: 'center' }), key);
      await page.waitForTimeout(400);
      const seedCentre = await page.evaluate(() => {
        const vb = (document.querySelector('#viz').getAttribute('viewBox') || '0 0 1000 700')
          .split(/[\s,]+/).map(Number);
        return { x: vb[0] + vb[2] / 2, y: vb[1] + vb[3] / 2 };
      });
      const r = await fitScene(page, key, aspect, seedCentre);
      rows.push(r);
      if (r.box && r.status !== 'UNFITTABLE') map[key] = snap(r.box, GRID);
      const tag = r.status.padEnd(10);
      if (r.status === 'EMPTY') console.log('  ' + tag + key + '  (nothing painted)');
      else if (r.status === 'FLAT') console.log('  ' + tag + key + '  w ' + Math.round(r.wTK1) + '  TK-insensitive');
      else if (r.status === 'UNFITTABLE') console.log('  ' + tag + key +
        '  wants ' + Math.round(r.wStar) + ' from ' + Math.round(r.wTK1) +
        ' (x' + (r.wStar / r.wTK1).toFixed(2) + ') — keeping committed frame');
      else console.log('  ' + tag + key + '  w* ' + Math.round(r.wStar) +
        '  TK ' + (r.tk || 0).toFixed(2) + '  from ' + Math.round(r.wTK1) +
        '  resid ' + r.residual + '  ' + r.evals + ' evals');
    }
    out[mapName] = map; log[name] = rows;
    console.log(name + ': fitted ' + Object.keys(map).length + '/' + keys.length +
      ' scenes (stage aspect ' + aspect.toFixed(3) + ')');
    await page.close();
  }
  return { out, log };
}

(async () => {
  const browser = await chromium.launch();
  const first = await fitAll(browser);

  if (VERIFY) {
    console.log('\n--- verify: second pass on the same source ---');
    const second = await fitAll(browser);
    let bad = 0;
    for (const m of ['FIT', 'FIT_M']) {
      const A = first.out[m], B = second.out[m];
      for (const k of new Set([...Object.keys(A), ...Object.keys(B)]))
        if (A[k] !== B[k]) { console.log('  DIFFERS  ' + m + '.' + k + '  ' + A[k] + '  ->  ' + B[k]); bad++; }
    }
    await browser.close();
    console.log(bad ? '\nNOT IDEMPOTENT: ' + bad + ' frames differ between passes.'
                    : '\nIDEMPOTENT: both passes produced identical frames.');
    process.exit(bad ? 1 : 0);
  }
  await browser.close();

  const unfit = [].concat(first.log.desktop, first.log.mobile).filter(r => r.status === 'UNFITTABLE');
  const slow  = [].concat(first.log.desktop, first.log.mobile).filter(r => r.status === 'SLOW');
  if (unfit.length) console.log('\n' + unfit.length + ' scene(s) refused a frame (growth over x' +
    GROWTH_CAP + '): ' + unfit.map(r => r.key).join(', ') +
    '\n  These are authoring problems, not framing problems. Their committed frames are unchanged.');
  if (slow.length) console.log('\n' + slow.length + ' scene(s) did not converge within ' + ITERS +
    ' steps: ' + slow.map(r => r.key + ' (resid ' + r.residual + ')').join(', '));

  if (REPORT) { fs.writeFileSync(REPORT, JSON.stringify(first.log, null, 1)); console.log('report -> ' + REPORT); }
  if (DRY) { console.log('\n--dry: nothing written'); return; }

  const fmt = o => Object.entries(o).map(([k, v]) => "  " + k + ":'" + v + "'").join(',\n');
  let s = fs.readFileSync(FILE, 'utf8');
  const block = 'const FIT = {\n' + fmt(first.out.FIT) + '\n};\nconst FIT_M = {\n' + fmt(first.out.FIT_M) + '\n};';
  const before = s;
  s = s.replace(/const FIT = \{[\s\S]*?\n\};\nconst FIT_M = \{[\s\S]*?\n\};/, block);
  if (s === before) s = s.replace('const FIT = {};\nconst FIT_M = {};', block);
  if (s === before) { console.error('could not find the FIT block to replace — nothing written'); process.exit(1); }
  fs.writeFileSync(FILE, s);
  console.log('frames written back into ' + path.basename(FILE));
})();
