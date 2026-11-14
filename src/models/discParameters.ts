// Parameter sets for the three disc conditions.
// Every value is traceable to the reference review (tags: R = reported,
// S = secondary citation, P = proposed simplification, D = derived).

import type { DiscParams, DiscSelection, Prony } from './types';

export const H_REF = 8.86; // mm, O'Connell 2011 mean disc height (R)
export const DISC_AREA = 1000 / 0.58; // mm², O'Connell: 1000 N ↔ 0.58 MPa (D)
export const HERNIATED_SEVERITY = 0.7; // (P)
// Schmorl's node: vertical herniation through a damaged endplate (Newell 2017, citing Adams &
// Dolan 2012; Brinckmann 1988). Design choice (P): the Schmorl's node condition is shown on the same
// degenerated, posteriorly herniated disc as the Herniated condition, PLUS the vertical node. The
// nucleus-loss slider drives both, so the drawing and the numbers stay consistent.
export const SCHMORL_SEVERITY = HERNIATED_SEVERITY;

const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
/** Piecewise-linear through healthy (s=0), moderate (s=0.5), severe (s=1). */
const lerp3 = (h: number, m: number, sv: number, s: number) =>
  s <= 0.5 ? lerp(h, m, s / 0.5) : lerp(m, sv, (s - 0.5) / 0.5);
const lerpProny = (h: Prony, m: Prony, sv: Prony, s: number): Prony => ({
  g: lerp3(h.g, m.g, sv.g, s),
  tauS: lerp3(h.tauS, m.tauS, sv.tauS, s),
  tauL: lerp3(h.tauL, m.tauL, sv.tauL, s),
});

// Ellingson & Nuckley 2012, Table 1 (R)
export const PRONY_TABLE = {
  antAF: {
    healthy: { g: 0.074, tauS: 2.65, tauL: 45.6 },
    moderate: { g: 0.113, tauS: 2.72, tauL: 55.2 },
    severe: { g: 0.172, tauS: 2.76, tauL: 66.6 },
  },
  NP: {
    healthy: { g: 0.109, tauS: 2.65, tauL: 50.6 },
    moderate: { g: 0.095, tauS: 2.76, tauL: 48.3 },
    severe: { g: 0.169, tauS: 2.66, tauL: 32.9 },
  },
  latAF: {
    healthy: { g: 0.116, tauS: 2.57, tauL: 59.3 },
    moderate: { g: 0.12, tauS: 2.75, tauL: 54.2 },
    severe: { g: 0.131, tauS: 2.78, tauL: 90.0 },
  },
} as const;

// O'Connell 2011, Table 1, Creep 1: [Q1, median, Q3] (R), mapped to grades (P)
export const OCONNELL = {
  aE: [1.08, 1.44, 1.71],
  a1: [0.21, 0.29, 0.44],
  a2: [1.31, 1.51, 1.72],
  tau1Min: [6.12, 8.09, 11.75],
  tau2H: 3.07,
  tau1RMin: 35.8,
  tau2RH: 8.0,
} as const;

export function buildParams(sel: DiscSelection): DiscParams {
  const herniated = sel.condition === 'herniated';
  const schmorl = sel.condition === 'schmorl';
  const s =
    sel.condition === 'healthy'
      ? 0
      : herniated
        ? HERNIATED_SEVERITY
        : schmorl
          ? SCHMORL_SEVERITY
          : clamp01(sel.severity);
  const lam = herniated || schmorl ? clamp01(sel.nucleusLoss) : 0;
  const A = DISC_AREA;
  const p = (k: keyof typeof PRONY_TABLE) =>
    lerpProny(PRONY_TABLE[k].healthy, PRONY_TABLE[k].moderate, PRONY_TABLE[k].severe, s);
  return {
    condition: sel.condition,
    severity: s,
    nucleusLoss: lam,
    h0: lerp(9.67, 5.53, s), // Ellingson anterior AF heights (R), linear (P)
    A,
    r: Math.sqrt(A / Math.PI),
    phi: lerp(0.4, 0.1, s) * (1 - lam), // Newell 2017 (S) + (P)
    aE: lerp3(OCONNELL.aE[0], OCONNELL.aE[1], OCONNELL.aE[2], s),
    a1: lerp3(OCONNELL.a1[0], OCONNELL.a1[1], OCONNELL.a1[2], s),
    a2: lerp3(OCONNELL.a2[0], OCONNELL.a2[1], OCONNELL.a2[2], s),
    tau1: lerp3(OCONNELL.tau1Min[0], OCONNELL.tau1Min[1], OCONNELL.tau1Min[2], s) * 60,
    tau2: OCONNELL.tau2H * 3600,
    tau1R: OCONNELL.tau1RMin * 60,
    tau2R: OCONNELL.tau2RH * 3600,
    rho: lerp(0.02, 0.56, s), // O'Connell % recovery 98→44 (R range), mapping (P)
    kappa: 1 - lam * (1 - 0.44), // Joshi 2006 (R) + linear (P)
    // Johannessen & Elliott 2005 via Ellingson (S). Nucleus loss decompresses the nucleus
    // (Newell 2017: 'decompression of the NP'); scaled by (1 − λ) (P).
    H_NP: lerp(1.01, 0.44, s) * (1 - lam),
    H_AF: lerp(0.56, 1.1, s), // Iatridis 1998 via Ellingson (S)
    nuAF: lerp(0.4, 0.35, s), // Natarajan 2006 via Ellingson (S)
    nuNP: lerp(0.49, 0.4, s),
    EeqNP: lerp(0.435, 0.229, s), // Ellingson (R)
    prony: { NP: p('NP'), antAF: p('antAF'), latAF: p('latAF') },
    Gapp: 5.5, // Nerurkar 2010 range 2–9 MPa, midpoint (P)
    Eb: 6.5, // Nerurkar 2010 range 3–10 MPa, midpoint (P)
    W_NP: lerp(0.85, 0.7, s), // Newell 2017 (S)
    W_AF: 0.675, // Newell 2017 (S)
    epsY: lerp(0.25, 0.15, s), // Nerurkar yield 20–30% (S); reduction (P)
  };
}

function clamp01(x: number) {
  return Math.min(1, Math.max(0, x));
}

/** Rows for the "Model parameters" chip and the documentation page. */
export interface ParamRow {
  label: string;
  value: string;
  source: string;
  tag: 'R' | 'S' | 'P' | 'D';
}

export function describeParams(p: DiscParams): ParamRow[] {
  const f = (x: number, d = 2) => x.toFixed(d);
  return [
    { label: 'Resting height h₀', value: `${f(p.h0)} mm`, source: 'Ellingson & Nuckley 2012', tag: 'R' },
    { label: 'NP area fraction φ', value: f(p.phi), source: 'Newell 2017 (25–50%), degeneration scaling', tag: 'P' },
    { label: 'NP aggregate modulus', value: `${f(p.H_NP)} MPa`, source: 'Johannessen & Elliott 2005 via Ellingson', tag: 'S' },
    { label: 'AF aggregate modulus', value: `${f(p.H_AF)} MPa`, source: 'Iatridis 1998 via Ellingson', tag: 'S' },
    { label: 'Elastic amplitude L/S_E', value: `${f(p.aE)} mm @1000 N`, source: "O'Connell 2011 (quartile mapping)", tag: 'P' },
    { label: 'Fast amplitude L/S₁', value: `${f(p.a1)} mm @1000 N`, source: "O'Connell 2011", tag: 'P' },
    { label: 'Fast time constant τ₁', value: `${f(p.tau1 / 60, 1)} min`, source: "O'Connell 2011", tag: 'P' },
    { label: 'Slow amplitude L/S₂', value: `${f(p.a2)} mm @1000 N`, source: "O'Connell 2011", tag: 'P' },
    { label: 'Slow time constant τ₂', value: `${f(p.tau2 / 3600, 2)} h`, source: "O'Connell 2011", tag: 'R' },
    { label: 'Recovery τ₁ᴿ / τ₂ᴿ', value: `${f(p.tau1R / 60, 1)} min / ${f(p.tau2R / 3600, 1)} h`, source: "O'Connell 2011", tag: 'R' },
    { label: 'Unrecovered fraction ρ', value: `${f(p.rho * 100, 0)} %`, source: "O'Connell 2011 (98→44% recovery)", tag: 'P' },
    ...(p.condition === 'herniated' || p.condition === 'schmorl'
      ? [{ label: 'Stiffness factor κ', value: f(p.kappa), source: 'Joshi 2006 (denucleation → 44%)', tag: 'P' as const }]
      : []),
  ];
}
