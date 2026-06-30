import React from 'react';
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
import { CartProvider, useCart } from './src/data/CartContext';
import { AuthProvider } from './src/data/AuthContext';

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
    </MenuStack.Navigator>
  );
}

function TabIcon({ name, focused }) {
  const icons = {
    Menu: '☕',
    Track: '🕐',
    Rewards: '⭐',
    Saved: '❤️',
    Admin: '🧾',
  };
  return (
    <React.Fragment>
      {/* rendered via label below */}
    </React.Fragment>
  );
}

function AppNavigator() {
  const { totalItems } = useCart();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
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
      })}
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
      <Tab.Screen
        name="Track"
        component={TrackScreen}
        options={{ tabBarIcon: ({ color }) => <TabText color={color}>🕐</TabText> }}
      />
      <Tab.Screen
        name="Rewards"
        component={LoyaltyScreen}
        options={{ tabBarIcon: ({ color }) => <TabText color={color}>⭐</TabText> }}
      />
      <Tab.Screen
        name="Saved"
        component={FavouritesScreen}
        options={{ tabBarIcon: ({ color }) => <TabText color={color}>❤️</TabText> }}
      />
      <Tab.Screen
        name="Admin"
        component={AdminOrdersScreen}
        options={{ tabBarIcon: ({ color }) => <TabText color={color}>🧾</TabText> }}
      />
    </Tab.Navigator>
  );
}

function TabText({ color, children }) {
  const { Text } = require('react-native');
  return <Text style={{ fontSize: 20, color }}>{children}</Text>;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
      <CartProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <AppNavigator />
        </NavigationContainer>
      </CartProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
