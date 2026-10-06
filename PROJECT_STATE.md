# Dash Dodge — Project State

## Day 1 — Complete
- Phaser 3 + TypeScript + Vite foundation.
- Portrait responsive canvas and safe mobile touch behavior.
- Playable 3-lane road with scrolling lane markers.
- Placeholder player with swipe, tap-side, A/D and arrow controls.
- Smooth lane tween and input buffer.
- Endless movement, speed ramp, distance and speed HUD.

## Day 2 — Complete
- Procedural obstacle spawning with a safe-path validator.
- One- and two-lane obstacle patterns; never intentionally blocks all three lanes.
- Obstacles move toward the player and are tracked in the scene obstacle list for now.
- Player/obstacle collision detection.
- Distance-based scoring and live score HUD.
- Collision response with camera shake.
- Game-over overlay showing score and best score for the current session.
- Play Again button and `R` keyboard restart.
- Unit tests for obstacle safety and Day 1 tuning.

## Day 3 — Complete
- Progressive speed ramp remains capped at the configured maximum.
- Coin pickups spawn on safe lanes and increase the run coin count.
- Shield power-up grants 10 seconds of one-hit protection.
- Magnet power-up grants 8 seconds of increased coin pickup range.
- Power-up timers are shown in the HUD.
- Near-miss detection awards bonus score and a visible popup.
- Consecutive near misses build a combo up to x9; the combo expires after its timer.
- Shield hits consume the shield instead of ending the run.
- Collection feedback and camera/player feedback added.

## Day 4 — In Progress
- Versioned local-only SaveService added with safe fallback loading.
- Persistent coins and best-score storage primitives added.
- Eight cosmetic skins added: two free and six unlockable.
- Purchase/equip validation added to the economy service.
- Home scene added with Play, Shop, reset-progress, best-score and coin display.
- Shop scene added with all eight skins and persistent equip/purchase state.
- Main Phaser scene registry starts at Home.
- SaveService unit tests added for defaults, persistence and purchase validation.
- PlayScene now loads the selected skin and persistent best score.
- Run coins are committed to the local bank exactly once when a run ends.
- Best score is persisted when the run ends.
- Near-miss bonuses now accumulate separately instead of being overwritten every frame.
- One revive per run added, costing 50 persistent coins and granting brief invulnerability.
- Revive clears nearby obstacles and resumes the same run.
- Game-over screen now includes Play Again and Home navigation, with Shop available from Home.

## Decisions
- Gameplay remains entirely procedural/vector-based so the prototype has no external asset licensing dependency.
- All gameplay tuning lives in `src/config/gameConfig.ts`.
- The obstacle safety rule always leaves at least one open lane.
- Save data is local-only and versioned behind one SaveService; there are no network calls.
- A run's earned coins are awarded to the persistent bank once; a revive cannot award the same run coins twice.
- Revive costs 50 coins and is limited to once per run.
- Vercel deployment remains intentionally deferred until the planned feature work is finished.

## Next
Finish Day 4 QA/integration checks: verify the live game build, refine game-over Home/Shop navigation, and add targeted tests for revive and run-reward behavior before moving to Day 5.
