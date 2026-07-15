# Android Release Signing — Agri Innovators

Signing config is wired up in `android/app/build.gradle`. It reads credentials from
`android/keystore.properties` (git-ignored). Follow the steps below on your **local
machine** (Android Studio + JDK 17 installed).

## 1. Generate a keystore (one-time, keep forever)

From the project root:

```bash
keytool -genkey -v \
  -keystore android/app/agri-innovators-release.jks \
  -alias agri-innovators \
  -keyalg RSA -keysize 2048 -validity 10000
```

You'll be prompted for:
- Keystore password (store securely — you cannot recover it)
- Key password (use the same as keystore password for simplicity)
- Name, org, city, country (any values are fine for internal testing)

**Back up `agri-innovators-release.jks` somewhere safe.** If you lose it, you can
never publish updates to the same Play Store listing.

## 2. Create `android/keystore.properties`

Copy the template and fill it in:

```bash
cp android/keystore.properties.example android/keystore.properties
```

Edit `android/keystore.properties`:

```properties
storeFile=agri-innovators-release.jks
storePassword=YOUR_KEYSTORE_PASSWORD
keyAlias=agri-innovators
keyPassword=YOUR_KEY_PASSWORD
```

`storeFile` is resolved relative to `android/app/`.

## 3. Build the signed release

```bash
npm install
npm run build
npx cap sync android
cd android

# Signed AAB (upload to Google Play)
./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab

# Signed APK (side-load for testing on a phone)
./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk
```

## 4. Install the signed APK on a test device

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

Or transfer the `.apk` to the phone and open it (enable "Install unknown apps"
for the file manager).

## 5. Verify the signature

```bash
cd android
./gradlew signingReport
# or
keytool -list -v -keystore app/agri-innovators-release.jks
```

## Notes

- `keystore.properties` and `*.jks` are in `android/.gitignore` — never commit them.
- If `keystore.properties` is missing, the `release` build type falls back to
  unsigned (Gradle will error). This is intentional to avoid accidentally
  shipping an unsigned build.
- For Play Store: upload the `.aab` and enroll in **Play App Signing** so
  Google manages the upload → app signing key rotation.
- Bump `versionCode` and `versionName` in `android/app/build.gradle` for each
  new release.
