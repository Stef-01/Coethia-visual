/* Shoot ONE scene, at ONE width, at 3x, so it can be looked at.
   Run: K=r0,trap W=375 H=780 O=/tmp/shots node shot.js

   audit.js --shots already writes both widths for every scene, and that is the
   right tool for a sweep. This exists for the other loop: a single finding is on
   the table, and the question is whether it is real. Two of legible.js's findings
   were resolved this way and both turned out to be instrument bugs -- `comments`
   reported a 9x9 circle inside "before my 12 month" and there is no mark in any
   word; `placement` reported "Ad · 0:15" at 1.00:1 and it is dark type on a white
   badge. Neither would have been settled by reading the code, and neither was
   worth a 59-scene sweep to see.

   deviceScaleFactor is 3 on purpose. At 1x a 7px label at mobile is 7 device
   pixels and you cannot tell a dot through a glyph from antialiasing, which is
   the exact judgement this is for.

   __fastTimers is set before load, the same flag audit.js uses, so intro
   animations do not eat the 4.5s settle.                                     */

const { chromium } = require('playwright');
const path = require('path');
const URL = 'file:///' + path.resolve(__dirname, 'faster-than-the-rumour.html').replace(/\\/g, '/');

(async () => {
  const keys = (process.env.K || '').split(',').filter(Boolean);
  if (!keys.length) {
    console.log('K is empty. Usage: K=scene1,scene2 [W=375] [H=780] [O=dir] node shot.js');
    process.exitCode = 1;
    return;
  }
  const out = process.env.O || '.';
  const W = +(process.env.W || 375), H = +(process.env.H || 780);

  const b = await chromium.launch();
  const errs = [];
  const pg = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 3 });
  pg.on('pageerror', e => errs.push(e.message));
  pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await pg.addInitScript(() => { window.__fastTimers = true; });
  await pg.goto(URL, { waitUntil: 'load' });
  await pg.waitForTimeout(1500);

  for (const k of keys) {
    /* Missing key reports rather than throwing, so a typo in a 6-scene list does
       not lose the five that would have rendered. */
    const found = await pg.evaluate(kk => {
      const el = document.querySelector('.step[data-key="' + kk + '"]');
      if (!el) return false;
      el.scrollIntoView({ block: 'center' });
      return true;
    }, k);
    if (!found) { console.log('no such scene: ' + k); continue; }
    await pg.waitForTimeout(4500);
    await pg.locator('.graphic').screenshot({ path: out + '/shot-' + k + '.' + W + '.png' });
    console.log('wrote shot-' + k + '.' + W + '.png');
  }

  /* Printed even when zero, because "no errors" is a measurement and a silent run
     is not distinguishable from a run that never got to the page. */
  console.log('page errors: ' + errs.length + (errs.length ? ' ' + JSON.stringify(errs.slice(0, 2)) : ''));
  await b.close();
})();
