// src/hooks/useMenu.js
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useMenu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_available', true)
      .order('sort_order');
    if (!error) setItems(data);
    setLoading(false);
  };

  return { items, loading, refetch: fetchMenu };
}

// ============================================================
// src/hooks/useOrders.js
// ============================================================
export function useOrders(userId) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchOrders();

    // Realtime: auto-update when order status changes (e.g. staff marks "ready")
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${userId}` },
        () => fetchOrders()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [userId]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (!error) setOrders(data);
    setLoading(false);
  };

  return { orders, loading, refetch: fetchOrders };
}

// ============================================================
// src/hooks/useCheckout.js
// Creates an order in the DB, then calls the Stripe edge function
// ============================================================
export function useCheckout() {
  const placeOrder = async ({ userId, cartItems, subtotal, tax, total }) => {
    // 1. Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({ user_id: userId, subtotal, tax, total })
      .select()
      .single();

    if (orderError) return { error: orderError };

    // 2. Insert order items (snapshot name/price at time of order)
    const orderItemsPayload = cartItems.map((item) => ({
      order_id: order.id,
      menu_item_id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.qty,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItemsPayload);
    if (itemsError) return { error: itemsError };

    // 3. Get a Stripe PaymentIntent client secret from the edge function
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/create-payment-intent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ orderId: order.id }),
      }
    );

    const paymentData = await response.json();
    if (!response.ok) return { error: paymentData.error };

    return { order, clientSecret: paymentData.clientSecret };
  };

  return { placeOrder };
}

// ============================================================
// src/hooks/useFavourites.js
// ============================================================
export function useFavourites(userId) {
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchFavourites();
  }, [userId]);

  const fetchFavourites = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('favourites')
      .select('*, menu_items(*)')
      .eq('user_id', userId);
    if (!error) setFavourites(data);
    setLoading(false);
  };

  const addFavourite = async (menuItemId, customisation = '') => {
    const { error } = await supabase
      .from('favourites')
      .insert({ user_id: userId, menu_item_id: menuItemId, customisation });
    if (!error) fetchFavourites();
    return { error };
  };

  const removeFavourite = async (favouriteId) => {
    const { error } = await supabase.from('favourites').delete().eq('id', favouriteId);
    if (!error) fetchFavourites();
    return { error };
  };

  return { favourites, loading, addFavourite, removeFavourite, refetch: fetchFavourites };
}

// ============================================================
// src/hooks/useRewards.js
// ============================================================
export function useRewards(userId, profile) {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('is_active', true)
      .order('points_cost');
    if (!error) setRewards(data);
    setLoading(false);
  };

  const redeemReward = async (reward) => {
    if (!profile || profile.loyalty_points < reward.points_cost) {
      return { error: { message: 'Not enough points' } };
    }

    const { error: redemptionError } = await supabase.from('redemptions').insert({
      user_id: userId,
      reward_id: reward.id,
      points_spent: reward.points_cost,
    });

    if (redemptionError) return { error: redemptionError };

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ loyalty_points: profile.loyalty_points - reward.points_cost })
      .eq('id', userId);

    return { error: profileError };
  };

  return { rewards, loading, redeemReward };
}
