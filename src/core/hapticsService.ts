import { SaveService } from './saveService';

export const HapticsService = {
  pulse(duration = 20): void {
    if (!SaveService.load().settings.vibration) return;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(duration);
  },
  success(): void { this.pulse(28); },
  warning(): void { this.pulse(18); },
  impact(): void { this.pulse(45); }
};
