/* Frame fitter for faster-than-the-rumour.html
   Walks every scene, measures the painted content, and emits a camera frame per
   scene that contains it and matches the stage's own aspect — so scenes fill the
   stage instead of letterboxing. Writes the FIT / FIT_M maps back into the file.
   Run: node measure.js                                                         */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const FILE = path.resolve(__dirname, 'faster-than-the-rumour.html');
const URL = 'file:///' + FILE.replace(/\\/g, '/');

const PAD = 34;   // a little margin so a stage a few px off the measured one does not clip          // breathing room around the composition
const SETTLE = 1500;     // let entrance transitions land before measuring

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
    if (g === document.querySelector('#viz > g:last-child')) { /* stamp still counts */ }
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
  return { minX, minY, maxX, maxY, n, aspect: r.width / r.height };
};

function fit(m, aspect, pad) {
  let x = m.minX - pad, y = m.minY - pad;
  let w = (m.maxX - m.minX) + pad * 2, h = (m.maxY - m.minY) + pad * 2;
  // expand the short side so the frame matches the stage — margins, not letterbox
  if (w / h > aspect) { const nh = w / aspect; y -= (nh - h) / 2; h = nh; }
  else { const nw = h * aspect; x -= (nw - w) / 2; w = nw; }
  return [x, y, w, h].map(v => Math.round(v)).join(' ');
}

(async () => {
  const browser = await chromium.launch();
  const out = {};
  for (const view of [['desktop', 1440, 900, 'FIT'], ['mobile', 375, 780, 'FIT_M']]) {
    const page = await browser.newPage({ viewport: { width: view[1], height: view[2] } });
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForTimeout(1200);
    const keys = await page.$$eval('.step', els => els.map(e => e.dataset.key));
    const map = {};
    for (const k of keys) {
      await page.evaluate(kk => document.querySelector('.step[data-key="' + kk + '"]')
        .scrollIntoView({ behavior: 'auto', block: 'center' }), k);
      await page.waitForTimeout(SETTLE);
      // measure the default state, then the widest interactive state, and take
      // the union — otherwise a poked frame crops the state readers land on
      let m = await page.evaluate(MEASURE);
      if (POKE[k]) {
        await POKE[k](page); await page.waitForTimeout(500);
        const m2 = await page.evaluate(MEASURE);
        if (m2.n) m = m.n ? { n: m.n + m2.n, aspect: m.aspect,
          minX: Math.min(m.minX, m2.minX), minY: Math.min(m.minY, m2.minY),
          maxX: Math.max(m.maxX, m2.maxX), maxY: Math.max(m.maxY, m2.maxY) } : m2;
      }
      if (!m.n) { console.log('  skip (empty) ' + k); continue; }
      map[k] = fit(m, m.aspect, PAD);
    }
    out[view[3]] = map;
    console.log(view[0] + ': fitted ' + Object.keys(map).length + ' scenes (stage aspect ' +
      (await page.evaluate(() => { const r = document.querySelector('#viz').getBoundingClientRect(); return (r.width / r.height).toFixed(3); })) + ')');
    await page.close();
  }
  await browser.close();

  const fmt = o => Object.entries(o).map(([k, v]) => "  " + k + ":'" + v + "'").join(',\n');
  let s = fs.readFileSync(FILE, 'utf8');
  s = s.replace(/const FIT = \{[\s\S]*?\n\};\nconst FIT_M = \{[\s\S]*?\n\};/,
    'const FIT = {\n' + fmt(out.FIT) + '\n};\nconst FIT_M = {\n' + fmt(out.FIT_M) + '\n};');
  s = s.replace('const FIT = {};\nconst FIT_M = {};',
    'const FIT = {\n' + fmt(out.FIT) + '\n};\nconst FIT_M = {\n' + fmt(out.FIT_M) + '\n};');
  fs.writeFileSync(FILE, s);
  console.log('frames written back into ' + path.basename(FILE));
})();
