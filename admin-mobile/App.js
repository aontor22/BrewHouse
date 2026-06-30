import React from 'react';
import { ActivityIndicator, Text, View, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/lib/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import AdminOrdersScreen from './src/screens/AdminOrdersScreen';

const COLORS = { espresso: '#1A0A00', mocha: '#6B3A1F', latte: '#C49A6C', foam: '#FFF8EE' };

function AdminGate() {
  const { loading, authReady, isSignedIn, profile, signOut } = useAuth();
  if (loading) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.foam }}><ActivityIndicator color={COLORS.mocha} /><Text style={{ marginTop: 10, color: COLORS.mocha }}>Loading admin…</Text></View>;
  }
  if (authReady && !isSignedIn) return <LoginScreen />;
  // Admin APK is a separate app, so do not block the screen with a client-side role gate.
  // Real protection still stays in Supabase RLS policies. Set the staff/admin role in Supabase
  // for full order update permission.
  return <AdminOrdersScreen />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar style="light" />
        <AdminGate />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
