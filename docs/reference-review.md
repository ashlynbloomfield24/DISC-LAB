# DISC LAB: Scientific Reference Review (Prompt 2)

Prepared 2026-11-14 from the 8 PDFs in `TermPaper_Discs_Journals`. **Status: awaiting approval. Nothing is implemented yet.**

**Evidence tags used throughout**

| Tag | Meaning |
|---|---|
| **[R]** | Reported directly by the paper's own data or analysis |
| **[S]** | Secondary: the paper is citing another study (the original is named; it is **not** among your PDFs) |
| **[P]** | My proposed simplification for the simulation, **not** a finding from the literature |

Values are written as mean ± SD exactly as reported. "Healthy / moderate / severe" follow each paper's own grouping (Ellingson & Nuckley: Pfirrmann grade 1 = healthy, 2–3 = moderate, 4–5 = severe).

---

## 0. The eight references

*(Updated 2026-11-14: O'Connell 2011 added as reference #8. Sections 0, 6, 11, 12, 13 and 14 are revised.)*

| # | Short name | Full citation | What it is | Value for DISC LAB |
|---|---|---|---|---|
| V | **Volz 2022** | Volz M, Elmasry S, Jackson AR, Travascio F. *Computational Modeling Intervertebral Disc Pathophysiology: A Review.* Front. Physiol. 12:750668 (2022) | Review of finite-element (FE) models of degeneration: nutrition, biochemistry, aging, mechanical factors | **Core framing** (degeneration cascade, mechanical factors, model limitations). Qualitative; it gives almost no mechanical parameter values |
| E | **Ellingson 2012** | Ellingson AM, Nuckley DJ. *Intervertebral disc viscoelastic parameters and residual mechanics spatially quantified using a hybrid confined/in situ indentation method.* J Biomech 45:491–496 (2012) | Human cadaveric L1–L2 discs (n=16) tested in stress relaxation by degeneration grade and region | **Most important quantitative source.** It gives a fitted viscoelastic equation with healthy, moderate and severe parameters |
| N17 | **Newell 2017** | Newell N, Little JP, Christou A, Adams MA, Adam CJ, Masouros SD. *Biomechanics of the human intervertebral disc: A review of testing techniques and results.* J Mech Behav Biomed Mater 69:420–434 (2017) | Review of human IVD testing | Anatomy and composition numbers, in vivo NP pressures, degeneration effects, injury mechanisms, AF tensile properties |
| Ner | **Nerurkar 2010** | Nerurkar NL, Elliott DM, Mauck RL. *Mechanical design criteria for intervertebral disc tissue engineering.* J Biomech 43:1017–1030 (2010) | Review that tabulates native-tissue benchmarks | Benchmark table (Table 1): motion-segment stiffness, AF/NP moduli, permeability, swelling pressure |
| N20 | **Newell 2020** | Newell N, Rivera Tapia D, Rahman T, Lim S, O'Connell GD, Holsgrove TP. *Influence of testing environment and loading rate on intervertebral disc compressive mechanics…* JOR Spine 3:e1110 (2020) | Bovine tail discs, axial cyclic compression 50–1000 N at 0.05, 0.5 and 5 Hz, at three labs | Loading-rate effect (small), load-to-pressure mapping, variability between labs |
| J | **Joshi 2006** | Joshi A, Fussell G, Thomas J, et al. *Functional compressive mechanics of a PVA/PVP nucleus pulposus replacement.* Biomaterials 27:176–184 (2006) | NP hydrogel implant; human cadaveric discs tested intact → denucleated → implanted | The only direct number for **loss of nucleus → loss of stiffness** (relevant to Herniated) |
| O | **O'Connell 2011** | O'Connell GD, Jacobs NT, Sen S, Vresilovic EJ, Elliott DM. *Axial creep loading and unloaded recovery of the human intervertebral disc and the effect of degeneration.* J Mech Behav Biomed Mater 4(7):933–942 (2011) | Human L1–L3 bone-disc-bone segments: (1) slow ramp to 2000 N (n=8) and (2) 1000 N creep for 4 h, 24 h unloaded recovery, then repeat creep (n=12; Pfirrmann 1.8–3.4) | **Whole-disc creep AND recovery parameters**, at minute and hour time scales, with degeneration correlations |
| D | **Delaine-Smith 2016** | Delaine-Smith RM, Burney S, Balkwill FR, Knight MM. *Experimental validation of a flat punch indentation methodology…* J Mech Behav Biomed Mater 60:401–415 (2016) | Indentation methods validated on agarose, omentum and cartilage, **not disc** | Methodological caution: indentation moduli depend on the analysis model used, which matters for interpreting Ellingson 2012 |

---

## 1. IVD anatomy and structure

| Finding | Values | Source | Use in sim |
|---|---|---|---|
| Three components: gelatinous NP, concentric lamellar AF, thin cartilaginous endplates (CEP) bonding to bony endplates | — | N17 [R, review]; Ner; E | Illustration layers |
| NP share of disc | 40–50% of adult disc **volume**; 25–50% of transverse **cross-sectional area** | N17 [S: Bayliss & Johnstone 1992; Iatridis 1996; Farfan 1970 …] | **NP area fraction** in the two-region model (§11) |
| AF lamellae | 15–25 concentric layers, 0.05–0.5 mm thick (thicker toward inner); ~48% circumferentially incomplete | N17 [S: Cassidy 1989; Marchand & Ahmed 1990] | Number of lamella lines drawn |
| Fibre angle | alternating ±25–45° to the transverse plane (N17); ~30° (Ner); "~±30°" in **Ellingson's text, garbled to "7301"** in extraction | N17 [S]; Ner [S] | Lamella fibre hatching |
| CEP | ~0.6 mm thick, thinner centrally; ~60% water | N17 [S: Roberts 1989, 1997] | Endplate band |
| Lumbar endplate size | AP 30–36 mm, lateral 43–54 mm | N17 [S: Berry 1987; Panjabi 1992] | Illustration proportions; disc area estimate |
| Disc height (L1–L2 cadaver, by site) | Anterior AF **9.67 ± 1.71 mm (healthy) → 5.53 ± 3.12 mm (severe)**; lateral AF 9.42 ± 1.71 → 6.53 ± 2.59 mm; NP 10.32 ± 2.36 → 7.30 ± 3.75 mm (NP change **not significant**, p = 0.278) | **E [R]** | **Resting height per condition** |
| Endplate bulge under load | CEP/BEP can bulge into the vertebral body by up to 1 mm, which lowers NP pressure | N17 [S: Brinckmann 1983; Holmes 1993] | Optional endplate deflection in animation |

## 2. Healthy disc mechanical properties

| Property | Value | Source |
|---|---|---|
| Motion-segment axial compressive stiffness | **1.73 kN/mm** | Ner Table 1 [S: Nachemson 1979; Shea 1994; Beckstein 2008] |
| Motion-segment axial compressive modulus | **3–10 MPa** | Ner Table 1 [S] |
| Dynamic compressive stiffness | **3.5–5.1 kN/mm** over 0.001–1 Hz | Ner Table 1 [S: Costi 2008] |
| Torsion, apparent shear modulus | **G_app 2–9 MPa** | Ner Table 1 [S: Elliott & Sarver 2004; Abumi 1990; Haughton 2000; Beckstein 2007] |
| NP aggregate modulus (confined) | **1.01 ± 0.43 MPa** (healthy); also "1.0 MPa" | E [S: Johannessen & Elliott 2005]; N17 [S]; Ner (HA_eff 1.0 MPa) |
| NP equilibrium modulus (in situ indentation) | **0.435 MPa** (healthy, ν = 0.49) | **E [R]** |
| NP residual stress (no external load) | **0.305 MPa** average, healthy | **E [R]** |
| NP swelling pressure | **0.138 MPa** | Ner [S: Johannessen & Elliott 2005] |
| NP permeability | **9.0 × 10⁻¹⁶ m⁴ N⁻¹ s⁻¹** | Ner [S: Johannessen & Elliott 2005] |
| NP unconfined "linear" modulus / shear modulus | 5.4 kPa / 7–50 kPa | N17 [S: Cloyd 2007; Bodine 1982; Iatridis 1997] |
| AF aggregate modulus (confined) | **0.56 ± 0.21 MPa** (healthy); Ner gives HA₀ 440–750 kPa | E [S: Iatridis 1998]; Ner [S] |
| AF permeability | 1.6–2.3 × 10⁻¹⁶ m⁴ N⁻¹ s⁻¹ | Ner [S: Best 1994; Iatridis 1998; Perie 2005] |
| AF swelling pressure | 110–130 kPa | Ner [S] |
| AF tension, single lamella along fibres | 80–120 MPa | Ner [S: Skaggs 1994; Holzapfel 2005] |
| AF tension, average moduli | along fibre **183 MPa**, circumferential **16 MPa**, radial 0.3, axial 2.6, cross-fibre 0.2 MPa | N17 [R: averaged across its Table 3] |
| AF circumferential failure | stress **2.7 MPa**, strain **0.3** (averages) | N17 [R: averaged] |
| AF yield strain | **20–30%** | Ner [S] |
| CEP modulus | ~23.8 MPa (estimate) | N17 [S: Yamada 1970] |
| In vivo NP pressure (healthy lumbar) | lying **91–539 kPa**; standing **500–870 kPa**; sitting **460–1330 kPa**; peak **2300 kPa** (standing, flexed, holding 20 kg) | N17 [S: Nachemson; Sato 1999; **Wilke 1999**] |
| Stiffness ranking by mode | axial rotation > extension > lateral bending > flexion | N17 [S: Beaubien 2005; Moroney 1988; Schultz 1979] |
| Typical applied test moments | commonly 7.5–10 N·m in single-segment tests | N17 Table 2 [R: compiled] |
| Normal axial rotation | "normally no greater than 9" (the unit symbol is lost in the PDF text; presumably degrees; **verify in Farfan 1970**) | V [S: Farfan 1970] |

## 3. Degenerated disc mechanical properties

| Change with degeneration | Value / direction | Source |
|---|---|---|
| NP equilibrium modulus | **0.435 → 0.229 MPa** (healthy → severe, significant) | **E [R]** |
| NP aggregate modulus (confined) | **1.01 → 0.44 ± 0.19 MPa** | E [S: Johannessen & Elliott 2005] |
| AF aggregate modulus (confined) | **0.56 → 1.10 ± 0.53 MPa** (AF *stiffens* in compression) | E [S: Iatridis 1998] |
| AF in situ equilibrium modulus | no significant change | **E [R]** |
| Equilibrium stress at 15% strain | decreases significantly in all regions | **E [R]** |
| Residual (pre-)stress | significantly lower in moderate and severe at all sites (p < 0.016) | **E [R]** (numbers only in Fig. 4) |
| Peak relaxation force (3 mm indenter) | **3.47 ± 0.70 N** (healthy) → **2.17 ± 0.70** (moderate) → **1.96 ± 1.48** (severe) | **E [R]** |
| Peak / equilibrium force ratio | **1.35 ± 0.10 → 1.41 ± 0.21 → 1.59 ± 0.33** (more relaxation when degenerated) | **E [R]** |
| Disc height | see §1 (anterior AF −43%, lateral AF −31%) | **E [R]** |
| Poisson's ratio (assumed, not measured) | AF 0.40 / 0.375 / 0.35; NP 0.49 / 0.445 / 0.40 | E [S: Natarajan 2006] |
| NP composition | proteoglycan and water fall, so **NP pressure falls**; NP sagittal diameter falls **~50%**; NP behaves "more like a solid"; **load bearing shifts to AF** | N17 [S: Adams 1996; Sato 1999; Johannessen & Elliott 2005] |
| AF in tension | becomes **softer and weaker** (small defects accumulate) | N17 [S: Shan 2015] |
| Bending stiffness of motion segment | **decreases** with degeneration | N17 [S: Moroney 1988; Nachemson 1979; Zhao 2005] |
| Range of motion | decreases (possibly osteophytes) | N17 [S: Al-Rawahi 2011] |
| Segment mobility in FE | **higher** mobility in degenerated conditions | V [S: Ibarz 2013] |
| AF stress state | degenerated AF experiences compressive stress (rather than NP-pressure-driven tension), which may seed fissures | J [R: intro, citing refs 2–4] |
| Stress location | with more compression and degeneration, AF stress moves **from inner to outer surface** | V [S: Lotz 1998, mouse + FE] |
| Vibration | larger fluid-pressure drop and larger AF effective stress in degenerated discs (1–11 Hz) | V [S: Guo & Teo 2006; Fan 2020] |

## 4. Herniated disc characteristics

| Finding | Value | Source |
|---|---|---|
| Herniation through the AF needs flexion or overload in **multiple modes at once**; more likely at **high loading rates** | qualitative | N17 [S: Adams & Hutton 1982; Wade 2014, 2015] |
| Bending plus compression → radial fissures and prolapse, in a single cycle or by **fatigue** | qualitative | N17 [S: Adams & Hutton 1982, 1983, 1985] |
| Axial rotation increases vulnerability of **posterior** AF and lowers the load to failure | qualitative | N17 [S: Callaghan & McGill 2001; Drake 2005 …] |
| Compressive overload damages the **bony endplate first** (vertical herniation, Schmorl's nodes) | qualitative | N17 [S: Adams & Dolan 2012; Brinckmann 1988] |
| CEP fragments often appear in herniations | qualitative | N17 [S: Lama 2014; Wade 2014] |
| Loss of nucleus → loss of stiffness | denucleated stiffness = **44% of the bone-drilled (BI) control at 15% strain**; drilling alone = 80% of intact | **J [R]** (cadaveric, not a natural herniation) |
| Annular lesions alone have minimal effect on overall disc mechanics (FE) | qualitative | V [S: Little 2007] |

## 5. Loading types and their effects

| Loading | Finding | Source |
|---|---|---|
| Axial compression | narrows height, bulges NP outward, puts axial and radial compression on AF; NP pressure generates AF hoop tension | Ner [R, review]; N17 |
| Excess static compression | high stress and strain, altered biologic activity, cell death, degeneration | V [S: Setton & Chen 2006; Lotz 1998] |
| Torsion + compression | linked to degeneration and to lift-and-twist low back pain; fibres damaged when stretched past resting length | V [S: Marras 1995; Hadjipavlou 2008] |
| Flexion / extension / lateral bending | most commonly simulated motions; neural arch carries more load in extension | V; N17 [S] |
| Cyclic / vibration | 1–11 Hz studied (vehicle vibration), with worse effects in degenerated discs | V [S] |
| Compressive load → NP pressure (bovine, extrapolated) | 50 N ≈ 0.08 MPa; 1000 N ≈ 1.6 MPa (assumes 622 mm² area); with measured 455 mm², 1000 N ≈ 2.2 MPa | N20 [R, with stated caveat] |
| Loading rate | a **100× faster rate raised stiffness only ~2%** (significant at 1 of 3 labs), which is small compared with variation between specimens | **N20 [R]** |
| Bovine disc stiffness | ~1,100–1,700 N/mm (uncorrected); 1,400–2,400 N/mm (compliance-corrected); modulus ~15–34 MPa; **~35% difference between labs** | **N20 [R]** |

## 6. Viscoelasticity and time-dependent response

**Ellingson 2012, Eq. (2) [R]: three-term Prony stress-relaxation function**

> G(t) = 1 + g · Σᵢ₌₁³ exp(−t / τᵢ)

- G(t) is the force normalised by the **equilibrium** force.
- g is the spectrum magnitude.
- τ₁ = τ_S (short), τ₃ = τ_L (long), and τ₂ = τ_M, the logarithmic average of τ_S and τ_L (= √(τ_S·τ_L)).
- The protocol was a 10% strain preload, then a further 5% step at 5%/s, held for 1800 s. All fits had R² > 0.98 except one.

**Table 1 of Ellingson 2012 [R]** (mean ± SD):

| Region | Grade | g | τ_S (s) | τ_L (s) |
|---|---|---|---|---|
| Anterior AF | Healthy | 0.074 ± 0.011 | 2.65 ± 0.08 | 45.6 ± 10.3 |
| | Moderate | 0.113 ± 0.038 | 2.72 ± 0.12 | 55.2 ± 7.8 |
| | Severe | 0.172 ± 0.067 | 2.76 ± 0.12 | 66.6 ± 26.8 |
| Posterior NP | Healthy | 0.109 ± 0.036 | 2.65 ± 0.07 | 50.6 ± 10.7 |
| | Moderate | 0.095 ± 0.047 | 2.76 ± 0.15 | 48.3 ± 7.2 |
| | Severe | 0.169 ± 0.052 | 2.66 ± 0.07 | 32.9 ± 13.8 |
| Lateral AF | Healthy | 0.116 ± 0.032 | 2.57 ± 0.17 | 59.3 ± 41.4 |
| | Moderate | 0.120 ± 0.062 | 2.75 ± 0.10 | 54.2 ± 16.0 |
| | Severe | 0.131 ± 0.067 | 2.78 ± 0.17 | 90.0 ± 48.7 |

*(The table was garbled in the layout extraction and was re-read in raw text order. ± signs appear as "7" in the PDF text layer.)*

The authors' interpretation [R]: degenerated tissue **relaxes faster and by a larger percentage**, so healthy discs "encounter higher forces at the same strain level, and are able to maintain this force". They suggest the AF governs the fast response.

### O'Connell 2011: whole-disc creep and recovery (human)

**Model [R], a 5-parameter rheological model:** an elastic spring in series with two Voigt (Kelvin–Voigt) solids, following Keller 1988 and Johannessen 2006. The paper's Equation 1 is an embedded image that cannot be extracted from the PDF text. From the paper's own definitions (elastic amplitude L/S_E, Voigt amplitudes L/S₁ and L/S₂, time constants τ₁ and τ₂, equilibrium at t = ∞), the form is:

> d(t) = L/S_E + (L/S₁)·(1 − e^(−t/τ₁)) + (L/S₂)·(1 − e^(−t/τ₂))

*Reconstructed from the text; check it against the printed Equation 1 on page 4 of the PDF.* Load history across creep → recovery → creep was handled with **Boltzmann superposition** [R].

**Table 1 [R]**, median (interquartile range), pooled across grades 1.8–3.4:

| Parameter | Creep 1 (1000 N, 4 h) | Recovery (20 N, 24 h) | Creep 2 |
|---|---|---|---|
| τ₁, fast (min) | **8.09** (6.12–11.75) | **35.8** (28.9–57.7) | 5.85 (4.26–8.10) |
| L/S₁ (mm) | 0.29 (0.21–0.44) | 0.28 (0.24–0.38) | 0.20 (0.16–0.30) |
| τ₂, slow (h) | **3.07** (2.96–3.43) | **8.00** (7.47–9.26) | 3.40 (3.19–3.73) |
| L/S₂ (mm) | 1.51 (1.31–1.72) | 1.64 (1.48–1.83) | 1.70 (1.59–1.81) |
| L/S_E, elastic (mm) | 1.44 (1.08–1.71) | 0.53 (0.49–0.59) | 0.76 (0.65–0.79) |
| Equilibrium displacement (mm) | 3.29 (2.55–3.99) | 2.49 (2.25–2.71) | 2.66 (2.42–2.83) |
| Equilibrium time (h, 99%) | 14.1 (13.6–15.8) | 36.9 (34.4–42.7) | 15.6 (14.7–17.2) |

Other findings [R]:
- **Recovery is slower than loading.** τ₁ is 5× and τ₂ 2.5× longer in recovery; the authors call recovery "3-4X slower" overall. Their explanation: creep is driven by the applied load, while recovery is driven only by osmotic pressure.
- **Contribution to equilibrium displacement:**
  - in creep: elastic 30–45%, fast 10–15%, slow ~50%
  - in recovery: elastic ~20%, fast 10–15%, slow ~70%
- **Interpretation (authors' assumption, supported by nucleotomy studies):** the fast response is NP/endplate fluid flow and the slow response is AF fluid flow.
- **Correlations with degeneration (Spearman, Table 2):**
  - **τ₁ increases** with grade in creep (r > 0.65), but not in recovery.
  - **L/S₁ increases** with grade in creep and recovery (r > 0.65).
  - **τ₂ is not correlated** with degeneration (p > 0.1).
  - Elastic L/S_E, slow L/S₂ and equilibrium displacement increase with grade in **creep 1 only** (r = 0.67, 0.66, 0.75).
  - Equilibrium time is not correlated.
  - **% recovery (44–98%) decreases with grade** (r = −0.72).
- **Slow ramp:**
  - Linear-region stiffness was **1498 (1294–1668) N/mm**, with average disc height **8.86 (6.94–11.00) mm** and about 23% axial compression at 2000 N.
  - After 0–1 h of recovery, stiffness was 20–25% higher than initially.
  - After ≥ 4 h, stiffness was within 5% of the initial value; after ≥ 8 h, height was within 1%.
- **Loads** were chosen to represent **0.58 MPa (1000 N) and 1.16 MPa (2000 N)** of in vivo stress (citing Wilke 1999).
- **Limits stated by the authors:**
  - The model "[is] not specifically tied to disc structure".
  - Tests did not run to equilibrium.
  - Creep 1 included about 0.7 mm of low-load (neutral-zone) displacement.
  - Unloaded-equilibrium start ≠ diurnal loading. In vitro height change was 2–3 mm vs ~1.5 mm diurnal in vivo (Adams 1987).

**Limitation for DISC LAB:** the paper gives **pooled medians** plus **correlation directions**. Grade-specific values exist only in Fig. 7 (scatter plots), and those cannot be read from the PDF text.

Other time-dependent findings:
- At 37 °C, compressive creep is ~10% greater than at room temperature (N17 [S: Koeller 1986]).
- Disc **height and hydration vary ~20% diurnally** in vivo (N17 [S: Botsford 1994]).
- Motion-segment rate dependence is "dominated by fluid-solid interactions (poroelastic effects)" rather than the intrinsic viscoelasticity of the solid matrix (Ner [S: Costi 2008]).
- For whole-segment creep, Ner says there is "no one established method or metric" and defers to multi-parameter rheological models (Keller 1987; Beckstein 2008), whose values are **not tabulated**.
- Ellingson 2012 describes O'Connell 2011 as finding that the "long time constant" increases with degeneration. **O'Connell's own paper reports that the *fast* constant τ₁ (minutes) correlates with degeneration and the slow τ₂ (hours) does not** (see §12).

## 7. Fluid flow, hydration and osmotic behaviour

| Finding | Value | Source |
|---|---|---|
| NP water content | **~90% → ~70%** from age 1 to 80, tracking proteoglycan loss | N17 [S: Antoniou 1996 …] |
| AF water content | 65–70% (healthy) | N17 [S] |
| NP proteoglycan | 35–65% of NP dry weight; binds water | N17 [S] |
| NP/AF permeability, swelling pressure | see §2 | Ner [S] |
| Unloaded wet cadaveric discs swell ~20% | qualitative caution for testing | N17 [S: McMillan 1996] |
| Standing / weight-bearing changes water content and lowers glucose throughout the disc (FE) | qualitative | V [S: Jackson 2011b] |
| Loss of water follows depletion of fixed charge density (GAGs) | qualitative | V [S: Baldoni & Gu 2019] |
| Restricting water uptake osmotically → 35% lower axial stiffness | quantitative | N20 [S: Bezci 2015] |

## 8. Stress and strain distributions

- **No paper in the set gives a numeric stress field.** Distribution findings are qualitative and come from FE studies cited by Volz:
  - AF stress migrates **inner → outer** surface with load and degeneration (Lotz 1998).
  - Degeneration raises intradiscal pressure and bulge in *adjacent* discs (Ruberte 2009; Hussain 2010, 2012).
- Outer and anterior AF are stiffer than inner and posterior AF in tension (N17 [S]).
- Healthy NP behaves hydrostatically; degenerated NP behaves more like a solid, so load shifts to the AF (N17 [S]).
- **Implication:** the heat map can show only a *qualitative* redistribution that the simplified model produces. It must be labeled as illustrative.

## 9. Cellular and ECM responses to loading (mechanobiology)

| Finding | Value | Source |
|---|---|---|
| Degeneration = cell catabolism exceeding anabolism, a cascade in which altered ECM alters cell signals | qualitative (Volz Fig. 1) | V [R, review] |
| Cell density falls linearly when glucose < 0.5 mM; all cells non-viable at ≤ 0.2 mM | quantitative | V [S: Horner & Urban 2001; Bibby 2002, 2004] |
| Sustained compression changes O₂ and lactate distributions, more so in healthy than degenerated tissue | qualitative | V [S: Malandrino 2011] |
| Water and PG take ~55 years to reach a new equilibrium after nutrient reduction; cell density takes ~30 days | quantitative (FE) | V [S: Zhu 2012; Gu 2014] |
| With aging, NP collagen shifts from type II to type I and smaller, less aggregated PGs are made | qualitative | V [S] |
| NP cells: rounded, Sox-9 / collagen II / aggrecan; AF cells: fibrochondrocytes | qualitative | Ner [R, review] |
| Static and dynamic overloading induce early degenerative changes (caprine bioreactor) | qualitative | V [S: Paul 2013] |

## 10. Failure mechanisms and herniation progression

- Mechanisms are covered in §4.
- The only quantitative tissue-level **failure anchors** in the set are:
  - AF circumferential failure stress ~2.7 MPa and failure strain ~0.3 (N17).
  - AF yield strain 20–30% (Ner).
- These are *isolated-tissue tensile* values, **not** whole-disc herniation thresholds.
- Fatigue failure is reported (Adams & Hutton 1985, via N17), but **no cycle-to-failure numbers** appear in the set.
- **Conclusion:** the references do **not** support a predictive herniation threshold. The damage index has to be **explicitly illustrative**, as you planned.

---

## 11. Scientific reference table: what goes into the simulation

| Model quantity | Healthy | Degenerated | Herniated | Basis |
|---|---|---|---|---|
| Resting disc height | ~9.7–10.3 mm | ~5.5–7.3 mm (severe), scaled by the severity slider | Use degenerated value [P] | E [R] |
| Viscoelastic relaxation, g / τ_S / τ_L (Relaxation preset) | Table 1 healthy rows | Table 1 moderate/severe rows, interpolated by severity [P] | Severe rows [P] | E [R] + [P] interpolation |
| **Whole-disc creep** (Creep preset; default loading) | O'Connell Creep 1 medians as baseline (τ₁ 8.09 min, τ₂ 3.07 h, L/S_E 1.44, L/S₁ 0.29, L/S₂ 1.51 mm at 1000 N) | τ₁ and L/S₁ **larger** (direction from O [R]); magnitude of change from a stated assumption [P]; τ₂ **unchanged** (O [R]) | As degenerated plus a lower NP contribution (J) [P] | O [R] + [P] |
| **Recovery** (Recovery-time slider) | O'Connell Recovery medians (τ₁ 35.8 min, τ₂ 8.00 h) | same τ values; **lower % recovery** with grade (O [R] direction) [P magnitude] | same as degenerated [P] | O [R] |
| Whole-disc axial stiffness (cross-check) | 1498 N/mm (O, ramp) and 1.73 kN/mm (Ner) | — | — | O [R]; Ner [S] |
| NP stiffness | 0.435 MPa (equilibrium) | 0.229 MPa (severe) | Reduced further; Joshi's 44% stiffness ratio used as the guide for nucleus loss [P] | E [R]; J [R] |
| AF compressive stiffness | 0.56 MPa (aggregate) | 1.10 MPa (aggregate) | As degenerated, plus a posterior defect [P] | E [S: Iatridis 1998] |
| Whole-disc axial stiffness (calibration) | 1.73 kN/mm | Emerges from the NP/AF values above [P] | Emerges [P] | Ner [S] |
| NP area fraction | 25–50% → use ~40% [P] | ~50% smaller NP diameter at severe [P from N17 S] | Smaller still [P] | N17 [S] |
| NP pressure sanity check | must land near 0.5–0.87 MPa for a standing-type load | Lower than healthy at the same load | Lower | N17 [S: Wilke 1999] |
| Loading-rate effect on stiffness | ignored (~2% per 100×) | ignored | ignored | N20 [R] |
| Poisson's ratio (bulge) | AF 0.40, NP 0.49 | 0.35 / 0.40 | 0.35 / 0.40 | E [S: Natarajan 2006] |
| Torsional stiffness | from G_app 2–9 MPa and disc geometry [P] | **no degenerated value in refs (gap)** | gap | Ner [S] |
| Bending stiffness | ordering only (extension > lateral > flexion) | "decreases" (direction only) | gap | N17 [S] |
| Hydration / water | NP ~80–90% | NP ~70% (direction supported) | — | N17 [S] |
| Damage index | **illustrative only**, strain-based, using AF yield 20–30% as the reference scale | faster accumulation [P] | starts high [P] | Ner/N17 anchors + [P] |

---

## 12. Conflicting findings between references

1. **AF stiffness with degeneration.**
   - Stiffer in confined compression and shear (Iatridis 1998, via E and N17).
   - Softer and weaker in tension (Shan 2015, via N17).
   - No significant change in situ (E's own data).
   - *Resolution [P]:* model AF **compressive** stiffness rising and show AF **tensile failure capacity** falling, and say so on screen.
2. **Segment mobility.**
   - Higher mobility with degeneration (Ibarz 2013, via V).
   - Lower bending stiffness, which is consistent with more mobility, but **decreased ROM** (N17, possibly from osteophytes).
   - *Resolution [P]:* the disc-only model shows reduced bending stiffness and does not model osteophytes.
3. **Time constants and degeneration.**
   - In E (tissue indentation, seconds to minutes), τ_L **decreases** in NP but **increases** in AF with degeneration.
   - E describes O'Connell 2011 as showing a "long time constant" increase. O'Connell's own data show the **fast τ₁ (minutes) increases** with grade while the **slow τ₂ (hours) does not change**.
   - Test mode (relaxation vs creep), scale (3 mm tissue site vs whole disc) and time window all differ.
   - *Resolution [P]:* use E only for the tissue-level relaxation preset and O for whole-disc creep and recovery. Don't mix their time constants.
   - **Related conflict:** O's discussion notes that NP permeability *increases* with degeneration (Johannessen & Elliott 2005), even though whole-disc τ₁ gets slower. The authors suggest loss of osmotic pressure dominates at the whole-disc level.
4. **Test environment.**
   - N20: saline bath had no effect.
   - Costi 2002 (via N17 and N20): bath reduced stiffness 20–30%.
   - N20 attributes this to its short soak time.
5. **Modulus depends on test method.**
   - NP ranges from **5.4 kPa** (unconfined) to **1.0 MPa** (confined) (N17).
   - E's indentation moduli fall between direct indentation and confined compression.
   - D shows that the Hayes-type indentation model (the form E's Eq. 1 follows) **can deviate substantially from compression moduli** unless corrected for geometry. **Absolute values from E should be treated as approximate. The healthy-vs-degenerated *ratios* are more robust.**
6. **Species and source.** N20 found a **~35%** stiffness difference between bovine discs from US vs UK labs even after corrections, and bovine ≠ human.

## 13. Missing information (needs more research or must be labeled as assumption)

| Gap | Why it matters | Suggestion |
|---|---|---|
| ~~Whole-disc human creep time constants~~ | **Resolved by O'Connell 2011** (pooled medians) | — |
| **Grade-specific magnitudes** of O'Connell's parameters | Only correlation directions are in the text; the numbers are in Fig. 7 scatter plots | Read approximate values off Fig. 7 (you can do this from the printed figure), or state an explicit scaling assumption [P] |
| Whole-disc axial stiffness for **degenerated** human discs | the only direct whole-disc benchmark is healthy (1.73 kN/mm) | Derive it from tissue ratios [P], or add a paper |
| Bending (flexion/extension/lateral) stiffness values | only the ordering is available | Heuer 2007/2008 appear in N17's Table 2; add one if you want numbers |
| ~~Recovery kinetics after unloading~~ | **Resolved by O'Connell 2011** (separate recovery τ values) | — |
| Load → NP pressure relation for human discs | only posture pressures (Wilke 1999) and bovine extrapolation (N20) | Calibrate the simple model so standing ≈ 0.5–0.87 MPa [P] |
| Herniation / fatigue thresholds | no cycles-to-failure data | Illustrative damage index (as planned) |
| Quantitative cell response to load magnitude and frequency | Volz gives only qualitative or nutrient-based results | Keep mechanobiology as explanatory text, plus the glucose-viability thresholds |
| The torsion-angle unit in Volz ("no greater than 9") | the symbol was lost in the PDF | Check against Farfan 1970 before quoting |

---

## 14. Recommended model (high level; equations come in Prompt 3)

**Recommendation: a lumped-parameter, two-region (NP + AF in parallel) generalized-Maxwell (Prony series) model, driven by the Ellingson 2012 relaxation function.**

1. **Axial behaviour.** Treat the disc as two parallel columns, NP and AF, with area fractions from N17. Each column gets an equilibrium modulus from §11 and the Prony relaxation function G(t) from Ellingson.
   - **Stress-relaxation preset:** σ(t) = E_eq · ε₀ · G(t). This is exactly the published equation.
   - **Creep preset:** integrate the *same* generalized-Maxwell (Wiechert) model under constant force. This is the mathematically consistent creep counterpart of the same parameters [P].
   - **Load sharing** between NP and AF falls out naturally. As NP stiffness falls with degeneration, the AF share rises, matching the qualitative finding in N17.
2. **Why not a plain Maxwell or Kelvin–Voigt model.**
   - A Maxwell element relaxes stress to **zero** and creeps without limit. That contradicts E's finite equilibrium stress.
   - A Kelvin–Voigt element **cannot show stress relaxation** at all.
   - The Prony/Wiechert form (a generalization of the standard linear solid) shows both, and its parameters are published for all three degeneration grades. It is also cheap enough to run in real time.
3. **Time scales (updated with O'Connell 2011).**
   - **Whole-disc creep and recovery** come from O'Connell's 5-parameter model: spring + two Kelvin–Voigt solids in series, with Boltzmann superposition for loading history. This covers the default loading, cyclic loading, the creep preset and the recovery slider, on realistic minutes-to-hours time scales.
   - Recovery uses O'Connell's **separate, slower recovery time constants**, so "recovery is slower than loading" emerges from the data.
   - **Tissue-level stress relaxation** (the relaxation preset) keeps E's Prony function, labeled as a tissue-site test.
   - Choosing Kelvin–Voigt elements here is not arbitrary. It is the published model form fitted to human whole-disc creep. A spring plus two Voigt elements gives finite equilibrium creep, which a plain Maxwell element cannot.
   - The biphasic estimate τ ≈ h²/(H_A·k) is **no longer needed** and is dropped.
4. **Other modes.**
   - Torsion: shear stiffness from G_app (Ner).
   - Bending and shear: **ordering-only** stiffness, labeled "relative" unless you add a data source.
   - Stiffness does not depend on rate (N20).
5. **Outputs the model can honestly support:**
   - disc height and axial strain
   - NP vs AF load share
   - NP pressure, calibrated to the Wilke ranges
   - stress-relaxation and creep curves
   - healthy vs degenerated differences from published parameter ratios
   - radial bulge, from Poisson's-ratio assumptions [P]
6. **Outputs that must be labeled illustrative:**
   - stress heat map (qualitative redistribution)
   - hydration % (direction supported, kinetics assumed)
   - damage index and herniation progression
