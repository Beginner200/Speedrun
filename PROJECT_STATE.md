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
- Obstacles move toward the player and are pooled through the scene list for now.
- Player/obstacle collision detection.
- Distance-based scoring and live score HUD.
- Collision response with camera shake.
- Game-over overlay showing score and best score for the current session.
- Play Again button and `R` keyboard restart.
- Unit tests for obstacle safety and Day 1 tuning.

## Decisions
- Gameplay is entirely procedural/vector-based so the prototype has no external asset licensing dependency.
- All Day 1/2 tuning lives in `src/config/gameConfig.ts`.
- The obstacle safety rule always leaves at least one open lane.
- Persistent SaveService, coins, power-ups, advanced obstacle types and meta screens remain Day 3+ work.

## Next
Day 3: difficulty curve polish, coins, Shield, Magnet, near-miss detection, combo system and HUD polish.
