// E4: NP/AF load sharing and NP pressure
// E5: bending, torsion, shear, tension stiffness
// E6: radial bulge
// E8: region stresses for the illustrative stress map

import type { DiscParams, Direction, LoadType } from './types';

export interface LoadShare {
  npShare: number;
  pNP: number; // MPa
  sigmaAF: number; // MPa
}

/** E4: two parallel columns (NP, AF) with equal strain. */
export function loadSharing(p: DiscParams, F: number): LoadShare {
  const kNP = p.H_NP * p.phi;
  const kAF = p.H_AF * (1 - p.phi);
  const npShare = kNP / (kNP + kAF);
  const Fc = Math.max(0, F); // only compression pressurizes the NP
  return {
    npShare,
    pNP: (Fc * npShare) / (p.phi * p.A),
    sigmaAF: (Fc * (1 - npShare)) / ((1 - p.phi) * p.A),
  };
}

const HEALTHY_H0 = 9.67; // bending/torsion stiffness evaluated at healthy height (spec E5)

/** Polar and area moments of the equivalent circular disc, mm⁴. */
export function sectionMoments(p: DiscParams) {
  const r4 = Math.pow(p.r, 4);
  return { J: (Math.PI * r4) / 2, I: (Math.PI * r4) / 4 };
}

/** Torsional stiffness K_T = G·J/h, N·m/rad. */
export function torsionStiffness(p: DiscParams): number {
  return (p.Gapp * sectionMoments(p).J) / HEALTHY_H0 / 1000;
}

/** Bending stiffness K_B = E·I/h, N·m/rad. */
export function bendingStiffness(p: DiscParams): number {
  return (p.Eb * sectionMoments(p).I) / HEALTHY_H0 / 1000;
}

/** Shear stiffness K_S = G·A/h, N/mm. */
export function shearStiffness(p: DiscParams): number {
  return (p.Gapp * p.A) / HEALTHY_H0;
}

export interface SecondaryResponse {
  angle: number; // rad
  shear: number; // mm
  edgeStrain: number; // tension-side edge strain from bending
  shearStrain: number; // outer shear strain from torsion / shear
  postTension: number; // posterior tension-side strain contribution
}

/** E5: response of the disc to the non-axial (secondary) load. */
export function secondaryResponse(
  p: DiscParams,
  type: LoadType,
  dir: Direction,
  magnitude: number,
): SecondaryResponse {
  const none: SecondaryResponse = { angle: 0, shear: 0, edgeStrain: 0, shearStrain: 0, postTension: 0 };
  if (type === 'torsion') {
    const angle = magnitude / torsionStiffness(p);
    const shearStrain = (angle * p.r) / p.h0;
    return { ...none, angle, shearStrain };
  }
  if (type === 'bending') {
    const angle = magnitude / bendingStiffness(p);
    const edgeStrain = (angle * p.r) / p.h0;
    // Flexion stretches the posterior AF; extension compresses it; lateral bending stretches
    // a posterolateral corner partially (factor 0.7 = cos 45°, geometric).
    const postTension = dir === 'flexion' ? edgeStrain : dir === 'lateralBend' ? 0.7 * edgeStrain : 0;
    return { ...none, angle, edgeStrain, postTension };
  }
  if (type === 'shear') {
    const shear = magnitude / shearStiffness(p);
    return { ...none, shear, shearStrain: shear / p.h0 };
  }
  return none;
}

/** E6: radial AF bulge from axial strain (Poisson), mm. */
export function radialBulge(p: DiscParams, strain: number): number {
  return p.nuAF * Math.max(0, strain) * p.r;
}

export interface RegionStresses {
  np: number;
  innerAntAF: number;
  innerPostAF: number;
  outerAntAF: number;
  outerPostAF: number;
}

/**
 * E8 (illustrative): region-averaged stress magnitudes for the heat map, MPa.
 * Inner AF carries hoop tension from NP pressure (thin-wall formula); outer AF carries
 * axial compression; bending adds a linear gradient (σ = M·y/I).
 */
export function regionStresses(
  p: DiscParams,
  pNP: number,
  sigmaAF: number,
  type: LoadType,
  dir: Direction,
  magnitude: number,
): RegionStresses {
  const rNP = p.r * Math.sqrt(p.phi);
  const tAF = Math.max(1, p.r - rNP);
  const hoop = (pNP * rNP) / tAF;
  let bendAnt = 0;
  let bendPost = 0;
  let tors = 0;
  if (type === 'bending') {
    const sb = (magnitude * 1000 * p.r) / sectionMoments(p).I;
    // flexion: anterior compressed, posterior stretched (both raise stress magnitude)
    if (dir === 'flexion') { bendAnt = sb; bendPost = sb * 0.8; }
    else if (dir === 'extension') { bendPost = sb; bendAnt = sb * 0.8; }
    else { bendAnt = bendPost = sb * 0.6; }
  }
  if (type === 'torsion') tors = (magnitude * 1000 * p.r) / sectionMoments(p).J;
  return {
    np: pNP,
    innerAntAF: hoop * 0.8 + sigmaAF * 0.6 + bendAnt * 0.6 + tors * 0.5,
    innerPostAF: hoop * 0.8 + sigmaAF * 0.6 + bendPost * 0.6 + tors * 0.5,
    outerAntAF: hoop * 0.3 + sigmaAF + bendAnt + tors,
    outerPostAF: hoop * 0.3 + sigmaAF + bendPost + tors,
  };
}
