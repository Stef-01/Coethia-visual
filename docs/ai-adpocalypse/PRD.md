# PRD — The AI Adpocalypse: A Public Health Disaster

**Series:** The Reachable · piece 3
**File target:** `ai-adpocalypse.html` (single file, same stack as `belief-based-communication.html`)
**Status:** PRD v1 · 2026-08-24 · provenance: ai (founder-directed)
**Companion:** [RESEARCH-BUILD-PLAN.md](RESEARCH-BUILD-PLAN.md) — the 1-year execution plan

---

## 1. Thesis

The most precise persuasion machine ever built is currently selling unregulated
medicine, and public health is not even in the auction. The piece walks the
reader through that machine at tutorial-grade fidelity — every screen an
advertising manager actually clicks — first pointed at consumers by a gray-market
peptide company, then through the AI-generated influencer layer that launders the
same pitch into "authentic" social content, and finally flipped: the identical
console, the identical targeting primitives, re-engineered to find at-risk
populations and reach them with health communication that actually lands.

The argument inherits the series' spine: **the machinery is neutral; the
asymmetry is the disaster.** Piece 2 proved belief beats labels. Piece 3 proves
the other side already knows — and is running the playbook at industrial scale
while health promotion mails pamphlets.

## 2. Why tutorial precision (and its guardrails)

The Google Ads walkthrough must be precise enough that a reader recognizes every
screen — that precision IS the horror. Guardrails that keep it an exposé, not a
how-to for harm:

- Everything shown is what Google's own public campaign wizard shows any
  advertiser; nothing beyond publicly documented, first-party UI.
- The vendor is **fictional** ("Apex Research Peptides" — name TBD in copy pass;
  must collide with no real company). No real brand, handle, or product page is
  reproduced.
- All UI is **stylized SVG recreation** in the series' visual language — never
  screenshots, never Google's trade dress verbatim (Material chrome is
  abstracted; no Google logo beyond a generic "ads console" label).
- All metrics, audiences, and dollar figures are synthetic and stamped as such
  (series honesty layer).
- The dual-use flip is structural, not a coda: Act III re-runs the same screens
  for good, so the tutorial energy resolves into the counterattack.
- No evasion techniques are taught beyond what the evidence pack documents as
  already public and already policed (e.g. "Research Use Only" labeling is
  reported as the legal fig leaf it is, with the FDA position stated).

## 3. Audience & outcomes

**Primary:** public-health practitioners, health-comms funders, digital-policy
audiences. **Secondary:** general readers who arrive via the series.

A reader finishes able to:
1. Reconstruct how intent-based ad targeting reaches a person mid-symptom
   (custom segments from search terms — the loophole around banned
   health-condition targeting).
2. Explain the AI content flywheel (persona farms → variant testing →
   winner amplification → fatigue-speed iteration).
3. Name the asymmetry in resources, speed, and precision between commercial
   and public-health persuasion.
4. Describe the counterattack concretely: Ad Grants, search interception,
   demographic gap-finding, credible-messenger loops.

## 4. Narrative architecture — 29 scenes, 5 movements

Scene grammar identical to piece 2: sticky SVG stage + step rail, IO-driven
scene controller, per-scene camera frame, `TITLES` map, reveal system.

### Act 0 — The Symptom (3 scenes)

| key | working headline | stage |
|---|---|---|
| `open` | A Search at 1 A.M. | Dark stage. A phone glows; a typed query animates: "why won't my shoulder heal". One person, one moment of need. |
| `results` | The Auction Answers First | The results page materializes: four ad slots stack above the organic results, each a peptide vendor. Ad badges pulse. Stamp: stylized recreation. |
| `thesis` | The AI Adpocalypse | Title beat. The claim, plainly: precision persuasion is pointed at patients, and health promotion hasn't caught up. |

### Act I — The Machine (10 scenes) · the tutorial

A recurring **console frame** (browser-chrome SVG component) walks the real
campaign-creation sequence. Each scene = one screen the ad manager actually sees.

| key | working headline | screen recreated |
|---|---|---|
| `mach1` | Step One: Pick a Goal | New campaign → objective chooser (Sales · Leads · Website traffic · Awareness). "Sales" selected. The console asks what to optimize; nobody asks if it's true. |
| `mach2` | Step Two: Pick a Weapon | Campaign type: Search · Performance Max · Demand Gen · Display · Video. Search selected; side copy explains what each buys. |
| `mach3` | The Machine Bids for You | Bidding screen: Maximize conversions, target CPA. Smart bidding optimizes toward checkouts — the only feedback signal is the sale. |
| `mach4` | Where the Buyers Live | Location targeting: metro radius rings on a stylized map; language; income-tier location groups. |
| `mach5` | The Audience Shelf | Audience segments, browse tab: Affinity · In-market ("Fitness & nutrition supplements") · Life events · Detailed demographics. The taxonomy of you. |
| `mach6` | The Loophole | **Core mechanism scene** (this act's "Missed: Belief"). Custom segments: "people who searched on Google for…" → `bpc-157 dosage`, `wolverine stack`, `shoulder won't heal`. Condition targeting is banned by policy; intent targeting is the product. The ban and the workaround rendered side by side. |
| `mach7` | Sorting People Into Boxes | Demographics grid: age × gender × household income, with exclude toggles. Direct visual echo of piece 2's bucket scene — same crime, new console. |
| `mach8` | Words That Summon Ads | Keywords + match types (broad/phrase/exact); negative keywords quietly exclude `fda`, `scam`, `reddit`. The vendor curates which doubts it meets. |
| `mach9` | Fifteen Headlines, One Fig Leaf | RSA builder: 15 headlines, 4 descriptions, Ad Strength meter animating to "Excellent". Description slot carries "For research use only" — the disclaimer that converts. |
| `mach10` | Two Hundred Milliseconds | Launch. Auction visualization: query → eligible ads → auction → impression in <200ms; the dashboard begins counting conversions. The 1 A.M. search from `open` re-enters and is caught. |

### Act II — The Feed (6 scenes) · the laundering

| key | working headline | stage |
|---|---|---|
| `feed1` | Meanwhile, on the Feed | Flip from search to social: phone-feed frame. A warm, credible creator explains "how I finally healed my shoulder". She does not exist. |
| `feed2` | Build-a-Creator | Persona spec-sheet UI (DoubleSpeed-class tooling, named and sourced): "62-year-old mom in Phoenix", "Gen-Z skater in Atlanta". Bios, faces, interaction patterns — configured like campaign settings. |
| `feed3` | The Farm | Device-rack visual: real phones on real US carriers; accounts that scroll, swipe, comment, and warm up like people; agent accounts engaging each other. Priced like SaaS ($150–$250/mo tiers). |
| `feed4` | The Dark Flywheel | **The series' loop wheel, inverted** — same radial grammar as piece 2's flywheel, recolored to the commerce palette: Generate 50 variants → score → test → amplify winners → regenerate from winners. Fatigue cycle 2–3 weeks; 20+ creatives/month is table stakes. Hover stations for content (series interaction grammar). |
| `feed5` | Optimized for Everything but Truth | The metrics the loop sees: engagement, CTR, conversion. The metrics it never sees: accuracy, outcomes, harm. Dashboard with the missing columns rendered as dashed voids. |
| `feed6` | The Asymmetry Ledger | **This act's "Two Bought. Five Missed."** — ledger walk comparing machine vs health promotion: persona precision ✓/✗ · creative volume ✓/✗ · iteration speed ✓/✗ · spend per person ✓/✗ · feedback loop ✓/✗. Procedural row-by-row reveal, then the summary lineup. |

### Act III — The Counterattack (7 scenes) · the flip

| key | working headline | stage |
|---|---|---|
| `flip` | Hold the Machine the Other Way | The reprise move (piece 2's Coethia beat): the console returns, dimmed, then relights in the health palette. Same screens. Different buyer. |
| `good1` | The Same Console, Rerun | Objective re-chosen: not Sales — reach. Ad Grants reality: $10k/month of search inventory for nonprofits; geo-targeting required by policy. The walkthrough repeats compressed — the reader already knows every screen. |
| `good2` | Intercept the Search | Custom segments for good: the same `bpc-157 dosage` searcher — served the evidence card instead: gray-market quality data (10–90% mislabeled actives, contamination), what is and isn't approved, a real pathway. Search interception as care, with crisis-line precedent. |
| `good3` | Find the Unreached | The demographic grid re-used to find gaps, not customers: income × geography × language = access deserts lit up on the map. Piece 2's belief-map quadrants cameo as the targeting layer health already owns. |
| `good4` | A Credible-Messenger Flywheel | The loop wheel relit in health teal: real clinicians and creators, belief-state messaging (piece 2 continuity), the same testing rigor pointed at comprehension and trust instead of checkout. |
| `good5` | Three Ways In, Again | Piece 2's Information / Training / Service tiers return, applied to counter-marketing capability: syndicated intelligence → team training → full-service campaign ops. Series continuity is explicit. |
| `good6` | What It Would Take | Honest asks: funding parity lines, platform health-segment accountability, policy levers (EU-style targeting limits as live precedent), practitioner tooling. Rendered as a ledger, not a manifesto. |

### Reprise & close (3 scenes)

| key | working headline | stage |
|---|---|---|
| `reprise` | Two Flywheels, One Attention | Both wheels side by side, spinning — commerce loop vs health loop — over the same silhouette crowd. Which one is tuned to you tonight? |
| `close` | The Same Search, Answered Differently | Return to the dark stage and the 1 A.M. phone. Same query; the first result is now the evidence card. The fix is infrastructural, not personal willpower. |
| `methods` | How This Was Made | Honesty layer, full-bleed: fictional vendor, stylized UI recreations, synthetic metrics, claims registry with sources, dual-use statement. |

## 5. Design-system inheritance (exact)

Inherit from `belief-based-communication.html` verbatim unless stated:

- **Stack:** single HTML file, vanilla JS + vendored `d3.v7.min.js` (CDN
  fallback), no build step. Sticky-stage scrollytelling: `.step` rail +
  IntersectionObserver active-set controller, `render(key)` idempotent scene
  switch with `prev` tracking.
- **Palette:** series tokens (paper `#F8F6F1`, ink `#212E36`, body `#333`,
  accent `#F37940`, alarm `#B8492E`/`#E74D4E`, teal `#7FCCC8`/`#5FA8A0`, blues
  `#C3DCEB`, golds `#FFD733`). New within-token usage: Act 0/close run the dark
  stage (ink field, paper type) — first dark scenes in the series; tokens
  inverted, not new colors. Commerce loop renders alarm-side; health loop
  teal-side.
- **Type:** identical stack (display serif wordmark, Libre Franklin text, IBM
  Plex Mono labels); `typed(sel, base)` + `data-fs` + `TK` from
  `computeTK(frame)`; `applyTypeScale()` on frame change; authored line splits
  for long labels.
- **Motion constants:** `REDUCE, ELASTIC, FADE, CAMERA, MOVE, VALUE_EASE` —
  same values, same law: encoded marks never overshoot; elastic only on
  decoration; clamped attrTweens for width/dash animations; named transitions
  with explicit `interrupt` on competing writes.
- **Camera:** `FRAMES` / `FRAMES_MOBILE` per named frame + `frameFor` +
  `isNarrow()` (≤960). Every three-across composition ships with a narrow
  restack layout pass (the piece-2 `layoutPillars`/`layoutTiers` pattern —
  build both layouts from day one, not as a retrofit).
- **Reveal + a11y contract:** `.reveal-ready .step-inner.in` gated on observer
  existence; svg `role="group"`, decorative layers `aria-hidden`; every hover
  system keyboard-reachable (tabbable hit nodes with focus/blur mirroring
  mouse handlers); prose carries all load-bearing content so the stage is
  enhancement, not requirement.
- **Honesty layer:** persistent corner stamp ("Synthetic data · stylized
  recreation · fictional vendor"), per-scene disclosure notes where a real
  product/price/statistic is cited, `methods` scene as the full register.
- **Masthead:** The Reachable wordmark → `index.html`; prev/next nav rewired
  three-ways (Personas ↔ Noise & Belief ↔ Adpocalypse, wrap-around); index gains
  a third `.piece` card; nav labels collapse to arrows <640px.

## 6. New components (build once, spec'd)

1. **Console frame** — browser-chrome SVG shell (tab, URL bar reading
   `ads.google.com` genericized, content region) that every Act I/III screen
   mounts inside. One component, re-dressed per scene like piece 2's caseCard.
2. **Ads-UI kit** (SVG, series-styled): stepper rail, radio/segmented cards
   (objective, campaign type), toggle rows with expand, tabbed audience shelf,
   token-chip input (keywords, custom-segment terms), demographic grid with
   exclude states, Ad Strength arc meter, dashboard counter row. Soft corners,
   series colors — abstracted, not Material.
3. **Phone-feed frame** — device-shell SVG with scrollable feed cards, creator
   header, engagement counters (piece 2's social-card grammar extended).
4. **Device rack** — the farm visual; rows of phone silhouettes with status
   pips and activity traces.
5. **Dark-stage treatment** — inverted-token scene wrapper for `open`/`close`
   (background field swap on the stage + step-rail contrast handling).
6. **Dual flywheel** — parameterized rebuild of piece 2's loop wheel accepting
   palette + station set, so commerce and health wheels are the same component
   proved different only by inputs (which is the thesis, in code).
7. **Ledger** — direct reuse of the piece-2 case-walk engine (CASE_STEP state
   machine, row emphasis law, single re-dressed explainer card, narrow crop).

## 7. Interaction spec

- Hover/focus grammar identical to piece 2 (tooltip singleton, `placeTip`,
  content-bearing hovers that spread the stage out).
- Act I console screens: the "clicked" control in each scene animates its
  selection state as the scene enters (radio fill, toggle slide, chip commit) —
  the reader watches the choice being made; REDUCE renders final states.
- `mach6` custom-segment chips are hoverable: each search term explains what
  it reveals about the searcher and why policy doesn't stop it.
- `feed4`/`good4` wheels: station hovers (piece 2 loopHits pattern), keyboard
  navigable.
- `feed6`/`good6` ledgers: procedural scroll walk (piece 2 case grammar).
- No interaction is load-bearing; all content reachable in prose.

## 8. Evidence & claims registry (contract)

Every factual claim in side copy maps to a registry row (`docs/ai-adpocalypse/
claims.md`, built in Q1): claim → ≥2 sources → date checked → scene key.
Anchor claims from initial research (2026-08):

- Custom segments target by past Google searches; health-condition personalized
  targeting is policy-restricted — the intent/condition gap is the documented
  workaround. (Google Ads audience docs; Adobe health-segment guidelines.)
- Peptide gray market: BPC-157 unapproved/"legal limbo" (2026 FDA advisory
  fight); six peptides eased 2026; "Research Use Only" labeling does not
  legalize human use; Belgian quality study: 10–90% active-ingredient variance
  + contamination; "Wolverine Stack" as live marketing artifact.
- DoubleSpeed (real, named, quoted): synthetic personas ("62-year-old mom in
  Phoenix"), real US devices/carriers, warm-up behavior, agentic cross-
  engagement, comment seeding, $150/$250/custom tiers, "replacing 30 person
  creator teams".
- Creative-testing economy: 20–50 creatives/month operating tempo; predictive
  creative scoring; 2–3 week fatigue cycles; volume-testing ROAS advantage.
- Counterattack precedents: Ad Grants $10k/mo + geo-targeting policy; crisis-
  line search interception; WHO/gov COVID ad-grant precedent ($250M).

## 9. Tech spec & budgets

- One file ≤ ~180KB unminified (piece 2 is ~105KB; +29 scenes justifies
  headroom, not bloat); d3 vendored; zero external requests beyond fonts.
- 60fps steady-state on mid-tier mobile; idle loops (typing cursor, wheel spin,
  counter ticks) gated off-scene via `interrupt` and off entirely under REDUCE.
- Console-frame screens are data-driven (one component + per-scene spec
  objects), not 10 hand-built SVG trees.
- Tri-width contract: 375 / 768 / 1440 — all scenes revealed, zero horizontal
  overflow, zero console errors (the series sweep, automated via headless
  browse).

## 10. QA protocol

The established loop, now standing: exact-string patch scripts → headless
smoke (`typeof d3`, step count, error scan) → per-scene screenshots at 1440 +
375 → targeted fixes → tri-width sweep → Desktop mirror → commit+push main →
live verify → Stefan-Brain log. Act-level gates in the build plan add: copy
fact-check against the claims registry, a11y keyboard pass, and REDUCE pass.

## 11. Risks

| Risk | Mitigation |
|---|---|
| Tutorial precision reads as enablement | Guardrails §2; ethics review gate M3; the flip is structural |
| Google UI drifts during the year | Screens are abstracted; Q1 walkthrough re-verified M7 + M11 pre-launch |
| DoubleSpeed pivots/rebrands/lawyers up | Claims quoted + archived (M1 evidence pack snapshots); component named generically ("persona-farm tooling"), vendor cited in sources |
| Legal exposure (defamation/trade dress) | Fictional vendor, stylized UI, quoted-public-material rule, legal review gate M10 |
| Scope creep past 29 scenes | Scene budget is a hard cap; cut list maintained from M4 |
| Dark-stage a11y contrast | Token-inversion spec'd + contrast-checked in M5 prototype |
