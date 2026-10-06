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
    return this.samples.reduce((sum, sample) => sum + sample.fps, 0) / this.samples.length;
  }

  getWorstFrameMs(): number {
    if (!this.samples.length) return 0;
    return Math.max(...this.samples.map(sample => sample.frameMs));
  }

  isWithinBudget(targetFps = 60, minimumFps = 30): boolean {
    const fps = this.getAverageFps();
    return fps >= minimumFps && this.getWorstFrameMs() <= 1000 / minimumFps;
  }

  reset(): void {
    this.samples.length = 0;
  }
}
