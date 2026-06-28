-- ============================================
-- Hotel North Star Inn - RESET & RECREATE
-- Drops everything then recreates from scratch
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================

-- ===== DROP EXISTING =====

DROP TRIGGER IF EXISTS on_booking_created ON bookings;
DROP TRIGGER IF EXISTS on_booking_status_change ON bookings;

DROP FUNCTION IF EXISTS auto_create_bill();
DROP FUNCTION IF EXISTS update_room_status_on_booking();
DROP FUNCTION IF EXISTS lookup_guest(TEXT, TEXT);
DROP FUNCTION IF EXISTS is_room_available(UUID, DATE, DATE);
DROP FUNCTION IF EXISTS update_bill_totals(UUID);
DROP FUNCTION IF EXISTS get_booking_bill(UUID);
DROP FUNCTION IF EXISTS monthly_revenue(INT, INT);
DROP FUNCTION IF EXISTS add_order_to_bill(UUID);
DROP FUNCTION IF EXISTS remove_order_from_bill(UUID);

DROP POLICY IF EXISTS "Public can view hotel images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated admins can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated admins can delete images" ON storage.objects;

DROP TABLE IF EXISTS bill_charges CASCADE;
DROP TABLE IF EXISTS bills CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS food_menu CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;

-- ===== RECREATE =====

-- 1. ROOMS TABLE
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10, 2) NOT NULL,
  capacity INT NOT NULL DEFAULT 1,
  features TEXT[] DEFAULT '{}',
  image_url TEXT,
  gallery TEXT[] DEFAULT '{}',
  room_code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'booked', 'maintenance'))
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rooms"
  ON rooms FOR SELECT USING (true);

CREATE POLICY "Authenticated admins can insert"
  ON rooms FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated admins can update"
  ON rooms FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated admins can delete"
  ON rooms FOR DELETE USING (auth.role() = 'authenticated');


-- 2. BOOKINGS TABLE
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL DEFAULT '',
  user_phone TEXT NOT NULL DEFAULT '',
  address TEXT DEFAULT '',
  id_proof_type TEXT DEFAULT '',
  id_proof_number TEXT DEFAULT '',
  check_in DATE NOT NULL,
  check_out DATE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  room_code TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  source TEXT NOT NULL DEFAULT 'online' CHECK (source IN ('online', 'offline')),
  checkin_status TEXT NOT NULL DEFAULT 'pending' CHECK (checkin_status IN ('pending', 'checked_in', 'checked_out')),
  checkin_time TIMESTAMPTZ,
  checkout_time TIMESTAMPTZ,
  security_deposit NUMERIC(10, 2) DEFAULT 0
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create a booking"
  ON bookings FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view bookings"
  ON bookings FOR SELECT USING (true);

CREATE POLICY "Authenticated admins can update bookings"
  ON bookings FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated admins can delete bookings"
  ON bookings FOR DELETE USING (auth.role() = 'authenticated');


-- 3. FOOD_MENU TABLE
CREATE TABLE food_menu (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL DEFAULT 'Main Course',
  image_url TEXT,
  gallery TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT true NOT NULL
);

ALTER TABLE food_menu ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view food menu"
  ON food_menu FOR SELECT USING (true);

CREATE POLICY "Authenticated admins can insert"
  ON food_menu FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated admins can update"
  ON food_menu FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated admins can delete"
  ON food_menu FOR DELETE USING (auth.role() = 'authenticated');


-- 4. ORDERS TABLE
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT NOT NULL DEFAULT '',
  room_code TEXT NOT NULL DEFAULT '',
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'approved', 'rejected', 'preparing', 'delivered', 'cancelled')),
  notes TEXT DEFAULT '',
  total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  scheduled_for TIME
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create an order"
  ON orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view orders"
  ON orders FOR SELECT USING (true);

CREATE POLICY "Authenticated admins can update orders"
  ON orders FOR UPDATE USING (auth.role() = 'authenticated');


-- 5. ORDER_ITEMS TABLE
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  food_item_id UUID NOT NULL REFERENCES food_menu(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view order items"
  ON order_items FOR SELECT USING (true);


-- 6. BILLS TABLE
CREATE TABLE bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL DEFAULT '',
  user_phone TEXT NOT NULL DEFAULT '',
  room_code TEXT NOT NULL DEFAULT '',
  room_charge NUMERIC(10, 2) NOT NULL DEFAULT 0,
  food_charge NUMERIC(10, 2) NOT NULL DEFAULT 0,
  additional_charges NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid')),
  notes TEXT DEFAULT '',
  bill_date DATE DEFAULT CURRENT_DATE
);

ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view bills"
  ON bills FOR SELECT USING (true);

CREATE POLICY "Anyone can create bills"
  ON bills FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated admins can update bills"
  ON bills FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated admins can delete bills"
  ON bills FOR DELETE USING (auth.role() = 'authenticated');


-- 7. BILL_CHARGES TABLE
CREATE TABLE bill_charges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  charge_type TEXT DEFAULT 'extra' CHECK (charge_type IN ('extra', 'food', 'room', 'deposit', 'discount'))
);

ALTER TABLE bill_charges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view bill charges"
  ON bill_charges FOR SELECT USING (true);

CREATE POLICY "Authenticated admins can manage bill charges"
  ON bill_charges FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated admins can delete bill charges"
  ON bill_charges FOR DELETE USING (auth.role() = 'authenticated');


-- 8. REVIEWS TABLE
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  image_url TEXT
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Anyone can create reviews"
  ON reviews FOR INSERT WITH CHECK (true);


-- 9. HOTEL EXPENSES TABLE
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('utilities', 'maintenance', 'salary', 'food', 'supplies', 'other')),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT DEFAULT ''
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated admins can manage expenses"
  ON expenses FOR ALL USING (auth.role() = 'authenticated');


-- 10. STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public) VALUES ('hotel_images', 'hotel_images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view hotel images"
  ON storage.objects FOR SELECT USING (bucket_id = 'hotel_images');

CREATE POLICY "Authenticated admins can upload images"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'hotel_images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated admins can delete images"
  ON storage.objects FOR DELETE USING (bucket_id = 'hotel_images' AND auth.role() = 'authenticated');


-- 11. FUNCTION: Lookup guest by email + room_code
CREATE OR REPLACE FUNCTION lookup_guest(p_email TEXT, p_room_code TEXT)
RETURNS TABLE(user_name TEXT, user_phone TEXT, booking_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT b.user_name, b.user_phone, b.id
  FROM bookings b
  JOIN rooms r ON b.room_id = r.id
  WHERE b.user_email = p_email
    AND r.room_code = p_room_code
    AND b.checkin_status = 'checked_in'
    AND b.check_in <= CURRENT_DATE
    AND (b.check_out IS NULL OR b.check_out >= CURRENT_DATE)
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;


-- 12. FUNCTION: Check room availability
CREATE OR REPLACE FUNCTION is_room_available(p_room_id UUID, p_check_in DATE, p_check_out DATE DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  conflicting_count INT;
BEGIN
  SELECT COUNT(*) INTO conflicting_count
  FROM bookings
  WHERE room_id = p_room_id
    AND (status = 'confirmed' OR checkin_status = 'checked_in')
    AND (
      (p_check_out IS NULL AND check_in <= p_check_in AND (check_out IS NULL OR check_out >= p_check_in))
      OR
      (p_check_out IS NOT NULL AND (check_in, check_out) OVERLAPS (p_check_in, p_check_out))
    );

  RETURN conflicting_count = 0;
END;
$$ LANGUAGE plpgsql STABLE;


-- 13. FUNCTION: Recalculate bill totals
CREATE OR REPLACE FUNCTION update_bill_totals(p_bill_id UUID)
RETURNS VOID AS $$
DECLARE
  extra_charges NUMERIC(10, 2);
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO extra_charges
  FROM bill_charges
  WHERE bill_id = p_bill_id AND charge_type IN ('extra', 'food', 'room');

  UPDATE bills
  SET additional_charges = extra_charges,
      total = room_charge + food_charge + extra_charges - discount
  WHERE id = p_bill_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 14. FUNCTION: Get bill summary for a booking
CREATE OR REPLACE FUNCTION get_booking_bill(p_booking_id UUID)
RETURNS TABLE(bill_id UUID, total NUMERIC, paid NUMERIC, due NUMERIC, payment_status TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT b.id, b.total, b.paid_amount, (b.total - b.paid_amount) AS due, b.payment_status
  FROM bills b
  WHERE b.booking_id = p_booking_id
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;


-- 15. FUNCTION: Monthly revenue report
CREATE OR REPLACE FUNCTION monthly_revenue(p_year INT, p_month INT)
RETURNS TABLE(total_revenue NUMERIC, room_revenue NUMERIC, food_revenue NUMERIC, extra_revenue NUMERIC, expense_total NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(b.total), 0) AS total_revenue,
    COALESCE(SUM(b.room_charge), 0) AS room_revenue,
    COALESCE(SUM(b.food_charge), 0) AS food_revenue,
    COALESCE(SUM(b.additional_charges), 0) AS extra_revenue,
    COALESCE(SUM(e.amount), 0) AS expense_total
  FROM bills b
  LEFT JOIN expenses e ON EXTRACT(YEAR FROM e.expense_date) = p_year AND EXTRACT(MONTH FROM e.expense_date) = p_month
  WHERE EXTRACT(YEAR FROM b.created_at) = p_year
    AND EXTRACT(MONTH FROM b.created_at) = p_month;
END;
$$ LANGUAGE plpgsql STABLE;


-- 16. TRIGGER: Auto-create bill on booking
CREATE OR REPLACE FUNCTION auto_create_bill()
RETURNS TRIGGER AS $$
DECLARE
  nights INT;
  room_price NUMERIC(10, 2);
  code TEXT;
BEGIN
  SELECT price, room_code INTO room_price, code FROM rooms WHERE id = NEW.room_id;
  nights := GREATEST(COALESCE((NEW.check_out - NEW.check_in), 1), 1);

  INSERT INTO bills (booking_id, user_name, user_email, user_phone, room_code, room_charge, total, payment_status, bill_date)
  VALUES (NEW.id, NEW.user_name, NEW.user_email, NEW.user_phone, code, room_price * nights, room_price * nights, 'pending', CURRENT_DATE);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_booking_created
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_bill();


-- 17. FUNCTION: Add approved order to bill
CREATE OR REPLACE FUNCTION add_order_to_bill(p_order_id UUID)
RETURNS VOID AS $$
DECLARE
  v_order RECORD;
BEGIN
  SELECT * INTO v_order FROM orders WHERE id = p_order_id;

  UPDATE bills
  SET food_charge = food_charge + v_order.total,
      total = total + v_order.total
  WHERE booking_id = v_order.booking_id;

  IF NOT FOUND THEN
    UPDATE bills
    SET food_charge = food_charge + v_order.total,
        total = total + v_order.total
    WHERE user_email = v_order.user_email
      AND room_code = v_order.room_code
      AND payment_status != 'paid';

    IF NOT FOUND THEN
      INSERT INTO bills (user_name, user_email, user_phone, room_code, food_charge, total, payment_status, bill_date)
      VALUES (v_order.user_name, v_order.user_email, v_order.user_phone, v_order.room_code, v_order.total, v_order.total, 'pending', CURRENT_DATE);
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 18. FUNCTION: Remove order amount from bill
CREATE OR REPLACE FUNCTION remove_order_from_bill(p_order_id UUID)
RETURNS VOID AS $$
DECLARE
  v_order RECORD;
BEGIN
  SELECT * INTO v_order FROM orders WHERE id = p_order_id;

  UPDATE bills
  SET food_charge = GREATEST(food_charge - v_order.total, 0),
      total = GREATEST(total - v_order.total, 0)
  WHERE booking_id = v_order.booking_id;

  DELETE FROM bills WHERE total <= 0 AND food_charge <= 0 AND room_charge <= 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 19. TRIGGER: Update room status on booking changes
CREATE OR REPLACE FUNCTION update_room_status_on_booking()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.checkin_status = 'checked_in' THEN
    UPDATE rooms SET status = 'booked' WHERE id = NEW.room_id;
  ELSIF NEW.checkin_status = 'checked_out' OR NEW.status = 'cancelled' THEN
    UPDATE rooms SET status = 'available' WHERE id = NEW.room_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_booking_status_change
  AFTER INSERT OR UPDATE OF checkin_status, status ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_room_status_on_booking();
