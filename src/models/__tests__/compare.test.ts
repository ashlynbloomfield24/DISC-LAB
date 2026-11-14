import { describe, expect, it } from 'vitest';
import { PRESETS } from '../../data/presets';
import { compareRows, explainComparison, recoveredFraction } from '../compare';
import { buildParams } from '../discParameters';
import { sampleAt, simulate } from '../simulate';

const pH = buildParams({ condition: 'healthy', severity: 0, nucleusLoss: 0 });
const pD = buildParams({ condition: 'degenerated', severity: 0.6, nucleusLoss: 0 });
const inputs = PRESETS[0].inputs; // Standing: 4 h load + 8 h recovery
const resH = simulate(pH, inputs);
const resD = simulate(pD, inputs);

describe('comparison mode', () => {
  it('uses identical inputs, so total time matches', () => {
    expect(resH.totalTime).toBe(resD.totalTime);
  });
  it('during loading the table shows more strain and less NP share for the degenerated disc', () => {
    const t = 3 * 3600;
    const rows = compareRows(sampleAt(resH, t), sampleAt(resD, t), false);
    const strain = rows.find((r) => r.label === 'Axial strain')!;
    const share = rows.find((r) => r.label === 'Nucleus share of load')!;
    expect(strain.degenerated).toBeGreaterThan(strain.healthy);
    expect(share.degenerated).toBeLessThan(share.healthy);
  });
  it('during recovery the degenerated disc has recovered a smaller fraction', () => {
    const t = 11 * 3600;
    expect(recoveredFraction(resD, t)!).toBeLessThan(recoveredFraction(resH, t)!);
  });
  it('explanation cites sources and mentions both discs', () => {
    const t = 2 * 3600;
    const text = explainComparison({ pH, pD, h: sampleAt(resH, t), d: sampleAt(resD, t), resH, resD, t, showDamage: false, relaxation: false }).join(' ');
    expect(text).toContain("O'Connell");
    expect(text).toContain('Newell');
    expect(text).toMatch(/healthy/);
  });
});
