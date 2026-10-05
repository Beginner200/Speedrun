import { describe, expect, it } from 'vitest';
import { GAME_CONFIG } from '../config/gameConfig';

describe('Day 1 foundation', () => {
  it('uses three lanes and responsive tuning', () => {
    expect(GAME_CONFIG.lanes).toBe(3);
    expect(GAME_CONFIG.laneTweenMs).toBeLessThanOrEqual(120);
  });
});
