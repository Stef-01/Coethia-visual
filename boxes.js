/* Enforces the repo's own standing rule, adopted 2026-08-25:
     "no rounded rectangle may be the primary carrier of an idea. Every unit of meaning
      gets a drawn thing — a glyph, a mechanism, an instrument, a real product UI, or a
      figure. A box is allowed only as the chrome of an interface being recreated, never
      as a substitute for an illustration."
   Run: node boxes.js

   Measurable form: a rounded rect whose sibling content is ONLY text is a box carrying
   words. A rounded rect accompanied by a path, circle, polygon, image or line is chrome
   around a drawn thing, which the rule permits. The check counts the first kind.

   This is the fault the piece was rebuilt to remove -- F6 in
   docs/PLAN-faster-than-the-rumour.md, "seven roundRects with a tick and wrapped text.
   This is a slide deck drawn in SVG." No existing check looks for it, because it is a
   rule about MEANING and every other check measures geometry. */
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file:///' + path.resolve(__dirname, 'faster-than-the-rumour.html').replace(/\\/g, '/');
const SETTLE = 4500;
/* Scenes that recreate a real interface. The rule exempts these by name, so the check
   must too, or it reports the exemption as the violation. */
const RECREATED = new Set(['segments','subsidy','privacy','listen','placement','grants',
                           'swipe','trap','comments','anatomy','counterpost','reel','decided','gate']);
/* A grid cartogram's tiles are identically sized BY DEFINITION -- that is what makes it
   a cartogram rather than a bar chart. `states` draws one 66x66 tile per US state, and
   flagging 9 of them as slide bullets would be the check misreading a recognised chart
   form. Named here with the reason rather than silently tuned away. */
const CHART_FORMS = new Set(['states']);

const SCAN = () => {
  const svg = document.querySelector('#viz');
  const vis = [...svg.children].filter(g => g.tagName === 'g' && +(g.getAttribute('opacity') ?? 1) > 0.05);
  const out = [];
  for (const layer of vis) {
    // a "unit" is the nearest group that owns a rounded rect
    for (const rect of layer.querySelectorAll('rect[rx]')) {
      const rx = parseFloat(rect.getAttribute('rx') || 0);
      if (rx < 2) continue;                       // a square-cornered rect is not the target
      const r = rect.getBoundingClientRect();
      if (r.width < 40 || r.height < 24) continue; // chips and ticks are not idea-carriers
      const unit = rect.parentNode;
      if (!unit || unit === svg) continue;
      /* A control is chrome, not an idea-carrier. The rule's own wording allows a box as
         "the chrome of an interface being recreated", and a button or a filter chip is
         exactly that -- k280's "Now all of them" and the facet chips reading "Education"
         are controls, not slide bullets. */
      if (unit.getAttribute('role') === 'button' || unit.closest('[role="button"]')) continue;
      const kids = [...unit.querySelectorAll('*')];
      const drawn = kids.filter(k => ['path','circle','polygon','polyline','image','ellipse','line'].includes(k.tagName)
                                     && !k.closest('clipPath'));
      const texts = kids.filter(k => k.tagName === 'text' && k.textContent.trim());
      if (!drawn.length && texts.length) {
        out.push({ w: Math.round(r.width), h: Math.round(r.height), texts: texts.length,
                   parentKey: unit.parentNode === svg ? 'root' : (unit.parentNode.getAttribute('class') || 'g'),
                   sample: texts.map(t => t.textContent.trim()).slice(0, 2).join(' / ').slice(0, 52) });
      }
    }
  }
  const seen = new Set();
  const uniq = out.filter(o => { const k = o.w + 'x' + o.h + o.sample; if (seen.has(k)) return false; seen.add(k); return true; });
  /* THE DISTINCTION THAT MATTERS, and the first version of this check missed it.
     A box whose DIMENSIONS VARY across its siblings is encoding a quantity -- a
     proportional bar, a gantt span, an escalating tier. That is a data mark and the
     standing rule does not forbid it; the rule is about a box standing in for an
     illustration. A set of IDENTICALLY sized boxes encodes nothing, so whatever meaning
     it carries is carried by the words inside it. That is the slide-deck shape the rule
     names.
     Measured: `middle` is 517/143/105 wide and `weeks` is 116/232/112/232 -- both
     encoding. `measure` is six identical 250x84 and `cases` three identical 240x250 --
     neither encoding anything. Reporting all of them as violations would have inflated
     14 real findings into 37. */
  const byShape = {};
  uniq.forEach(o => { const k = o.parentKey; (byShape[k] = byShape[k] || []).push(o); });
  return uniq.map(o => {
    const sibs = byShape[o.parentKey] || [o];
    const varies = sibs.length > 1 &&
      (new Set(sibs.map(s => s.w)).size > 1 || new Set(sibs.map(s => s.h)).size > 1);
    return { ...o, encoding: varies };
  });
};

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.addInitScript(() => { window.__fastTimers = true; });
  await p.goto(URL, { waitUntil: 'load' });
  await p.waitForTimeout(1500);
  let keys = await p.$$eval('.step', e => e.map(x => x.dataset.key));
  /* Scene filter. Useful for re-checking a single scene after a fix without paying for
     a 59-scene walk. */
  const ONLY = (process.argv.find(a => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
  if (ONLY.length) keys = keys.filter(k => ONLY.includes(k));
  const hits = [];
  for (const k of keys) {
    await p.evaluate(kk => document.querySelector(`.step[data-key="${kk}"]`)
      .scrollIntoView({ behavior: 'auto', block: 'center' }), k);
    await p.waitForTimeout(SETTLE);
    const boxes = await p.evaluate(SCAN);
    if (boxes.length) hits.push([k, boxes]);
  }
  /* SELF-VERIFY. Every hit is re-checked from a fresh page visiting only that scene, and
     a hit that does not reproduce is dropped and reported as dropped.

     Not because this check has been caught being wrong -- it has not. Its `measure`
     finding was real, and drawing the six glyphs is what cleared it. The guard is here
     because the OTHER aggregate walker in this repo, a11y.js, produced false findings
     four times by carrying state across a 59-scene sequence, and the pattern that caught
     it every time was a second isolated pass. Encoding that costs one page load per
     flagged scene, and it means a future false positive announces itself instead of being
     acted on.

     A note against my own reasoning, since it nearly went the other way: after `measure`
     was fixed, a probe found glyphs present and I briefly concluded the check had been
     wrong all along. It had not -- the glyphs were there because the fix had landed one
     commit earlier. "The defect is absent now" and "the check was wrong" are different
     claims, and a fix in between makes them look identical. Check the log before
     blaming the instrument. */
  const verified = [];
  const dropped = [];
  for (const [k, boxes] of hits) {
    const vp = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await vp.addInitScript(() => { window.__fastTimers = true; });
    await vp.goto(URL, { waitUntil: 'load' });
    await vp.waitForTimeout(1500);
    await vp.evaluate(kk => document.querySelector(`.step[data-key="${kk}"]`)
      .scrollIntoView({ behavior: 'auto', block: 'center' }), k);
    await vp.waitForTimeout(SETTLE);
    const again = await vp.evaluate(SCAN);
    await vp.close();
    if (again.length) verified.push([k, again]);
    else dropped.push([k, boxes.length]);
  }
  await b.close();
  if (dropped.length) {
    console.log('dropped — flagged by the aggregate walk, did NOT reproduce in isolation:');
    dropped.forEach(([k, n]) => console.log(`  ${k.padEnd(15)} ${n} box(es) — the aggregate walk was wrong here`));
    console.log();
  }
  const hits2 = verified;
  const flagged = hits2.filter(([k]) => !RECREATED.has(k) && !CHART_FORMS.has(k));
  const exempt  = hits2.filter(([k]) =>  RECREATED.has(k));
  console.log(`${keys.length} scenes scanned`);
  console.log(`${exempt.length} scene(s) exempt as recreated interfaces: ${exempt.map(h => h[0]).join(', ') || 'none'}`);
  const forms = hits2.filter(([k]) => CHART_FORMS.has(k));
  if (forms.length) console.log(`exempt as a recognised chart form: ${forms.map(h => h[0] + ' (' + h[1].length + ' tiles)').join(', ')}`);
  console.log();
  const violations = flagged.map(([k, bs]) => [k, bs.filter(o => !o.encoding)]).filter(h => h[1].length);
  const marks      = flagged.map(([k, bs]) => [k, bs.filter(o =>  o.encoding)]).filter(h => h[1].length);
  console.log(`data marks (dimensions encode a quantity — the rule permits these): ` +
    marks.map(h => `${h[0]} ${h[1].length}`).join(', '));
  console.log();
  if (!violations.length) { console.log('CLEAN — no identically sized box is carrying an idea'); return; }
  const total = violations.reduce((s, h) => s + h[1].length, 0);
  console.log(`${total} box(es) carrying ONLY words, identically sized, across ${violations.length} scene(s):`);
  for (const [k, boxes] of violations.sort((a, b2) => b2[1].length - a[1].length)) {
    console.log(`  ${k.padEnd(15)} ${boxes.length}`);
    boxes.slice(0, 4).forEach(o => console.log(`      ${o.w}x${o.h}  "${o.sample}"`));
  }
  process.exitCode = 1;
})();
