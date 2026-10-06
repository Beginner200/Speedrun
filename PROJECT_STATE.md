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

## Day 7 — In Progress
- Capacitor Android configuration added with application ID `com.jadebelvestre.dashdodge`.
- Android build/sync scripts and Capacitor dependencies added to package configuration.
- Privacy notice added for the offline/local-only release model.
- Release checklist added for Android QA, signing, store assets and final deployment.
- Google Play store-listing draft added.

## Day 7 — Remaining
- Generate the Android project with `npx cap add android` in an Android-capable development environment.
- Add final adaptive icon and splash assets.
- Set final Android version code/name and verify release configuration.
- Build and test a signed AAB/APK on a physical Android device.
- Complete touch, orientation, safe-area, interruption, battery/heat and long-session QA.
- Create final screenshots, feature graphic and app icon.
- Complete Google Play Data Safety and content-rating questionnaires.
- Publish the privacy notice at a public URL before store submission.
- Run final production CI and release review.
- Deploy to Vercel only after final QA approval.

## Decisions
- Gameplay remains procedural/vector-based with no external asset licensing dependency.
- All gameplay tuning lives in `src/config/gameConfig.ts`.
- Save data is local-only behind SaveService; there are no gameplay network calls.
- PWA offline shell is included; gameplay data remains local to the device.
- Android package ID is `com.jadebelvestre.dashdodge`.
- Vercel deployment is intentionally paused/deferred until final feature completion and QA.
