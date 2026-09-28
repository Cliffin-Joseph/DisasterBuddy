# DisasterBuddy
A mobile application for disaster preparedness and alerts

## What you need

- Node.js and npm
- The Expo Go app on your phone
- A Firebase project configured for this app

## Run the app

1. Download or clone this repository and open a terminal in the project folder.
2. Install the dependencies:

   ```bash
   npm ci
   ```

3. Copy `.env.example` to a new file named `.env`. Replace the example values with your Firebase **web app** configuration from the Firebase console. Do not upload `.env` to GitHub.
4. Start Expo Go:

   ```bash
   npm run start:go
   ```

5. To use a phone, open Expo Go and scan the QR code shown in the terminal. To use an Android emulator, start the emulator in Android Studio, then press `a` in the Expo terminal. You can also use `npm run android:go` to start Expo Go and open Android automatically.

If the phone cannot connect, make sure it and your computer are on the same Wi-Fi network. You can try `npx expo start --go --tunnel` if the local connection still fails.

## Firebase setup

The app uses Firebase Authentication, Firestore, and Storage. Follow [FIREBASE_SETUP.md](FIREBASE_SETUP.md) to enable the required services and deploy the included security rules. Without this setup, sign-in and saved data will not work correctly.

## Tests

Run the unit tests with:

```bash
npm test
```

## Notifications

Expo Go is enough to explore most of the app and test local expiry reminders. Remote push notifications require a development build and a push-sending backend. The current hazard check runs while the app is active; it does not continuously monitor hazards when the app is closed.

For a native Android development build, use `npm run android`. This additionally requires a configured Android SDK and Java environment. On Windows, keeping the project in a short path such as `C:\dev\DisasterBuddy` can help avoid native build path-length problems.
