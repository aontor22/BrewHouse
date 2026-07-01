// menuService.js
// Fetches menu items from Supabase, falls back to local constants.
// No Firebase, no Stripe.

import { MENU_ITEMS } from '../data/constants';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

function normalizeSupabaseMenuItem(item) {
  return {
    id: item.id,
    name: item.name,
    desc: item.description || '',
    description: item.description || '',
    price: Number(item.price || 0),
    emoji: item.emoji || '☕',
    category: item.category || 'Hot',
    image_url: item.image_url,
    sort_order: item.sort_order || 0,
    is_available: item.is_available !== false,
  };
}

export async function getMenuItems() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_available', true)
      .order('sort_order', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map(normalizeSupabaseMenuItem);
    }
  }
  // Fallback to bundled menu if Supabase not configured or empty
  return MENU_ITEMS;
}
