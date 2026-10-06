# Dash Dodge Release Checklist

## Build
- [x] TypeScript production build passes in CI
- [x] Automated tests pass
- [ ] Install and run Android debug build on a physical phone
- [ ] Verify portrait orientation and safe-area behavior
- [ ] Verify touch/swipe latency
- [ ] Verify background/resume behavior
- [ ] Verify 30+ minute session stability
- [ ] Check battery and device heat

## Android
- [x] Capacitor app ID configured: `com.jadebelvestre.dashdodge`
- [x] Capacitor app name configured: `Dash Dodge`
- [ ] Generate Android project with `npx cap add android`
- [ ] Configure adaptive launcher icon
- [ ] Configure splash screen
- [ ] Set final Android versionCode/versionName
- [ ] Create signed release AAB
- [ ] Test signed release on a physical Android device
- [ ] Store signing key securely; never commit it

## Store assets
- [ ] App icon: 512x512 PNG
- [ ] Feature graphic: 1024x500 PNG/JPG
- [ ] Phone screenshots
- [ ] Short description
- [ ] Full description
- [ ] Content rating questionnaire
- [ ] Data Safety questionnaire
- [ ] Privacy policy URL

## Release review
- [ ] Confirm no network/account/analytics behavior was added accidentally
- [ ] Confirm no unlicensed assets are included
- [ ] Confirm reset-progress flow works
- [ ] Confirm daily reward duplicate-claim protection
- [ ] Confirm leaderboard remains local-only
- [ ] Confirm Shop purchases/equipped skins persist
- [ ] Confirm Revive works only once per run
- [ ] Confirm game can restart quickly after game over
- [ ] Final production build and GitHub Actions check are green
- [ ] Deploy to Vercel only after final QA approval
