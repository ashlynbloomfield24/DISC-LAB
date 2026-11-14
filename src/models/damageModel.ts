// E9: ILLUSTRATIVE damage index. Educational approximation, NOT a predictive failure model.
// No reference provides cycles-to-failure or herniation thresholds (see reference review §10).
// Form: Miner's-rule-type power law, ΔD = (ε_post / ε_y)^m / N_ref per load cycle
// (sustained loads count one "cycle" per minute). Constants m, N_ref, c_T are (P).

import type { DiscParams } from './types';

export const DAMAGE_M = 4;
export const DAMAGE_NREF = 4500;
export const DAMAGE_CT = 0.5;

/** Posterior annulus strain proxy: Poisson hoop stretch + bending tension + torsion shear. */
export function posteriorStrain(p: DiscParams, axialStrain: number, postTension: number, shearStrain: number) {
  return p.nuAF * Math.max(0, axialStrain) + postTension + DAMAGE_CT * shearStrain;
}

/** Damage increment for `cycles` load cycles at the given posterior strain. */
export function damageIncrement(p: DiscParams, postStrain: number, cycles: number) {
  if (postStrain <= 0 || cycles <= 0) return 0;
  return (cycles * Math.pow(postStrain / p.epsY, DAMAGE_M)) / DAMAGE_NREF;
}
