import { describe, expect, it } from 'vitest';
import { GAME_CONFIG } from '../config/gameConfig';

describe('Day 3 tuning', () => {
  it('keeps power-up durations within the intended session scale', () => {
    expect(GAME_CONFIG.shieldDurationMs).toBe(10_000);
    expect(GAME_CONFIG.magnetDurationMs).toBe(8_000);
  });

  it('keeps the magnet range larger than normal pickup range', () => {
    expect(GAME_CONFIG.magnetRange).toBeGreaterThan(28);
  });

  it('keeps speed progression capped', () => {
    expect(GAME_CONFIG.maxWorldSpeed).toBeGreaterThan(GAME_CONFIG.worldSpeed);
    expect(GAME_CONFIG.speedRampPerSecond).toBeGreaterThan(0);
  });
});
