import { describe, expect, it } from 'vitest';
import { CATEGORIES, QUESTIONS } from '../../data/quizQuestions';

describe('quiz bank', () => {
  it('covers all 8 categories with several questions each', () => {
    for (const c of CATEGORIES) expect(QUESTIONS.filter((q) => q.category === c.id).length, c.id).toBeGreaterThanOrEqual(4);
  });
  it('includes every question type', () => {
    const types = new Set(QUESTIONS.map((q) => q.type));
    expect(types).toEqual(new Set(['mc', 'tf', 'tap']));
    expect(QUESTIONS.some((q) => q.type === 'mc' && q.scenario)).toBe(true);
    expect(QUESTIONS.some((q) => q.simLink)).toBe(true);
  });
  it('has unique ids, valid answers and a source + explanation for each', () => {
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(QUESTIONS.length);
    for (const q of QUESTIONS) {
      expect(q.explanation.length, q.id).toBeGreaterThan(20);
      expect(q.source.length, q.id).toBeGreaterThan(3);
      if (q.type === 'mc') {
        expect(q.options).toHaveLength(4);
        if (q.why) expect(q.why[q.answer], q.id).toBe('');
      }
    }
  });
});
