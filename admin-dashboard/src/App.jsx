import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';

const COLORS = {
  espresso: '#1A0A00', mocha: '#6B3A1F', latte: '#C49A6C',
  cream: '#F5EDD8', foam: '#FFF8EE', white: '#FFFFFF',
};

const STATUS_FLOW = ['pending', 'confirmed', 'brewing', 'ready', 'completed'];
const STATUS_LABELS = {
  pending: 'Pending payment', confirmed: 'Confirmed', brewing: 'Brewing',
  ready: 'Ready for pickup', completed: 'Completed', cancelled: 'Cancelled',
};
const STATUS_COLORS = {
  pending: '#9CA3AF', confirmed: '#3B82F6', brewing: '#F59E0B',
  ready: '#10B981', completed: '#6B7280', cancelled: '#EF4444',
};

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkRole(session.user.id);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
      if (session) checkRole(session.user.id);
      else setProfile(null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const checkRole = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(data);
  };

  if (!session) return <LoginView />;
  if (profile && profile.role === 'customer') {
    return (
      <CenteredMessage title="Access restricted" message="This account doesn't have staff access. Ask an admin to upgrade your role in the profiles table." />
    );
  }
  if (!profile) return <CenteredMessage title="Loading…" message="" />;

  return <Dashboard profile={profile} />;
}

function LoginView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
  };

  return (
    <div style={styles.loginWrap}>
      <form onSubmit={handleLogin} style={styles.loginCard}>
        <h1 style={styles.loginTitle}>☕ BrewHouse Staff</h1>
        <input style={styles.input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input style={styles.input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p style={{ color: '#EF4444', fontSize: 13 }}>{error}</p>}
        <button style={styles.loginBtn} type="submit">Log in</button>
      </form>
    </div>
  );
}

function CenteredMessage({ title, message }) {
  return (
    <div style={styles.loginWrap}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ color: COLORS.espresso }}>{title}</h2>
        <p style={{ color: '#888' }}>{message}</p>
      </div>
    </div>
  );
}

function Dashboard({ profile }) {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*), profiles(full_name, phone)')
      .order('created_at', { ascending: false });
    if (data) setOrders(data);
  };

  const advanceStatus = async (order) => {
    const idx = STATUS_FLOW.indexOf(order.status);
    const next = STATUS_FLOW[idx + 1];
    if (!next) return;
    await supabase.from('orders').update({ status: next }).eq('id', order.id);
  };

  const cancelOrder = async (order) => {
    await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id);
  };

  const filtered = orders.filter((o) => {
    if (filter === 'active') return ['confirmed', 'brewing', 'ready'].includes(o.status);
    if (filter === 'completed') return o.status === 'completed';
    if (filter === 'cancelled') return o.status === 'cancelled';
    return true;
  });

  return (
    <div style={styles.dashWrap}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>☕ BrewHouse Staff Dashboard</h1>
        <div style={styles.headerRight}>
          <span style={styles.headerName}>{profile.full_name || 'Staff'}</span>
          <button style={styles.logoutBtn} onClick={() => supabase.auth.signOut()}>Log out</button>
        </div>
      </header>

      <div style={styles.filterRow}>
        {['active', 'completed', 'cancelled', 'all'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{ ...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {}) }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div style={styles.ordersGrid}>
        {filtered.length === 0 && <p style={{ color: '#999' }}>No orders here.</p>}
        {filtered.map((order) => (
          <div key={order.id} style={styles.orderCard}>
            <div style={styles.orderTop}>
              <span style={styles.orderNum}>{order.order_number}</span>
              <span style={{ ...styles.statusPill, background: STATUS_COLORS[order.status] }}>
                {STATUS_LABELS[order.status]}
              </span>
            </div>
            <p style={styles.customerName}>{order.profiles?.full_name || 'Customer'}</p>
            <div style={styles.itemsList}>
              {order.order_items?.map((item) => (
                <div key={item.id} style={styles.itemRow}>
                  <span>{item.quantity}× {item.name}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div style={styles.orderFooter}>
              <span style={styles.totalText}>Total: ${order.total.toFixed(2)}</span>
              <span style={styles.paymentBadge}>
                {order.payment_status === 'paid' ? '✅ Paid' : '⏳ Unpaid'}
              </span>
            </div>
            {!['completed', 'cancelled'].includes(order.status) && (
              <div style={styles.actionRow}>
                {order.status !== 'pending' && (
                  <button style={styles.advanceBtn} onClick={() => advanceStatus(order)}>
                    Mark as {STATUS_LABELS[STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1]]} →
                  </button>
                )}
                <button style={styles.cancelBtn} onClick={() => cancelOrder(order)}>Cancel</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  loginWrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: COLORS.foam, fontFamily: 'system-ui' },
  loginCard: { background: COLORS.white, padding: 36, borderRadius: 16, width: 320, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  loginTitle: { color: COLORS.espresso, marginBottom: 24, textAlign: 'center' },
  input: { width: '100%', padding: 12, marginBottom: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' },
  loginBtn: { width: '100%', padding: 13, background: COLORS.mocha, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  dashWrap: { minHeight: '100vh', background: COLORS.foam, fontFamily: 'system-ui' },
  header: { background: COLORS.espresso, padding: '16px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: COLORS.latte, margin: 0, fontSize: 20 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 14 },
  headerName: { color: '#ccc', fontSize: 13 },
  logoutBtn: { background: 'transparent', border: '1px solid #555', color: '#ccc', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12 },
  filterRow: { display: 'flex', gap: 8, padding: '20px 28px 0' },
  filterBtn: { padding: '8px 16px', borderRadius: 20, border: '1px solid #e5d5c0', background: COLORS.white, color: COLORS.mocha, cursor: 'pointer', fontSize: 13 },
  filterBtnActive: { background: COLORS.mocha, color: '#fff', borderColor: COLORS.mocha },
  ordersGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, padding: 28 },
  orderCard: { background: COLORS.white, borderRadius: 14, border: '1px solid #e5d5c0', padding: 18 },
  orderTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderNum: { fontWeight: 600, color: COLORS.espresso, fontSize: 15 },
  statusPill: { color: '#fff', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 12 },
  customerName: { color: '#888', fontSize: 13, marginBottom: 12 },
  itemsList: { borderTop: '1px solid #f0e4d0', borderBottom: '1px solid #f0e4d0', padding: '10px 0', marginBottom: 10 },
  itemRow: { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#555', padding: '3px 0' },
  orderFooter: { display: 'flex', justifyContent: 'space-between', marginBottom: 12 },
  totalText: { fontWeight: 600, color: COLORS.mocha, fontSize: 14 },
  paymentBadge: { fontSize: 12, color: '#555' },
  actionRow: { display: 'flex', gap: 8 },
  advanceBtn: { flex: 1, background: COLORS.mocha, color: '#fff', border: 'none', borderRadius: 8, padding: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  cancelBtn: { background: 'transparent', border: '1px solid #EF4444', color: '#EF4444', borderRadius: 8, padding: 10, fontSize: 12, cursor: 'pointer' },
};
