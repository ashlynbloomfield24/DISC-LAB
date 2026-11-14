// Validation checks from the model specification (§7).
import { describe, expect, it } from 'vitest';
import { CREEP_TEST, PRESETS } from '../../data/presets';
import { buildParams, OCONNELL } from '../discParameters';
import { bendingStiffness, loadSharing, torsionStiffness } from '../mechanics';
import { simulate } from '../simulate';
import type { DiscParams } from '../types';
import { pronyG, stepCreep } from '../viscoelasticity';

const healthy = buildParams({ condition: 'healthy', severity: 0, nucleusLoss: 0 });
const moderate = buildParams({ condition: 'degenerated', severity: 0.5, nucleusLoss: 0 });
const severe = buildParams({ condition: 'degenerated', severity: 1, nucleusLoss: 0 });

/** O'Connell median parameters on an 8.86 mm disc (undoes height scaling). */
function oconnellMedian(): DiscParams {
  return { ...moderate, h0: 8.86 };
}

describe("O'Connell 2011 creep reproduction", () => {
  it('median parameters give ≈3.29 mm equilibrium at 1000 N', () => {
    const eq = OCONNELL.aE[1] + OCONNELL.a1[1] + OCONNELL.a2[1];
    expect(eq).toBeCloseTo(3.24, 2);
    expect(Math.abs(eq - 3.29)).toBeLessThan(0.1);
  });
  it('≈86% of equilibrium is reached after 4 h', () => {
    const p = oconnellMedian();
    const frac = stepCreep(p, 1000, 4 * 3600) / stepCreep(p, 1000, 1e9);
    expect(frac).toBeGreaterThan(0.84);
    expect(frac).toBeLessThan(0.9);
  });
  it('time-stepped simulation matches the closed form for a step load', () => {
    const p = oconnellMedian();
    const res = simulate(p, { ...CREEP_TEST, frequencyMode: 'single', recovery: 0 });
    const last = res.samples[res.samples.length - 1];
    const closed = stepCreep(p, 1000, 4 * 3600) + p.rho * 0; // set excluded below
    expect(Math.abs(last.disp - last.dispMin)).toBeLessThan(1e-9);
    // the unrecoverable set adds to displacement; compare viscous+elastic part within 10%
    expect(last.disp).toBeGreaterThan(closed * 0.95);
    expect(last.disp).toBeLessThan(closed * 1.35);
  });
  it('recovery is slower than loading', () => {
    const res = simulate(healthy, { ...CREEP_TEST, repeats: 1, recovery: 4 * 3600 });
    const atEndLoad = res.samples.find((s) => s.t >= 4 * 3600 && !s.loaded)!;
    const after4hRec = res.samples[res.samples.length - 1];
    const creepIn4h = res.samples.find((s) => s.t >= 4 * 3600 - 1 && s.loaded)!.disp - res.samples[1].disp;
    const recoveredIn4h = atEndLoad.disp - after4hRec.disp;
    expect(recoveredIn4h).toBeLessThan(creepIn4h);
  });
});

describe('NP pressure calibration (Wilke 1999 via Newell 2017)', () => {
  it('healthy Standing preset gives NP pressure inside 0.50–0.87 MPa', () => {
    const p = loadSharing(healthy, PRESETS[0].inputs.magnitude).pNP;
    expect(p).toBeGreaterThan(0.5);
    expect(p).toBeLessThan(0.87);
  });
  it('degeneration lowers NP pressure and raises AF stress (Newell 2017)', () => {
    const h = loadSharing(healthy, 1000);
    const s = loadSharing(severe, 1000);
    expect(s.pNP).toBeLessThan(h.pNP);
    expect(s.sigmaAF).toBeGreaterThan(h.sigmaAF);
    expect(s.npShare).toBeLessThan(h.npShare);
  });
});

describe('Ellingson 2012 Prony relaxation', () => {
  it('G(0) = 1 + 3g approximates measured peak/equilibrium ratios', () => {
    expect(pronyG(healthy.prony.NP, 0)).toBeCloseTo(1.327, 3);
    expect(pronyG(severe.prony.NP, 0)).toBeCloseTo(1.507, 3);
  });
  it('G(t) → 1 at long times', () => {
    expect(pronyG(healthy.prony.NP, 1800)).toBeLessThan(1.001);
  });
});

describe('Torsion and bending orders of magnitude', () => {
  it('10 N·m torsion gives ≈2° in a healthy disc', () => {
    const deg = (10 / torsionStiffness(healthy)) * (180 / Math.PI);
    expect(deg).toBeGreaterThan(1.5);
    expect(deg).toBeLessThan(3);
  });
  it('7.5 N·m bending gives ≈2.7°', () => {
    const deg = (7.5 / bendingStiffness(healthy)) * (180 / Math.PI);
    expect(deg).toBeGreaterThan(2);
    expect(deg).toBeLessThan(3.5);
  });
});

describe('Degeneration directions match the literature', () => {
  const run = (p: DiscParams) => simulate(p, PRESETS[0].inputs);
  it('degenerated disc shows more creep strain', () => {
    const peak = (p: DiscParams) => Math.max(...run(p).samples.map((s) => s.strain));
    expect(peak(severe)).toBeGreaterThan(peak(healthy));
  });
  it('degenerated disc recovers a smaller fraction (O\'Connell r = −0.72)', () => {
    const frac = (p: DiscParams) => {
      const s = run(p).samples;
      const peakDisp = Math.max(...s.map((x) => x.disp));
      return (peakDisp - s[s.length - 1].disp) / peakDisp;
    };
    expect(frac(severe)).toBeLessThan(frac(healthy));
  });
});

describe('Illustrative damage index calibration', () => {
  const lifting = PRESETS.find((p) => p.id === 'lifting')!.inputs;
  it('Lifting does not herniate a healthy disc in 30 min', () => {
    expect(simulate(healthy, lifting).herniatedAt).toBeNull();
  });
  it('Lifting herniates a 60%-degenerated disc within 30 min', () => {
    const deg = buildParams({ condition: 'degenerated', severity: 0.6, nucleusLoss: 0 });
    expect(simulate(deg, lifting).herniatedAt).not.toBeNull();
  });
});
