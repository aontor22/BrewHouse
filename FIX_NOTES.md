# BrewHouse Fix Notes

This build fixes:
- Order placement failing with Supabase cash orders
- Admin tab showing to normal customers
- Phone login showing even though SMS provider is not enabled
- Missing profile row after email confirmation
- Supabase menu loading instead of static demo IDs
- App icon config

## Required Supabase step
Run this SQL file in Supabase SQL Editor before testing the new APK:

`supabase/migrations/0004_cash_order_profile_fix.sql`

## Customer vs Admin
- Normal customers will not see the Admin tab.
- To make one account admin/staff, run:

```sql
update public.profiles
set role = 'admin'
where id = '<USER_UUID_FROM_PROFILES_TABLE>';
```

Or use email:

```sql
update public.profiles p
set role = 'admin'
from auth.users u
where p.id = u.id
and u.email = 'your-email@example.com';
```

Then log out and log in again.

## Build env
Use only:

```env
EXPO_PUBLIC_SUPABASE_URL=https://ijrquhypqhldtxtaiayl.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_publishable_key
```
