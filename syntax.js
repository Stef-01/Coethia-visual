/* Parse the page's inline script. Nothing else. Run it first, always.
   Run: node syntax.js

   WHY THIS EXISTS
   ---------------
   An edit to faster-than-the-rumour.html deleted the `if` branch of an if/else and
   left the `else` orphaned. That is a syntax error, so the page's entire inline
   script stopped parsing: #viz got no viewBox, no children, and nothing was drawn.

   legible.js then walked all 59 scenes -- the .step elements are static HTML, so the
   walk succeeded -- found zero painted labels, had nothing to report, and printed
   "CLEAN - every label is readable against what is behind it" with exit code 0. The
   sweep meant to verify the work was the one instrument that did not notice. audit.js
   and interact.js crashed on the same page a minute later, which is the only reason
   it was caught, and each of those took several minutes of browser time to get there.

   A syntax error in a bundled artifact is invisible to anything that does not execute
   it, and expensive to find via anything that does. This finds it in about a second,
   with no browser, and it is cheap enough to run after every single edit.

   It deliberately does NOT check anything else. A file that does not parse makes every
   other measurement meaningless, so this is the one gate that has to come first and
   the one that has to stay fast enough that skipping it is never tempting.          */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const FILE = path.resolve(__dirname, process.argv[2] || 'faster-than-the-rumour.html');
const html = fs.readFileSync(FILE, 'utf8');

/* every <script> without a src is the page's own code */
const blocks = [];
const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
let m;
while ((m = re.exec(html)) !== null) {
  blocks.push({ code: m[1], offset: m.index + m[0].indexOf(m[1]) });
}

if (!blocks.length) {
  console.log('no inline script found in ' + path.basename(FILE));
  process.exitCode = 1;
  return;
}

let bad = 0;
for (const [i, b] of blocks.entries()) {
  /* the line the block starts on, so a reported line maps back to the html */
  const base = html.slice(0, b.offset).split('\n').length;
  try {
    new vm.Script(b.code, { filename: 'inline-' + i + '.js' });
  } catch (e) {
    bad++;
    console.log('SYNTAX ERROR in inline block ' + (i + 1) + ' of ' + blocks.length
      + ' (' + b.code.length + ' chars, starts at html line ' + base + ')');
    console.log('  ' + e.message);
    /* v8 puts the offending line and a caret in the stack for a parse failure */
    const st = String(e.stack || '').split('\n');
    const lineNo = (st[0].match(/inline-\d+\.js:(\d+)/) || [])[1];
    if (lineNo) console.log('  --> html line ~' + (base + (+lineNo) - 1));
    st.slice(1, 4).forEach(l => { if (l.trim()) console.log('  ' + l.trim().slice(0, 160)); });
  }
}

if (bad) {
  console.log('\n' + bad + ' of ' + blocks.length + ' inline block(s) do not parse.'
    + ' Every other check in this suite is meaningless until this passes:'
    + ' a page whose script did not run has nothing on it to measure, and a'
    + ' geometry check finds no defects in nothing.');
  process.exitCode = 1;
} else {
  const chars = blocks.reduce((n, b) => n + b.code.length, 0);
  console.log('OK - ' + blocks.length + ' inline block(s), '
    + chars.toLocaleString() + ' chars, all parse');
}
