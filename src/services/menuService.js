import { MENU_ITEMS } from '../data/constants';
import { db, firestore, isFirebaseConfigured } from './firebase';

export async function getMenuItems() {
  if (!isFirebaseConfigured || !db) return MENU_ITEMS;
  const ref = firestore.collection(db, 'menuItems');
  const snapshot = await firestore.getDocs(ref);
  if (snapshot.empty) return MENU_ITEMS;
  return snapshot.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(item => item.isAvailable !== false)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}
