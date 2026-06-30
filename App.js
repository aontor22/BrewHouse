import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

import MenuScreen from './src/screens/MenuScreen';
import CartScreen from './src/screens/CartScreen';
import TrackScreen from './src/screens/TrackScreen';
import LoyaltyScreen from './src/screens/LoyaltyScreen';
import FavouritesScreen from './src/screens/FavouritesScreen';
import AdminOrdersScreen from './src/screens/AdminOrdersScreen';
import LoginScreen from './src/screens/LoginScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import { CartProvider, useCart } from './src/data/CartContext';
import { AuthProvider, useAuth } from './src/lib/AuthContext';

const Tab = createBottomTabNavigator();
const MenuStack = createStackNavigator();

const COLORS = {
  espresso: '#1A0A00',
  mocha: '#6B3A1F',
  latte: '#C49A6C',
  cream: '#F5EDD8',
  foam: '#FFF8EE',
};

function MenuStackScreen() {
  return (
    <MenuStack.Navigator screenOptions={{ headerShown: false }}>
      <MenuStack.Screen name="MenuMain" component={MenuScreen} />
      <MenuStack.Screen name="Cart" component={CartScreen} />
      <MenuStack.Screen name="Payment" component={PaymentScreen} />
    </MenuStack.Navigator>
  );
}

function AppNavigator() {
  const { totalItems } = useCart();
  const { profile } = useAuth();
  const isStaff = ['staff', 'admin'].includes(profile?.role);
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.espresso,
          borderTopColor: '#2a1500',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: COLORS.latte,
        tabBarInactiveTintColor: '#666',
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tab.Screen
        name="Menu"
        component={MenuStackScreen}
        options={{
          tabBarIcon: ({ color }) => <TabText color={color}>☕</TabText>,
          tabBarBadge: totalItems > 0 ? totalItems : undefined,
          tabBarBadgeStyle: { backgroundColor: COLORS.latte, color: COLORS.espresso, fontSize: 10 },
        }}
      />
      <Tab.Screen name="Track" component={TrackScreen} options={{ tabBarIcon: ({ color }) => <TabText color={color}>🕐</TabText> }} />
      <Tab.Screen name="Rewards" component={LoyaltyScreen} options={{ tabBarIcon: ({ color }) => <TabText color={color}>⭐</TabText> }} />
      <Tab.Screen name="Saved" component={FavouritesScreen} options={{ tabBarIcon: ({ color }) => <TabText color={color}>❤️</TabText> }} />
      {isStaff && (
        <Tab.Screen name="Admin" component={AdminOrdersScreen} options={{ tabBarIcon: ({ color }) => <TabText color={color}>🧾</TabText> }} />
      )}
    </Tab.Navigator>
  );
}

function TabText({ color, children }) {
  return <Text style={{ fontSize: 20, color }}>{children}</Text>;
}

function AppGate() {
  const { loading, authReady, isSignedIn } = useAuth();
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.foam }}>
        <ActivityIndicator color={COLORS.mocha} />
        <Text style={{ marginTop: 10, color: COLORS.mocha }}>Loading BrewHouse…</Text>
      </View>
    );
  }
  if (authReady && !isSignedIn) return <LoginScreen />;
  return <AppNavigator />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <CartProvider>
          <NavigationContainer>
            <StatusBar style="light" />
            <AppGate />
          </NavigationContainer>
        </CartProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
