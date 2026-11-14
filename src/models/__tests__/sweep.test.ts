// Software test: every condition × load type × direction × frequency mode must give finite,
// physically sensible outputs, and the illustration inputs must stay within bounds.
import { describe, expect, it } from 'vitest';
import { DIRECTIONS, MAGNITUDE_RANGE } from '../../data/presets';
import { buildParams } from '../discParameters';
import { simulate } from '../simulate';
import type { Condition, FrequencyMode, LoadInputs, LoadType, SimSample } from '../types';
import { relaxationTest } from '../viscoelasticity';

const CONDITIONS: Condition[] = ['healthy', 'degenerated', 'herniated', 'schmorl'];
const TYPES: LoadType[] = ['compression', 'tension', 'shear', 'torsion', 'bending'];
const MODES: FrequencyMode[] = ['single', 'repeated', 'cyclic'];

const finite = (s: SimSample) =>
  Object.entries(s).every(([, v]) => typeof v !== 'number' || Number.isFinite(v));

describe('input sweep', () => {
  for (const cond of CONDITIONS)
    for (const sev of cond === 'degenerated' ? [0, 0.5, 1] : [0.6])
      for (const type of TYPES)
        for (const dir of DIRECTIONS[type])
          for (const mode of MODES)
            for (const mag of [MAGNITUDE_RANGE[type].min, MAGNITUDE_RANGE[type].max]) {
              const name = `${cond}/${sev} ${type}/${dir.value} ${mode} ${mag}`;
              it(name, () => {
                const p = buildParams({ condition: cond, severity: sev, nucleusLoss: 0.5 });
                const inp: LoadInputs = {
                  loadType: type, direction: dir.value, magnitude: mag, preload: type === 'tension' ? 0 : 750,
                  duration: 1800, frequencyMode: mode, repeats: 2, frequencyHz: 5, recovery: 3600,
                };
                const r = simulate(p, inp, 600);
                expect(r.samples.length).toBeGreaterThan(10);
                for (const s of r.samples) {
                  expect(finite(s), name).toBe(true);
                  expect(s.height).toBeGreaterThan(0);
                  expect(s.pNP).toBeGreaterThanOrEqual(0);
                  expect(s.hydration).toBeGreaterThan(0);
                  expect(s.hydration).toBeLessThanOrEqual(1);
                  expect(s.damage).toBeGreaterThanOrEqual(0);
                  expect(s.damage).toBeLessThanOrEqual(1);
                  expect(s.npShare).toBeGreaterThanOrEqual(0);
                  expect(s.npShare).toBeLessThanOrEqual(1);
                }
                // time must be monotonic
                for (let i = 1; i < r.samples.length; i++) expect(r.samples[i].t).toBeGreaterThanOrEqual(r.samples[i - 1].t);
                // a pure tension load (no preload) must lengthen the disc, not compress it
                if (type === 'tension' && mag > 0) expect(r.samples[1].disp).toBeLessThan(0);
                // the disc must be unloaded at the end of recovery
                expect(r.samples[r.samples.length - 1].loaded).toBe(false);
              });
            }
});

describe('relaxation preset', () => {
  for (const cond of CONDITIONS)
    it(cond, () => {
      const rel = relaxationTest(buildParams({ condition: cond, severity: 0.6, nucleusLoss: 0.3 }));
      for (let i = 1; i < rel.length; i++) expect(rel[i].sigmaNP).toBeLessThanOrEqual(rel[i - 1].sigmaNP + 1e-12);
      expect(rel[rel.length - 1].gNP).toBeGreaterThanOrEqual(1);
    });
});

describe('monotonic loading response', () => {
  it('more compression → more height loss and more NP pressure', () => {
    const p = buildParams({ condition: 'healthy', severity: 0, nucleusLoss: 0 });
    const run = (F: number) => simulate(p, { loadType: 'compression', direction: 'axial', magnitude: F, preload: 0, duration: 600, frequencyMode: 'single', repeats: 1, frequencyHz: 1, recovery: 0 }).samples.at(-1)!;
    expect(run(1000).disp).toBeGreaterThan(run(500).disp);
    expect(run(1000).pNP).toBeGreaterThan(run(500).pNP);
  });
  it('degeneration severity increases equilibrium creep strain monotonically', () => {
    const strains = [0, 0.25, 0.5, 0.75, 1].map((s) => {
      const p = buildParams({ condition: 'degenerated', severity: s, nucleusLoss: 0 });
      return (p.aE + p.a1 + p.a2) * (p.h0 / 8.86) / p.h0;
    });
    for (let i = 1; i < strains.length; i++) expect(strains[i]).toBeGreaterThan(strains[i - 1]);
  });
});
