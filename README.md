# BrewHouse ☕ — Coffee Shop Ordering App

A warm & cozy React Native (Expo) app for ordering coffee, tracking orders, earning loyalty points, and saving favourites.

---

## Features
- 📋 **Menu** — Browse hot drinks, cold drinks, and food. Add to cart.
- 🛒 **Cart** — Review items, see tax, place order.
- 🕐 **Order tracking** — Live step-by-step brewing progress + past orders.
- ⭐ **Rewards** — Loyalty stamp card, points tracker, redeemable rewards.
- ❤️ **Saved** — Favourite drinks with one-tap reorder.

---

## How to build the APK (3 steps)

### Prerequisites
- [Node.js 18+](https://nodejs.org/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Free [Expo account](https://expo.dev/signup) (for EAS Build)

### Step 1 — Install dependencies
```bash
cd brewhouse
npm install
```

### Step 2 — Log in to Expo
```bash
npx eas login
```

### Step 3 — Build the APK
```bash
npx eas build --platform android --profile preview
```

This uploads to Expo's free cloud build service and gives you a download link for the `.apk` file in ~5–10 minutes. No Android Studio needed!

---

## Run locally (optional)
```bash
npx expo start
```
Then scan the QR code with the **Expo Go** app on your Android phone to preview instantly.

---

## Customise
- **Menu items** → `src/data/constants.js` → `MENU_ITEMS`
- **Shop name & colours** → `src/data/constants.js` → `COLORS`
- **Loyalty rules** → `src/screens/LoyaltyScreen.js`
