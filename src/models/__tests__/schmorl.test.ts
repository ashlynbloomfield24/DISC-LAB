import { describe, expect, it } from 'vitest';
import { buildParams, HERNIATED_SEVERITY } from '../discParameters';
import { loadSharing } from '../mechanics';
import { stepCreep } from '../viscoelasticity';

const healthy = buildParams({ condition: 'healthy', severity: 0, nucleusLoss: 0 });
const herniated = buildParams({ condition: 'herniated', severity: 0.2, nucleusLoss: 0.3 });
const node = buildParams({ condition: 'schmorl', severity: 0.2, nucleusLoss: 0.3 });

describe("Schmorl's node condition", () => {
  it('is drawn and modelled on the same degenerated, herniated disc as the Herniated condition', () => {
    expect(node.severity).toBe(HERNIATED_SEVERITY);
    expect(node.h0).toBeCloseTo(herniated.h0, 6);
    expect(node.kappa).toBeCloseTo(herniated.kappa, 6);
  });
  it('decompresses the nucleus: lower NP pressure than a healthy disc (Newell 2017)', () => {
    expect(loadSharing(node, 1000).pNP).toBeLessThan(loadSharing(healthy, 1000).pNP);
  });
  it('compresses more than a healthy disc under the same load', () => {
    expect(stepCreep(node, 1000, 3600)).toBeGreaterThan(stepCreep(healthy, 1000, 3600));
  });
  it('more nucleus loss means more decompression', () => {
    const big = buildParams({ condition: 'schmorl', severity: 0, nucleusLoss: 0.8 });
    expect(loadSharing(big, 1000).pNP).toBeLessThan(loadSharing(node, 1000).pNP);
  });
});
