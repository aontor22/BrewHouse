# BrewHouse – merged production-ready MVP

This repo now includes the original Expo React Native coffee ordering app, Firebase fallback order storage, and the Supabase + Stripe backend package.

## What is merged

- Expo mobile app
- Supabase auth-ready login screen
- Supabase orders/menu/rewards hooks
- Stripe payment screen scaffold
- Firebase/local fallback order flow
- In-app admin order status dashboard
- Supabase SQL migrations and Edge Functions
- Separate Vite admin dashboard folder

## GitHub + Expo build

For Expo.dev GitHub builds, keep the base directory as `/` or blank.

Recommended first test build:

- Platform: Android
- Git ref: `main`
- EAS Build profile: `preview`
- Environment: `Preview`
- EAS Submit: Off / skip

## Required Expo/EAS environment variables

Add these in Expo.dev project environment variables before building the real backend version:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxx
EXPO_PUBLIC_SHOP_NAME=BrewHouse
EXPO_PUBLIC_TAX_RATE=0.08
```

If Supabase variables are not added yet, the app still opens in guest/local fallback mode so the APK build does not fail only because backend values are missing.

## Supabase setup

1. Create a Supabase project.
2. Run the SQL files inside `supabase/migrations` in order:
   - `0001_schema.sql`
   - `0002_rls_policies.sql`
   - `0003_seed_data.sql`
3. Deploy the Edge Functions from `supabase/functions`.
4. Add Stripe secret values to Supabase Function secrets.
5. Add the public Supabase and Stripe keys to Expo/EAS env variables.

Full details are in `docs/SUPABASE_STRIPE_SETUP.md`.

## Admin dashboard

The web admin dashboard is inside `admin-dashboard/`. It is a separate Vite app and should be deployed separately. Do not set Expo base directory to `admin-dashboard` for the mobile app.

## Install/run locally

```bash
npm install
npx expo start
```

## Notes

- Do not upload a real `.env` with secret values to GitHub.
- Stripe secret key must never be placed in the mobile app.
- For test APK sharing, use the `preview` profile first. Use `production` only when ready for Play Store/App Store release.
