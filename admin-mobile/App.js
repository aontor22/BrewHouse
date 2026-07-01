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
  if (!['staff', 'admin'].includes(profile?.role)) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.foam, padding: 24 }}>
        <Text style={{ fontSize: 42 }}>🔒</Text>
        <Text style={{ fontSize: 20, fontWeight: '700', color: COLORS.espresso, marginTop: 12 }}>Admin access required</Text>
        <Text style={{ textAlign: 'center', color: COLORS.mocha, marginTop: 8 }}>Set this account role to staff/admin in Supabase profiles table.</Text>
        <TouchableOpacity onPress={signOut} style={{ marginTop: 20, backgroundColor: COLORS.mocha, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 }}>
          <Text style={{ color: 'white', fontWeight: '700' }}>Log out</Text>
        </TouchableOpacity>
      </View>
    );
  }
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
