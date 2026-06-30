# BrewHouse Final Setup

## What is included

1. Customer mobile app at project root
   - No Admin tab
   - Email login/signup
   - Menu, cart, manual payment method, order tracking
   - Manual payment methods: Cash, bKash, Nagad, Rocket, Upay, Bank

2. Admin mobile app in `/admin-mobile`
   - Separate Expo app
   - Admin/staff login only
   - Incoming orders
   - Status update: pending -> confirmed -> brewing -> ready -> completed

3. Existing web admin dashboard in `/admin-dashboard`

## Supabase SQL
Run these files in Supabase SQL Editor in order:

1. `supabase/migrations/0001_schema.sql`
2. `supabase/migrations/0002_rls_policies.sql`
3. `supabase/migrations/0003_seed_data.sql`
4. `supabase/migrations/0004_cash_order_profile_fix.sql`
5. `supabase/migrations/0005_manual_payments_and_admin_split.sql`

## Make an admin account

1. Install/open the Admin app once.
2. Sign up with the admin email.
3. Confirm email from inbox.
4. In Supabase SQL Editor, run:

```sql
update public.profiles set role = 'admin' where id = (
  select id from auth.users where email = 'YOUR_ADMIN_EMAIL@example.com' limit 1
);
```

## Expo build settings

### Customer app
Base directory: `/` or blank
Build profile: `preview`
Environment: `Preview`

### Admin mobile app
Base directory: `admin-mobile`
Build profile: `preview`
Environment: `Preview`

## Expo environment variables
Add these to Preview environment:

```env
EXPO_PUBLIC_SUPABASE_URL=https://ijrquhypqhldtxtaiayl.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_publishable_or_anon_key
```

Stripe is fully removed from the customer app build path.
