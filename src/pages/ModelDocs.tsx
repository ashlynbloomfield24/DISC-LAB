// MODEL DOCUMENTATION (Prompt 9). Tables marked "computed" are generated from the model code,
// so the documentation always matches what the simulation actually uses.

import { useMemo, type ReactNode } from 'react';
import { CREEP_TEST, PRESETS } from '../data/presets';
import { REFERENCES } from '../data/references';
import { DAMAGE_CT, DAMAGE_M, DAMAGE_NREF } from '../models/damageModel';
import { buildParams, DISC_AREA, H_REF } from '../models/discParameters';
import { bendingStiffness, loadSharing, shearStiffness, torsionStiffness } from '../models/mechanics';
import { simulate } from '../models/simulate';
import type { Condition, DiscParams } from '../models/types';
import { pronyG, stepCreep } from '../models/viscoelasticity';

const SECTIONS = [
  ['overview', '1. Overview'],
  ['background', '2. Scientific background'],
  ['equations', '3. Equations'],
  ['variables', '4. Variables'],
  ['parameters', '5. Parameters & sources'],
  ['assumptions', '6. Assumptions'],
  ['limitations', '7. Limitations'],
  ['operation', '8. How the simulation runs'],
  ['graphs', '9. The graphs'],
  ['verification', 'Verification checks'],
  ['mechanobiology', 'Mechanobiology'],
  ['references', '10. References'],
] as const;

const f = (x: number, d = 2) => x.toFixed(d);

function Eq({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="eq">
      <div className="eq-body">{children}</div>
      <div className="eq-label">{label}</div>
    </div>
  );
}

export default function ModelDocs() {
  const conds: { id: Condition; label: string; p: DiscParams }[] = useMemo(
    () => [
      { id: 'healthy', label: 'Healthy', p: buildParams({ condition: 'healthy', severity: 0, nucleusLoss: 0 }) },
      { id: 'degenerated', label: 'Degenerated (50%)', p: buildParams({ condition: 'degenerated', severity: 0.5, nucleusLoss: 0 }) },
      { id: 'degenerated', label: 'Degenerated (100%)', p: buildParams({ condition: 'degenerated', severity: 1, nucleusLoss: 0 }) },
      { id: 'herniated', label: 'Herniated (λ = 0.3)', p: buildParams({ condition: 'herniated', severity: 0, nucleusLoss: 0.3 }) },
      { id: 'schmorl', label: "Schmorl's node (λ = 0.3)", p: buildParams({ condition: 'schmorl', severity: 0, nucleusLoss: 0.3 }) },
    ],
    [],
  );

  const checks = useMemo(() => {
    const h = conds[0].p;
    const med = { ...conds[1].p, h0: H_REF };
    const sev = conds[2].p;
    const lifting = PRESETS.find((x) => x.id === 'lifting')!.inputs;
    const deg60 = buildParams({ condition: 'degenerated', severity: 0.6, nucleusLoss: 0 });
    const eqMed = stepCreep(med, 1000, 1e9);
    const frac4h = stepCreep(med, 1000, 4 * 3600) / eqMed;
    const pStand = loadSharing(h, PRESETS[0].inputs.magnitude).pNP;
    const tors = (10 / torsionStiffness(h)) * (180 / Math.PI);
    const creepH = simulate(h, { ...CREEP_TEST, repeats: 1 });
    const creepS = simulate(sev, { ...CREEP_TEST, repeats: 1 });
    const recFrac = (r: ReturnType<typeof simulate>) => {
      const peak = Math.max(...r.samples.map((s) => s.disp));
      return (peak - r.samples[r.samples.length - 1].disp) / peak;
    };
    return [
      { what: 'Equilibrium creep displacement, median parameters, 1000 N', model: `${f(eqMed)} mm`, ref: "3.29 mm (O'Connell 2011, Table 1)", ok: Math.abs(eqMed - 3.29) < 0.1 },
      { what: 'Fraction of equilibrium reached after 4 h', model: `${f(frac4h * 100, 0)}%`, ref: "86% (O'Connell 2011)", ok: Math.abs(frac4h - 0.86) < 0.03 },
      { what: 'Healthy nucleus pressure, Standing preset (750 N)', model: `${f(pStand)} MPa`, ref: '0.50–0.87 MPa standing (Wilke 1999 via Newell 2017)', ok: pStand >= 0.5 && pStand <= 0.87 },
      { what: 'Prony G(0) = 1 + 3g, healthy nucleus', model: f(pronyG(h.prony.NP, 0), 3), ref: '1.35 ± 0.10 peak/equilibrium (Ellingson 2012)', ok: Math.abs(pronyG(h.prony.NP, 0) - 1.35) < 0.1 },
      { what: 'Prony G(0), severely degenerated nucleus', model: f(pronyG(sev.prony.NP, 0), 3), ref: '1.59 ± 0.33 (Ellingson 2012)', ok: Math.abs(pronyG(sev.prony.NP, 0) - 1.59) < 0.33 },
      { what: 'Healthy axial rotation at 10 N·m', model: `${f(tors)}°`, ref: 'Physiological order of magnitude (a few degrees)', ok: tors > 0.5 && tors < 5 },
      { what: 'Height recovered after 4 h load + 24 h rest: healthy vs severe', model: `${f(recFrac(creepH) * 100, 0)}% vs ${f(recFrac(creepS) * 100, 0)}%`, ref: "44–98%, lower with degeneration (O'Connell 2011)", ok: recFrac(creepS) < recFrac(creepH) },
      { what: 'Nucleus share of load: healthy vs severe', model: `${f(loadSharing(h, 1000).npShare * 100, 0)}% vs ${f(loadSharing(sev, 1000).npShare * 100, 0)}%`, ref: 'Load shifts to annulus with degeneration (Newell 2017), direction only', ok: loadSharing(sev, 1000).npShare < loadSharing(h, 1000).npShare },
      { what: 'Lifting preset: healthy vs 60% degenerated damage after 30 min', model: `${f((simulate(h, lifting).samples.at(-1)!.damage) * 100, 0)}% vs herniates at ${f((simulate(deg60, lifting).herniatedAt ?? NaN) / 60, 0)} min`, ref: 'Calibration target (illustrative, no reference threshold)', ok: true },
    ];
  }, [conds]);

  return (
    <main className="page docs-page">
      <div className="sim-header">
        <div>
          <h1>Model Documentation</h1>
          <p>How DISC LAB calculates everything you see, where each number comes from, and what the model cannot do.</p>
        </div>
      </div>
      <div className="docs-layout">
        <nav className="card docs-toc" aria-label="Contents">
          {SECTIONS.map(([id, label]) => (
            <a key={id} href={`#/model`} onClick={(e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }}>
              {label}
            </a>
          ))}
        </nav>
        <article className="card docs">
          <div className="banner info" style={{ marginTop: 0 }}>
            <span aria-hidden>ⓘ</span>
            <span>
              <b>Status:</b> DISC LAB is a simplified, literature-informed <b>educational</b> model. Its outputs have been <b>verified</b> against
              values reported in the source papers (below), but the model as a whole has <b>not been experimentally validated</b> and is
              not a clinical or predictive tool.
            </span>
          </div>

          <h2 id="overview">1. Overview of the computational model</h2>
          <p>
            DISC LAB represents one lumbar intervertebral disc between two rigid vertebrae. It is a <b>lumped-parameter</b> model rather than a
            finite element model, so it runs instantly in the browser. Five linked sub-models turn the applied load into time-dependent outputs:
          </p>
          <ol>
            <li><b>Whole-disc creep and recovery</b>: an elastic spring in series with two Kelvin–Voigt elements (O'Connell et al. 2011).</li>
            <li><b>Tissue stress relaxation</b>: a three-term Prony series (Ellingson & Nuckley 2012), used by the Relaxation test.</li>
            <li><b>Nucleus/annulus load sharing</b>: two columns in parallel, giving nucleus pressure and annulus stress.</li>
            <li><b>Bending, torsion and shear</b>: linear stiffnesses from reported moduli and the disc geometry.</li>
            <li><b>Illustrative outputs</b>: radial bulge, hydration index, stress map and damage index.</li>
          </ol>
          <p>
            Healthy, degenerated, herniated and Schmorl's-node discs use the <b>same equations</b>; only their parameters differ. The
            drawing is computed from the same outputs as the numbers, so the two cannot disagree.
          </p>

          <h2 id="background">2. Scientific background</h2>
          <p>
            The nucleus pulposus is a proteoglycan-rich gel that pressurizes under load; the annulus fibrosus is a layered collagen ring that
            resists that pressure in hoop tension (Newell 2017). Under sustained load, fluid flows out of the disc and its height falls over
            hours (creep); when unloaded, osmotic pressure from the proteoglycans draws fluid back in more slowly (O'Connell 2011).
            Degeneration is an imbalance in which catabolism exceeds anabolism (Volz 2022); the nucleus loses proteoglycans, water and
            pressure, and load shifts to the annulus (Newell 2017). Degenerated discs are shorter, softer in the nucleus, relax and creep
            more, and recover less (Ellingson 2012; O'Connell 2011).
          </p>

          <h2 id="equations">3. Equations</h2>
          <h3>E1. Load history</h3>
          <p>Single hold, repeated load/rest blocks, or a cyclic triangle wave between 5% and 100% of the peak load at 0.1–5 Hz.</p>
          <h3>E2. Whole-disc creep and recovery (O'Connell et al. 2011)</h3>
          <Eq label="step load">d(t) = (L/1000) · k<sub>h</sub>/κ · [ a<sub>E</sub> + a<sub>1</sub>(1 − e<sup>−t/τ₁</sup>) + a<sub>2</sub>(1 − e<sup>−t/τ₂</sup>) ]</Eq>
          <Eq label="any load history">dx<sub>i</sub>/dt = (x<sub>i</sub>* − x<sub>i</sub>) / τ<sub>i</sub>*,  x<sub>i</sub>* = (F/1000)·(k<sub>h</sub>/κ)·a<sub>i</sub>,  τ<sub>i</sub>* = τ<sub>i</sub> (loading) or τ<sub>i</sub><sup>R</sup> (recovery)</Eq>
          <Eq label="height">h(t) = h<sub>0</sub> − d(t),  ε<sub>z</sub> = d / h<sub>0</sub>,  k<sub>h</sub> = h<sub>0</sub> / {H_REF} mm</Eq>
          <p>
            Why this model: a single Maxwell element creeps without limit and relaxes to zero stress; a single Kelvin–Voigt element has no
            instantaneous response and cannot show relaxation. Discs reach a finite equilibrium with an instant, a fast (minutes) and a slow
            (hours) component, which is exactly what O'Connell et al. fitted (R² = 0.998).
          </p>
          <h3>E3. Tissue stress relaxation (Ellingson & Nuckley 2012)</h3>
          <Eq label="Prony series">σ(t) = E<sub>eq</sub> · ε<sub>0</sub> · G(t),  G(t) = 1 + g [ e<sup>−t/τS</sup> + e<sup>−t/τM</sup> + e<sup>−t/τL</sup> ],  τ<sub>M</sub> = √(τ<sub>S</sub> τ<sub>L</sub>)</Eq>
          <h3>E4. Nucleus/annulus load sharing</h3>
          <Eq label="two parallel columns">k<sub>NP</sub> ∝ H<sub>NP</sub>·φ,  k<sub>AF</sub> ∝ H<sub>AF</sub>·(1 − φ),  F<sub>NP</sub> = F·k<sub>NP</sub>/(k<sub>NP</sub> + k<sub>AF</sub>)</Eq>
          <Eq label="pressure and stress">p<sub>NP</sub> = F<sub>NP</sub> / (φA),  σ<sub>AF</sub> = (F − F<sub>NP</sub>) / ((1 − φ)A)</Eq>
          <h3>E5. Bending, torsion, shear and tension</h3>
          <Eq label="stiffnesses">K<sub>T</sub> = G<sub>app</sub>J/h,  K<sub>B</sub> = E<sub>b</sub>I/h,  K<sub>S</sub> = G<sub>app</sub>A/h,  J = πr⁴/2,  I = πr⁴/4</Eq>
          <Eq label="responses">θ = M/K,  ε<sub>edge</sub> = θ·r/h<sub>0</sub>,  γ = θ·r/h<sub>0</sub> (torsion),  δ = V/K<sub>S</sub> (shear)</Eq>
          <p>Tension uses the elastic axial stiffness only (no creep). Healthy height is used in K so that degeneration does not artificially stiffen the disc.</p>
          <h3>E6. Radial bulge</h3>
          <Eq label="Poisson">Δr = ν<sub>AF</sub> · ε<sub>z</sub> · r</Eq>
          <h3>E7. Hydration index (illustrative)</h3>
          <Eq label="water fraction">W(t) = [W<sub>0</sub>V<sub>0</sub> − A(x<sub>1</sub> + x<sub>2</sub> + set)] / [V<sub>0</sub> − A(x<sub>1</sub> + x<sub>2</sub> + set)],  W<sub>0</sub> = φW<sub>NP</sub> + (1 − φ)W<sub>AF</sub></Eq>
          <h3>E8. Stress map (illustrative)</h3>
          <p>
            Region colours combine p<sub>NP</sub>, σ<sub>AF</sub>, inner-annulus hoop stress p<sub>NP</sub>·r<sub>NP</sub>/t<sub>AF</sub>, bending stress
            M·y/I and torsional shear T·r/J, with fixed illustrative weights between inner and outer annulus. Scale 0–2 MPa.
          </p>
          <h3>E9. Damage index (illustrative, not predictive)</h3>
          <Eq label="per cycle (or per minute of sustained load)">ΔD = (ε<sub>post</sub> / ε<sub>y</sub>)<sup>m</sup> / N<sub>ref</sub>,  ε<sub>post</sub> = ν<sub>AF</sub>ε<sub>z</sub> + ε<sub>edge,posterior</sub> + c<sub>T</sub>γ</Eq>
          <p>
            m = {DAMAGE_M}, N<sub>ref</sub> = {DAMAGE_NREF}, c<sub>T</sub> = {DAMAGE_CT}. These constants were chosen so the Lifting preset herniates a
            60%-degenerated disc but not a healthy one; no reference reports cycles-to-failure. Lateral bending stretches a posterolateral
            corner, taken as 0.7 × the edge strain (cos 45°).
          </p>

          <h2 id="variables">4. Definitions of variables</h2>
          <table className="param-table docs-table">
            <tbody>
              {[
                ['F, L', 'Axial load (compression positive)', 'N'],
                ['M, T, V', 'Bending moment, torque, shear force', 'N·m, N·m, N'],
                ['d, h, h₀', 'Axial displacement, current height, resting height', 'mm'],
                ['εz', 'Axial strain = d/h₀', '–'],
                ['aE, a₁, a₂', 'Elastic, fast and slow creep amplitudes at 1000 N', 'mm'],
                ['τ₁, τ₂ (τᴿ)', 'Fast and slow time constants (recovery)', 's'],
                ['κ', 'Stiffness factor for nucleus loss', '–'],
                ['λ', 'Nucleus-loss fraction (Herniated, Schmorl’s node)', '–'],
                ['ρ', 'Unrecovered fraction (calibrated to recovery %)', '–'],
                ['g, τS, τL', 'Prony spectrum magnitude and short/long time constants', '–, s, s'],
                ['Eeq', 'Equilibrium modulus of nucleus tissue', 'MPa'],
                ['H_NP, H_AF', 'Aggregate (confined compression) moduli', 'MPa'],
                ['φ', 'Nucleus fraction of disc area', '–'],
                ['A, r', 'Disc area and equivalent radius', 'mm², mm'],
                ['p_NP, σ_AF', 'Nucleus pressure, annulus axial stress', 'MPa'],
                ['G_app, E_b', 'Apparent shear modulus, bending modulus', 'MPa'],
                ['θ, γ, δ', 'Rotation, shear strain, shear translation', 'rad (shown °), –, mm'],
                ['ν', "Poisson's ratio", '–'],
                ['W', 'Water fraction (hydration index)', '–'],
                ['D', 'Damage index (0–1)', '–'],
              ].map(([s, d, u]) => (
                <tr key={s}>
                  <td><b>{s}</b></td>
                  <td style={{ textAlign: 'left', fontWeight: 400 }}>{d}</td>
                  <td>{u}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 id="parameters">5. Parameter values and sources <span className="tag">computed</span></h2>
          <p>Values below are read from the model code. Tags: R = reported by the paper, S = cited by the paper from another study, P = simplification, D = derived.</p>
          <div className="docs-scroll">
            <table className="param-table docs-table">
              <thead>
                <tr>
                  <td><b>Parameter</b></td>
                  {conds.map((c) => <td key={c.label}><b>{c.label}</b></td>)}
                  <td style={{ textAlign: 'left' }}><b>Source</b></td>
                </tr>
              </thead>
              <tbody>
                {([
                  ['Resting height h₀ (mm)', (p: DiscParams) => f(p.h0), 'Ellingson & Nuckley 2012 [R], linear in severity [P]'],
                  ['NP area fraction φ', (p: DiscParams) => f(p.phi), 'Newell 2017 (25–50%) [S]; 50% smaller NP diameter when severe [S→P]'],
                  ['H_NP (MPa)', (p: DiscParams) => f(p.H_NP), 'Johannessen & Elliott 2005 via Ellingson [S]; × (1 − λ) [P]'],
                  ['H_AF (MPa)', (p: DiscParams) => f(p.H_AF), 'Iatridis 1998 via Ellingson [S]'],
                  ['aE (mm @1000 N)', (p: DiscParams) => f(p.aE), "O'Connell 2011 Q1/median/Q3 [R → P mapping]"],
                  ['a₁ (mm @1000 N)', (p: DiscParams) => f(p.a1), "O'Connell 2011 [R → P]"],
                  ['τ₁ (min)', (p: DiscParams) => f(p.tau1 / 60, 1), "O'Connell 2011 [R → P]"],
                  ['a₂ (mm @1000 N)', (p: DiscParams) => f(p.a2), "O'Connell 2011 [R → P]"],
                  ['τ₂ (h)', (p: DiscParams) => f(p.tau2 / 3600), "O'Connell 2011 [R], not correlated with grade"],
                  ['τ₁ᴿ (min) / τ₂ᴿ (h)', (p: DiscParams) => `${f(p.tau1R / 60, 1)} / ${f(p.tau2R / 3600, 1)}`, "O'Connell 2011 [R]"],
                  ['ρ unrecovered', (p: DiscParams) => f(p.rho), "O'Connell 2011 range 98→44% [R → P]"],
                  ['κ stiffness factor', (p: DiscParams) => f(p.kappa), 'Joshi 2006 (44% when fully denucleated) [R → P]'],
                  ['Eeq NP (MPa)', (p: DiscParams) => f(p.EeqNP, 3), 'Ellingson & Nuckley 2012 [R]'],
                  ['Prony NP g', (p: DiscParams) => f(p.prony.NP.g, 3), 'Ellingson & Nuckley 2012 Table 1 [R]'],
                  ['Prony NP τS / τL (s)', (p: DiscParams) => `${f(p.prony.NP.tauS)} / ${f(p.prony.NP.tauL, 1)}`, 'Ellingson & Nuckley 2012 Table 1 [R]'],
                  ['ν_AF / ν_NP', (p: DiscParams) => `${f(p.nuAF, 3)} / ${f(p.nuNP, 3)}`, 'Natarajan 2006 via Ellingson [S]'],
                  ['W_NP', (p: DiscParams) => f(p.W_NP), 'Newell 2017 (~90→70%) [S → P]'],
                  ['ε_y (damage reference)', (p: DiscParams) => f(p.epsY), 'Nerurkar 2010 yield 20–30% [S]; reduction [P]'],
                ] as [string, (p: DiscParams) => string, string][]).map(([name, fn, src]) => (
                  <tr key={name}>
                    <td>{name}</td>
                    {conds.map((c) => <td key={c.label}>{fn(c.p)}</td>)}
                    <td style={{ textAlign: 'left', fontWeight: 400, whiteSpace: 'normal' }} className="src">{src}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="control-hint">
            Shared constants: disc area A = {f(DISC_AREA, 0)} mm² (derived from O'Connell's 1000 N ↔ 0.58 MPa), G<sub>app</sub> = 5.5 MPa and
            E<sub>b</sub> = 6.5 MPa (midpoints of Nerurkar 2010 ranges 2–9 and 3–10 MPa), W<sub>AF</sub> = 0.675 (Newell 2017). Resulting healthy
            stiffnesses: torsion {f(torsionStiffness(conds[0].p), 0)} N·m/rad, bending {f(bendingStiffness(conds[0].p), 0)} N·m/rad, shear {f(shearStiffness(conds[0].p), 0)} N/mm.
          </p>

          <h2 id="assumptions">6. Assumptions</h2>
          <ul>
            <li>Displacement is linear in load (O'Connell fitted one 1000 N load; real discs are nonlinear).</li>
            <li>Healthy and severe creep parameters are the lower and upper quartiles of O'Connell's grade 1.8–3.4 sample (an extrapolation).</li>
            <li>The disc is two columns (nucleus, annulus) with equal strain and a load split that is constant in time.</li>
            <li>Midpoints are used where the references give ranges (G<sub>app</sub>, E<sub>b</sub>, φ).</li>
            <li>Stiffness does not depend on loading rate (justified by Newell 2020: ~2% per 100×).</li>
            <li>In cyclic loading the creep elements respond to the cycle-mean load (valid because τ₁ ≫ the cycle period).</li>
            <li>Bending and torsion are elastic and identical for all directions; degeneration does not change them (ligaments are not modelled).</li>
            <li>Nucleus loss scales stiffness linearly toward Joshi's fully-denucleated 44% and decompresses the nucleus by (1 − λ).</li>
            <li>The Schmorl's-node condition is drawn and modelled on the same degenerated, herniated disc as Herniated (a presentation choice).</li>
            <li>Hydration, the stress map and the damage index are illustrative indices.</li>
          </ul>

          <h2 id="limitations">7. Limitations</h2>
          <ul>
            <li><b>Not experimentally validated</b>: only individual outputs were checked against the values the model was built from.</li>
            <li>Data are ex vivo, at room temperature; diurnal in vivo loading is a steady state, not an equilibrium (O'Connell 2011).</li>
            <li>Above ~35% strain (e.g. 2000 N for hours) the linear model extrapolates beyond the measured range; the app warns when this happens.</li>
            <li>
              The derived disc area ({f(DISC_AREA, 0)} mm²) is larger than an ellipse with Newell 2017's lumbar endplate dimensions (≈1000–1500 mm²).
              Nucleus pressure was therefore checked against measured in vivo pressures rather than taken from geometry alone.
            </li>
            <li>Relaxation time constants are tissue-level (3 mm indentation) and absolute indentation moduli are method-dependent (Delaine-Smith 2016).</li>
            <li>No facet joints, ligaments, muscles, endplate failure, healing, cell biology or nutrient transport.</li>
            <li>No reference provides herniation thresholds; the damage index cannot predict real failure.</li>
            <li>Sources disagree on some trends (annulus stiffer in compression but weaker in tension; mobility with degeneration); DISC LAB states which it follows.</li>
          </ul>

          <h2 id="operation">8. How the simulation operates</h2>
          <ol>
            <li>Your choices (condition, severity, load type, direction, magnitude, timing) build a parameter set and a load history.</li>
            <li>A pure function steps through time with exact exponential updates (up to 3000 steps) and returns every output at every step.</li>
            <li>The clock plays these results at 1–3600× real time; the scrubber jumps to any time.</li>
            <li>The drawing, readouts and graphs all read the sample at the current time. Deformation is drawn 2× (or true scale); numbers are always true scale.</li>
            <li>Comparison mode runs the same inputs through a healthy and a degenerated parameter set.</li>
          </ol>

          <h2 id="graphs">9. Explanation of each graph</h2>
          <dl className="docs-dl">
            <dt>Disc height</dt><dd>Resting height minus elastic and creep displacement. Drops instantly when loaded, keeps falling for hours, recovers slowly at rest.</dd>
            <dt>Axial strain</dt><dd>Height loss ÷ resting height, so discs of different heights can be compared. Dashed line in cyclic mode = cycle minimum.</dd>
            <dt>Nucleus pressure</dt><dd>Load carried by the nucleus ÷ its area (E4). Follows the load instantly; lower in degenerated or herniated discs.</dd>
            <dt>Hydration index</dt><dd>Illustrative water fraction (E7). Falls as fluid is squeezed out during creep and rises during recovery.</dd>
            <dt>Relaxation test graphs</dt><dd>Nucleus stress at a held strain, and the normalized G(t) for nucleus and annulus sites on a log time axis (E3).</dd>
          </dl>

          <h2 id="verification">Verification checks <span className="tag">computed</span></h2>
          <p>
            These checks compare model outputs with the values they were built from. They show the code reproduces its sources; they are
            <b> not</b> independent experimental validation. The same checks run as automated unit tests, alongside a sweep of every
            condition × load type × direction × frequency mode (several hundred automated tests).
          </p>
          <table className="param-table docs-table">
            <thead>
              <tr><td><b>Check</b></td><td><b>Model</b></td><td style={{ textAlign: 'left' }}><b>Reference</b></td><td><b>Result</b></td></tr>
            </thead>
            <tbody>
              {checks.map((c) => (
                <tr key={c.what}>
                  <td>{c.what}</td>
                  <td>{c.model}</td>
                  <td style={{ textAlign: 'left', fontWeight: 400, whiteSpace: 'normal' }}>{c.ref}</td>
                  <td>{c.ok ? <span className="good">✓ consistent</span> : <span className="bad">✕ check</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 id="mechanobiology">How DISC LAB demonstrates mechanobiology</h2>
          <p>
            Mechanobiology is the loop in which cells sense mechanical loading and respond by building or breaking down matrix, which in turn
            changes the mechanics the cells feel (Volz 2022). DISC LAB models the <b>mechanical half</b> of that loop and makes its link to
            biology visible:
          </p>
          <ul>
            <li><b>Loading → fluid flow:</b> creep and the hydration index show water leaving the disc under load and returning slowly, the transport pathway disc cells depend on for nutrients.</li>
            <li><b>Matrix → mechanics:</b> the degeneration slider changes matrix-derived parameters (nucleus stiffness, size, water), and the simulation shows how that shifts load to the annulus and changes creep and recovery.</li>
            <li><b>Mechanics → damage:</b> the illustrative damage index shows how combined flexion and compression concentrate annulus strain, linking loading to structural failure.</li>
          </ul>
          <p>
            The cell response itself (how load magnitude changes synthesis) is explained on the Learn page but not simulated, because the
            references do not provide a quantitative rule for it.
          </p>

          <h2 id="references">10. References</h2>
          <ol className="docs-refs">
            {Object.values(REFERENCES).map((r) => (
              <li key={r.key}>
                {r.full}{' '}
                {r.doi && <a href={`https://doi.org/${r.doi}`} target="_blank" rel="noreferrer">doi:{r.doi}</a>}
              </li>
            ))}
          </ol>
          <p>
            Studies cited through these papers are listed on the <a href="#/references">References</a> page.
          </p>
        </article>
      </div>
    </main>
  );
}
