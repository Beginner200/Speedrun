// Reserved for an optional future ad provider.
// Dash Dodge v1 intentionally has no ad SDK, tracking, or network dependency.
export const AdService = {
  isAvailable(): boolean { return false; },
  showRewardedRevive(): Promise<boolean> { return Promise.resolve(false); }
};
