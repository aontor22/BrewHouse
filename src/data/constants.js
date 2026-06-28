export const COLORS = {
  espresso: '#1A0A00',
  coffee: '#3B1F0A',
  mocha: '#6B3A1F',
  latte: '#C49A6C',
  cream: '#F5EDD8',
  foam: '#FFF8EE',
  white: '#FFFFFF',
  lightBorder: '#E5D5C0',
  muted: '#999999',
  success: '#065F46',
  successBg: '#D1FAE5',
  warning: '#92400E',
  warningBg: '#FEF3C7',
  gray: '#6B7280',
  grayBg: '#F3F4F6',
};

export const FONTS = {
  regular: '400',
  medium: '500',
  bold: '700',
};

export const MENU_ITEMS = [
  { id: '1', name: 'Espresso', desc: 'Double shot, rich crema', price: 3.00, emoji: '☕', category: 'Hot' },
  { id: '2', name: 'Cappuccino', desc: 'Espresso, steamed milk, foam', price: 4.50, emoji: '🥛', category: 'Hot' },
  { id: '3', name: 'Flat White', desc: 'Velvety microfoam, intense shot', price: 4.50, emoji: '☕', category: 'Hot' },
  { id: '4', name: 'Caramel Macchiato', desc: 'Vanilla, caramel drizzle', price: 5.50, emoji: '🍮', category: 'Hot' },
  { id: '5', name: 'Matcha Latte', desc: 'Ceremonial grade, oat milk', price: 5.00, emoji: '🍵', category: 'Hot' },
  { id: '6', name: 'Cold Brew', desc: '12-hr steep, smooth finish', price: 5.00, emoji: '🧊', category: 'Cold' },
  { id: '7', name: 'Lavender Cold Brew', desc: 'House lavender syrup', price: 5.50, emoji: '🧋', category: 'Cold' },
  { id: '8', name: 'Iced Americano', desc: 'Bold espresso over ice', price: 4.00, emoji: '🥤', category: 'Cold' },
  { id: '9', name: 'Butter Croissant', desc: 'Freshly baked, flaky layers', price: 3.50, emoji: '🥐', category: 'Food' },
  { id: '10', name: 'Blueberry Muffin', desc: 'Bursting with berries', price: 3.00, emoji: '🫐', category: 'Food' },
  { id: '11', name: 'Avocado Toast', desc: 'Sourdough, chilli flakes', price: 7.00, emoji: '🥑', category: 'Food' },
];

export const PAST_ORDERS = [
  {
    id: '#2831',
    items: ['Cappuccino', 'Cold Brew'],
    total: 9.50,
    date: 'Jun 26',
    status: 'completed',
  },
  {
    id: '#2819',
    items: ['Espresso', 'Espresso', 'Croissant'],
    total: 9.50,
    date: 'Jun 24',
    status: 'completed',
  },
  {
    id: '#2804',
    items: ['Flat White', 'Matcha Latte', 'Muffin'],
    total: 13.00,
    date: 'Jun 21',
    status: 'completed',
  },
];

export const FAVOURITES = [
  { id: '3', name: 'Flat White', customisation: 'Oat milk · No sugar · Medium', emoji: '☕', price: 4.50 },
  { id: '7', name: 'Lavender Cold Brew', customisation: 'Light ice · Extra lavender', emoji: '🧋', price: 5.50 },
  { id: '9', name: 'Butter Croissant', customisation: 'Warmed, with butter', emoji: '🥐', price: 3.50 },
];
