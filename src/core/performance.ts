export type PerformanceSample = {
  fps: number;
  frameMs: number;
};

export class PerformanceMonitor {
  private samples: PerformanceSample[] = [];
  private readonly maxSamples: number;

  constructor(maxSamples = 60) {
    this.maxSamples = Math.max(10, maxSamples);
  }

  addFrame(deltaMs: number): void {
    const safeDelta = Math.max(0.1, deltaMs);
    this.samples.push({ fps: 1000 / safeDelta, frameMs: safeDelta });
    if (this.samples.length > this.maxSamples) this.samples.shift();
  }

  getAverageFps(): number {
    if (!this.samples.length) return 60;
    let total = 0;
    for (const sample of this.samples) total += sample.fps;
    return total / this.samples.length;
  }

  getWorstFrameMs(): number {
    if (!this.samples.length) return 0;
    let worst = 0;
    for (const sample of this.samples) worst = Math.max(worst, sample.frameMs);
    return worst;
  }

  isWithinBudget(targetFps = 60, minimumFps = 30): boolean {
    const fps = this.getAverageFps();
    const targetFrameMs = 1000 / Math.max(1, targetFps);
    const minimumFrameMs = 1000 / Math.max(1, minimumFps);
    return fps >= minimumFps && this.getWorstFrameMs() <= Math.max(targetFrameMs, minimumFrameMs);
  }

  reset(): void {
    this.samples.length = 0;
  }
}
