# BrewHouse — Full Backend + Auth + Payments + Admin Dashboard

This package adds a real production backend to your BrewHouse app:

- **Auth**: Email/password, Phone OTP (SMS), Google sign-in, Apple sign-in
- **Database**: Postgres via Supabase (menu, orders, favourites, loyalty, rewards)
- **Payments**: Stripe (real card charges, webhook-confirmed)
- **Realtime**: Order status updates push live to the customer's phone
- **Admin dashboard**: Web app for staff to manage incoming orders

---

## Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────┐
│  Mobile App      │◄────►│  Supabase         │◄────►│  Stripe     │
│  (React Native)  │      │  - Postgres DB    │      │  Payments   │
│                  │      │  - Auth           │      └─────────────┘
└─────────────────┘      │  - Realtime       │
                          │  - Edge Functions │
┌─────────────────┐      └──────────────────┘
│  Admin Dashboard │◄─────────────┘
│  (React web)      │
└─────────────────┘
```

---

## Part 1 — Set up Supabase (free tier works)

1. Go to **[supabase.com](https://supabase.com)** → create a free account → **New Project**
2. Wait ~2 min for provisioning
3. Go to **SQL Editor** → run each file in `supabase/migrations/` **in order**:
   - `0001_schema.sql`
   - `0002_rls_policies.sql`
   - `0003_seed_data.sql`
4. Go to **Settings → API** → copy your:
   - `Project URL`
   - `anon public` key
   - `service_role` key (keep secret, used only in edge functions)

---

## Part 2 — Enable Auth providers

Go to **Authentication → Providers** in Supabase:

- **Email**: enabled by default ✅
- **Phone**: enable it, then connect an SMS provider (Twilio is the easiest — free trial credits). Add your Twilio SID/Auth Token/Sender number in the Phone provider settings.
- **Google**: enable it, create OAuth credentials at [console.cloud.google.com](https://console.cloud.google.com) → paste Client ID + Secret into Supabase
- **Apple**: enable it, requires an Apple Developer account ($99/yr) → create a Sign in with Apple key → paste credentials into Supabase

---

## Part 3 — Set up Stripe

1. Go to **[stripe.com](https://stripe.com)** → create an account
2. Get your API keys from **Developers → API keys**:
   - Publishable key (`pk_...`)
   - Secret key (`sk_...`)
3. Install the Supabase CLI: `npm install -g supabase`
4. Login: `supabase login`
5. Link your project: `supabase link --project-ref YOUR_PROJECT_REF`
6. Set secrets for the edge functions:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
   supabase secrets set STRIPE_PUBLISHABLE_KEY=pk_live_xxx
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```
   (You'll get `STRIPE_WEBHOOK_SECRET` in step 8 below)
7. Deploy the edge functions:
   ```bash
   supabase functions deploy create-payment-intent
   supabase functions deploy stripe-webhook --no-verify-jwt
   ```
8. In Stripe Dashboard → **Developers → Webhooks → Add endpoint**:
   - URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook`
   - Event to send: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy the **Signing secret** → set it as `STRIPE_WEBHOOK_SECRET` (repeat step 6)

---

## Part 4 — Connect the mobile app

1. Copy the `mobile-integration/src/` folder contents into your existing BrewHouse project's `src/` folder (merges with what you already have)
2. Install new dependencies:
   ```bash
   npx expo install @supabase/supabase-js @react-native-async-storage/async-storage
   npx expo install expo-auth-session expo-web-browser expo-apple-authentication
   npx expo install @stripe/stripe-react-native
   ```
3. Edit `src/lib/supabase.js` and `admin-dashboard/src/supabase.js` — replace `YOUR_PROJECT_REF` and `YOUR_SUPABASE_ANON_KEY` with your real values
4. Wrap your `App.js` with the Stripe and Auth providers:
   ```js
   import { StripeProvider } from '@stripe/stripe-react-native';
   import { AuthProvider } from './src/lib/AuthContext';

   export default function App() {
     return (
       <StripeProvider publishableKey="pk_live_xxx">
         <AuthProvider>
           {/* ...rest of your app */}
         </AuthProvider>
       </StripeProvider>
     );
   }
   ```
5. Add a check: if no `session`, show `LoginScreen`; otherwise show the main tab navigator (see comment in `AuthContext.js`)
6. Replace your static `MENU_ITEMS`, `PAST_ORDERS`, `FAVOURITES` data calls with the hooks in `src/hooks/useBackend.js` (`useMenu`, `useOrders`, `useFavourites`, `useRewards`)
7. Replace the "Place order" button logic in `CartScreen.js` to navigate to `PaymentScreen.js` instead of simulating an order

---

## Part 5 — Run the admin dashboard

1. `cd admin-dashboard && npm install`
2. Edit `src/supabase.js` with your project URL + anon key
3. `npm run dev` → opens at `localhost:5173`
4. **Make your first staff account**: sign up a user normally, then in Supabase **Table Editor → profiles**, find that row and change `role` from `customer` to `admin`
5. Log into the dashboard with that account — you'll see live orders streaming in

Deploy the dashboard for free on **[Vercel](https://vercel.com)** or **[Netlify](https://netlify.com)** by connecting your GitHub repo.

---

## Part 6 — Rebuild your APK

Once the mobile app code is updated and committed to GitHub, trigger a new EAS build exactly as before:

```
Expo Dashboard → Builds → New build → Android → Preview
```

---

## Cost summary (to set expectations)

| Service | Free tier | When you'll pay |
|---|---|---|
| Supabase | 500MB DB, 50k auth users | Beyond that, ~$25/mo |
| Stripe | No monthly fee | 2.9% + $0.30 per transaction |
| Twilio (SMS OTP) | Trial credit | ~$0.0075/SMS after |
| Google/Apple OAuth | Free | Apple requires $99/yr developer account |
| Vercel/Netlify (admin dashboard) | Free | Free for this use case |

This stack can comfortably run a real single-location coffee shop at no fixed monthly cost beyond Stripe's per-transaction fee.

---

## Security notes

- Row Level Security (RLS) is enabled on every table — customers can only see their own orders/favourites; only staff/admin roles can see all orders or edit the menu
- The Stripe **secret key** never touches the mobile app — it lives only in the server-side edge function
- Payment confirmation happens via Stripe's **webhook**, not the client, so a user can't fake a "successful" payment by manipulating the app
