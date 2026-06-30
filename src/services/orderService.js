import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, firestore, isFirebaseConfigured } from './firebase';

const LOCAL_ORDERS_KEY = 'brewhouse.orders';
const STATUS_FLOW = ['placed', 'confirmed', 'brewing', 'ready', 'completed'];

function createReadableId() {
  return `#${Math.floor(1000 + Math.random() * 9000)}`;
}

export function getStatusStep(status) {
  return Math.max(0, STATUS_FLOW.indexOf(status));
}

export async function placeOrder({ items, subtotal, customerId = 'guest', paymentMethod = 'pay_at_counter' }) {
  const taxRate = Number(process.env.EXPO_PUBLIC_TAX_RATE || 0.08);
  const tax = Number((subtotal * taxRate).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));
  const order = {
    readableId: createReadableId(),
    customerId,
    items: items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      qty: item.qty,
      emoji: item.emoji || '☕',
    })),
    subtotal: Number(subtotal.toFixed(2)),
    tax,
    total,
    paymentMethod,
    paymentStatus: paymentMethod === 'pay_at_counter' ? 'pending' : 'paid',
    status: 'placed',
    type: 'pickup',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    const docRef = await firestore.addDoc(firestore.collection(db, 'orders'), {
      ...order,
      createdAt: firestore.serverTimestamp(),
      updatedAt: firestore.serverTimestamp(),
    });
    return { id: docRef.id, ...order };
  }

  const existing = JSON.parse(await AsyncStorage.getItem(LOCAL_ORDERS_KEY) || '[]');
  const localOrder = { id: `local-${Date.now()}`, ...order };
  await AsyncStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify([localOrder, ...existing]));
  return localOrder;
}

export async function getLocalOrders() {
  return JSON.parse(await AsyncStorage.getItem(LOCAL_ORDERS_KEY) || '[]');
}

export function subscribeToCustomerOrders(customerId, callback) {
  if (isFirebaseConfigured && db) {
    const q = firestore.query(
      firestore.collection(db, 'orders'),
      firestore.where('customerId', '==', customerId || 'guest'),
      firestore.orderBy('createdAt', 'desc')
    );
    return firestore.onSnapshot(q, snapshot => {
      callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }

  let active = true;
  getLocalOrders().then(orders => active && callback(orders));
  return () => { active = false; };
}

export function subscribeToAllOrders(callback) {
  if (isFirebaseConfigured && db) {
    const q = firestore.query(firestore.collection(db, 'orders'), firestore.orderBy('createdAt', 'desc'));
    return firestore.onSnapshot(q, snapshot => {
      callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }
  let active = true;
  getLocalOrders().then(orders => active && callback(orders));
  return () => { active = false; };
}

export async function updateOrderStatus(orderId, status) {
  if (isFirebaseConfigured && db && !String(orderId).startsWith('local-')) {
    await firestore.updateDoc(firestore.doc(db, 'orders', orderId), {
      status,
      updatedAt: firestore.serverTimestamp(),
    });
    return;
  }
  const orders = await getLocalOrders();
  const updated = orders.map(order => order.id === orderId ? { ...order, status, updatedAt: new Date().toISOString() } : order);
  await AsyncStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
}

export const ORDER_STATUSES = STATUS_FLOW;
