# Android release guide

## Development build

From the project root:

```bash
npm install
npm run build
npx cap add android
npx cap sync android
npx cap run android
```

The `android/` project should only be generated after the web build is healthy. Android Studio is used for native configuration and physical-device testing.

## Release build

1. Confirm all automated tests pass.
2. Run the production web build.
3. Run `npx cap sync android`.
4. Open the generated `android/` project in Android Studio.
5. Verify application ID: `com.jadebelvestre.dashdodge`.
6. Verify app name: `Dash Dodge`.
7. Verify portrait orientation and safe-area behavior.
8. Set final version name and monotonically increasing version code.
9. Configure the final launcher icon and splash assets.
10. Configure a release signing key/keystore outside the repository.
11. Build a signed AAB for Google Play and an APK when a directly installable package is useful.
12. Install the release build on a physical Android phone and complete `TESTING.md`.

## Signing security

Never commit keystores, passwords, signing certificates containing private keys, or Play service-account credentials to GitHub. Keep signing secrets in a secure password manager or CI secret store.

## Release gate

Do not publish or deploy the release until automated tests, physical-device gameplay, interruption/resume, touch input, portrait orientation, safe-area behavior, and long-session stability checks pass.

## Current project decision

Vercel deployment remains deferred until Android QA and the final release review are complete.
