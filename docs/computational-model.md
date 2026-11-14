# DISC LAB: Computational Model Specification (Prompt 3)

Prepared 2026-11-14. **Status: awaiting approval. No code has been written.**
It builds on `DISC-LAB_Reference_Review.md` and uses the same tags:

- **[R]** reported by the paper itself
- **[S]** secondary (the paper cites another study)
- **[P]** my proposed simplification or assumption

Short source keys:

| Key | Source |
|---|---|
| O | O'Connell 2011 |
| E | Ellingson & Nuckley 2012 |
| N17 | Newell 2017 |
| Ner | Nerurkar 2010 |
| N20 | Newell 2020 |
| J | Joshi 2006 |
| V | Volz 2022 |

---

## 1. Model architecture

```
            Inputs (identical definitions for every disc)
  condition · severity s · load type · direction · magnitude
  duration · frequency mode · recovery time · test preset
                              │
          ┌───────────────────┴───────────────────┐
          ▼                                       ▼
  discParameters(condition, s)            loadHistory(inputs) → F(t), M(t)
  (every value carries its citation)
          │                                       │
          └──────────────┬────────────────────────┘
                         ▼
  ┌──────────────────────────────────────────────────────────────┐
  │ M1 Axial creep / recovery   (O'Connell 5-parameter model)    │
  │ M2 Tissue stress relaxation (Ellingson Prony series)         │
  │ M3 NP / AF load sharing → NP pressure, AF stress             │
  │ M4 Bending · torsion · shear (linear stiffness, geometry)    │
  │ M5 Radial bulge (Poisson)                                    │
  │ M6 Hydration index (illustrative)                            │
  │ M7 Stress map (illustrative)                                 │
  │ M8 Damage index (illustrative)                               │
  └──────────────────────────────────────────────────────────────┘
                         ▼
     Time series: height, strain, pressure, AF stress, rotation,
                  bulge, hydration, damage
                         ▼
     The SVG animation and the graphs read ONLY these time series
```

- `simulate(inputs, params)` is a **pure function** that returns arrays.
- The illustration's shape is computed from the same arrays, so the animation and the numbers cannot disagree.
- **Comparison mode** calls `simulate` twice with identical inputs and two parameter sets: Healthy (s = 0) and Degenerated (user's s).

**Severity variable.** s ∈ [0, 1]: 0 = healthy (Pfirrmann 1), 0.5 = moderate (2–3), 1 = severe (4–5), following E's grouping.

- Parameters reported at three grades use **piecewise-linear interpolation** between them [P].
- Herniated uses s = 0.7 by default plus nucleus loss (§8).

**Units used internally:** N, N·m, mm, s, MPa. They are displayed as N, N·m, mm, %, MPa, and min or h.

---

## 2. Parameter table (all three conditions)

### 2a. Geometry

| Symbol | Meaning | Healthy (s=0) | Severe (s=1) | Herniated | Basis |
|---|---|---|---|---|---|
| h₀ | resting disc height | 9.67 mm | 5.53 mm | from s = 0.7: 6.77 mm | E [R] anterior-AF heights 9.67 ± 1.71 → 5.53 ± 3.12 mm; linear in s [P] |
| A | disc axial area | 1720 mm² | 1720 mm² | 1720 mm² | O [R]: 1000 N ↔ 0.58 MPa ⇒ A = 1000/0.58 [derived] |
| r | equivalent radius √(A/π) | 23.4 mm | 23.4 mm | 23.4 mm | derived [P: circular cross-section, as in N20] |
| φ | NP fraction of area | 0.40 | 0.10 | 0.07 | N17 [S]: 25–50% area; NP diameter ~50% smaller when degenerated ⇒ area × 0.25 [P] |

### 2b. Whole-disc creep (O'Connell Creep 1, at 1000 N, h_ref = 8.86 mm)

Healthy is mapped to the **lower quartile**, moderate to the **median**, severe to the **upper quartile** [P]. This is applied only to parameters the paper found correlated with degeneration.

| Symbol | Meaning | Healthy (Q1) | Moderate (median) | Severe (Q3) | Basis |
|---|---|---|---|---|---|
| a_E | elastic amplitude L/S_E | 1.08 mm | 1.44 mm | 1.71 mm | O Table 1 [R]; correlates with grade in creep 1 [R] |
| a₁ | fast amplitude L/S₁ | 0.21 mm | 0.29 mm | 0.44 mm | O [R]; correlates [R] |
| τ₁ | fast time constant (loading) | 6.12 min | 8.09 min | 11.75 min | O [R]; correlates [R] |
| a₂ | slow amplitude L/S₂ | 1.31 mm | 1.51 mm | 1.72 mm | O [R]; correlates in creep 1 [R] |
| τ₂ | slow time constant (loading) | 3.07 h | 3.07 h | 3.07 h | O [R]; **not** correlated |
| τ₁ᴿ | fast time constant (recovery) | 35.8 min | 35.8 min | 35.8 min | O [R]; not correlated in recovery |
| τ₂ᴿ | slow time constant (recovery) | 8.00 h | 8.00 h | 8.00 h | O [R]; not correlated |
| ρ | unrecoverable fraction after a 4 h / 24 h cycle | 0.02 | ~0.29 | 0.56 | O [R]: recovery ranged 98% → 44%, r = −0.72 with grade; endpoint mapping [P] |

### 2c. Tissue properties

| Symbol | Meaning | Healthy | Severe | Basis |
|---|---|---|---|---|
| H_NP | NP aggregate modulus | 1.01 MPa | 0.44 MPa | E [S: Johannessen & Elliott 2005] |
| H_AF | AF aggregate modulus | 0.56 MPa | 1.10 MPa | E [S: Iatridis 1998] |
| ν_AF / ν_NP | Poisson's ratio | 0.40 / 0.49 | 0.35 / 0.40 | E [S: Natarajan 2006] |
| E_eq,NP | NP equilibrium modulus (relaxation preset) | 0.435 MPa | 0.229 MPa | E [R] |
| g, τ_S, τ_L | Prony parameters (NP, anterior AF, lateral AF) | E Table 1 healthy | E Table 1 severe (moderate at s = 0.5) | E [R] |
| G_app | apparent torsional shear modulus | 5.5 MPa | 5.5 MPa | Ner [S] range 2–9 MPa; midpoint [P]; no degeneration data |
| E_b | modulus for bending | 6.5 MPa | 6.5 MPa | Ner [S] axial modulus 3–10 MPa; midpoint [P]; no disc-level degeneration data |
| E_t | AF axial tensile modulus (linear) | 0.82 MPa | 0.82 MPa | Ner [S] |
| W_NP | NP water fraction | 0.85 | 0.70 | N17 [S]: ~90% → ~70% with age [P endpoints] |
| W_AF | AF water fraction | 0.675 | 0.675 | N17 [S]: 65–70% |
| ε_y | AF reference (yield) strain for damage | 0.25 | 0.15 | Ner [S] 20–30%; lower when degenerated (direction: N17 [S: Shan 2015]); magnitude [P] |

### 2d. Herniated condition

| Symbol | Meaning | Value | Basis |
|---|---|---|---|
| λ | nucleus-loss fraction | 0.30 by default (slider 0–1) | [P] |
| κ(λ) | axial stiffness factor = 1 − λ(1 − 0.44) | 0.83 at λ = 0.30 | J [R]: full denucleation → 44% of control stiffness; linear in λ [P] |

---

## 3. Equations

Each equation is listed with: **variables & units · scientific basis · assumptions · limitations · implementation.**

### E1. Applied load history

F(t) = F_mag · u(t), where u(t) depends on the frequency mode:

| Frequency mode | Load pattern |
|---|---|
| Single | a step held for the duration T_load, then recovery for T_rec |
| Repeated | n blocks of (T_load on, T_rec off) |
| Cyclic | a triangle wave between 0.05·F_mag and F_mag at f = 0.1–5 Hz |

- **Variables:** F (N); T_load, T_rec (s); f (Hz).
- **Basis:** triangle-wave cyclic compression as in N20 [R] (50–1000 N at 0.05–5 Hz); creep and recovery protocol as in O [R].
- **Assumption:** the cyclic minimum is 5% of peak, mirroring N20's 50 N on 1000 N [P].
- **Limitations:** no sine or random vibration. Volz's 1–11 Hz vibration studies are described qualitatively only.
- **Implementation:** `loadHistory()` returns F(t) and M(t) on the simulation time grid.

### E2. Whole-disc axial creep and recovery (M1)

For a step load L held from t = 0 (O [R], reconstructed form):

> d(t) = (L/1000)·k_h·κ·[ a_E + a₁(1 − e^(−t/τ₁)) + a₂(1 − e^(−t/τ₂)) ]

For a general load history, each Kelvin–Voigt element i ∈ {1, 2} is a first-order state xᵢ (mm):

> dxᵢ/dt = (xᵢ* − xᵢ)/τᵢ*,  with xᵢ* = (F(t)/1000)·k_h·κ·aᵢ
>
> τᵢ* = τᵢ when xᵢ* ≥ xᵢ (loading); τᵢ* = τᵢᴿ when xᵢ* < xᵢ (recovery)
>
> d(t) = (F(t)/1000)·k_h·κ·a_E + x₁ + x₂ + d_set(t)

**Variables**
- d: axial displacement (mm), so disc height h(t) = h₀ − d(t) and axial strain ε_z = d/h₀.
- L: load (N).
- aᵢ: amplitudes at 1000 N (mm). τᵢ: time constants (s).
- k_h = h₀/h_ref (h_ref = 8.86 mm, O's mean height): this converts O's displacements to strain so they can be applied to a disc of different height [P].
- κ: herniation stiffness factor (1 for intact discs).

**Unrecoverable set:** d_set grows toward ρ·(x₁ + x₂) during a 4 h load and stays [P]. This is a calibration to O's 24 h recovery percentages, not a mechanism.

**Basis**
- O [R]: the elastic spring + two Voigt solids model fitted human L2–L3 creep with R² = 0.998.
- Recovery time constants are 5× (τ₁) and 2.5× (τ₂) longer than loading.
- O's authors attribute the fast response to NP/endplate flow and the slow response to AF flow.

**Why this model and not the alternatives**

| Model | Behaviour | Fit for DISC LAB |
|---|---|---|
| Maxwell | creeps without limit; relaxes stress to zero | **Rejected.** Contradicts O's finite equilibrium (3.29 mm) and E's finite equilibrium stress |
| Single Kelvin–Voigt | one time constant; no instant response | **Rejected.** O needs an instant elastic part plus two time scales (minutes and hours) |
| Spring + 2 Kelvin–Voigt (O) | instant + fast + slow, finite equilibrium | **Selected.** This is the published model fitted to human whole-disc data, with parameters for creep *and* recovery |
| Biphasic / poroelastic FE (as in Volz's reviewed models) | physically richest | **Rejected for real time.** Needs FE solvers and parameters the references don't provide |

**Assumptions [P]**
- Displacement is linear in load: O fitted a single 1000 N load, so the amplitudes are scaled ∝ L. The real disc is nonlinear (O Fig. 2; N17 Fig. 3).
- Elements switch between loading and recovery time constants by direction. O used Boltzmann superposition on step histories. This switching rule reproduces O's step results exactly and approximates arbitrary histories.
- The quartile-to-grade mapping (§2b).

**Limitations**
- O's discs were pooled grades 1.8–3.4, so "healthy" and "severe" are **extrapolations** to the ends of the measured spread.
- Creep 1 includes ~0.7 mm of low-load neutral-zone displacement (O [R]), so the elastic stiffness (~850 N/mm) is lower than O's ramp stiffness (1498 N/mm).
- Tested at room temperature in PBS; O itself does not report a temperature effect.

**Implementation**
- Exact exponential update per step, xᵢ ← xᵢ* + (xᵢ − xᵢ*)·e^(−Δt/τᵢ*). This is unconditionally stable.
- **Cyclic loading:** because τ₁ ≥ 6 min ≫ the load period (0.2–10 s), the Voigt elements are driven by the *cycle-mean* load. The elastic term follows F(t) instantaneously. This is exact in the limit f·τ ≫ 1 and keeps a 4-hour, 5 Hz run under ~50 ms.
- **Rate independence:** stiffness does not vary with frequency. N20 [R] found only ~2% per 100× rate. Ner's dynamic stiffness of 3.5–5.1 kN/mm is not used. It is noted in the ⓘ panel.

### E3. Tissue-level stress relaxation (M2, "Run relaxation test" preset)

> σ(t) = E_eq · ε₀ · G(t),  G(t) = 1 + g·[e^(−t/τ_S) + e^(−t/τ_M) + e^(−t/τ_L)],  τ_M = √(τ_S·τ_L)

- **Variables:** σ (MPa); E_eq (MPa); ε₀ = 5% step strain (E's protocol), adjustable 2–15% [P]; t (s), run for 1800 s like E.
- **Basis:** E [R] Eq. 2, Table 1. The parameters are fitted per region (NP, anterior AF, lateral AF) and per grade.
- **Assumptions:** linear in ε₀ [P]. The absolute stress is shown for the NP only (E_eq,NP is reported); the AF curves are shown **normalized** (σ/σ_eq), because AF equilibrium moduli appear only in E's Fig. 4.
- **Limitations:**
  - 3 mm indentation at a tissue site, not the whole disc.
  - D 2016 shows indentation moduli depend on the analysis model, so absolute values are approximate.
  - The time constants are seconds to about a minute, which is why this preset is labeled "tissue test".
- **Implementation:** closed form, evaluated on a log-spaced time grid.

### E4. NP / AF load sharing and NP pressure (M3)

> k_NP = H_NP·φ·A/h₀,  k_AF = H_AF·(1 − φ)·A/h₀
>
> F_NP = F·k_NP/(k_NP + k_AF),  F_AF = F − F_NP
>
> p_NP = F_NP/(φ·A),  σ_AF = F_AF/((1 − φ)·A)

- **Variables:** H (MPa); φ (–); A (mm²); F (N); p_NP and σ_AF (MPa).
- **Basis:**
  - N17 [S]: degeneration lowers NP pressure and shifts load to the AF.
  - The opposite trends in H_NP and H_AF come from E [S].
  - φ comes from N17 [S].
  - Both moduli are confined-compression aggregate moduli, so the comparison uses the same test mode.
- **Assumptions [P]:**
  - Two columns in parallel with equal strain.
  - A uniform NP pressure, treated hydrostatically.
  - Load sharing is constant in time: fluid-driven redistribution during creep is not modeled.
- **Results this produces (1000 N):**

| Condition | NP load share | p_NP | σ_AF |
|---|---|---|---|
| Healthy | 55% | **0.79 MPa** | 0.44 MPa |
| Moderate | 23% | 0.52 MPa | 0.60 MPa |
| Severe | 4% | 0.25 MPa | 0.62 MPa |

- **Validation:** standing in vivo pressure is 0.50–0.87 MPa (N17 [S: Wilke 1999]). The model gives p_NP = 0.6 MPa at ~760 N for a healthy disc, so the **Standing preset uses 750 N**.
- **Limitations:**
  - It ignores annulus hoop tension, endplate bulge (N17) and posture.
  - The severe NP share depends strongly on the assumed φ.
  - p_NP for a degenerated NP (which N17 says behaves "more like a solid") is an effective stress, not a true hydrostatic pressure.
- **Implementation:** algebraic, evaluated each time step with F(t). In cyclic mode it follows the instantaneous load.

### E5. Bending, torsion and shear (M4)

| Mode | Stiffness | Output | Strain proxy |
|---|---|---|---|
| Torsion | K_T = G_app·J/h₀, J = πr⁴/2 | θ = T/K_T | outer shear strain γ = θ·r/h₀ |
| Bending (flexion, extension, lateral) | K_B = E_b·I/h₀, I = πr⁴/4 | θ = M/K_B | edge strain ε_edge = θ·r/h₀ (compression on the bending side, tension on the opposite side) |
| Shear (anterior, posterior, lateral) | K_S = G_app·A/h₀ | δ = V/K_S | γ = δ/h₀ |
| Tension (axial) | K_ten = E_t·(1 − φ)·A/h₀ (AF only; NP does not resist tension) | d = F/K_ten | ε = d/h₀ |

- **Variables:** T and M (N·m); V (N); θ (rad, shown in °); δ (mm).
- **Basis:** G_app and E_b ranges from Ner [S]; elementary beam and shaft formulas [P, standard mechanics, not from the references].
- **Sanity check:** at 10 N·m, healthy torsion gives **2.1°** and 9.0% outer shear strain. At 7.5 N·m (the common test moment in N17's Table 2), bending gives **2.7°**. Both are physiological orders of magnitude.
- **Assumptions [P]:**
  - Linear and elastic: no time dependence for these modes, since the references give no creep data for them.
  - Flexion, extension and lateral bending all use the same K_B.
  - Degeneration does not change K_T or K_B, which are evaluated at the healthy h₀ to avoid an artificial height-stiffening effect.
- **Why no degeneration effect:** N17 reports that motion-segment bending stiffness *falls* with degeneration because the **ligaments become slack**, and the ligaments are outside this disc-only model. The model instead shows that the *same* angle produces **larger edge strain** in a shorter degenerated disc (ε_edge ∝ 1/h₀). That effect follows directly from the geometry.
- **Limitations:**
  - It doesn't reproduce N17's stiffness ordering (axial rotation > extension > lateral bending > flexion). That ordering will be stated in the ⓘ panel.
  - No facet joints, ligaments or coupled motions.
  - Tension uses an AF tissue modulus, not whole-disc data.
- **Implementation:** algebraic. Combined presets (such as Lifting = compression + flexion) superpose E2 and E5 linearly [P].

### E6. Radial bulge (M5)

> Δr_AF = ν_AF·ε_z·r,  ε_z = d/h₀

The NP's lateral push is drawn from ν_NP on the inner boundary.

- **Basis:** Ner: compression narrows the disc and the NP bulges outward [R, qualitative]. The ν values come from E [S].
- **Assumptions:** small-strain Poisson relation and linear elasticity [P]. Disc compressibility is not modeled.
- **Limitations:** real bulge is nonuniform: greater anteriorly in lower lumbar discs (N17 [S: Koeller 1984a]). This is purely geometric.
- **Implementation:** drives the SVG outline. The visual scale (5× or true) multiplies Δr and d for **display only**.

### E7. Hydration index (M6, labeled illustrative)

> W(t) = [W₀·V₀ − A·(x₁ + x₂)] / [V₀ − A·d(t)],  V₀ = A·h₀,  W₀ = φ·W_NP + (1 − φ)·W_AF

- **Basis:** O's authors attribute the viscous creep components to fluid flow out of the disc [R, interpretation]. Water content values come from N17 [S].
- **Assumptions [P]:** viscous displacement × area = volume of water lost; the elastic part loses no fluid.
- **Limitations:** an index, not a measured water content. It ignores fluid redistribution between NP and AF, and osmotic or fixed-charge effects (V, Baldoni & Gu 2019).
- **Implementation:** derived from the E2 states and shown in the 4th graph with an "illustrative" tag.

### E8. Stress distribution map (M7, labeled illustrative)

Each SVG region is colored on a single-hue blue scale by:

| Region | Stress shown |
|---|---|
| NP | p_NP (E4) |
| AF, axial | σ_AF (E4), plus the bending gradient σ_b = M·y/I and the torsion shear τ = T·ρ/J |
| Inner AF, hoop tension | σ_hoop ≈ p_NP·r_NP/t_AF (thin-wall pressure-vessel formula [P]) |

- **Basis:**
  - V [S: Lotz 1998]: AF stress moves from inner to outer with load and degeneration.
  - J [R, intro]: the degenerated AF carries compression rather than NP-driven tension.
  - The model produces this shift on its own: p_NP falls, so inner-AF hoop stress falls, while σ_AF rises.
- **Limitations:** no FE stress field. Colors are relative and region-averaged.

### E9. Damage index (M8, explicitly educational, not predictive)

> per load cycle (or per minute of sustained load): ΔD = (ε_post/ε_y)^m / N_ref
>
> ε_post = ν_AF·ε_z + ε_edge,tension-side,posterior + c_T·γ

- Herniation is drawn when D ≥ 1: the NP extrudes posterolaterally.
- **Variables:** D (0–1, shown as %); ε_post = posterior AF strain proxy; ε_y = reference strain (§2c); m = 4; N_ref = 2000; c_T = 0.5 [all P, chosen so that a "Lifting" cyclic preset reaches herniation within a few thousand cycles for a degenerated disc but not a healthy one].
- **Basis (qualitative only):**
  - N17 [S: Adams & Hutton 1982, 1985]: herniation needs combined flexion + compression; fatigue failure exists.
  - Axial rotation increases posterior vulnerability (N17 [S]).
  - Degenerated AF is weaker in tension (N17 [S: Shan 2015]).
  - AF yield strain is 20–30% (Ner [S]).
- **Assumptions:** a power-law fatigue accumulation of the Miner's-rule type [P]. **No reference provides cycles-to-failure or herniation thresholds.**
- **Display:** a persistent banner: "Educational approximation, not a predictive failure model."
- **Limitations:**
  - No endplate failure (N17: compressive overload damages the endplate first).
  - No loading-rate effect.
  - No healing.

---

## 4. Outputs

| Output | From | Graph? | Readout | Confidence |
|---|---|---|---|---|
| Disc height h(t), Δh | E2 | ✅ Height vs time | mm and % | **Data-based** (O, E) |
| Axial strain ε_z | E2 | ✅ Strain vs time | % | Data-based |
| NP pressure p_NP | E4 | ✅ NP pressure vs time | MPa | Calibrated (Wilke range) |
| AF axial stress, NP/AF load share | E4 | readout | MPa, % | Direction supported; magnitude [P] |
| Rotation / translation | E5 | readout | °, mm | Order of magnitude |
| Radial bulge | E6 | animation | mm | [P] |
| Hydration index | E7 | ✅ 4th graph ("illustrative") | % | Illustrative |
| Stress map | E8 | overlay | relative | Illustrative |
| Damage index | E9 | meter | % | Illustrative |
| Tissue relaxation σ(t) | E3 | replaces the Strain graph during the preset | MPa, normalized | Data-based (E) |

---

## 5. Presets (default inputs)

| Preset | Inputs | Basis |
|---|---|---|
| **Standing** (default) | compression 750 N, single, 4 h load, 8 h recovery | p_NP ≈ 0.6 MPa, within Wilke 1999 standing range (N17) [P calibration]. O used 4 h creep |
| **Lifting** | compression 2000 N + flexion 7.5 N·m, cyclic 0.5 Hz, 30 min | 2000 N = O's ramp peak; 7.5 N·m = common test moment (N17 Table 2); 0.5 Hz recommended in N20 |
| **Bending forward** | compression 750 N + flexion 7.5 N·m, single, 30 min | as above |
| **Twisting** | compression 750 N + torsion 7.5 N·m, single, 30 min | torsion + compression linked to degeneration (V [S: Marras 1995]) |
| **Run creep test** | compression 1000 N, 4 h, 24 h recovery, then reload 4 h | **reproduces O's protocol** |
| **Run relaxation test** | 5% step strain, 1800 s, NP + AF sites | **reproduces E's protocol** |

**Slider ranges [P, bounded by the references]**

| Control | Range | Basis |
|---|---|---|
| Compression | 0–3000 N | Wilke 1999 peak of 2.3 MPa ≈ 2900 N healthy in this model |
| Tension / shear | 0–500 N | [P] |
| Bending / torsion | 0–15 N·m | N17 Table 2 tests mostly 7.5–10 N·m |
| Duration | 1 s – 8 h | [P] |
| Recovery | 0–24 h | O |
| Cyclic frequency | 0.1–5 Hz | N20 tested 0.05–5 Hz |
| Severity | 0–100% | — |
| Nucleus loss λ | 0–100% | — |

---

## 6. Comparison mode

- **Same inputs, two parameter sets:** Healthy (s = 0) vs Degenerated (s = the user's severity, 60% by default). Every difference in output comes **only** from §2 parameters.
- **Parameter chip:** a small "Model parameters" chip lists the degeneration settings used (h₀, φ, H_NP, H_AF, τ₁, a₁, a_E, a₂, ρ). This answers the requirement that students can see the simplified degeneration parameters, and why "this is one possible degenerated disc, not all of them".
- **Auto-explanation:** rule-based text compares the two runs. For example: "The degenerated disc lost X% more height because its fast (nucleus) response is larger and slower (O'Connell 2011); its nucleus carries Y% of the load vs Z% in the healthy disc, so NP pressure is lower and the annulus is stressed more (Newell 2017)."

---

## 7. Built-in validation checks (run as automated tests in Prompt 9)

| Check | Model | Reference value |
|---|---|---|
| O median parameters, 1000 N: equilibrium displacement | 3.24 mm | 3.29 mm (O Table 1; the 0.05 mm gap is from medians not adding exactly) ✅ |
| Fraction of equilibrium reached at 4 h | 87% | 86% (O) ✅ |
| Healthy p_NP at the Standing preset | 0.6 MPa | 0.50–0.87 MPa (Wilke via N17) ✅ |
| Prony G(0) = 1 + 3g vs measured peak/equilibrium | NP healthy 1.33, NP severe 1.51 | 1.35, 1.59 (E; pooled across regions) ✅ approximately |
| Healthy torsion at 10 N·m | 2.1° | physiological order; Volz cites "normally no greater than 9" (unit unverified) |
| Healthy equilibrium creep strain at 1000 N | 29% | O reports ~30% axial compression after 4 h ✅ |
| Degenerated vs healthy (directions) | more creep strain, slower fast response, lower p_NP, higher σ_AF, less recovery | all directions match O / N17 / E ✅ |

---

## 8. Summary of assumptions (shown on the Model Documentation page)

1. **Linear in load** for all modes, although the real disc is nonlinear.
2. **Healthy and severe are extrapolated** from O's grade 1.8–3.4 sample, using the quartile mapping.
3. **Disc-only model:** no facets, ligaments or muscles. So, unlike real motion segments, bending stiffness doesn't change with degeneration.
4. **Two-column NP/AF load sharing**, with a fixed split over time.
5. **Midpoint values** are used where the references give ranges (G_app, E_b, φ).
6. **Hydration, the stress map and the damage index are illustrative.** They don't come from measured models.
7. **Herniation** is NP loss scaled linearly to Joshi's full-denucleation stiffness.
8. **Room-temperature, ex vivo** data. Diurnal in vivo loading is a steady state, not an equilibrium (O).

## 9. Implementation files (Prompt 4)

```
src/models/discParameters.ts   tables from §2, each value with {value, unit, source, tag}
src/models/viscoelasticity.ts  E2 creep/recovery states, E3 Prony relaxation
src/models/mechanics.ts        E4 load sharing, E5 bending/torsion/shear, E6 bulge
src/models/hydration.ts        E7
src/models/damageModel.ts      E9 (+ E8 stress-map values)
src/models/simulate.ts         loadHistory (E1) + time stepping → output arrays
src/models/__tests__/          §7 validation checks as unit tests
```

---

## 10. Implementation notes (Prompt 4, 2026-11-14): changes from the approved spec

| Item | Spec said | Implemented | Why |
|---|---|---|---|
| Herniation stiffness in E2 | amplitudes × κ | amplitudes **÷ κ** | κ < 1 is a *stiffness* factor, so displacement must grow; the spec had a typo |
| Herniated φ | 0.07 | φ(s = 0.7) × (1 − λ) = 0.13 at λ = 0.3 | consistent with the formula |
| Tension stiffness | AF axial tensile modulus (0.82 MPa) | O'Connell elastic stiffness, elastic only | the tissue modulus gave about 60% strain at 500 N, which is implausible; no whole-disc tension data exist in the references [P] |
| Damage N_ref | 2000 | **4500** | calibrated so the Lifting preset herniates a 60%-degenerated disc (~26 min) but not a healthy one (13% after 30 min) |
| Visual magnification | 5× | **2×** | creep strains reach 20–30%, so 5× collapsed the drawing; 2× keeps small effects visible |
| Playback speeds | 1, 10, 60, 600× | adds **3600×** | the creep-test preset is 56 h long |
| Compression slider max | 3000 N | **2000 N** | the largest load in the source creep data; a warning appears above 35% strain |

### Added 2026-11-14: Schmorl's node condition (requested after Prompt 8)

| Item | Implementation | Basis |
|---|---|---|
| Mechanism | nucleus material pushed **vertically** through a damaged bony endplate into the vertebral body | Newell 2017 [S: Adams & Dolan 2012; Brinckmann 1988; Hamanishi 1994]: compressive overload damages the bony endplate first |
| Surrounding disc | healthy parameters (s = 0) | overload, not degeneration, is the described cause [P] |
| Nucleus-loss slider λ | same Joshi stiffness scaling as Herniated (κ = 1 − 0.56λ); NP area φ × (1 − λ) | Joshi 2006 [R] + [P] |
| NP decompression | H_NP × (1 − λ), applied to **both** Herniated and Schmorl's node | Newell 2017 [S]: "decompression of the NP" [P magnitude] |
| Drawing location | into the vertebra **below** the disc (that vertebra's cranial endplate) | Newell 2017 [S: Zhao 2009]: failure is more common in the weaker cranial bony endplate |
| Result at 750 N (Standing, λ = 0.3) | NP pressure 0.51 vs 0.59 MPa healthy; strain 11.0% vs 9.1% early in loading | model output |

**Revision (2026-11-14, by request):** the Schmorl's node condition now uses the same degenerated, herniated disc as the Herniated condition (s = 0.7, grey appearance, posterior extrusion) **plus** the vertical node, so the "Surrounding disc: healthy parameters" row above no longer applies. This is a presentation choice [P]. The nucleus-loss slider drives both extrusions and the stiffness/decompression scaling. The "Anterior" label in the top-view inset was also given fixed clearance, and the inset bulge is capped at 9 px (drawing only).
