import { describe, expect, it } from 'vitest';
import { PRESETS } from '../../data/presets';
import { TERMS, TOPICS } from '../../data/learnContent';
import { REFERENCES } from '../../data/references';

const allText = (t: (typeof TOPICS)[number]) =>
  [t.lead, ...t.body, t.structureFunction, ...t.deeper.flatMap((d) => d.body)].join(' ');

describe('Learn content integrity', () => {
  it('has the 12 required sections', () => {
    expect(TOPICS).toHaveLength(12);
    expect(new Set(TOPICS.map((t) => t.id)).size).toBe(12);
  });
  it('every highlighted term has a definition', () => {
    for (const t of TOPICS) {
      for (const m of allText(t).matchAll(/\{\{([^|}]+)(?:\|([^}]+))?\}\}/g)) {
        const key = m[1];
        expect(TERMS[key], `${t.id}: ${key}`).toBeDefined();
      }
    }
  });
  it('every source key exists in the reference library', () => {
    for (const t of TOPICS) for (const k of t.sources) expect(REFERENCES[k], `${t.id}: ${k}`).toBeDefined();
  });
  it('every simulation link points to a real preset or test', () => {
    const ok = new Set([...PRESETS.map((p) => p.id), 'creep', 'relaxation']);
    for (const t of TOPICS) if (t.sim.launch.preset) expect(ok.has(t.sim.launch.preset), t.id).toBe(true);
  });
  it('each lesson has 3 takeaways', () => {
    for (const t of TOPICS) expect(t.takeaways.length).toBeGreaterThanOrEqual(3);
  });
});
