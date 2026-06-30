-- ============================================================
-- Seed data: initial menu + rewards
-- ============================================================

insert into public.menu_items (name, description, price, category, emoji, sort_order) values
  ('Espresso', 'Double shot, rich crema', 3.00, 'Hot', '☕', 1),
  ('Cappuccino', 'Espresso, steamed milk, foam', 4.50, 'Hot', '🥛', 2),
  ('Flat White', 'Velvety microfoam, intense shot', 4.50, 'Hot', '☕', 3),
  ('Caramel Macchiato', 'Vanilla, caramel drizzle', 5.50, 'Hot', '🍮', 4),
  ('Matcha Latte', 'Ceremonial grade, oat milk', 5.00, 'Hot', '🍵', 5),
  ('Cold Brew', '12-hr steep, smooth finish', 5.00, 'Cold', '🧊', 6),
  ('Lavender Cold Brew', 'House lavender syrup', 5.50, 'Cold', '🧋', 7),
  ('Iced Americano', 'Bold espresso over ice', 4.00, 'Cold', '🥤', 8),
  ('Butter Croissant', 'Freshly baked, flaky layers', 3.50, 'Food', '🥐', 9),
  ('Blueberry Muffin', 'Bursting with berries', 3.00, 'Food', '🫐', 10),
  ('Avocado Toast', 'Sourdough, chilli flakes', 7.00, 'Food', '🥑', 11);

insert into public.rewards (name, description, points_cost, emoji) values
  ('Free any drink', 'Redeem for any drink on the menu', 300, '🎁'),
  ('Free pastry', 'Any item from the bakery', 150, '🥐'),
  ('10% off your order', 'Applied at checkout', 100, '🏷️');
