/* Keyboard, accessible-name, reflow and accessibility-tree check.  Run: node a11y.js

   A KNOWN LIMITATION, stated because it has produced false findings four times. The
   aggregate walk visits 59 scenes in sequence and carries focus state between them, and
   that residual state occasionally makes a scene look partly unreachable. Every such
   finding so far has been the walk, not the page: `weeks` reported 4 of 9 and a focused
   probe on that one scene found 10 of 10; `crosstab` reported 5 of 7 and a focused probe
   found 7 of 7. Treat any "Tab reached N of M" from this file as a POINTER, and confirm
   it by driving that single scene from a fresh page before believing it. A metric points;
   it does not diagnose.
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
  out.buriedFocusable = [];
  for (const el of svg.querySelectorAll('[tabindex]')) {
    const ti = el.getAttribute('tabindex');
    if (ti !== '0') continue;                       // -1 is deliberately out of the order
    /* focusable AND hidden from the tree is the worst combination: Tab lands on it and
       a screen reader announces nothing. Worth checking explicitly, because the fix for
       one half of the problem (hiding invisible scenes from the tree) can create it. */
    if (el.closest('[aria-hidden="true"]'))
      out.buriedFocusable.push((el.getAttribute('aria-label') || el.tagName).slice(0, 40));
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
      (s.buriedFocusable || []).forEach(n =>
        findings.push([view, k, 'focusable but inside aria-hidden — Tab lands, nothing announced', n]));
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
      /* Reset to a KNOWN point. Two earlier versions of this called .focus() on an
         element that cannot take focus -- first #viz (role="group", no tabindex), then
         document.body (also no tabindex). Both are silent no-ops, so the walk actually
         started wherever the previous scene's walk had left focus, which after 40-odd
         Tab presses is somewhere past #viz. Then Tab moves further away, not back.
         That single mistake produced 78 false findings, then 27, then 1 -- each time
         looking more plausible than the last.
         Focus the first genuinely focusable element in the document instead. */
      await page.evaluate(() => {
        document.activeElement?.blur?.();
        document.querySelector('a[href], button, input, [tabindex="0"]')?.focus();
      });
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
      if (total !== s.focusable.length)
        findings.push([view, k, `counted ${s.focusable.length} controls then tagged ${total}`, 'scene changed between the two reads']);
      if (tabbed.size === 0) findings.push([view, k, `${total} control(s) exist but Tab reached none`, '']);
      else if (tabbed.size < total)
        findings.push([view, k, `Tab reached ${tabbed.size} of ${total} controls`, '']);
    }
    console.log(`${view}: ${scenesWithControls} of ${keys.length} scenes expose controls, ${totalFocusable} focusable objects`);
    await page.close();
  }
  /* ---- WCAG 1.4.10 reflow -------------------------------------------------
     Content must reflow without two-dimensional scrolling at 320 CSS px wide.
     That is the real bar, not "looks fine on a phone": 320px is 400% zoom of a
     1280px viewport, which is how a low-vision reader actually uses this. */
  {
    const page = await b.newPage({ viewport: { width: 320, height: 640 } });
    await page.addInitScript(() => { window.__fastTimers = true; });
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    const keys = await page.$$eval('.step', els => els.map(e => e.dataset.key));
    let worst = 0, worstKey = '';
    for (const k of keys) {
      await page.evaluate(kk => document.querySelector('.step[data-key="' + kk + '"]')
        .scrollIntoView({ behavior: 'auto', block: 'center' }), k);
      await page.waitForTimeout(700);
      const over = await page.evaluate(() =>
        document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (over > worst) { worst = over; worstKey = k; }
    }
    console.log(`\nreflow at 320px: worst horizontal overflow ${worst}px` +
      (worst > 1 ? `  <-- ${worstKey} (WCAG 1.4.10 wants 0)` : '  — no two-dimensional scrolling'));
    if (worst > 1) findings.push(['320px', worstKey, `horizontal overflow ${worst}px`, 'WCAG 1.4.10 reflow']);
    await page.close();
  }

  /* ---- the accessibility tree, as a screen reader receives it -------------
     page.accessibility.snapshot() was removed from Playwright; the current API is
     locator.ariaSnapshot(), which returns the tree as text. Checked on a scene with
     real controls rather than on the document, because setTabbing() means a scene's
     controls only enter the tree while that scene is current. */
  {
    const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await page.addInitScript(() => { window.__fastTimers = true; });
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    for (const scene of ['five', 'desk']) {
      await page.evaluate(k => document.querySelector(`.step[data-key="${k}"]`)
        ?.scrollIntoView({ behavior: 'auto', block: 'center' }), scene);
      await page.waitForTimeout(2500);
      let tree = '';
      try { tree = await page.locator('#viz').ariaSnapshot(); } catch (e) { tree = ''; }
      const lines = tree.split('\n').filter(l => l.trim());
      const buttons = lines.filter(l => /- button/.test(l));
      const named   = lines.filter(l => /"[^"]{3,}"/.test(l));
      const group   = lines.find(l => /- group/.test(l));
      console.log(`\naccessibility tree on '${scene}': ${lines.length} nodes, ${named.length} named, ${buttons.length} buttons`);
      if (!tree)          findings.push(['tree', scene, 'ariaSnapshot returned nothing', '']);
      else {
        if (!group)          findings.push(['tree', scene, 'the chart is not exposed as a group', '']);
        if (!buttons.length) findings.push(['tree', scene, 'no buttons reach the accessibility tree', '']);
        // an unnamed button announces as "button" and nothing else
        const anon = buttons.filter(l => !/"[^"]{3,}"/.test(l));
        if (anon.length) findings.push(['tree', scene, `${anon.length} button(s) reach the tree with no name`, '']);
        if (buttons.length) console.log('  first button announces as: ' + buttons[0].trim().slice(0, 74));
      }
    }
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
    /* ALL of them, not the worst four. A count of 13 printed beside a list of 4 is the
       shape that has already cost this project twice: findings sorted by severity and
       read through `tail`, so the reported number was a floor and the rest were never
       seen. If the list is long, the answer is to fix the controls, not to shorten the
       list -- a human cannot apply 2.5.8's exceptions to rows nobody printed. */
    /* And WHICH control, which was collected as `f.id` from the first version of this
       check and never printed. A row reading "[mobile] lenses 19x108" is a number
       without an address: it took a grep through 20 padHit call sites and a wrong guess
       about rounding to not find it. The identifier costs one field. */
    small.forEach(s => console.log(
      `  [${s[0]}] ${String(s[1]).padEnd(12)} ${String(s[2]).padEnd(8)} ${s[3] || '(no id)'}`));
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
