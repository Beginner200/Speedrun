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
- Main Phaser scene registry now starts at Home.
- SaveService unit tests added for defaults, persistence and purchase validation.

## Decisions
- Gameplay remains entirely procedural/vector-based so the prototype has no external asset licensing dependency.
- All gameplay tuning lives in `src/config/gameConfig.ts`.
- The obstacle safety rule always leaves at least one open lane.
- Save data is local-only and versioned behind one SaveService; there are no network calls.
- Coins earned during a run are still session-only until PlayScene is wired to commit them exactly once at run end.
- Revive, persistent best-score integration, game-over Home/Shop navigation and final Day 4 economy integration remain to be completed.
- Vercel deployment remains intentionally deferred until the planned feature work is finished.

## Next
Finish Day 4 integration: connect PlayScene to SaveService, add the one-revive-per-run coin flow, persist best score and earned coins exactly once, and add Home/Shop buttons to game-over.
