# Claims Registry — The AI Adpocalypse

Every factual claim that appears in the piece maps to a row here: the claim as
it will be stated, the sources, the date verified, and the scene it appears in.
**Rule:** no claim ships single-sourced. **Rule:** any number in the piece is
either in this registry or is stamped synthetic.

Verified: 2026-08-24 (round 1). Re-verify: M7 (Mar 2027), M10 (Jun 2027).

---

## A. The search behavior (Act 0)

| # | Claim | Sources | Scene |
|---|---|---|---|
| A1 | Google receives ~1 billion health questions per day; roughly 7% of all Google searches are health-related (attributed to Google Health VP David Feinberg) | [Becker's](https://www.beckershospitalreview.com/healthcare-information-technology/google-receives-more-than-1-billion-health-questions-every-day/), [Evok](https://evokad.com/healthcare-marketing-statistics-google/) | `open` |
| A2 | ~80% of US adult internet users have searched online for health information | [Sagapixel roundup](https://sagapixel.com/marketing/healthcare-marketing-statistics/), [Brown Health](https://www.brownhealth.org/be-well/dr-google-and-online-symptom-checkers) | `open` |
| A3 | Searches for common primary-care symptoms grew sharply 2004–2019 (cough +208%, sore throat +290%, stomach pain +490%) | [PubMed 41187281](https://pubmed.ncbi.nlm.nih.gov/41187281/) | `open` |

## B. The peptide market (Act 0 / Act I framing)

| # | Claim | Sources | Scene |
|---|---|---|---|
| B1 | July 23–24 2026: FDA's Pharmacy Compounding Advisory Committee voted narrowly to recommend 6 of 7 peptides (BPC-157, KPV, TB-500, MOTS-c, Semax, epitalon) for the 503A Bulks List; emideltide rejected; BPC-157 passed 8–6 | [FDA meeting page](https://www.fda.gov/advisory-committees/advisory-committee-calendar/july-23-24-2026-meeting-pharmacy-compounding-advisory-committee-07232026), [AJMC](https://www.ajmc.com/view/fda-panel-backs-6-peptides-for-compounding), [CNN](https://www.cnn.com/2026/07/31/health/what-are-peptides-fda-next-steps-wellness) | `results`, `methods` |
| B2 | The committee overrode FDA's own scientific staff, who opposed all seven on safety/efficacy evidence grounds; the recommendation is advisory and the peptides remain in regulatory limbo pending FDA action | [Medscape](https://www.medscape.com/viewarticle/fda-expert-panel-backs-compounding-six-peptides-2026a1000pgw), [TechTimes](https://www.techtimes.com/articles/321365/20260723/gray-market-peptide-users-face-legal-limbo-fda-scientists-oppose-bpc-157-vote.htm) | `results` |
| B3 | "For Research Use Only / Not for Human Consumption" labeling does not make a product legal for human use | [The Conversation](https://theconversation.com/the-peptide-problem-hype-is-outrunning-the-evidence-280715), [Holt Law](https://djholtlaw.com/the-unregulated-world-of-peptides-what-you-need-to-know-before-you-inject/) | `mach9`, `good2` |
| B4 | Gray-market peptide quality: a Belgian market study found products containing 10–90% less active ingredient than labeled, plus microbial contamination, heavy metals, and cross-contamination | [The Conversation](https://theconversation.com/the-peptide-problem-hype-is-outrunning-the-evidence-280715) *(second source required before ship — trace to the underlying study)* | `good2` |
| B5 | Peptide demand runs through wellness/longevity clinics, telehealth, and "research chemical" vendors; social promotion is large (>130k Instagram posts, >230M TikTok views as of May) and several advisory panelists had industry financial ties | [Nutrition Insight](https://www.nutritioninsight.com/news/peptides-drugs-supplements-health-risks.html), [Becker's gray market](https://www.beckershospitalreview.com/glp-1s/the-100m-gray-market-of-peptides-5-notes/) | `feed1`, `mach2` |
| B6 | Longevity/anti-aging peptide search demand grew ~300% year-over-year (vendor-side SEO reporting — treat as industry claim, attribute) | [Lantern Sol](https://www.lanternsol.com/blogs/seo-for-peptides) | `mach8` |

## C. The advertising machine (Act I)

| # | Claim | Sources | Scene |
|---|---|---|---|
| C1 | Campaign creation begins with an objective (Sales, Leads, Website traffic, Awareness…), which constrains the campaign types and bid strategies offered downstream | [Google Ads Help — create a Search campaign](https://support.google.com/google-ads/answer/9510373?hl=en) | `mach1` |
| C2 | Custom segments accept four input types: interests/purchase intentions, **"People who searched for any of these terms on Google"**, websites browsed, and apps used — combinable | [Google Ads Help — about custom segments](https://support.google.com/google-ads/answer/9805516?hl=en), [Audience builder help](https://support.google.com/google-ads/answer/11421388) | `mach6` |
| C3 | Search-term custom segments reach people who searched those *and similar* terms across Google properties | [Google Ads Help — custom segments](https://support.google.com/google-ads/answer/9805516?hl=en), [Search Engine Land](https://searchengineland.com/google-ads-custom-segments-464521) | `mach6` |
| C4 | Ad platforms restrict audience segments built on sensitive health conditions and on prior activity indicating interest in such conditions | [Adobe health segment guidelines](https://experienceleague.adobe.com/en/docs/advertising/policies/health-segment-guidelines) | `mach6` |
| C5 | Demographic dimensions: age in 7 brackets (18-24…65+, Unknown); household income in 7 tiers (Top 10%, 11-20%…Lower 50%, Unknown) available in 19+ countries; parental status (Parent / Not a parent / Unknown). **Household income and parental status are not available in Search** — they are Display/Video/Gmail/Demand Gen dimensions | [Google Ads Help — demographic targeting](https://support.google.com/google-ads/answer/2580383?hl=en), [Search Engine Land deep dive](https://searchengineland.com/google-ads-demographics-targeting-exclusion-460939) | `mach7` |
| C6 | The auction resolves in roughly 100–300ms as a modified second-price auction; Ad Rank is computed per auction from bid, real-time quality signals, and context; Ad Rank thresholds are undisclosed minimum quality floors an ad must clear to show at a position | [Digital Applied breakdown](https://www.digitalapplied.com/blog/how-google-ads-auction-works-complete-breakdown), [MB Adv](https://www.mbadv.agency/google-ads/quality-score-and-ad-rank) | `mach10` |
| C7 | Google's healthcare policy: online pharmacies and telemedicine providers must hold LegitScript certification to serve ads in the US; Meta applies a comparable requirement | [LegitScript/Google recognition](https://www.businesswire.com/news/home/20260408837286/en/LegitScript-Healthcare-Merchant-Certification-Now-Recognized-by-Google-for-Pharmacies-in-India-and-Telemedicine-Providers-in-New-Zealand), [Google pharma manufacturer policy](https://support.google.com/adspolicy/answer/15597836?hl=en) | `mach2`, `mach6` |
| C8 | **Research peptides and unapproved supplements are categorically banned from Google advertising**; only certified advertisers may target prescription-drug keywords; compounded-medication claims are scrutinized and research-chemical business models fail certification | [icomchain policy guide](https://www.icomchain.com/prescription-drug-advertising-on-google-in-2026-the-complete-policy-certification-and-recovery-guide-30-questions-answered/), [Wellness MD Group](https://wellnessmdgroup.com/blog/why-google-meta-shut-down-ads-without-legitscript), [Lengea](https://lengealaw.com/googles-prescription-drug-advertising-enforcement-what-your-business-needs-to-know/) | `mach2`, `mach6` — **structural claim, drives Act I** |
| C9 | Gray-market vendors reach demand through SEO/content on longevity and wellness properties, affiliate and influencer routes, and clinic/telehealth channels rather than direct paid search on banned terms | [Lantern Sol SEO](https://www.lanternsol.com/blogs/seo-for-peptides), [Nutrition Insight](https://www.nutritioninsight.com/news/peptides-drugs-supplements-health-risks.html) | `mach2`, `mach8` |

## D. The synthetic content layer (Act II)

| # | Claim | Sources | Scene |
|---|---|---|---|
| D1 | DoubleSpeed markets synthetic creator accounts specified by demographic ("62-year-old mom in Phoenix", "Gen-Z skater in Atlanta"), deployed on real phones on a real US carrier, with accounts that scroll, swipe, comment, warm up, and engage; comment seeding included; tiers $150/mo self-hosted, $250/mo content agent, custom managed; positioning line "replacing 30 person creator teams" | [doublespeed.ai](https://www.doublespeed.ai/) (archived M1) | `feed2`, `feed3` |
| D2 | AI actor platforms generate testimonial-style video from a script plus a chosen synthetic performer in ~2 minutes; Arcads offers 300+ digital performers from ~$110/mo; Creatify runs product-URL → scripts → avatars → batched variants from ~$19/mo | [Arcads review](https://dupple.com/reviews/arcads-ai), [Arcads vs Creatify](https://www.ngram.com/blog/arcads-vs-creatify) | `feed2` |
| D3 | Creative-testing operating tempo: leading teams run 20–50 creatives/month vs 3–5 for typical teams; platforms score variants predictively from historical performance; fatigue cycles have compressed to ~2–3 weeks; brands testing 20+/month report materially higher ROAS | [Admetrics](https://www.admetrics.io/en/post/best-automated-creative-testing-platforms), [Atria](https://www.tryatria.com/blog/meta-creative-fatigue-diagnose-and-fix-2026), [Segwise](https://segwise.ai/blog/meta-andromeda-update-creative-strategy-2026) | `feed4` |
| D4 | The loop's optimization targets are engagement, click-through, and conversion; accuracy and health outcomes are not signals in it | Structural/analytic claim — supported by the above sources' described objective functions; stated as argument, not statistic | `feed5` |
| D5 | Platform rules: TikTok requires labeling of realistic AI-generated visuals/audio and uses C2PA credentials to detect undisclosed synthetic media; Meta requires advertiser disclosure of AI-generated realistic people; FTC's Fake Reviews Rule (16 CFR Part 465) treats AI-generated testimonials as fake reviews regardless of disclaimer; per-violation penalties reach ~$53,088 (2026); brands remain liable for agents' conduct | [TikTok AI labeling](https://storrito.com/resources/tiktoks-2026-ai-labeling-rules-and-what-they-signal-for-platform-governance/), [FTC disclosure guidance](https://ppl.studio/blog/ai-generated-content-disclosure-ftc-guidelines), [humanads summary](https://humanadsai.com/blog/ftc-ai-generated-content-disclosure) | `feed5`, `good6` |

## E. The asymmetry (Act II ledger)

| # | Claim | Sources | Scene |
|---|---|---|---|
| E1 | US pharmaceutical DTC advertising runs >$10B/year; ten companies spent a combined $13.8B on advertising and promotion in 2023; pharma online marketing projected ~$19.45B (2024) | [CSRxP analysis](https://www.csrxp.org/csrxp-analysis-finds-big-pharmas-direct-to-consumer-dtc-advertising-costs-u-s-taxpayers-billions-of-dollars/), [eMarketer](https://www.emarketer.com/content/pharma-accounts-nearly-90-of-broader-industry-digital-ad-spending) | `feed6` |
| E2 | The FY2026 President's budget proposed a ~53% reduction to CDC relative to FY2024; 444 CDC grants totaling $5.78B in unliquidated obligations were terminated by May 2026 | [TFAH](https://www.tfah.org/report-details/funding-report-2025/), [GWU](https://publichealth.gwu.edu/new-research-proposed-cdc-budget-cuts-harm-public-health-and-state-and-local-economies), [Legis1](https://legis1.com/news/cdc-budget-cut-faces-40-percent-444-grants) | `feed6` |
| E3 | DTC advertising spending skews toward drugs with low added therapeutic benefit | [Johns Hopkins](https://publichealth.jhu.edu/2023/spending-on-consumer-advertising-for-top-selling-prescription-drugs-in-us-favors-those-with-low-added-benefit) | `feed6` |

## F. The counterattack (Act III)

| # | Claim | Sources | Scene |
|---|---|---|---|
| F1 | Google Ad Grants provides eligible nonprofits up to $10,000/month of search advertising; accounts must maintain ≥5% account-level CTR; the $2 max CPC applies to manual bidding only and is lifted under Smart Bidding, which is now required; geo-targeting is a policy requirement; verification moved to Goodstack and Performance Max is now permitted | [google.com/grants](https://www.google.com/grants/), [Elevation guide](https://www.elevationweb.org/blog/google-ad-grants/), [Getting Attention](https://gettingattention.org/google-ad-grants-limitations/), [Big Sea 2026](https://bigsea.co/articles/get-google-ad-grants-nonprofit/) | `good1` |
| F2 | Ad Grants accounts show large relative traffic gains (reported ~603% more clicks, ~15x higher CTR — vendor-reported benchmark, attribute as such) | [Elevation](https://www.elevationweb.org/blog/google-ad-grants/) *(vendor benchmark — label in copy)* | `good1` |
| F3 | Search-ad interception for help-seeking has RCT support: a randomized controlled trial of suicide-prevention Google Ads measured engagement and hotline contact from the landing page, evidencing feasibility, reach, speed, and cost | [RCT (ScienceDirect)](https://www.sciencedirect.com/org/science/article/pii/S2368795923000185), [PMC copy](https://ncbi.nlm.nih.gov/pmc/articles/PMC10160926) | `good2` |
| F4 | 988: ~4,400 fewer US suicide deaths among 15–23-year-olds than projected in the Lifeline's first 2.5 years (11% below expected, Jul 2022–Dec 2024) | [PBS](https://www.pbs.org/newshour/health/988-hotline-linked-to-thousands-of-fewer-youth-suicide-deaths-since-launch-study-finds), [Journalist's Resource roundup](https://journalistsresource.org/home/988-research-roundup/) | `good2` |
| F5 | Large-scale social advertising for vaccination has been tested in RCTs (Athey et al., PNAS 2023; ~17.8M US and ~11.5M French Facebook users reached with clinician-produced video); systematic review finds effects real but variable and often nonsignificant — the honest framing | [NBER w30618](https://www.nber.org/papers/w30618), [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC11044825/), [systematic review](https://link.springer.com/article/10.1186/s12889-026-27159-w) | `good4`, `good6` |
| F6 | Precedent for platform-scale public-health advertising: Google provided $250M in ad grants to WHO and 100+ government agencies during COVID-19 | [Google blog](https://blog.google/company-news/inside-google/company-announcements/commitment-support-small-businesses-and-crisis-response-covid-19/) | `good6` |
| F7 | Counter-marketing works at population scale: the truth® campaign is credited with ~450,000 fewer youth/young-adult smoking initiations 2000–2004 and ~2.5 million prevented 2015–2018; a national campaign accounted for ~22% of a two-year decline in youth smoking; cost-effectiveness estimated at ~$1,076 per QALY with ~$3.07B societal savings | [AJPM](https://www.ajpmonline.org/article/s0749-3797(09)00074-9/fulltext), [AJPH dose-response](https://ajph.aphapublications.org/doi/full/10.2105/AJPH.2004.049692), [FinishIt cost-effectiveness](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6888078/), [Truth Initiative](https://truthinitiative.org/research-resources/tobacco-prevention-efforts/truth-campaign-linked-decreased-smoking-and-increased) | `good5`, `good6` |
| F8 | Policy precedent: the EU Digital Services Act bans profiling-based advertising using special-category data including health, and bans profiling-based ads to minors — with no consent override | [EC DSA Q&A](https://digital-strategy.ec.europa.eu/en/faqs/digital-services-act-questions-and-answers), [DSA Observatory](https://dsa-observatory.eu/2025/08/01/what-does-the-dsa-mean-for-online-advertising-and-adtech/) | `good6` |

---

## Open items before ship

1. **B4** needs the underlying Belgian study cited directly, not via secondary coverage.
2. **F2** is a vendor benchmark — either find independent measurement or label it in-copy as advertiser-reported.
3. **B1/B2** will move: FDA action on the 503A Bulks List is pending. Re-check at M7 and M10; the copy must state whatever is true at launch.
4. **C8** is the structural spine of Act I — verify directly in a live Ads account during M1 (attempt a peptide-term campaign; document the policy block).
5. **D1/D2** vendor pages must be archived at M1; pricing and claims rot fast.
