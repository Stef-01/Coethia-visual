# Faster Than the Rumour — rebuild plan

Replaces `coethia-engagement.html` ("Working With Coethia — An Engagement,
Walked Through"). Founder verdict on that piece, 2026-08-25:

> "it is clear you did not think from a public health officer and first
> principles level, it should start with the issue, a new paradigm of public
> health, not just working with coethia which is so undescriptive and useless…
> no story about introducing the measles issue, the people suffering, the
> emotive element, what is being said on social media, the misinformation,
> visual graphics on what people are seeing on their phone on reels, how public
> health officers are too slow to counter… I am banning you from ever doing ugly
> boxes like these with no symbols or visual elements… this is not a slide deck
> this is an animation… it should be 1 hour of content."

---

## 1. What was wrong, named precisely

| # | Fault | Evidence in the old file |
|---|---|---|
| F1 | **Starts at the vendor, not the issue.** Scene 1 is "A Brief Arrives" — a sales meeting. The reader is asked to care about an engagement before being given a reason to care about anything. | `SCENES[0].key='brief'`, act mark "Act one · the brief" |
| F2 | **No public-health-officer point of view.** Nothing about mandate, budget, statute, staffing, or the actual decision an officer makes. The officer is the *buyer* in the old piece, never the *protagonist*. | no scene addresses capacity, funding, or authority |
| F3 | **Measles is a prop.** It appears in one clause of scene 1 and never returns. No patient, no hospital, no death, no biology, no numbers. | `grep -c measles` = 5, all incidental |
| F4 | **No phone, no feed, no misinformation.** The piece asserts an "alternative-health ecosystem" exists and never shows it. | scene `tried` — one sentence, no visual |
| F5 | **No speed argument.** "Too slow to counter" is the central asymmetry and is absent entirely. | — |
| F6 | **Boxes.** The seven-layer rig is seven `roundRect`s with a tick and wrapped text. The three case studies are three `roundRect`s with chips. This is a slide deck drawn in SVG. | `drawRigScene()` L2143, `drawCaseHub()` L2216 |
| F7 | **Demographics never rendered.** The piece *argues* demographic targeting is shallow and never shows a demographic. | — |
| F8 | **Length.** 19 scenes ≈ 12 minutes. Brief asks for ~60. | `SCENES.length === 19` |

**Standing law adopted from this feedback:**

> No rounded rectangle may be the primary carrier of an idea. Every unit of
> meaning gets a *drawn thing* — a glyph, a mechanism, an instrument, a real
> product UI, or a figure. A box is allowed only as the chrome of a real
> interface being recreated (a phone status bar, a Google Ads card), never as
> the substitute for an illustration.

---

## 2. First principles — rederiving the argument from the officer's chair

Strip the vendor away. A county health officer in 2026 holds five facts:

1. **The disease is a mathematical object, not a moral one.** Measles R₀ is
   12–18; the herd-immunity threshold is 93–95%. This is a *cliff*, not a
   slope: at 95% an introduction dies out, at 92% it runs. Kindergarten MMR
   coverage is 92.4%. The officer is already over the edge.
2. **The exposure is unavoidable and invisible.** Airborne, viable up to two
   hours after the case leaves the room. There is no behavioural mitigation
   that works. Coverage is the *only* instrument.
3. **The failure is not ignorance, it is arrival time.** The decision is made
   at 3am on a phone, weeks before the appointment. Whoever is present in that
   moment wins. Public health is structurally never present in that moment.
4. **The money is already being spent — on the wrong end.** ~$244,480 to *open*
   an outbreak response before case two; ~$16,200 per additional case; $58,600
   societal cost per case; $5.4M for one New Mexico outbreak; ~$134M nationally
   in 2025. Meanwhile Google Ad Grants offers eligible bodies $10,000/month of
   search inventory free, and most departments do not use it.
5. **"Unvaccinated" is not one belief.** 93% of 2026 cases were unvaccinated or
   unknown — but that population splits five ways (never asked / could not /
   delayed / doubting / refusing), and four of the five are not refusals. The
   campaign that treats all five as one is aimed at the smallest, hardest slice.

**The paradigm claim that falls out of those five:** communication is not a
campaign the department *runs*; it is a standing clinical function the
department *operates* — always on, segmented by barrier rather than identity,
iterated daily, measured in behaviour rather than reach, with nulls published.
Coethia is what that function looks like when it is built. It arrives at scene
41 and not one scene earlier.

**The honest limit, stated inside the piece:** better advertising would not have
saved the child in Act 0. Her parents were in group five, and group five does
not move. The claim is narrower and defensible — the *other four groups were
reachable, and nobody reached them.*

---

## 3. Evidence base (every number citable; nothing invented outside the console)

| Claim | Value | Source |
|---|---|---|
| 2026 US cases | 2,465 confirmed (Aug 2026); 2,134 across 41 jurisdictions at 25 Jun | CDC via JHU IVAC / CIDRAP |
| Unvaccinated or unknown | 93% of confirmed cases | CDC |
| Hospitalised | 136 (6%) | CDC |
| Deaths | 3 in 2025 — first since 2015; 0 so far in 2026 | CDC / TX DSHS |
| Elimination status | under PAHO review, Nov 2026; most cases since 1991 | JHU |
| First 2025 death | unvaccinated 6-year-old, Covenant Children's, Lubbock, 26 Feb 2025 | TX DSHS / Texas Tribune |
| Second 2025 death | Daisy Hildebrand, 8, measles pulmonary failure, Apr 2025 | TX DSHS / CNN |
| Parents' response | told Children's Health Defense it did not change their view | Texas Tribune, 20 Mar 2025 |
| West Texas outbreak | began Gaines County; 762 confirmed; declared over 18 Aug 2025 | TX DSHS |
| R₀ | 12–18 | Guerra et al., *Lancet Infectious Diseases* systematic review |
| Herd immunity threshold | 93–95% | ibid. |
| Airborne persistence | up to 2 hours after the case leaves the room | CDC |
| Immune amnesia | depletes memory lymphocytes; later bacterial mortality | American Association of Immunologists |
| SSPE | 4–10 yr latency, no cure, death 1–3 yrs from onset | MedlinePlus |
| Kindergarten MMR | 95.2% (2019–20) → 92.4% (2025–26) | CDC SchoolVaxView |
| Exemptions | 4.2% (from 3.6%); non-medical 2.2%→4.0%; up in 41 states + DC; 24 states >5% | ibid. |
| Unprotected kindergartners | ~280,000 without documented MMR series | ibid. |
| Cost per case | $43,200 medical; $58,600 incl. public health response | Johns Hopkins |
| Response fixed cost | ~$244,480 before case two; ~$16,200 marginal | ibid. |
| One outbreak | $5.4M (New Mexico) | *Annals of Internal Medicine* |
| 2025 national | ~$134M | JHU |
| LHD staff losses | 19% of LHDs in 2023 (14% in 2021); ~40% of large LHDs | NACCHO Forces of Change |
| LHD budget cuts | 17% in FY2024; 23% expecting FY2025 | ibid. |
| Proposed CDC cut | 53%, FY2026 budget proposal | Trust for America's Health |
| Roles cut first | public health nurses, **outreach and education staff**, disease intervention specialists | NACCHO |
| Misinformation dynamics | spreads farther and faster than truth; corrections register as engagement and amplify | Vosoughi et al. lineage; *Vaccine* 2025 |
| Short-form asymmetry | hesitant content is a minority of posts but wins likes/shares/comments; any individual can match an agency's reach | JAMIA Open; Int. J. of Communication |
| Comms clearance | draft → health education → comms → management → executive | CDPH / NACCHO comms guidance |
| Federal pause | HHS memo halting external health-agency communications, Jan 2025 | NPR |
| Segmentation | Disengaged Skeptics 67% / Informed Unconvinced 19% / Open to Persuasion 14% | H1N1 audience-segmentation study |
| Movable middle | fence-sitters distinct from refusers; younger, lower education, worsening finances | U. Michigan IHPI; Frontiers in Public Health |
| Ad Grants | $10,000/mo; 5% CTR floor; geo-targeting; Smart Bidding lifts the $2 CPC cap | Google Ad Grants terms |
| Health segments | may not build audiences from health condition or condition-implying browsing; **may** target search terms | Google Ads policy |
| Ad Rank | bid × quality (expected CTR, relevance, landing page) — relevance is a discount | Google Ads Help |

Synthetic content stays confined to the recreated Google Ads console and is
stamped as such, exactly as before. Case A stays real and cited; B and C stay
composites with OBSERVED / INFERRED / COMPOSITE chips.

---

## 4. The piece — 59 scenes, ten acts

**Title: "Faster Than the Rumour."** Deck: *Measles came back because a number
slipped from 95 to 92.4. This is what that costs, why the correction never
arrives in time, and the operating model that would change it.*

File renamed `faster-than-the-rumour.html`; `index.html` card and copy updated.

### ACT 0 · THE ROOM — 4 scenes · cold open, no data

| # | key | The drawn thing |
|---|---|---|
| 1 | `room` | Lubbock, Feb 2025. Line-drawn hospital room: bed, small figure, monitor, window, an empty parent's chair. The monitor trace draws itself left to right and flattens — and the flat line becomes the rule the next scene is built on. |
| 2 | `air` | The same room, now empty. Aerosol particles drift. A clock hand sweeps two hours; the field thins but never clears. A new person opens the door. |
| 3 | `daisy` | Six weeks later, same hospital. A second small figure draws in beside the first. Names, ages, dates. Nothing else. |
| 4 | `afterwords` | A phone in a hand, a video thumbnail, a play triangle: the parents telling an anti-vaccine organisation it changed nothing. **The hinge — if a child's death does not move the belief, "raising awareness" is not the instrument.** |

### ACT I · THE DISEASE IS A MATHEMATICAL OBJECT — 6 scenes

| # | key | The drawn thing |
|---|---|---|
| 5 | `r0` | One lit figure; radial burst to 15; then 15×15 = 225, counter ticking. Influenza at R₀ 1.3 drawn beside it at the same scale — visibly nothing. |
| 6 | `cliff` | **Interactive centrepiece.** 100 person-glyphs. Drag coverage 99→88. Seed one case. It *runs*: at 95 the chain dies in two generations, at 92 it sweeps the grid. Generation counter, final attack rate. |
| 7 | `descent` | The real coverage line 2019–2026 descending toward a drawn cliff edge, threshold band shaded. It crosses under in 2022. |
| 8 | `k280` | 280,000 undocumented kindergartners: 280 drawn classrooms of 20 chairs; the camera dives into one; one or two chairs empty; pull back to 280 of them. |
| 9 | `states` | Tile cartogram of the US, honest about being schematic. Exemption rate per tile; the 24 states over 5% lift off the plane. |
| 10 | `sequelae` | Immune amnesia as a drawn memory shelf being emptied; SSPE as a timeline where "recovered" is followed by four to ten quiet years and then a second, fatal event. |

### ACT II · THE PHONE — 8 scenes · the missing heart

Full-fidelity vertical video UI: status bar, caption, @handle, verified tick,
like/comment/share/save rail, spinning audio disc, progress bar, "Suggested for
you". This upholds the standing practical-UI principle — show the real interface
people navigate, never an abstraction of it.

| # | key | The drawn thing |
|---|---|---|
| 11 | `parent` | 3am. A phone lighting a face. A four-month-old asleep. Thursday's appointment on the fridge. |
| 12 | `reel` | One reel, rendered as the real player. Warm, well lit, sincere. **No falsifiable claim in it** — that is the point, and it is annotated as such. |
| 13 | `swipe` | **Interactive.** Six reels; drag or click to advance. After each, a margin note: *what the algorithm just learned.* The feed narrows in front of you. |
| 14 | `comments` | The comment sheet, real UI: avatars, handles, times, likes, "View 412 replies". Testimony stacking — where the persuasion actually happens. |
| 15 | `anatomy` | Callout lines drawn onto the live reel frame: the 0.8s hook, the face, "I'm not anti-vax, but", the unfalsifiable claim, "do your own research". Annotated *on the interface*, never listed in a box. |
| 16 | `counterpost` | The department's post in the identical player at identical scale: a flat graphic, Arial, "Clinic Saturday 9–1". Engagement counters side by side. It is not wrong. It is not media. |
| 17 | `trap` | Correcting it amplifies it. A live engagement bar the reader can feed by pressing "correct this" — reach goes **up**. |
| 18 | `reach` | Two profile headers in real UI: @marion_county_health 3,412 · @wholemamawellness 890K. Structural, not rhetorical. |

### ACT III · THE CLOCK — 5 scenes · the speed asymmetry

| # | key | The drawn thing |
|---|---|---|
| 19 | `twoclocks` | **Interactive centrepiece.** Press PLAY. Two swimlanes run in real time. Creator: sees story 08:04, films 08:11, posts 08:19. Department: epi draft → health-education review → comms → management → executive → post. The creator is at 40k views before the draft clears reviewer two. |
| 20 | `chain` | Zoom the chain. Each stage a drawn desk with an in-tray, a stamp, a stack, and *the real reason it exists* (accuracy, liability, political exposure). The chain is not stupid — it is correct for press releases and fatal for feeds. |
| 21 | `gate` | Sometimes the chain goes to zero: the Jan 2025 HHS memo pausing external health communications, drawn as a gate dropping across the pipeline. |
| 22 | `decided` | 08:52. The Thursday appointment is cancelled. The correct message ships on the 14th. |
| 23 | `law` | Plain statement over a drawn balance that will not level: *the side that publishes in minutes and iterates daily beats the side that publishes in weeks and iterates annually, regardless of who is right.* |

### ACT IV · WHAT THE OFFICER ACTUALLY HAS — 7 scenes

| # | key | The drawn thing |
|---|---|---|
| 24 | `desk` | Overhead view of a real desk — mandate letter, budget line, org chart, phone, case-investigation forms. **Click any object to open it.** The hub for this act. |
| 25 | `mandate` | The statute: investigate, quarantine, immunise, report. "Public information" appears — unfunded, unspecified, unmeasured. Drawn as the document with that line circled. |
| 26 | `money` | The budget as a physical stack being sliced: 17% cut FY2024, 23% expecting FY2025, 53% proposed CDC cut FY2026. |
| 27 | `people` | Org chart drawn as figures. The figures that vanish are precisely the outreach and education staff — the only people who did this job. |
| 28 | `ledger` | **Interactive.** Drag case count 1→100. The bill assembles itemised in real time: $244,480 to open, $16,200 marginal, $58,600 societal per case. Beside it, on the same axis, what continuous communication costs. |
| 29 | `arithmetic` | One sentence, earned: **preventing a single case pays for a year of the thing that would have prevented it** — and $244,480 is 24 months of Ad Grants inventory nobody is drawing. |
| 30 | `gaps` | The six gaps drawn as actual holes in the operation: no always-on channel, no audience map, no creative library, no test loop, no behavioural measure, no speed. |

### ACT V · WHO IS ACTUALLY UNVACCINATED — 7 scenes · the icon dive

| # | key | The drawn thing |
|---|---|---|
| 31 | `notone` | 100 figures; the unvaccinated light up; then they *sort themselves* into five groups by reason. |
| 32 | `five` | Five reasons, five **drawn glyphs**, no boxes: an empty clinic chair (never asked) · a bus route stopping short (could not) · a calendar date moved (delayed) · two contradictory pages (doubting) · a closed door (refusing). Four of the five are not refusals, and four are the majority. |
| 33 | `facets` | **The icon dive.** Click a facet — AGE (infant/toddler/school/teen/adult glyphs), GENDER, INCOME (wage-band glyphs), INSURANCE (none/Medicaid/employer), LANGUAGE, GEOGRAPHY, EDUCATION. The population redraws as icon rows each time. |
| 34 | `crosstab` | Stack any two facets. The five-reason mix stays stubbornly mixed. **The interaction's purpose is to fail** — demographic targeting cannot see the reason. |
| 35 | `axes` | The figures physically fly out of the demographic grid and land on institutional trust × intervention appetite. Now they separate. |
| 36 | `quadrants` | Four *scenes*, not four boxes: a kitchen table with a printed evidence sheet · a clinician on a screen · an adjudication table weighing claims · a Saturday clinic with a bus and a price. |
| 37 | `middle` | The movable middle: 67% / 19% / 14%. You do not convert the refuser. You reach the other four before the feed does. |

### ACT VI · THE NEW PARADIGM — 5 scenes

| # | key | The drawn thing |
|---|---|---|
| 38 | `oldnew` | Two operating diagrams drawn as *machines*: campaign (episodic, broadcast, cleared, measured in reach) vs standing function (always on, barrier-segmented, tested daily, measured in behaviour). |
| 39 | `laws` | Five laws, each visibly earned by an earlier act: speed is a clinical property · target the question never the diagnosis · segment by barrier not identity · reach is not an outcome · publish the nulls. |
| 40 | `loop` | The shape that implies — listen, map, translate, activate, measure, learn — and the wheel actually turns. |
| 41 | `coethia` | **The brand's first appearance in the entire piece.** It is the answer to a question the reader has been carrying for forty scenes. |
| 42 | `stations` | The six stations as a map into Act VII. |

### ACT VII · THE MACHINERY — 10 scenes · retained and upgraded

The recreated Google Ads console is the strongest existing work and is kept in
behaviour, re-titled from the officer's point of view.

43 `listen` (Keyword Planner) · 44 `map` · 45 `translate` ·
**46 `lenses` — the banned-box rebuild:** the seven targeting layers become a
drawn **optical rig** — seven glass lenses in a barrel, light entering as the
whole county and narrowing to the person actually deciding. Lenses 1–2
(demographic, geographic) barely bend the beam; lenses 3–7 are dark and
uninstalled. Install each and watch the beam narrow and the reached-count move.
Each lens carries its own etched glyph. *Most campaigns shoot through two lenses
and wonder why the image is soft.* ·
47 `grants` · 48 `segments` · 49 `subsidy` · 50 `placement` · 51 `privacy` ·
52 `measure`

### ACT VIII · THREE CAMPAIGNS — rebuilt

Branch structure, non-overlapping layer allocation and the evidence chips are
good work and survive. What changes is the rendering: each case becomes a drawn
establishing scene of the *place*, the actual creative shown inside the real
platform UI it ran in, the miss shown as dark lenses in the rig, and the after
as a hypothesis with an explicit falsification condition plus a drawn "what we
could not see from outside" panel.

`cases` (hub, rig as progress) + three branchable case walks.

### ACT IX/X · THE ENGAGEMENT AND THE CLOSE

`weeks` (12 weeks as a drawn desk diary, not a Gantt of boxes) · `tiers` ·
`fit` (when not to hire us) · `week12` (the county at week 12 vs week 0) ·
**`backtotheroom`** — the same drawn room from scene 1, and the honest limit
stated plainly: this would not have saved her; it would have reached the four
groups nobody reached.

---

## 5. Build order (the new heart ships first)

1. Head, brand tokens, new title and meta, scene rail, `SCENES` array. → verify: scene count matches, no console error.
2. Act 0 + Act I renderers. → verify: cliff simulator runs at 92 and dies at 95.
3. Act II phone kit (`reelUI()` component) + 8 scenes. → verify: swipe advances, comment sheet opens.
4. Act III clock engine + 5 scenes. → verify: PLAY runs both lanes.
5. Act IV desk hub + ledger + 7 scenes. → verify: ledger totals match the cited arithmetic.
6. Act V facet explorer + 7 scenes. → verify: every facet redraws; crosstab keeps the mix mixed.
7. Act VI paradigm + 5 scenes.
8. Act VII — console kit lifted unchanged, rig replaced by the lens barrel.
9. Act VIII — case rebuild on the retained branch logic.
10. Act IX/X — engagement, close, return to the room.
11. Gates: every scene at 375 and 1440, zero overflow, zero console errors, keyboard reachable, reduced-motion honoured.

## 6. Success criteria

- Opens on a child in a hospital room; the word "Coethia" does not appear until Act VI.
- Every one of the eight faults in §1 has a named scene answering it.
- Zero `roundRect`-as-idea: every conceptual unit carries a drawn glyph, mechanism, figure, or recreated product UI.
- Substantial interactives: cliff simulator, reel feed, correction trap, two clocks, ledger, facet dive, lens rig — plus the retained segment builder and case branches.
- Roughly an hour at a considered pace.
- Every non-console number traceable to §3.
