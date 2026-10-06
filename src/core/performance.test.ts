import { describe, expect, it } from 'vitest';
import { PerformanceMonitor } from './performance';

describe('Performance monitor', () => {
  it('tracks average FPS and worst frame time', () => {
    const monitor = new PerformanceMonitor(10);
    monitor.addFrame(16.67);
    monitor.addFrame(20);
    expect(monitor.getAverageFps()).toBeGreaterThan(45);
    expect(monitor.getWorstFrameMs()).toBe(20);
  });

  it('flags a frame stream below the minimum FPS budget', () => {
    const monitor = new PerformanceMonitor(10);
    for (let i = 0; i < 10; i++) monitor.addFrame(40);
    expect(monitor.isWithinBudget(60, 30)).toBe(false);
  });

  it('can reset samples', () => {
    const monitor = new PerformanceMonitor(10);
    monitor.addFrame(100);
    monitor.reset();
    expect(monitor.getAverageFps()).toBe(60);
    expect(monitor.getWorstFrameMs()).toBe(0);
  });
});
