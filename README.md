# BrewHouse ☕ — Real-life MVP Coffee Ordering App

This project was upgraded from a UI prototype into a real-working MVP-ready Expo app.

## What is included
- Live menu loading from Firebase Firestore, with local fallback data
- Cart and checkout flow
- Order creation in Firestore or local mock storage
- Customer order tracking with live status updates
- Internal Admin tab for changing order status
- Firebase anonymous auth scaffold
- Environment config template
- EAS APK build config
- Firebase setup guide and suggested Firestore structure

## Install
```bash
npm install
```

## Run locally
```bash
npx expo start
```

## Firebase setup
1. Create a Firebase project.
2. Enable Authentication → Anonymous sign-in.
3. Enable Firestore Database.
4. Copy `.env.example` to `.env` and add Firebase web app config.
5. Read `docs/FIREBASE_SETUP.md`.

Without Firebase values, the app still runs using local mock storage, so you can test checkout and order tracking immediately.

## Build APK
```bash
npx eas login
npx eas build --platform android --profile preview
```

## Important files
- `src/services/firebase.js` — Firebase connection
- `src/services/menuService.js` — Firestore menu loader with local fallback
- `src/services/orderService.js` — order create, subscribe, update logic
- `src/data/AuthContext.js` — anonymous auth wrapper
- `src/screens/AdminOrdersScreen.js` — shop-side order control
- `docs/FIREBASE_SETUP.md` — Firebase database/rules guide

## Production checklist
- Replace anonymous-only auth with phone/email login if needed
- Protect Admin tab with staff-only role/custom claims
- Add real payment gateway if online payment is required
- Add push notifications for order status changes
- Add real logo/icon/splash images
- Test on physical Android device before publishing
