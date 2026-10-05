export type ObstaclePattern = {
  blockedLanes: number[];
};

export function isSafePattern(pattern: ObstaclePattern, laneCount: number): boolean {
  if (laneCount <= 0) return false;
  const unique = new Set(pattern.blockedLanes);
  return unique.size < laneCount && [...unique].every((lane) => lane >= 0 && lane < laneCount);
}

export function buildSafePattern(laneCount: number, random = Math.random): ObstaclePattern {
  if (laneCount < 2) return { blockedLanes: [] };

  const maxBlocked = laneCount - 1;
  const blockCount = random() < 0.28 ? Math.min(2, maxBlocked) : 1;
  const available = Array.from({ length: laneCount }, (_, lane) => lane);
  const blockedLanes: number[] = [];

  for (let i = 0; i < blockCount; i++) {
    const index = Math.floor(random() * available.length);
    blockedLanes.push(available[index]);
    available.splice(index, 1);
  }

  return { blockedLanes };
}

export function hasSafeLane(pattern: ObstaclePattern, laneCount: number): boolean {
  return isSafePattern(pattern, laneCount) && pattern.blockedLanes.length < laneCount;
}
