Plan: Transform FarmSmart web app into an Android app using Capacitor

1. Goal and approach
   - Convert the existing Vite + React web app into a true Android app using Capacitor (already installed in the project).
   - Keep the web codebase as the single source of truth; Capacitor wraps the web app in a native Android shell.
   - Outcome: an .apk / .aab that can be installed on Android phones and later published to Google Play Store.

2. Current state
   - Capacitor dependencies are already installed: @capacitor/core, @capacitor/cli, @capacitor/android, @capacitor/ios, @capacitor/push-notifications.
   - capacitor.config.ts exists but the appName is "field-genius-site" and the server URL points to the live Lovable preview.
   - Native Android/iOS directories have not been created yet.
   - The app uses features that need Android permissions: camera (CropScanner), microphone (ChatBot voice input), GPS (useLocationTracker), and push notifications (usePushNotifications).
   - PWA/manifest setup already exists via vite-plugin-pwa.

3. Steps to implement

3.1 Update Capacitor configuration
   - Change appName in capacitor.config.ts to a consistent product name, e.g. "Agri Innovators" or "FarmSmart".
   - Review server.url: for a packaged app, remove or leave empty so the app loads from the bundled dist/ folder instead of the live preview URL. This is important for offline behavior and app-store compliance.
   - Confirm webDir: "dist" is correct.

3.2 Add Android platform
   - Run: npx cap add android
   - This creates the android/ directory with a Gradle project.

3.3 Configure Android native permissions
   - Edit android/app/src/main/AndroidManifest.xml to request permissions used by the web features:
     - Camera (CropScanner image capture)
     - Microphone/Record audio (ChatBot voice input)
     - Fine and coarse location (weather/soil/market localization)
     - Post notifications (Capacitor push notifications)
     - Internet (already present by default)
   - Also add the required queries intent for camera and other intents if needed.

3.4 Configure app identity and assets
   - Update app icon and splash screen images in the android/app/src/main/res/ drawable/mipmap folders, or use the Capacitor asset generator workflow (e.g., @capacitor/assets) to generate all required sizes from a single source icon.
   - Update strings.xml and styles.xml to match the desired app name, theme color (#16a34a), and status-bar appearance.
   - Set a unique applicationId/appId (currently app.lovable.f70938df8ad94818a0fa3337e6b7c7f9). Keep it for consistency, or update it if you want a branded Play Store package.

3.5 Build the web bundle and sync to Android
   - Run: npm run build
   - Run: npx cap sync android
   - This copies the dist/ contents into the Android project and installs any native Capacitor plugins declared in package.json.

3.6 Test in Android emulator
   - Open Android Studio.
   - Run: npx cap open android
   - Create/use an Android Virtual Device (AVD) in Android Studio.
   - Build and run the app from Android Studio (or run npx cap run android from the terminal if the Android SDK is configured).
   - Verify the five tabs (Home, Market, Scan, AI Bot, Profile) load correctly.
   - Test native features: camera scan, voice input, GPS location, and push notifications.

3.7 Test on a physical Android device
   - Enable USB debugging on the Android phone.
   - Connect the phone and run from Android Studio or via npx cap run android.
   - Grant permissions when prompted and verify the same native features.

3.8 Release preparation (optional, for Play Store)
   - Generate a signing keystore for release builds.
   - Configure build.gradle / signingConfigs in Android Studio.
   - Build a signed release .aab (Android App Bundle) or .apk from Android Studio.
   - Create a Google Play Console account and upload the .aab.

4. Important considerations
   - Server URL: the current capacitor.config.ts points to the Lovable preview URL. For an Android app, this is usually fine for quick preview, but a real app should bundle dist/ and run offline. Decide whether you want a "live" wrapper or a bundled app.
   - Web Speech API: Capacitor's WebView supports speechSynthesis and webkitSpeechRecognition on Android, but behavior varies by device. If recognition is poor, consider adding a native speech-to-text plugin as a later improvement.
   - Push notifications: currently configured via @capacitor/push-notifications. For Android, you will need a Firebase project and google-services.json in the android/app folder. This is a separate setup step after the app builds.
   - Camera/location: the web code already uses browser APIs. On Android, these map to native permissions, so no JavaScript changes are needed unless you want a more native UX.
   - App name: align the displayed name (capacitor.config.ts), manifest (vite.config.ts), and index.html <title> to avoid confusion.

5. Required tools on your machine
   - Android Studio (latest stable version)
   - Java JDK 17 or 21
   - Node.js and npm
   - Android SDK with at least one emulator image and API level 33+

6. Summary of commands you will run
   - npm run build
   - npx cap add android
   - npx cap sync android
   - npx cap open android
   - npx cap run android

7. Recommended next action
   - Approve this plan, then I will update capacitor.config.ts, add the Android platform, configure the Android manifest permissions, and update app assets. After that, you can build and test in Android Studio.