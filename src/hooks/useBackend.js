// useBackend.js
// React hooks for data fetching. Thin wrappers over menuService / orderService.
// No Firebase, no Stripe.

import { useEffect, useState } from 'react';
import { getMenuItems } from '../services/menuService';
import { subscribeToCustomerOrders } from '../services/orderService';

export function useMenu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const data = await getMenuItems();
      setItems(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  return { items, loading, error, refetch: fetch };
}

export function useOrders(userId) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    const unsub = subscribeToCustomerOrders(userId, (data) => {
      setOrders(data);
      setLoading(false);
    });
    return unsub;
  }, [userId]);

  return { orders, loading };
}
