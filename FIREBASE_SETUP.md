# Firebase setup

The app remains usable in local preview mode until Firebase is configured.

1. Create or select a Firebase project.
2. Register a Web app in Firebase Project Settings.
3. Enable **Authentication > Sign-in method > Email/Password**. Anonymous authentication is no longer used for new sessions.
4. Create a Cloud Firestore database.
5. Copy `.env.example` to `.env` and fill in the Firebase Web app values.
6. Restart Expo with `npx expo start --clear`.
7. Deploy `firestore.rules` before using the production database.

The `EXPO_PUBLIC_` values are normal Firebase client configuration. Never put a service-account key or administrator credential in this app.

## Implemented foundation

- Firebase modular JavaScript SDK
- persistent email/password authentication on Android and iOS
- login, sign-up, password reset and logout flows
- automatic `users/{uid}` creation, plus migration of an existing anonymous session when the user signs up
- editable profile and household data with a private emergency-contact subcollection
- controlled `lastActiveAt` update during startup
- explicit loading, retry and preview states
- owner-only Firestore rules
- Auth and Firestore emulator declarations

## Next vertical slice

Create a checklist repository service that writes one Tier 1 item to `users/{uid}/checklistItems/{itemId}`, restores it after restart, merges it with the local definition by permanent ID, and derives progress from the merged state.
