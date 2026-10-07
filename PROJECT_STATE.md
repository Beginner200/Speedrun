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
- Obstacles move toward the player.
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

## Day 5 — Complete
- Seven-day Daily Reward with escalating coins and Day 7 exclusive skin.
- Duplicate-claim and backwards-device-date protection.
- Three rotating daily missions with progress, rewards, and reroll-after-claim.
- Mission statistics are updated from completed runs.
- Personal top-10 local leaderboard with dates.
- First-run interactive swipe tutorial with skip and timeout.
- Settings for sound, music, vibration, reset progress, and an in-game privacy notice.
- Expanded Home navigation for Daily Reward, Missions, Leaderboard, Shop and Settings.
- Save migration/fallback handling includes the leaderboard field.

## Day 6 — Complete
- Reusable object pooling is integrated into live obstacle and pickup spawning/release paths.
- Removed avoidable per-frame array creation from HUD power text and optimized safe-lane selection.
- Extracted scoring/combo rules into a tested core module.
- Added scoring/combo unit tests, bringing the current suite to 24 passing tests.
- Pause now stops gameplay tweens as well as the logical update loop; resume restores them.
- Automatic interruption pause remains enabled for hidden/background browser state.
- Procedural Web Audio, looping music, haptics, obstacle warning telegraph, temporal spawn validation and magnet feedback are active.
- Offline PWA service worker and manifest are included.
- Production CI test/build gate completed successfully on the latest Day 6 gameplay commit.
- Production build is currently about 1.52 MB minified JS before gzip; Vite reports a chunk-size warning, which is a later optimization target rather than a build failure.

## Day 7 — Visual Upgrade In Progress
- Added `src/config/palette.ts` as the single source for UI and biome colors.
- Added an art-ready skin/biome system with eight cosmetic character slots and three biome definitions.
- Selected Jungle Ruins as the third biome to provide a strong visual contrast without changing gameplay.
- Added `assets/ASSET_MANIFEST.json` with standardized character dimensions/frame counts so art can be swapped without changing gameplay code.
- Added a procedural character renderer overlay that replaces the visible rectangle player while preserving the original collision object and hitbox dimensions.
- Implemented eight skin-specific color/outfit variants with distinct hair/skin/accent combinations.
- Implemented a lightweight running animation with alternating arms/legs, body bob, lane-change lean, and a contact shadow.
- Kept the renderer code-generated so there are currently no external character assets or license dependencies.
- Visual architecture is being added without changing obstacle hitboxes, scoring, saving, or offline/network rules.

## Visual Upgrade Decisions
- Art style: stylized semi-realistic, saturated, high-contrast, readable before decorative.
- Biomes: Sunny City Streets, Neon Night, Jungle Ruins.
- Biome transitions target about 2 seconds and are distance-driven.
- Quality presets will be Low/Medium/High; Low keeps baked effects and reduced particles rather than dynamic lighting.
- Character hitboxes and gameplay dimensions remain unchanged across skins/biomes.
- Maximum texture atlas target is 2048x2048; total install budget is now 40 MB.
- All assets must be CC0, openly licensed, or code-generated and must be recorded in `CREDITS.md` and `assets/ASSET_MANIFEST.json`.
- No web font, CDN, analytics, account, gameplay server, or network dependency will be introduced.
- Vercel deployment remains intentionally deferred until the visual upgrade and final QA are complete.

## Day 7 — Remaining
- Added deeper parallax dressing for all three biomes, including city silhouettes, neon signs/glow accents, and jungle foliage/ruin arches.
- Added biome transition banner presentation and layered fade when entering Neon Night or Jungle Ruins.
- Restyled Home, Shop, Daily Reward, Game Over and HUD with the glossy UI direction.
- Added shield glow, pickup bursts, near-miss streaks and quality-aware particles.
- Added Low/Medium/High quality controls, automatic Low fallback after sustained sub-40 FPS, and an optional FPS debug overlay.
- Added automated visual-system tests for biome boundaries, transition settings, and all eight character skin slots.
- Remaining: themed obstacle/lane-surface art polish, deeper character animation assets if needed, manifest validation script, final performance/readability/device QA.
- Generate final Android release assets, screenshots and signed AAB after QA.

## Existing Release State
- Capacitor Android configuration uses application ID `com.jadebelvestre.dashdodge`.
- A debug APK was successfully built in GitHub Actions and installed successfully on a real Android device.
- Vercel deployment is intentionally paused/deferred until final feature completion and QA.
