# Coethia brand palette — analysis and application

> **Status: the dark application was reverted.** The colour analysis below is
> still the record of what the deck actually uses, and the OKLCH and CVD work
> is still worth keeping. What no longer holds is the *application*: the third
> explainer ran on the espresso ground for two commits and, next to the two
> light pieces and the index, read as a different website. `index.html`
> promises "one shared design system" and the piece's own credits claimed to
> share the other two's palette; neither was true while the dark skin was on.
>
> `faster-than-the-rumour.html` is now back on The Reachable's light system.
> Two islands were kept, for the same reason the console was always exempt —
> you draw the object, not a diagram of it:
>
> | Island | Why it stays as it is |
> |---|---|
> | The recreated Google Ads console | a real ad console is a white Material UI |
> | The phone, the 3am bedroom, the profile cards, the comment sheet | a phone at three in the morning is a bright screen in a dark room |
>
> One token had no light twin. The deck's wheat `#EBDDA8` is the *brightest*
> accent on espresso (12.22:1); on paper a wheat yellow is the dimmest thing
> available (1.29:1). `GOLD` is therefore re-cut as an ochre `#8D5D1C`
> (5.23:1) rather than mapped to a yellow that would disappear.
>
> If the deck brand is ever wanted on the web again, the right move is to take
> **all three** pieces and the index dark together, not one of them.

Source: `AHACoethia.pdf` (14pp). Colours extracted from the deck's actual vector
fills and text runs, not eyeballed; typography from the embedded font names.
Was applied to `coethia-engagement.html` only (a file since replaced by
`faster-than-the-rumour.html`); see the status note above.

## What the deck actually uses

| Token | Hex | Evidence in the deck |
|---|---|---|
| Espresso ground | `#271C16` | dominant surface, 14 fills, ~16.3M pt² — equal to white |
| Bone | `#EFEEE7` | primary text on dark, 842 chars |
| Dusty blue | `#B8CAD6` | headings + fills, 702k pt², 413 chars |
| Wheat | `#EBDDA8` | secondary labels, 139 chars |
| Forest green | `#3E694F` | supporting fills, 10 uses, 615k pt² |
| White | `#FFFFFF` | emphasis |

**Type:** Work Sans (ExtraLight → Bold, plus italics) for everything
structural; Poppins Italic at 15–16pt for captions and source lines.
No serif anywhere in the deck — the display face is Work Sans Light at
large sizes.

## The problem the analysis found

The deck is a **dark** brand. The Reachable's system is a light one
(`#F8F6F1` paper, `#212E36` ink, orange accent). A straight token swap
fails, because the deck's own forest green is only **2.64:1** against its
own ground — fine for large fills in a slide deck, unusable for text or
UI strokes on the web.

## Derived working tokens

| Role | Hex | Contrast on ground | Note |
|---|---|---|---|
| Ground | `#271C16` | — | from the deck |
| Surface 1 (cards) | `#31241D` | 1.11:1 step | derived |
| Surface 2 (panels) | `#3A2B22` | 1.23:1 step | derived |
| Primary text | `#EFEEE7` | **14.28:1** | from the deck |
| Body text | `#DCD4CB` | **11.33:1** | derived |
| Muted text | `#A79C93` | **6.19:1** | derived |
| Card secondary text | `#BDB4AC` | 5.6–6.1:1 on tints | derived, see fix 1 |
| Accent / kicker | `#EBDDA8` wheat | **12.22:1** | from the deck |
| Heading accent | `#B8CAD6` dusty blue | **9.86:1** | from the deck |
| Positive / "good" | `#72AC89` | **6.31:1** | forest lifted to L=0.56 |
| Caution | `#E0A272` | **7.58:1** | warm amber, replaces the old rust |
| Meaningful stroke | `#8A7768` | **3.89:1** | meets 1.4.11 for UI boundaries |
| Decorative hairline | `#4A382C` | 1.50:1 | dividers only, carries no state |

Deck colours kept verbatim: ground, bone, dusty blue, wheat. Forest green is
kept as a **fill** (`#3E694F`) and lifted to `#72AC89` wherever it carries
text or a boundary.

## Two accessibility fixes the audit forced

1. **Muted text on the tinted case cards** measured 4.34:1 (blue) and
   4.28:1 (brown) — under the 4.5 body minimum. Lifted to `#BDB4AC`,
   now 5.6–6.1:1.
2. **Unlit layer-cell strokes** measured 2.56:1. Those borders carry
   state (a layer is lit or dark), so they fall under WCAG 1.4.11's 3:1
   requirement for UI components. Lifted to `#8A7768` at 3.89:1.

## What deliberately did not change

**The advertising console stays light.** It is a recreation of a real
product, and a real ad console is a white Material UI. Re-skinning it to
brand would make it a diagram of a console rather than the thing itself.
On the espresso ground it now reads as a lit screen — which is what a
person actually sees. This follows the standing principle that
information should be shown as the interface people really navigate.

The console keeps Google's own tokens (`#1a73e8`, `#202124`, `#5f6368`,
`#dadce0`, `#f8f9fa`, `#d93025`, `#188038`). Only the account avatar
takes the brand green, as an account avatar would.

---

# Recursive optimisation — three rounds in OKLCH

The first application was contrast-correct but not *theory*-correct. Three
further rounds assessed the palette in OKLCH (perceptually uniform, so a
lightness step means the same thing at every hue) and corrected it.

## Round 1 — assessment

| Check | Result |
|---|---|
| Hue harmony | **Sound.** Ground 50°; amber +8° (analogous), wheat +45°, forest +107° (triadic-ish), blue −173° (split-complement). A warm base with a cool complement and a triadic third — a coherent structure, kept. |
| Chroma balance | **Failed.** Accents spanned 3.76× (amber C=0.097 vs dusty blue C=0.026). The brand blue — the *heading* accent — was the visually weakest, inverting the hierarchy. |
| Surface ladder | **Sound.** Steps 0.036 / 0.030 / 0.033, spread 0.005. |
| Text ladder | **Failed.** Steps 0.076 / 0.099 / 0.074 — the body→bone jump was a third larger than its neighbours. Hue also drifted 62°→100° up the ramp. |
| Tint cards | **Failed.** L spread 0.027, C spread 0.020 — the brown card was both lightest and most chromatic, so it dominated two cards meant to be its equals. |

## Round 2 — corrections

- **Text ramp** rebuilt on even 0.083 steps at a settled hue (63°): `#A69C94` →
  `#C0B6AE` → `#DBD1C8` → `#EFEEE7`. Spread 0.025 → **0.002**.
- **Tint cards** equalised to L=0.335, C=0.030, hues kept: `#283944`,
  `#293C31`, `#423327`. L spread 0.027 → **0.002**.
- **Derived accents pulled into the deck's band** — the deck's own colours set
  it, so wheat and dusty blue were left alone and forest/amber came down to
  meet them. Spread 3.76× → **2.79×**.
- **`--blue-strong` `#A8CDE5`** added for small text and links: same hue and
  lightness as the brand blue, chroma 0.026 → 0.052. A tonal sibling, not a new
  brand colour — it fixes the hierarchy inversion without altering the blue.

## Round 3 — colour-vision deficiency

Simulated protanopia, deuteranopia and tritanopia (Viénot) and measured OKLab
ΔE for every pair that carries meaning.

| Pair | Normal | Worst CVD | Verdict |
|---|---|---|---|
| forest (good) vs amber (caution) | 0.126 | 0.031 | **Real defect** — semantically opposed, easily confused |
| tint green vs tint brown | 0.046 | 0.020 | Not a defect — see below |
| tint blue vs tint green | 0.038 | 0.018 | Not a defect — see below |

**Fixed:** forest and amber were separated in *lightness* as well as hue —
`#6C9C7F` (L=0.65) and `#E5B693` (L=0.81), ΔL 0.160. Worst-case CVD ΔE
0.031 → **0.114**, clear of the ~0.08 confusion threshold. Both still pass
contrast (5.30:1 and 9.05:1).

**Deliberately not fixed:** the tint cards. Their hue is decorative — each card
is identified by its heading, case label and layer chips, and nothing depends on
telling the tints apart. The round-2 equalisation that caused the low ΔE is
exactly what makes the three read as equals. Over-correcting here would trade a
real design gain for an imaginary accessibility one.

## WCAG 1.4.1 — no meaning rests on colour alone

Audited every state in the piece:

| State | Non-colour signals |
|---|---|
| Layer lit / unlit | dashed vs solid border, check glyph, filled vs hollow pip |
| Case walked | check badge, label changes to "walked ✓ — open again" |
| Banner good / caution | ✓ vs ! glyph |
| Evidence class | the literal words OBSERVED / INFERRED / COMPOSITE |

## Final token set

| Role | Hex | L | C | vs ground |
|---|---|---|---|---|
| Ground | `#271C16` | 0.238 | 0.021 | — |
| Surface 1 / 2 / 3 | `#31241D` `#3A2B22` `#443328` | 0.273–0.337 | — | 1.11–1.38 |
| Tints (blue/green/brown) | `#283944` `#293C31` `#423327` | 0.335 | 0.030 | ~1.39 |
| Bone / body / card-2nd / mute | `#EFEEE7` `#DBD1C8` `#C0B6AE` `#A69C94` | 0.948→0.699 | ~0.016 | 14.28→6.17 |
| Wheat | `#EBDDA8` | 0.896 | 0.070 | 12.22 |
| Dusty blue | `#B8CAD6` | 0.829 | 0.026 | 9.86 |
| Blue-strong | `#A8CDE5` | 0.829 | 0.052 | 9.91 |
| Forest | `#6C9C7F` | 0.650 | 0.068 | 5.30 |
| Amber | `#E5B693` | 0.810 | 0.072 | 9.05 |
| Stroke / hairline | `#8A7767` `#483930` | — | — | 3.89 / 1.51 |

## A bug the dark pass exposed

The first region split cut at `const GBLUE`, but the lifted Material kit sits
*before* the scene art in this file — so every later scene was swept into the
"console" region and its hardcoded light colours were never remapped. The
console is really **two islands** (the kit and the screens) with page art on
both sides. Repairing the split recoloured 46 further literals. It also
surfaced a latent layout bug: short Gantt bars whose titles overflowed, now
given a minimum width.
