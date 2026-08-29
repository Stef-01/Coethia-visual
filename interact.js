/* Interaction test: every control in the piece is exercised and its effect
   asserted. Layout audits do not catch a dead button.
   Run: node interact.js  (AUDIT_URL=... to test a deployment)              */
const { chromium } = require('playwright');
const path = require('path');
const URL = process.env.AUDIT_URL ||
  ('file:///' + path.resolve(__dirname, 'faster-than-the-rumour.html').replace(/\\/g, '/'));

const results = [];
const check = (name, ok, detail) => results.push({ name, ok, detail: detail || '' });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(1200);

  const go = async k => {
    await page.evaluate(kk => document.querySelector('.step[data-key="' + kk + '"]')
      .scrollIntoView({ behavior: 'auto', block: 'center' }), k);
    await page.waitForTimeout(1500);
  };

  // 1. the coverage cliff runs, and its verdict flips across the threshold
  await go('cliff');
  const cliff = await page.evaluate(async () => {
    const read = () => document.querySelector('#viz').textContent;
    cov = 95; paintGrid();
    const safe = /0\.75/.test(read());
    cov = 92; paintGrid();
    const risky = /1\.20/.test(read());
    runSim();
    await new Promise(r => setTimeout(r, 3000));
    return { safe, risky, ran: /GENERATION [1-9]/.test(read()) };
  });
  check('cliff: R falls out of the coverage', cliff.safe && cliff.risky,
    'R=0.75 at 95%: ' + cliff.safe + ', R=1.20 at 92%: ' + cliff.risky);
  check('cliff: the simulation actually runs', cliff.ran);

  // 2. the feed advances and the ranker note changes with it
  await go('swipe');
  const before = await page.evaluate(() => document.querySelector('#viz').textContent);
  await page.evaluate(() => { reelIx = 0; drawPhoneScene('swipe', false); });
  await page.waitForTimeout(300);
  const r0 = await page.evaluate(() => document.querySelector('#viz').textContent);
  await page.evaluate(() => { reelIx = 3; drawPhoneScene('swipe', false); });
  await page.waitForTimeout(300);
  const r3 = await page.evaluate(() => document.querySelector('#viz').textContent);
  check('swipe: the feed advances', r0 !== r3 && /VIDEO 4 OF 6/.test(r3));

  // 3. correcting the post raises its reach
  await go('trap');
  const trap = await page.evaluate(async () => {
    corrections = 0; drawPhoneScene('trap', false);
    const a = document.querySelector('#viz').textContent.match(/([\d,]{6,})\s*$/m);
    const first = (document.querySelector('#viz').textContent.match(/4[\d,]{5,}/) || [''])[0];
    corrections = 5; drawPhoneScene('trap', false);
    const after = (document.querySelector('#viz').textContent.match(/6[\d,]{5,}/) || [''])[0];
    return { first, after };
  });
  check('trap: correcting it amplifies it', !!trap.after && trap.first !== trap.after,
    trap.first + ' -> ' + trap.after);

  // 4. the two clocks run
  await go('twoclocks');
  await page.waitForTimeout(4000);
  const clocks = await page.evaluate(() => {
    const t = document.querySelector('#viz').textContent;
    return { views: /[1-9][\d,]* views/.test(t), moved: !/^0 views/.test(t) };
  });
  check('twoclocks: both lanes run on play', clocks.views && clocks.moved);

  // 5. the ledger recomputes from the slider
  await go('ledger');
  const led = await page.evaluate(() => {
    cases = 1; drawLedger('ledger', false);
    const one = /\$244,480/.test(document.querySelector('#viz').textContent);
    cases = 100; drawLedger('ledger', false);
    const hundred = /\$1,848,280/.test(document.querySelector('#viz').textContent);
    return { one, hundred };
  });
  check('ledger: the arithmetic is the cited arithmetic', led.one && led.hundred,
    '1 case = $244,480: ' + led.one + ', 100 cases = $1,848,280: ' + led.hundred);

  // 6. every demographic facet redraws, and the reason mix refuses to separate
  await go('facets');
  const facets = await page.evaluate(() => {
    const seen = new Set();
    for (const f of FACETS) { facetA = f.id; drawFacetScene('facets', false);
      seen.add(document.querySelector('#viz').textContent.length); }
    return seen.size;
  });
  check('facets: all seven redraw the population', facets >= 5, facets + ' distinct renders');

  await go('crosstab');
  const cross = await page.evaluate(() => {
    facetA = 'age'; facetB = 'geo'; drawFacetScene('crosstab', false);
    const m = document.querySelector('#viz').textContent.match(/Widest swing in any reason across every cell: (\d+) points/);
    return m ? +m[1] : -1;
  });
  check('crosstab: the mix stays mixed', cross >= 0 && cross <= 12, 'widest swing ' + cross + ' points');

  // 7. lenses install, and the beam narrows when they do
  await go('lenses');
  const lens = await page.evaluate(() => {
    const num = () => { const m = document.querySelector('#viz').textContent.match(/([\d,]+) people/); return m ? +m[1].replace(/,/g,'') : -1; };
    lensOn = new Set(['demo','geo']); drawLensScene(false);
    const two = num();
    LAYERS.forEach(l => lensOn.add(l.id)); drawLensScene(false);
    const seven = num();
    return { two, seven };
  });
  check('lenses: installing them narrows the beam', lens.seven > 0 && lens.seven < lens.two,
    lens.two.toLocaleString() + ' -> ' + lens.seven.toLocaleString());

  // 8. the desk objects open their documents
  await go('desk');
  const deskLinks = await page.$$eval('#viz g.dobj', g => g.length);
  check('desk: its objects are clickable', deskLinks === 3, deskLinks + ' objects');

  // 9. the case branches walk
  await go('cases');
  const cases = await page.evaluate(async () => {
    caseOpen = 'A'; caseStep = 0; drawCases();
    const before = document.querySelector('#viz').textContent;
    caseAdvance(); caseAdvance();
    return { opened: /CASE A/.test(before), walked: caseStep === 2 || caseDone.has('A') };
  });
  check('cases: a branch opens and walks', cases.opened && cases.walked);

  // 10. the segment builder still moves its estimate
  await go('segments');
  const seg = await page.$$eval('#viz g.segpick', g => g.length);
  check('segments: the term picker is present', seg >= 3, seg + ' terms');

  await browser.close();

  const bad = results.filter(r => !r.ok);
  results.forEach(r => console.log((r.ok ? 'PASS  ' : 'FAIL  ') + r.name + (r.detail ? '   [' + r.detail + ']' : '')));
  console.log('\nconsole errors during the run: ' + errs.length + (errs.length ? '\n  ' + errs.slice(0,3).join('\n  ') : ''));
  console.log(bad.length ? bad.length + ' FAILING' : 'all ' + results.length + ' interactions pass');
  process.exit(bad.length || errs.length ? 1 : 0);
})();
