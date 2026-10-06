# Google Play Data Safety — Dash Dodge draft

This is a release-preparation draft for the current offline-only build. The final answers must be verified against the exact Google Play Console questionnaire and the shipped APK/AAB.

## Current release model

- No user account or sign-in.
- No gameplay backend.
- No online leaderboard.
- No advertising SDK.
- No analytics SDK.
- No payment processing.
- Gameplay/progression data is stored locally on the device.

## Data handling draft

For the current build, the app is intended to declare that it **does not collect or share user data** through a developer-operated network service.

The app stores the following locally for gameplay functionality:

- Coins and best score
- Owned/selected cosmetic skins
- Daily reward state
- Mission progress
- Local leaderboard entries and dates
- Sound, music and vibration preferences
- Tutorial-completed state

These values are local game-save data and are not intentionally transmitted to a server by the current release.

## Device capabilities

- Vibration/haptics may be used when enabled.
- No contacts, location, camera, microphone, photo library, or account access is required by the current game.

## Security / deletion notes

The game provides **Reset Progress** to remove its local save data. If a future release adds accounts, cloud saves, analytics, advertising, payments, or other network services, this document and the Play Console declarations must be reviewed again.

## Final submission checklist

- [ ] Verify the final release APK/AAB contains no network/analytics/ad SDK that changes these answers.
- [ ] Complete the Play Console Data Safety questionnaire using the actual shipped build.
- [ ] Verify the privacy-policy URL is publicly accessible.
- [ ] Re-check declarations after every dependency or SDK change.
