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
- Game-over overlay and fast restart.
- Unit tests for obstacle safety and Day 1 tuning.

## Day 3 — Complete
- Progressive speed ramp capped at the configured maximum.
- Coin pickups on safe lanes.
- Shield power-up: 10 seconds and one-hit protection.
- Magnet power-up: 8 seconds of increased coin range.
- Power-up timers in HUD.
- Near-miss scoring, popup feedback, and combo up to x9.
- Collection feedback and camera/player feedback.

## Day 4 — Complete
- Versioned local-only SaveService with safe fallback loading.
- Persistent coins, best score and cosmetic skin economy.
- Eight cosmetic skins: two free and six unlockable, plus the Day 7 reward skin.
- Purchase/equip validation.
- Home and Shop scenes.
- One revive per run for 50 coins with brief invulnerability and nearby-obstacle clearing.
- Run rewards are settled once.

## Day 5 — Feature-complete pass
- Seven-day Daily Reward with escalating coins and Day 7 exclusive skin.
- Duplicate-claim and backwards-device-date protection.
- Three rotating daily missions with progress, rewards, and reroll-after-claim.
- Mission statistics are updated from completed runs.
- Personal top-10 local leaderboard with dates.
- First-run interactive swipe tutorial with skip and timeout.
- Settings for sound, music, vibration, reset progress, and an in-game privacy notice.
- Expanded Home navigation for Daily Reward, Missions, Leaderboard, Shop and Settings.
- Save migration/fallback handling includes the leaderboard field.

## Gameplay polish pass — Complete
- Obstacle warning telegraph before an obstacle reaches the player.
- Temporal obstacle validator keeps consecutive patterns reachable with at most one lane change.
- Pause/resume button and keyboard shortcut.
- Automatic pause when the browser/app becomes hidden, with resume/exit overlay.
- Procedural Web Audio feedback and lightweight looping music; respects sound/music settings.
- Device vibration hooks; respects vibration setting and safely no-ops where unsupported.
- Magnet now visibly pulls coins toward the player.
- Collision, pickup, near-miss, lane-change and revive feedback improved.
- Offline PWA service worker and manifest added for installable/offline shell behavior.

## Still to build before final deployment
- True object pooling/performance pass and long-session profiling.
- More particles, speed lines and final UI animation polish.
- Additional automated tests for scoring/combo, missions, leaderboard, save migration, and interruption behavior.
- Android Capacitor wrapper, icon/splash, release configuration, and real-device QA.
- Final store assets, release checklist, privacy HTML/Data Safety answers, and final production deployment.

## Decisions
- Gameplay remains procedural/vector-based with no external asset licensing dependency.
- All gameplay tuning lives in `src/config/gameConfig.ts`.
- Save data is local-only behind SaveService; there are no gameplay network calls.
- PWA offline shell is included; gameplay data remains local to the device.
- Vercel deployment is intentionally paused/deferred while feature development continues; final deployment will happen only after the feature-complete build and QA pass.
