import { describe, expect, it } from 'vitest';
import { buildSafePattern, hasSafeLane, isSafePattern } from './obstacle';

describe('Day 2 obstacle safety', () => {
  it('never blocks every lane', () => {
    for (let i = 0; i < 500; i++) {
      const pattern = buildSafePattern(3, () => (i % 17) / 17);
      expect(hasSafeLane(pattern, 3)).toBe(true);
      expect(pattern.blockedLanes.length).toBeLessThan(3);
    }
  });

  it('rejects invalid lane indexes', () => {
    expect(isSafePattern({ blockedLanes: [-1] }, 3)).toBe(false);
    expect(isSafePattern({ blockedLanes: [3] }, 3)).toBe(false);
    expect(isSafePattern({ blockedLanes: [0, 1, 2] }, 3)).toBe(false);
  });

  it('allows one or two blocked lanes in a three-lane road', () => {
    expect(isSafePattern({ blockedLanes: [0] }, 3)).toBe(true);
    expect(isSafePattern({ blockedLanes: [0, 2] }, 3)).toBe(true);
  });
});
