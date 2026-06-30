import { MENU_ITEMS } from '../data/constants';
import { db, firestore, isFirebaseConfigured } from './firebase';
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

  if (isFirebaseConfigured && db) {
    const ref = firestore.collection(db, 'menuItems');
    const snapshot = await firestore.getDocs(ref);
    if (!snapshot.empty) {
      return snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(item => item.isAvailable !== false)
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }
  }

  return MENU_ITEMS;
}
