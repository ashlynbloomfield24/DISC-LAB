// Comparison mode: identical inputs, two parameter sets. Differences in output come ONLY
// from the parameters (buildParams). This module builds the comparison table and the
// automatically updated plain-language explanation.

import type { DiscParams, SimResult, SimSample } from './types';

export interface CompareRow {
  label: string;
  unit: string;
  healthy: number;
  degenerated: number;
  digits: number;
  illustrative?: boolean;
}

/** Fraction of the peak height loss (so far) that has been recovered at time t. */
export function recoveredFraction(res: SimResult, t: number): number | null {
  const upTo = res.samples.filter((s) => s.t <= t);
  if (!upTo.length) return null;
  const cur = upTo[upTo.length - 1];
  if (cur.loaded) return null;
  const peak = Math.max(...upTo.map((s) => s.disp));
  if (peak <= 1e-6) return null;
  return (peak - cur.disp) / peak;
}

export function compareRows(h: SimSample, d: SimSample, showDamage: boolean): CompareRow[] {
  const rows: CompareRow[] = [
    { label: 'Disc height', unit: 'mm', healthy: h.height, degenerated: d.height, digits: 2 },
    { label: 'Height loss', unit: 'mm', healthy: h.disp, degenerated: d.disp, digits: 2 },
    { label: 'Axial strain', unit: '%', healthy: h.strain * 100, degenerated: d.strain * 100, digits: 1 },
    { label: 'Nucleus pressure', unit: 'MPa', healthy: h.pNP, degenerated: d.pNP, digits: 2 },
    { label: 'Nucleus share of load', unit: '%', healthy: h.npShare * 100, degenerated: d.npShare * 100, digits: 0 },
    { label: 'Annulus stress', unit: 'MPa', healthy: h.sigmaAF, degenerated: d.sigmaAF, digits: 2 },
    { label: 'Radial bulge', unit: 'mm', healthy: h.bulge, degenerated: d.bulge, digits: 2 },
    { label: 'Hydration index', unit: '%', healthy: h.hydration * 100, degenerated: d.hydration * 100, digits: 1, illustrative: true },
  ];
  if (h.angle > 0 || d.angle > 0)
    rows.push({ label: 'Rotation angle', unit: '°', healthy: (h.angle * 180) / Math.PI, degenerated: (d.angle * 180) / Math.PI, digits: 2 });
  if (h.edgeStrain > 0 || d.edgeStrain > 0)
    rows.push({ label: 'Bending edge strain', unit: '%', healthy: h.edgeStrain * 100, degenerated: d.edgeStrain * 100, digits: 1 });
  if (showDamage)
    rows.push({ label: 'Damage index', unit: '%', healthy: h.damage * 100, degenerated: d.damage * 100, digits: 0, illustrative: true });
  return rows;
}

const pct = (x: number) => `${(x * 100).toFixed(0)}%`;

/**
 * Plain-language explanation, regenerated from the current outputs and parameters.
 * Each statement cites the reference that supports the mechanism.
 */
export function explainComparison(args: {
  pH: DiscParams;
  pD: DiscParams;
  h: SimSample;
  d: SimSample;
  resH: SimResult;
  resD: SimResult;
  t: number;
  showDamage: boolean;
  relaxation: boolean;
}): string[] {
  const { pH, pD, h, d, resH, resD, t, showDamage, relaxation } = args;
  const out: string[] = [];
  if (relaxation) {
    out.push(
      `Holding the same strain, the degenerated nucleus starts at a lower stress and relaxes by a larger fraction: its spectrum magnitude g is ${pD.prony.NP.g.toFixed(3)} vs ${pH.prony.NP.g.toFixed(3)}, and its equilibrium modulus is ${pD.EeqNP.toFixed(3)} vs ${pH.EeqNP.toFixed(3)} MPa (Ellingson & Nuckley 2012).`,
    );
    out.push('In the authors\' words, healthy discs encounter higher forces at the same strain and are able to maintain them; degenerated discs are not.');
    return out;
  }
  if (!h.loaded && h.disp < 1e-6 && d.disp < 1e-6) {
    out.push('Press play to apply the same load to both discs.');
    return out;
  }
  if (h.loaded) {
    out.push(
      `Under the same load, the degenerated disc is compressed by ${(d.strain * 100).toFixed(1)}% of its height vs ${(h.strain * 100).toFixed(1)}% for the healthy disc. ` +
        `The degenerated disc starts shorter (${pD.h0.toFixed(1)} vs ${pH.h0.toFixed(1)} mm; Ellingson & Nuckley 2012), and its fast, nucleus-related creep is larger and slower (τ₁ ${(pD.tau1 / 60).toFixed(1)} vs ${(pH.tau1 / 60).toFixed(1)} min; O'Connell et al. 2011).`,
    );
  } else {
    const rH = recoveredFraction(resH, t);
    const rD = recoveredFraction(resD, t);
    if (rH !== null && rD !== null)
      out.push(
        `During unloaded recovery the healthy disc has regained ${pct(rH)} of its peak height loss and the degenerated disc ${pct(rD)}. ` +
          `Recovery is slow for both (τ₁ᴿ ≈ 36 min, τ₂ᴿ ≈ 8 h), and degenerated discs recover a smaller fraction (O'Connell et al. 2011).`,
      );
  }
  if (h.pNP > 0.005) {
    out.push(
      `The degenerated nucleus carries only ${pct(d.npShare)} of the axial load vs ${pct(h.npShare)} in the healthy disc, so nucleus pressure is lower (${d.pNP.toFixed(2)} vs ${h.pNP.toFixed(2)} MPa) and the annulus is more stressed (${d.sigmaAF.toFixed(2)} vs ${h.sigmaAF.toFixed(2)} MPa). ` +
        `This follows from a softer, smaller nucleus and a stiffer annulus in compression (Newell et al. 2017; Ellingson & Nuckley 2012).`,
    );
  }
  if (h.edgeStrain > 0)
    out.push(
      `Bending tilts both discs by the same angle (${((h.angle * 180) / Math.PI).toFixed(2)}°) in this disc-only model, but the shorter degenerated disc stretches its annulus edge more (${(d.edgeStrain * 100).toFixed(1)}% vs ${(h.edgeStrain * 100).toFixed(1)}%).`,
    );
  if (showDamage)
    out.push(
      `The illustrative damage index is ${pct(d.damage)} vs ${pct(h.damage)}: the degenerated annulus is strained more and is assumed to tolerate less strain (an educational approximation).`,
    );
  return out;
}
