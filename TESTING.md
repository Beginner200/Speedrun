# Dash Dodge Testing Checklist

## Automated
- `npm test`
- `npm run build`
- GitHub Actions runs both checks on pushes and pull requests to `main`.

## Core gameplay
- [ ] Start a run from Home.
- [ ] Swipe/tap left and right; lane movement feels immediate and controlled.
- [ ] Verify no obstacle sequence blocks every lane.
- [ ] Verify a safe lane is always reachable from the current lane.
- [ ] Collect coins.
- [ ] Collect Shield and survive one collision.
- [ ] Collect Magnet and verify nearby coins move toward the player.
- [ ] Trigger a near miss and verify combo/bonus feedback.
- [ ] Confirm speed and spawn pressure increase over time.
- [ ] Confirm game over saves score, coins, and best score.
- [ ] Confirm Play Again restarts quickly.
- [ ] Confirm one revive is available when enough banked coins exist.

## Progression
- [ ] Buy and equip each affordable skin.
- [ ] Daily Reward prevents duplicate same-day claims.
- [ ] Missions progress and can be claimed/rerolled.
- [ ] Leaderboard keeps the local top 10.
- [ ] Settings toggles work and Reset Progress clears local data.
- [ ] Tutorial appears only on first run.

## Interruption and mobile behavior
- [ ] Pause/resume works from the pause button and keyboard shortcut.
- [ ] Switching away from the app pauses the run.
- [ ] Returning to the app resumes only after user action.
- [ ] Portrait orientation remains stable.
- [ ] Test small and tall phone aspect ratios.
- [ ] Test devices with display cutouts/safe-area insets.
- [ ] Test touch controls for accidental page scrolling.

## Performance
- [ ] Mid-range phone targets smooth 60 FPS during normal play.
- [ ] Low-end phone remains at or above 30 FPS during normal play.
- [ ] Run continuously for 30+ minutes and check heat/battery behavior.
- [ ] Watch for growing obstacle/pickup counts or memory usage.
- [ ] Verify no visible hitch occurs when old objects leave the screen.

## Visual / performance QA
- [ ] Verify Sunny City → Neon Night → Jungle Ruins transitions are readable at speed.
- [ ] Verify Low/Medium/High quality changes effects without changing gameplay hitboxes.
- [ ] Verify sustained low FPS automatically falls back to Low quality.
- [ ] Verify FPS debug overlay can be enabled/disabled from Settings.
- [ ] Verify effect particle count never exceeds the configured 70-object pool.
- [ ] Verify 30+ minute run has no visible effect/object-count growth.
- [ ] Verify gameplay remains readable for color-blind players using obstacle shape as well as color.

## Release gate
Do not deploy the final build until automated checks and real-device checks above pass.
