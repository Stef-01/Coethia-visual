/* Scene audit for faster-than-the-rumour.html
   Walks every scene at two widths and reports: console errors, empty stages,
   content that overflows its own camera frame, and NaN geometry.
   Run: node audit.js [--shots] [--only=key1,key2]                             */
const { chromium } = require('C:/Users/stefa/Menu-app/node_modules/playwright');
const path = require('path');
const fs = require('fs');

const URL = 'file:///' + path.resolve(__dirname, 'faster-than-the-rumour.html').replace(/\\/g, '/');
const SHOTS = process.argv.includes('--shots');
const ONLY = (process.argv.find(a => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const SHOT_DIR = path.join(__dirname, '.shots');

const VIEWS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 375, height: 780 }
];

(async () => {
  if (SHOTS && !fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR);
  const browser = await chromium.launch();
  const findings = [];
  let scenes = [];

  for (const view of VIEWS) {
    const page = await browser.newPage({ viewport: { width: view.width, height: view.height } });
    const errs = [];
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForTimeout(1200);

    scenes = await page.$$eval('.step', els => els.map(e => e.dataset.key));
    const targets = ONLY.length ? scenes.filter(k => ONLY.includes(k)) : scenes;

    // horizontal page overflow
    const hOver = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (hOver > 1) findings.push({ view: view.name, key: '(page)', kind: 'h-overflow', detail: hOver + 'px' });

    for (const key of targets) {
      const before = errs.length;
      await page.evaluate(k => {
        const el = document.querySelector('.step[data-key="' + k + '"]');
        el.scrollIntoView({ behavior: 'auto', block: 'center' });
      }, key);
      await page.waitForTimeout(1500);

      const r = await page.evaluate(() => {
        const svg = document.querySelector('#viz');
        const vb = svg.getAttribute('viewBox').split(/[\s,]+/).map(Number);
        const box = { x: vb[0], y: vb[1], w: vb[2], h: vb[3] };
        let nodes = 0, texts = 0, tiny = 0, nan = 0;
        let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
        // The provenance stamp is chrome positioned FROM the camera frame, so it
        // sits on the frame edge by construction. measure.js already excludes it
        // for that reason; counting it here reported a phantom frame-overflow on
        // every scene that shows it (the six console screens, cases, measure).
        const stamp = svg.querySelector('g[pointer-events="none"]');
        const vis = [...svg.children].filter(g =>
          g.tagName === 'g' && g !== stamp && +(g.getAttribute('opacity') ?? 1) > 0.05);
        for (const g of vis) {
          const all = g.querySelectorAll('*');
          for (const n of all) {
            for (const a of n.attributes) if (/NaN|Infinity/.test(a.value)) nan++;
          }
          nodes += all.length;
          for (const t of g.querySelectorAll('text')) {
            if (!t.textContent.trim()) continue;
            texts++;
            const fs2 = parseFloat(t.getAttribute('font-size') || 0);
            const scale = svg.getBoundingClientRect().width / box.w;
            if (fs2 * scale < 7.0) tiny++;
          }
          // measure only what is actually painted: skip transparent hit targets,
          // zero-opacity nodes and anything inside a hidden subtree
          for (const n of all) {
            if (n.tagName === 'g' || n.tagName === 'clipPath' || n.tagName === 'animate'
                || n.tagName === 'animateTransform') continue;
            if (n.closest('clipPath')) continue;
            const fill = n.getAttribute('fill');
            const stroke = n.getAttribute('stroke');
            if (fill === 'transparent' && !stroke) continue;
            let op = 1, p2 = n;
            while (p2 && p2 !== svg) { op *= +(p2.getAttribute('opacity') ?? 1); p2 = p2.parentNode; }
            if (op < 0.06) continue;
            if (n.tagName === 'text' && !n.textContent.trim()) continue;
            let bb; try { bb = n.getBBox(); } catch (e) { continue; }
            if (!bb.width && !bb.height) continue;
            minX = Math.min(minX, bb.x); minY = Math.min(minY, bb.y);
            maxX = Math.max(maxX, bb.x + bb.width); maxY = Math.max(maxY, bb.y + bb.height);
          }
        }
        // text collisions: any two painted labels whose screen boxes materially
        // overlap. Catches the label pile-ups that only show up in a screenshot.
        const boxes = [];
        for (const g of vis) for (const t of g.querySelectorAll('text')) {
          if (!t.textContent.trim()) continue;
          let op = 1, p3 = t;
          while (p3 && p3 !== svg) { op *= +(p3.getAttribute('opacity') ?? 1); p3 = p3.parentNode; }
          if (op < 0.3) continue;
          const r2 = t.getBoundingClientRect();
          if (r2.width < 1) continue;
          boxes.push({ r: r2, s: t.textContent.trim().slice(0, 22) });
        }
        const hits = [];
        for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i].r, b = boxes[j].r;
          const ow = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          const oh = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (ow <= 1 || oh <= 1) continue;
          const frac = (ow * oh) / Math.min(a.width * a.height, b.width * b.height);
          if (frac > 0.34) hits.push(boxes[i].s + ' / ' + boxes[j].s);
        }
        return { box, nodes, texts, tiny, nan, minX, minY, maxX, maxY, groups: vis.length, hits };
      });

      const newErrs = errs.slice(before);
      if (newErrs.length) findings.push({ view: view.name, key, kind: 'console', detail: newErrs[0].slice(0, 160) });
      if (r.nan) findings.push({ view: view.name, key, kind: 'NaN-geometry', detail: r.nan + ' attrs' });
      if (r.nodes < 12) findings.push({ view: view.name, key, kind: 'empty-stage', detail: r.nodes + ' nodes' });
      if (r.hits.length) findings.push({ view: view.name, key, kind: 'text-collision',
        detail: r.hits.length + 'x  ' + r.hits.slice(0, 3).join(' | ') });
      if (r.tiny) findings.push({ view: view.name, key, kind: 'tiny-text', detail: r.tiny + ' of ' + r.texts + ' under 7px' });
      const PAD = 6;
      const over = [];
      if (r.minX < r.box.x - PAD) over.push('L' + Math.round(r.box.x - r.minX));
      if (r.minY < r.box.y - PAD) over.push('T' + Math.round(r.box.y - r.minY));
      if (r.maxX > r.box.x + r.box.w + PAD) over.push('R' + Math.round(r.maxX - r.box.x - r.box.w));
      if (r.maxY > r.box.y + r.box.h + PAD) over.push('B' + Math.round(r.maxY - r.box.y - r.box.h));
      if (over.length) findings.push({ view: view.name, key, kind: 'frame-overflow', detail: over.join(' ') });

      if (SHOTS && view.name === 'desktop') {
        await page.locator('.graphic').screenshot({
          path: path.join(SHOT_DIR, String(scenes.indexOf(key)).padStart(2, '0') + '-' + key + '.png')
        });
      }
    }
    await page.close();
  }
  await browser.close();

  console.log('scenes: ' + scenes.length);
  if (!findings.length) { console.log('CLEAN — no findings'); return; }
  const byKind = {};
  findings.forEach(f => (byKind[f.kind] = (byKind[f.kind] || 0) + 1));
  console.log('findings: ' + findings.length + '  ' + JSON.stringify(byKind));
  findings.forEach(f => console.log('  [' + f.view + '] ' + f.key.padEnd(15) + ' ' + f.kind.padEnd(15) + ' ' + f.detail));
})();
