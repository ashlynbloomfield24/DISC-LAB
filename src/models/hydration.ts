// E7: ILLUSTRATIVE hydration index.
// O'Connell et al. (2011) attribute the viscous (fast + slow) creep components to fluid flow.
// Assumptions (P): viscous displacement × disc area = volume of water lost; the elastic part is
// volume-preserving (shape change / bulge) and loses no water.

import type { DiscParams } from './types';

export function initialWater(p: DiscParams) {
  return p.phi * p.W_NP + (1 - p.phi) * p.W_AF;
}

export function hydrationIndex(p: DiscParams, viscousDisp: number): number {
  const V0 = p.A * p.h0;
  const lost = p.A * Math.max(0, viscousDisp);
  const water = initialWater(p) * V0 - lost;
  return Math.max(0, Math.min(1, water / Math.max(V0 - lost, 1)));
}
