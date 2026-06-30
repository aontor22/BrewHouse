# Firebase setup for BrewHouse

## 1. Create Firebase project
Create a Firebase project, then enable:
- Authentication → Anonymous sign-in
- Firestore Database → production mode

## 2. Add Expo environment values
Copy `.env.example` to `.env` and fill values from Firebase project settings.

```bash
cp .env.example .env
```

## 3. Firestore collections
The app uses these collections:

### `menuItems`
```js
{
  name: 'Cappuccino',
  desc: 'Espresso, steamed milk, foam',
  price: 4.5,
  emoji: '🥛',
  category: 'Hot',
  isAvailable: true,
  sortOrder: 2
}
```

### `orders`
Orders are created automatically from the app checkout.

```js
{
  readableId: '#2847',
  customerId: 'firebase-auth-uid',
  items: [{ id, name, price, qty, emoji }],
  subtotal: 9.5,
  tax: 0.76,
  total: 10.26,
  status: 'placed',
  paymentMethod: 'pay_at_counter',
  paymentStatus: 'pending',
  type: 'pickup',
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

## 4. Suggested Firestore rules for MVP testing
Use stricter admin claims before public launch.

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /menuItems/{itemId} {
      allow read: if true;
      allow write: if false;
    }

    match /orders/{orderId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && resource.data.customerId == request.auth.uid;
      allow update: if request.auth != null;
      allow delete: if false;
    }
  }
}
```

## 5. Production security note
The included Admin tab is for MVP/internal testing. Before Play Store release, protect staff features using Firebase custom claims or create a separate staff app/dashboard.
