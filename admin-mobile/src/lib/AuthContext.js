import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase, isSupabaseConfigured } from './supabase';

WebBrowser.maybeCompleteAuthSession();

const guestUser = { id: 'guest', uid: 'guest', displayName: 'Guest' };
const AuthContext = createContext({ user: guestUser, loading: false, authReady: false });

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      const currentSession = data?.session || null;
      setSession(currentSession);
      if (currentSession?.user?.id) fetchProfile(currentSession.user.id);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user?.id) fetchProfile(nextSession.user.id);
      else setProfile(null);
    });

    return () => listener?.subscription?.unsubscribe?.();
  }, []);

  const fetchProfile = async (userId) => {
    if (!supabase) return;
    const { data: { user } = {} } = await supabase.auth.getUser();
    const fallbackName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Customer';
    let { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (!data) {
      const { data: inserted } = await supabase
        .from('profiles')
        .upsert({ id: userId, full_name: fallbackName, phone: user?.phone || null, role: 'customer' }, { onConflict: 'id' })
        .select('*')
        .maybeSingle();
      data = inserted || null;
    }
    setProfile(data || null);
  };

  const refreshProfile = () => {
    if (session?.user?.id) fetchProfile(session.user.id);
  };

  const signUpWithEmail = async (email, password, fullName) => {
    if (!supabase) return { error: { message: 'Supabase is not configured yet.' } };
    return supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
  };

  const signInWithEmail = async (email, password) => {
    if (!supabase) return { error: { message: 'Supabase is not configured yet.' } };
    return supabase.auth.signInWithPassword({ email, password });
  };

  const sendPhoneOtp = async (phone) => {
    if (!supabase) return { error: { message: 'Supabase is not configured yet.' } };
    return supabase.auth.signInWithOtp({ phone });
  };

  const verifyPhoneOtp = async (phone, token) => {
    if (!supabase) return { error: { message: 'Supabase is not configured yet.' } };
    return supabase.auth.verifyOtp({ phone, token, type: 'sms' });
  };

  const signInWithGoogle = async () => {
    if (!supabase) return { error: { message: 'Supabase is not configured yet.' } };
    const redirectTo = AuthSession.makeRedirectUri({ useProxy: true });
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) return { error };
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== 'success') return { error: { message: 'Google sign-in cancelled.' } };
    const params = new URLSearchParams((result.url.split('#')[1] || result.url.split('?')[1] || ''));
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    if (!access_token || !refresh_token) return { error: { message: 'Could not complete Google sign-in.' } };
    return supabase.auth.setSession({ access_token, refresh_token });
  };

  const signInWithApple = async () => {
    if (!supabase) return { error: { message: 'Supabase is not configured yet.' } };
    if (Platform.OS !== 'ios') return { error: { message: 'Apple Sign-In is only available on iOS.' } };
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) return { error: { message: 'No identity token returned from Apple.' } };
      return supabase.auth.signInWithIdToken({ provider: 'apple', token: credential.identityToken });
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
  };

  const user = session?.user ? { ...session.user, uid: session.user.id } : guestUser;

  return (
    <AuthContext.Provider value={{
      session,
      profile,
      loading,
      user,
      authReady: isSupabaseConfigured,
      isSignedIn: !!session?.user,
      signUpWithEmail,
      signInWithEmail,
      sendPhoneOtp,
      verifyPhoneOtp,
      signInWithGoogle,
      signInWithApple,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
