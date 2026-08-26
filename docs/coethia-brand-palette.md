# Coethia brand palette — analysis and application

Source: `AHACoethia.pdf` (14pp). Colours extracted from the deck's actual vector
fills and text runs, not eyeballed; typography from the embedded font names.
Applied to `coethia-engagement.html` only — the other two pieces keep The
Reachable's light system.

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
