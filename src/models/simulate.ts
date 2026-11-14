// E1 load history + time stepping. Pure function: inputs + parameters → time series.
// The visualization and graphs read ONLY these outputs.

import { posteriorStrain, damageIncrement } from './damageModel';
import { hydrationIndex } from './hydration';
import { loadSharing, radialBulge, secondaryResponse } from './mechanics';
import type { DiscParams, LoadInputs, SimResult, SimSample } from './types';
import { elasticDisp, stepCreepState, type CreepState } from './viscoelasticity';

export const CYCLIC_MIN_FRACTION = 0.05; // N20 used 50 N on a 1000 N peak (P)
export const MEASURED_STRAIN_LIMIT = 0.35; // O'Connell measured ~30% at 1000 N
export const MAX_SOURCE_LOAD = 2000; // N, O'Connell's maximum applied load

interface Segment {
  start: number;
  end: number;
  loaded: boolean;
}

export function buildSegments(inp: LoadInputs): Segment[] {
  const segs: Segment[] = [];
  const blocks = inp.frequencyMode === 'repeated' ? Math.max(1, Math.round(inp.repeats)) : 1;
  let t = 0;
  for (let b = 0; b < blocks; b++) {
    segs.push({ start: t, end: t + inp.duration, loaded: true });
    t += inp.duration;
    if (inp.recovery > 0) {
      segs.push({ start: t, end: t + inp.recovery, loaded: false });
      t += inp.recovery;
    }
  }
  return segs;
}

/** Peak axial force (compression positive, N) and secondary load magnitude while loaded. */
export function peakLoads(inp: LoadInputs) {
  const axial =
    inp.loadType === 'compression'
      ? inp.magnitude
      : inp.loadType === 'tension'
        ? inp.preload - inp.magnitude
        : inp.preload;
  const secondary = inp.loadType === 'torsion' || inp.loadType === 'bending' || inp.loadType === 'shear' ? inp.magnitude : 0;
  return { axial, secondary };
}

export function simulate(p: DiscParams, inp: LoadInputs, maxSteps = 3000): SimResult {
  const segs = buildSegments(inp);
  const total = segs.length ? segs[segs.length - 1].end : 0;
  const { axial: Fpk, secondary: Spk } = peakLoads(inp);
  const cyclic = inp.frequencyMode === 'cyclic';
  const meanFrac = cyclic ? (1 + CYCLIC_MIN_FRACTION) / 2 : 1;
  const minFrac = cyclic ? CYCLIC_MIN_FRACTION : 1;

  let state: CreepState = { x1: 0, x2: 0, set: 0 };
  let damage = 0;
  let herniatedAt: number | null = null;
  const samples: SimSample[] = [];
  const dtTarget = total / maxSteps;

  const record = (t: number, loaded: boolean) => {
    const Fax = loaded ? Fpk : 0;
    const Fmin = loaded ? Fpk * minFrac : 0;
    const Ssec = loaded ? Spk : 0;
    const viscous = state.x1 + state.x2 + state.set;
    const disp = elasticDisp(p, Fax) + viscous;
    const dispMin = elasticDisp(p, Fmin) + viscous;
    const strain = disp / p.h0;
    const share = loadSharing(p, Fax);
    const shareMin = loadSharing(p, Fmin);
    const sec = secondaryResponse(p, inp.loadType, inp.direction, Ssec);
    const post = posteriorStrain(p, strain, sec.postTension, sec.shearStrain);
    samples.push({
      t,
      load: Fax,
      loadMin: Fmin,
      moment: Ssec,
      disp,
      dispMin,
      height: p.h0 - disp,
      strain,
      strainMin: dispMin / p.h0,
      pNP: share.pNP,
      pNPMin: shareMin.pNP,
      sigmaAF: share.sigmaAF,
      npShare: share.npShare,
      angle: sec.angle,
      shear: sec.shear,
      edgeStrain: sec.edgeStrain,
      shearStrain: sec.shearStrain,
      bulge: radialBulge(p, strain),
      hydration: hydrationIndex(p, viscous),
      damage: Math.min(1, damage),
      postStrain: post,
      loaded,
    });
    return post;
  };

  record(0, segs[0]?.loaded ?? false);
  for (const seg of segs) {
    const len = seg.end - seg.start;
    if (len <= 0) continue;
    const n = Math.max(2, Math.ceil(len / Math.max(dtTarget, 1e-3)));
    const dt = len / n;
    // sample just after a step change so the elastic jump is visible
    if (samples.length && samples[samples.length - 1].loaded !== seg.loaded) record(seg.start, seg.loaded);
    for (let i = 1; i <= n; i++) {
      const t = seg.start + i * dt;
      const Fmean = seg.loaded ? Math.max(0, Fpk) * meanFrac : 0;
      state = stepCreepState(p, state, Fmean, dt);
      const post = record(t, seg.loaded);
      if (seg.loaded) {
        const cycles = cyclic ? inp.frequencyHz * dt : dt / 60;
        damage += damageIncrement(p, post, cycles);
        if (damage >= 1 && herniatedAt === null) herniatedAt = t;
        samples[samples.length - 1].damage = Math.min(1, damage);
      }
    }
  }

  const warnings: string[] = [];
  const maxStrain = Math.max(...samples.map((s) => s.strain));
  if (maxStrain > MEASURED_STRAIN_LIMIT)
    warnings.push(
      `Axial strain reaches ${(maxStrain * 100).toFixed(0)}%, beyond the ~30% measured by O'Connell et al. (2011). The linear model is extrapolating.`,
    );
  if (Fpk > MAX_SOURCE_LOAD)
    warnings.push(`Load exceeds 2000 N, the largest load in the source creep data.`);

  return { samples, params: p, inputs: inp, totalTime: total, herniatedAt, warnings };
}

/** Linear interpolation of a sample at time t (for smooth animation). */
export function sampleAt(res: SimResult, t: number): SimSample {
  const s = res.samples;
  if (t <= s[0].t) return s[0];
  if (t >= s[s.length - 1].t) return s[s.length - 1];
  let lo = 0;
  let hi = s.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (s[mid].t <= t) lo = mid;
    else hi = mid;
  }
  const a = s[lo];
  const b = s[hi];
  if (b.t === a.t || a.loaded !== b.loaded) return t - a.t < b.t - t ? a : b;
  const w = (t - a.t) / (b.t - a.t);
  const out = { ...a } as SimSample;
  (Object.keys(a) as (keyof SimSample)[]).forEach((k) => {
    const av = a[k];
    const bv = b[k];
    if (typeof av === 'number' && typeof bv === 'number') (out as unknown as Record<string, number>)[k] = av + (bv - av) * w;
  });
  out.t = t;
  return out;
}
