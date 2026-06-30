import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STATUS_FLOW = ['pending', 'confirmed', 'brewing', 'ready', 'completed'];

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
    paymentMethod: order.payment_method || (order.notes || '').replace('Payment method: ', '') || 'cash',
    paymentStatus: order.payment_status || 'unpaid',
    status: order.status || 'pending',
    createdAt: order.created_at,
    updatedAt: order.updated_at,
  };
}

export const ORDER_STATUSES = STATUS_FLOW;
export function getStatusStep(status) { return Math.max(0, STATUS_FLOW.indexOf(status)); }

export function subscribeToAllOrders(callback) {
  if (!isSupabaseConfigured || !supabase) {
    callback([]);
    return () => {};
  }
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

export async function updateOrderStatus(orderId, status) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured.');
  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
  if (error) throw error;
}
