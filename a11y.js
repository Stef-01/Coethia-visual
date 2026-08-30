/* Keyboard and accessible-name check.  Run: node a11y.js
   The hands-on tier: the things a contrast scanner cannot decide. For every scene,
   is each interactive object actually reachable by Tab, does it announce a name, and
   does it carry a role? setTabbing() flips tabindex per scene, so a scene's controls
   are only reachable while that scene is current -- which is correct, and also means
   this has to be checked per scene rather than once for the document. */
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file:///' + path.resolve(__dirname, 'faster-than-the-rumour.html').replace(/\\/g, '/');
/* 1500 is enough here: tabindex, role and aria-label are all set at DRAW time, so the
   focus surface exists as soon as the scene is drawn. The 4500 the geometry suites need
   is for animation to land, which does not move the tab order. */
const SETTLE = 1500;

const SURFACE = () => {
  const svg = document.querySelector('#viz');
  const out = { focusable: [], nameless: [], roleless: [] };
  for (const el of svg.querySelectorAll('[tabindex]')) {
    const ti = el.getAttribute('tabindex');
    if (ti !== '0') continue;                       // -1 is deliberately out of the order
    const name = el.getAttribute('aria-label') || (el.textContent || '').trim();
    const role = el.getAttribute('role');
    const box = el.getBoundingClientRect();
    const id = (name || el.tagName).slice(0, 44);
    out.focusable.push({ id, w: Math.round(box.width), h: Math.round(box.height) });
    if (!name) out.nameless.push(el.tagName + ' ' + (el.getAttribute('class') || ''));
    if (!role) out.roleless.push(id);
  }
  return out;
};

(async () => {
  const b = await chromium.launch();
  const findings = [], small = [];
  for (const [view, w, h] of [['desktop', 1440, 900], ['mobile', 375, 780]]) {
    const page = await b.newPage({ viewport: { width: w, height: h } });
    await page.addInitScript(() => { window.__fastTimers = true; });
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForTimeout(1200);
    const keys = await page.$$eval('.step', els => els.map(e => e.dataset.key));
    let totalFocusable = 0, scenesWithControls = 0;
    for (const k of keys) {
      await page.evaluate(kk => document.querySelector('.step[data-key="' + kk + '"]')
        .scrollIntoView({ behavior: 'auto', block: 'center' }), k);
      await page.waitForTimeout(SETTLE);
      const s = await page.evaluate(SURFACE);
      if (!s.focusable.length) continue;
      scenesWithControls++; totalFocusable += s.focusable.length;
      s.nameless.forEach(n => findings.push([view, k, 'no accessible name', n]));
      s.roleless.forEach(n => findings.push([view, k, 'no role', n]));
      // a control smaller than 24x24 CSS px fails WCAG 2.2 SC 2.5.8 target size (minimum)
      /* WCAG 2.2 SC 2.5.8 asks 24x24 CSS px of any POINTER target. Reported separately
         from the keyboard findings because the two have different remedies and because
         2.5.8 has exceptions -- inline targets, and equivalent function available
         elsewhere -- that this cannot decide. Counted, listed, not asserted as failures. */
      s.focusable.filter(f => f.w > 0 && (f.w < 24 || f.h < 24))
        .forEach(f => small.push([view, k, `${f.w}x${f.h}`, f.id]));

      /* Can Tab actually reach them?
         The first version of this check was wrong and produced 78 false findings, which
         is worth recording so it is not repeated. It began with
         `document.querySelector('#viz').focus()` -- but #viz carries role="group" and NO
         tabindex, so .focus() is a no-op and the walk started from wherever focus already
         happened to be. The budget was `controls + 4` presses, 7-10 in practice, with page
         chrome ahead of #viz in the order. It concluded that 78 scenes exposed controls
         Tab could not reach. They were reachable; the test could not get there.

         Now: reset focus to the document, then walk with a budget generous enough to
         cross the chrome and the whole scene, counting DISTINCT elements rather than
         presses, and stopping as soon as every control has been hit. */
      /* Tag each control with a unique id before walking. The second version of this
         check keyed the visited-set on aria-label, which is NOT unique -- a scene with
         twelve controls sharing four labels collapsed to four entries and reported
         "Tab reached 4 of 12" for a scene where all twelve were reachable. Same class of
         mistake as the first version: measuring identity by something that is not
         identity. Element identity does not cross the page boundary, so put it in the
         DOM and read it back. */
      const total = await page.evaluate(() => {
        const els = [...document.querySelectorAll('#viz [tabindex="0"]')];
        els.forEach((e, i) => e.setAttribute('data-a11y-id', String(i)));
        return els.length;
      });
      await page.evaluate(() => { document.activeElement?.blur?.(); document.body.focus?.(); });
      const tabbed = new Set();
      const CAP = total + 40;
      for (let i = 0; i < CAP && tabbed.size < total; i++) {
        await page.keyboard.press('Tab');
        const hit = await page.evaluate(() => {
          const a = document.activeElement;
          if (!(a && a.closest && a.closest('#viz') && a.getAttribute('tabindex') === '0')) return null;
          return a.getAttribute('data-a11y-id');
        });
        if (hit !== null) tabbed.add(hit);
      }
      await page.evaluate(() => document.querySelectorAll('#viz [data-a11y-id]')
        .forEach(e => e.removeAttribute('data-a11y-id')));
      if (tabbed.size === 0) findings.push([view, k, `${total} control(s) exist but Tab reached none`, '']);
      else if (tabbed.size < total)
        findings.push([view, k, `Tab reached ${tabbed.size} of ${total} controls`, '']);
    }
    console.log(`${view}: ${scenesWithControls} of ${keys.length} scenes expose controls, ${totalFocusable} focusable objects`);
    await page.close();
  }
  await b.close();
  console.log();
  if (small.length) {
    const byScene = {};
    small.forEach(s => { byScene[s[1]] = (byScene[s[1]] || 0) + 1; });
    console.log(`SC 2.5.8 target size: ${small.length} focusable objects render under 24x24 CSS px,`);
    console.log(`across ${Object.keys(byScene).length} scenes. Listed, not asserted -- 2.5.8's`);
    console.log('exceptions (inline targets, equivalent function elsewhere) need a human.');
    console.log('  worst: ' + small.slice(0, 4).map(s => `${s[1]} ${s[2]}`).join(', '));
    console.log();
  }
  if (!findings.length) { console.log('CLEAN — every exposed control is reachable, named and roled'); return; }
  const byKind = {};
  findings.forEach(f => byKind[f[2].replace(/\d+/g, 'N')] = (byKind[f[2].replace(/\d+/g, 'N')] || 0) + 1);
  console.log(findings.length + ' findings  ' + JSON.stringify(byKind));
  findings.slice(0, 24).forEach(f => console.log(`  [${f[0]}] ${f[1].padEnd(15)} ${f[2].padEnd(34)} ${f[3]}`));
  if (findings.length > 24) console.log(`  ... and ${findings.length - 24} more`);
  process.exitCode = 1;
})();
