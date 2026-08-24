# The AI Adpocalypse — 1-Year Research & Build Plan

**Companion to:** [PRD.md](PRD.md) · v1 · 2026-08-24 · horizon: Sep 2026 → Aug 2027
**Operating law:** research before storyboard, storyboard before build, every act
gated, everything committed to main, every session logged.

---

## Shape of the year

| Quarter | Mode | Output |
|---|---|---|
| Q1 (Sep–Nov 2026) | Research & evidence | Claims registry, verified walkthrough, 6-lens research dossier, ethics/legal gate |
| Q2 (Dec–Feb 2027) | Design & prototype | Locked storyboard, copy draft 1, component kit, Act I vertical slice |
| Q3 (Mar–May 2027) | Production | All 29 scenes built, motion + interaction passes, mobile layouts |
| Q4 (Jun–Aug 2027) | Hardening & launch | QA matrix, fact-recheck, legal signoff, launch, post-launch loop |

Weekly cadence throughout: one build/research session minimum, committed to
main; monthly milestone gates below are hard — a red gate stops the next month's
work, not the log entry.

---

## Q1 — Research & evidence (M1–M3)

### M1 (Sep 2026) — Evidence pack v1

- **Walkthrough verification:** open a real Google Ads account, $0 spend,
  walk the full Search-campaign wizard for a *fictional* product; document
  every screen (field names, option lists, defaults, Ad Strength behavior,
  audience shelf taxonomy, custom-segment builder copy) in
  `docs/ai-adpocalypse/walkthrough-notes.md`. This is the piece's spine —
  primary-source, not blog-post, fidelity.
- **Persona-farm dossier:** archive DoubleSpeed's live site + pricing;
  survey the adjacent vendor class (AI UGC, creative-scoring, device-farm
  tooling); snapshot everything (claims rot).
- **Peptide market scan:** catalogue live ad creative + influencer content
  for peptide vendors (ad-library pulls, TikTok/IG examples); document the
  "Research Use Only" pattern, pricing, funnels. Save exemplars for stylized
  recreation reference — never for reproduction.
- Deliverable: `claims.md` v1 — every anchor claim from PRD §8 sourced ×2.
- **Verify:** registry has zero single-source claims; walkthrough notes cover
  all 10 Act I screens.

### M2 (Oct 2026) — Six-lens research dossier (LAW 4 RSG)

One dossier section per lens, each producing ≥1 non-obvious insight that
changes copy or structure:

1. **First-principles:** what targeting *is* (information asymmetry priced in
   an auction); why intent data dominates demographic data; where the floor of
   "personalization" actually sits.
2. **Historical:** patent-medicine advertising 1880–1906 → Pure Food and Drug
   Act; DTC pharma ads 1997→; tobacco counter-marketing (the "truth" campaign
   as the proven counterattack template). The piece's historical echo beats
   come from here.
3. **Contrarian:** steelman targeting-as-relevance; steelman "public-health
   precision targeting is surveillance-washing"; when does the counterattack
   become the thing it fights? `good6` honesty depends on this lens.
4. **Technical:** auction mechanics, quality score, policy-enforcement ML and
   its documented miss rate; how custom segments are compiled; what platforms
   can and cannot see.
5. **Economic:** unit economics of a peptide customer (CAC vs LTV) vs public-
   health spend per at-risk person reached; who profits at each layer
   (platform, vendor, farm, influencer); funding-parity math for `good6`.
6. **Geopolitical:** FDA jurisdiction vs platform self-regulation; EU DSA
   targeting restrictions as live precedent; state-level US moves; cross-border
   gray-market supply chains.
- **Verify:** ≥4 lenses have insights promoted into the storyboard; dossier
  filed to Stefan-Brain wiki with provenance frontmatter.

### M3 (Nov 2026) — Ethics/legal gate + storyboard inputs

- Ethics review: does any scene teach beyond publicly documented tooling?
  (PRD §2 checklist, applied scene by scene.)
- Legal review pass 1: fictional-vendor name cleared, trade-dress abstraction
  rules written, quoted-material register.
- Expert input: 2–3 conversations (public-health comms practitioner, paid-
  media practitioner, platform-policy person) — recorded into the dossier.
- **Gate:** written go/no-go on the tutorial-precision approach. Storyboard
  work does not start until this is green.

## Q2 — Design & prototype (M4–M6)

### M4 (Dec 2026) — Storyboard lock

- 29-scene storyboard finalized from PRD §4 + Q1 insights: per scene — key,
  frame, headline, side-copy outline, stage spec, motion spec, interaction
  spec, claims-registry references. Cut list opened (hard cap 29).
- Copy draft 0 for Acts 0–I.
- **Verify:** every scene has a claims mapping or an explicit "no factual
  claims" mark.

### M5 (Jan 2027) — Component kit

- Build the seven PRD §6 components as an isolated spike page (same file
  conventions, throwaway harness): console frame, ads-UI kit, phone-feed
  frame, device rack, dark-stage treatment, parameterized flywheel, ledger
  engine port.
- Dark-stage contrast + REDUCE behavior proven here.
- **Verify:** tri-width render of the spike page clean; flywheel accepts both
  palettes from one code path; ledger replays piece-2 behavior byte-for-byte.

### M6 (Feb 2027) — Act I vertical slice

- `ai-adpocalypse.html` created for real: masthead/nav integration, Act 0 +
  Act I (13 scenes) fully built — copy, motion, interactions, narrow layouts.
- Series QA loop runs end-to-end on the slice (smoke, screenshots, tri-width).
- **Gate:** the slice must produce the "I recognize this console" reaction
  from at least one paid-media practitioner and the "this is an exposé, not a
  manual" reaction from at least one public-health reader. Both, or the
  framing gets rebuilt before Act II.

## Q3 — Production (M7–M9)

### M7 (Mar 2027) — Act II

- Feed scenes 14–19: phone-feed frame content, persona spec sheet, device
  rack, dark flywheel, asymmetry ledger walk.
- Walkthrough re-verification #2 (Google UI drift check) — Act I screens
  patched if the console moved.
- **Verify:** ledger walk replays cleanly both scroll directions; wheel hover
  content complete; tri-width sweep clean at 19 scenes.

### M8 (Apr 2027) — Act III

- Scenes 20–26: the flip, the rerun console (compressed walkthrough), search
  interception, gap map, health flywheel, tiers reprise, asks ledger.
- Series continuity pass: piece-2 cameos (belief map, tiers) render faithfully.
- **Verify:** the flip scene reads at 375px; compressed rerun stays under 2
  scenes' worth of console screens (no Act I repeat bloat).

### M9 (May 2027) — Reprise, close, and the full-piece motion pass

- Scenes 27–29 + methods register rendered from `claims.md`.
- Whole-piece motion audit: idle loops gated, interrupts audited, REDUCE
  parity walk of all 29 scenes.
- Copy edit pass 2 (voice: piece-2 register — declarative, unhedged, sourced).
- **Verify:** full tri-width sweep 29/29 · 0 overflow · 0 errors; REDUCE
  screenshot set archived.

## Q4 — Hardening & launch (M10–M12)

### M10 (Jun 2027) — Fact re-check + legal signoff

- Every claims-registry row re-verified against live sources; dead sources
  swapped; date-stamps updated. Peptide regulatory status re-checked (it is
  moving) and copy updated to whatever is true in mid-2027.
- Legal review pass 2 on the built artifact (trade dress, quotes, vendor
  fiction). **Gate:** written signoff.

### M11 (Jul 2027) — QA matrix + soft launch

- Full matrix: 375/768/1440 × light scroll/fast scrub/keyboard-only ×
  REDUCE on/off; walkthrough re-verification #3.
- a11y audit: focus order, tooltip keyboard parity, contrast (dark scenes),
  prose-completeness check (stage removed → argument intact).
- Soft launch to 10–15 target-audience readers; structured feedback
  (comprehension of the 4 PRD §3 outcomes, misreading probes).
- **Verify:** ≥80% of soft-launch readers reproduce the loophole mechanism
  unprompted; zero readers describe the piece as a how-to.

### M12 (Aug 2027) — Launch + post-launch loop

- Feedback-driven fixes; index card + prev/next nav shipped; deploy verified
  live (Vercel checks per the established gentle protocol).
- Launch. Post-launch: errata protocol (claims registry stays live; corrections
  ship as dated notes in `methods`), lightweight analytics decision (default:
  none — series has none; revisit deliberately), retrospective logged to
  Stefan-Brain, learnings promoted into the series' CONTEXT docs.

---

## Standing workstreams (all year)

- **Evidence freshness:** monthly 30-minute source-drift check (peptide
  regulation, DoubleSpeed, Ads UI); anything moved → registry note.
- **Series integrity:** any piece-2 refactor (shared components, nav) lands in
  both files the same week.
- **Logging:** every session → `wiki/_log/` (LAW 5); monthly milestone entries
  link the gate evidence.
- **Version control:** main-only, push-on-commit (LAW 2); the spike page and
  notes live in-repo under `docs/ai-adpocalypse/`.

## Resourcing & assumptions

Solo founder + Claude sessions; no external budget assumed except an optional
legal-review consult (M3/M10) and zero-spend ad accounts. Expert conversations
are network asks, not engagements. If the year compresses, the protected core
is Q1 M1 (primary-source walkthrough) + M6 gate + M10 gates — everything else
flexes.

## Success criteria (year-end)

1. Piece live as The Reachable #3, meeting the series QA contract.
2. Every factual claim double-sourced and dated within 90 days of launch.
3. Soft-launch comprehension bar met (M11).
4. Zero legal challenges outstanding; ethics framing held through review.
5. The dual-use flip lands: at least one public-health org asks "can we
   actually do the Act III playbook?" — that question is the piece working.
