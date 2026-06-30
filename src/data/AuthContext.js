import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, isFirebaseConfigured, onAuthStateChanged, signInAnonymously } from '../services/firebase';

const AuthContext = createContext({ user: { uid: 'guest' }, loading: false });

export function AuthProvider({ children }) {
  const [user, setUser] = useState({ uid: 'guest', displayName: 'Guest' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, current => {
      setUser(current || { uid: 'guest', displayName: 'Guest' });
      setLoading(false);
    });
    signInAnonymously(auth).catch(() => setLoading(false));
    return unsub;
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
