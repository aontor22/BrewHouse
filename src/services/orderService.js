import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, firestore, isFirebaseConfigured } from './firebase';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOCAL_ORDERS_KEY = 'brewhouse.orders';
const STATUS_FLOW = ['pending', 'confirmed', 'brewing', 'ready', 'completed'];

function createReadableId() {
  return `#${Math.floor(1000 + Math.random() * 9000)}`;
}

function normalizeSupabaseOrder(order) {
  const orderItems = order.order_items || [];
  return {
    id: order.id,
    readableId: order.order_number ? String(order.order_number) : `#${String(order.id).slice(0, 4)}`,
    customerId: order.user_id,
    items: orderItems.map(item => ({
      id: item.menu_item_id || item.id,
      name: item.name,
      price: Number(item.price || 0),
      qty: item.quantity || 1,
      emoji: item.emoji || '☕',
    })),
    subtotal: Number(order.subtotal || 0),
    tax: Number(order.tax || 0),
    total: Number(order.total || 0),
    paymentMethod: 'pay_at_counter',
    paymentStatus: order.payment_status || 'unpaid',
    status: order.status || 'pending',
    type: 'pickup',
    createdAt: order.created_at,
    updatedAt: order.updated_at,
  };
}

export function getStatusStep(status) {
  return Math.max(0, STATUS_FLOW.indexOf(status));
}

export async function placeOrder({ items, subtotal, customerId = 'guest', paymentMethod = 'pay_at_counter' }) {
  const taxRate = Number(process.env.EXPO_PUBLIC_TAX_RATE || 0.08);
  const tax = Number((subtotal * taxRate).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));

  if (isSupabaseConfigured && supabase && customerId !== 'guest') {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: customerId,
        subtotal: Number(subtotal.toFixed(2)),
        tax,
        total,
        payment_status: paymentMethod === 'pay_at_counter' ? 'unpaid' : 'paid',
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const payload = items.map(item => ({
      order_id: order.id,
      menu_item_id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.qty,
    }));
    const { error: itemsError } = await supabase.from('order_items').insert(payload);
    if (itemsError) throw itemsError;
    return normalizeSupabaseOrder({ ...order, order_items: payload });
  }

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
    paymentStatus: paymentMethod === 'pay_at_counter' ? 'unpaid' : 'paid',
    status: 'pending',
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
  if (isSupabaseConfigured && supabase && customerId && customerId !== 'guest') {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', customerId)
        .order('created_at', { ascending: false });
      if (!error) callback((data || []).map(normalizeSupabaseOrder));
    };
    fetchOrders();
    const channel = supabase
      .channel(`customer-orders-${customerId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${customerId}` }, fetchOrders)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }

  if (isFirebaseConfigured && db) {
    const q = firestore.query(
      firestore.collection(db, 'orders'),
      firestore.where('customerId', '==', customerId || 'guest'),
      firestore.orderBy('createdAt', 'desc')
    );
    return firestore.onSnapshot(q, snapshot => callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))));
  }

  let active = true;
  getLocalOrders().then(orders => active && callback(orders));
  return () => { active = false; };
}

export function subscribeToAllOrders(callback) {
  if (isSupabaseConfigured && supabase) {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });
      if (!error) callback((data || []).map(normalizeSupabaseOrder));
    };
    fetchOrders();
    const channel = supabase
      .channel('all-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }

  if (isFirebaseConfigured && db) {
    const q = firestore.query(firestore.collection(db, 'orders'), firestore.orderBy('createdAt', 'desc'));
    return firestore.onSnapshot(q, snapshot => callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))));
  }

  let active = true;
  getLocalOrders().then(orders => active && callback(orders));
  return () => { active = false; };
}

export async function updateOrderStatus(orderId, status) {
  if (isSupabaseConfigured && supabase && !String(orderId).startsWith('local-')) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) throw error;
    return;
  }
  if (isFirebaseConfigured && db && !String(orderId).startsWith('local-')) {
    await firestore.updateDoc(firestore.doc(db, 'orders', orderId), { status, updatedAt: firestore.serverTimestamp() });
    return;
  }
  const orders = await getLocalOrders();
  const updated = orders.map(order => order.id === orderId ? { ...order, status, updatedAt: new Date().toISOString() } : order);
  await AsyncStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
}

export const ORDER_STATUSES = STATUS_FLOW;
