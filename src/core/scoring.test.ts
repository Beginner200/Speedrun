import { describe, expect, it } from 'vitest';
import { addNearMiss, calculateScore, tickCombo } from './scoring';

describe('scoring and combo rules', () => {
  it('builds combo bonuses and caps the combo', () => {
    let state = { combo: 0, timerMs: 0, bonus: 0 };
    state = addNearMiss(state, 10);
    expect(state.combo).toBe(1);
    expect(state.bonus).toBe(10);
    state = addNearMiss(state, 10);
    expect(state.combo).toBe(2);
    expect(state.bonus).toBe(30);
    for (let i = 0; i < 20; i++) state = addNearMiss(state, 10);
    expect(state.combo).toBe(9);
  });

  it('resets combo after its timer expires', () => {
    const state = tickCombo({ combo: 4, timerMs: 1800, bonus: 100 }, 1800);
    expect(state.combo).toBe(0);
    expect(state.timerMs).toBe(0);
    expect(state.bonus).toBe(100);
  });

  it('calculates distance, bonus and coin score without negative results', () => {
    expect(calculateScore(125.8, 1, 30, 4, 2)).toBe(163);
    expect(calculateScore(-10, 1, -20, 0, 2)).toBe(0);
  });
});
