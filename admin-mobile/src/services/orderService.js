// orderService.js
// Supabase-first order management. Falls back to local AsyncStorage
// if Supabase is not yet configured (useful for offline testing).
// No Firebase, no Stripe.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOCAL_ORDERS_KEY = 'brewhouse.orders';

// Status flow used by BOTH customer app and admin app
// pending → accepted → preparing → ready → completed
export const ORDER_STATUSES = ['pending', 'accepted', 'preparing', 'ready', 'completed'];

function createReadableId() {
  return `#${Math.floor(1000 + Math.random() * 9000)}`;
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || '')
  );
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
    paymentMethod: order.notes
      ? String(order.notes).replace('Payment method: ', '')
      : 'cash',
    paymentStatus: order.payment_status || 'unpaid',
    status: order.status || 'pending',
    createdAt: order.created_at,
    updatedAt: order.updated_at,
  };
}

export function getStatusStep(status) {
  return Math.max(0, ORDER_STATUSES.indexOf(status));
}

// ─── Place a new order ────────────────────────────────────────────────────────
export async function placeOrder({ items, subtotal, customerId = 'guest', paymentMethod = 'cash' }) {
  const taxRate = Number(process.env.EXPO_PUBLIC_TAX_RATE || 0.08);
  const tax = Number((subtotal * taxRate).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));

  // Supabase path
  if (isSupabaseConfigured && supabase && customerId !== 'guest') {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: customerId,
        subtotal: Number(subtotal.toFixed(2)),
        tax,
        total,
        payment_status: 'unpaid',
        status: 'pending',
        notes: `Payment method: ${paymentMethod}`,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const payload = items.map(item => ({
      order_id: order.id,
      menu_item_id: isUuid(item.id) ? item.id : null,
      name: item.name,
      price: item.price,
      quantity: item.qty,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(payload);
    if (itemsError) throw itemsError;

    return normalizeSupabaseOrder({ ...order, order_items: payload });
  }

  // Local fallback (no Supabase configured or guest user)
  const order = {
    id: `local-${Date.now()}`,
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
    paymentStatus: 'unpaid',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const existing = JSON.parse(await AsyncStorage.getItem(LOCAL_ORDERS_KEY) || '[]');
  await AsyncStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify([order, ...existing]));
  return order;
}

// ─── Fetch local orders ────────────────────────────────────────────────────────
export async function getLocalOrders() {
  return JSON.parse(await AsyncStorage.getItem(LOCAL_ORDERS_KEY) || '[]');
}

// ─── Subscribe to a customer's orders (realtime) ─────────────────────────────
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
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${customerId}` },
        fetchOrders
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }

  // Local fallback
  let active = true;
  getLocalOrders().then(orders => active && callback(orders));
  return () => { active = false; };
}

// ─── Subscribe to ALL orders (admin) ─────────────────────────────────────────
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
      .channel('admin-all-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }

  // Local fallback
  let active = true;
  getLocalOrders().then(orders => active && callback(orders));
  return () => { active = false; };
}

// ─── Update order status (admin) ──────────────────────────────────────────────
export async function updateOrderStatus(orderId, status) {
  if (isSupabaseConfigured && supabase && !String(orderId).startsWith('local-')) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) throw error;
    return;
  }
  // Local fallback
  const orders = await getLocalOrders();
  const updated = orders.map(o =>
    o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
  );
  await AsyncStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
}

// ─── Mark payment as paid manually (admin) ────────────────────────────────────
export async function markPaymentPaid(orderId) {
  if (isSupabaseConfigured && supabase && !String(orderId).startsWith('local-')) {
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: 'paid' })
      .eq('id', orderId);
    if (error) throw error;
    return;
  }
  // Local fallback
  const orders = await getLocalOrders();
  const updated = orders.map(o =>
    o.id === orderId ? { ...o, paymentStatus: 'paid', updatedAt: new Date().toISOString() } : o
  );
  await AsyncStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
}
