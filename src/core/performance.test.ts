import { describe, expect, it } from 'vitest';
import { PerformanceMonitor } from './performance';

describe('PerformanceMonitor', () => {
  it('keeps a rolling sample window', () => {
    const monitor = new PerformanceMonitor(3);
    monitor.addFrame(16.67);
    monitor.addFrame(16.67);
    monitor.addFrame(16.67);
    monitor.addFrame(33.33);

    expect(monitor.getWorstFrameMs()).toBeCloseTo(33.33, 1);
    expect(monitor.getAverageFps()).toBeGreaterThan(30);
  });

  it('accepts a stable 60 FPS budget', () => {
    const monitor = new PerformanceMonitor();
    for (let i = 0; i < 60; i++) monitor.addFrame(16.67);
    expect(monitor.isWithinBudget(60, 30)).toBe(true);
  });

  it('rejects sustained frames slower than the minimum budget', () => {
    const monitor = new PerformanceMonitor();
    for (let i = 0; i < 60; i++) monitor.addFrame(40);
    expect(monitor.isWithinBudget(60, 30)).toBe(false);
  });
});
