// E2: whole-disc creep / recovery (O'Connell et al. 2011, spring + two Kelvin–Voigt solids)
// E3: tissue-level stress relaxation (Ellingson & Nuckley 2012, three-term Prony series)

import { H_REF } from './discParameters';
import type { DiscParams, Prony } from './types';

/** Scale factor from O'Connell amplitudes (1000 N, 8.86 mm disc) to this disc, per newton. */
export function amplitudeScale(p: DiscParams): number {
  return (p.h0 / H_REF) / p.kappa / 1000;
}

/** Elastic (instantaneous) axial displacement for load F (N), mm. */
export function elasticDisp(p: DiscParams, F: number): number {
  return F * amplitudeScale(p) * p.aE;
}

/** Closed-form creep displacement for a step load L held for t seconds (O'Connell Eq. 1). */
export function stepCreep(p: DiscParams, L: number, t: number): number {
  const k = L * amplitudeScale(p);
  return k * (p.aE + p.a1 * (1 - Math.exp(-t / p.tau1)) + p.a2 * (1 - Math.exp(-t / p.tau2)));
}

/** Equilibrium (t → ∞) displacement for load L, mm. */
export function equilibriumDisp(p: DiscParams, L: number): number {
  return L * amplitudeScale(p) * (p.aE + p.a1 + p.a2);
}

/** State of the two Kelvin–Voigt elements (mm) plus unrecoverable set (mm). */
export interface CreepState {
  x1: number;
  x2: number;
  set: number;
}

/**
 * Advance the Kelvin–Voigt states by dt under (cycle-mean) load Fmean.
 * Loading uses τ₁, τ₂; unloading uses the slower recovery constants τ₁ᴿ, τ₂ᴿ.
 * Exact exponential update → unconditionally stable for any dt.
 */
export function stepCreepState(p: DiscParams, s: CreepState, Fmean: number, dt: number): CreepState {
  const k = Fmean * amplitudeScale(p);
  const t1 = k * p.a1;
  const t2 = k * p.a2;
  const tau1 = t1 >= s.x1 ? p.tau1 : p.tau1R;
  const tau2 = t2 >= s.x2 ? p.tau2 : p.tau2R;
  const x1 = t1 + (s.x1 - t1) * Math.exp(-dt / tau1);
  const x2 = t2 + (s.x2 - t2) * Math.exp(-dt / tau2);
  // Unrecoverable set: while loaded it approaches ρ × (viscous displacement),
  // calibrated to O'Connell's 4 h creep / 24 h recovery percentages (P). It never decreases.
  const viscous = x1 + x2;
  const setTarget = p.rho * viscous;
  const set = Fmean > 1 && setTarget > s.set ? setTarget + (s.set - setTarget) * Math.exp(-dt / (4 * 3600)) : s.set;
  return { x1, x2, set };
}

/** Ellingson Eq. 2: normalized relaxation function G(t) = 1 + g Σ exp(−t/τᵢ). */
export function pronyG(pr: Prony, t: number): number {
  const tauM = Math.sqrt(pr.tauS * pr.tauL);
  return 1 + pr.g * (Math.exp(-t / pr.tauS) + Math.exp(-t / tauM) + Math.exp(-t / pr.tauL));
}

export interface RelaxSample {
  t: number;
  sigmaNP: number; // MPa, NP absolute stress
  gNP: number; // normalized
  gAntAF: number;
  gLatAF: number;
}

/** E3: stress-relaxation preset. Step strain eps0 held for tEnd seconds (log-spaced samples). */
export function relaxationTest(p: DiscParams, eps0 = 0.05, tEnd = 1800, n = 240): RelaxSample[] {
  const out: RelaxSample[] = [];
  const t0 = 0.1;
  for (let i = 0; i < n; i++) {
    const t = i === 0 ? 0 : t0 * Math.pow(tEnd / t0, (i - 1) / (n - 2));
    out.push({
      t,
      sigmaNP: p.EeqNP * eps0 * pronyG(p.prony.NP, t),
      gNP: pronyG(p.prony.NP, t),
      gAntAF: pronyG(p.prony.antAF, t),
      gLatAF: pronyG(p.prony.latAF, t),
    });
  }
  return out;
}
