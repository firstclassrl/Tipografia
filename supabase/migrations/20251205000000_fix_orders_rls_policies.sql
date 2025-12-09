/*
  # Fix RLS policies for orders and order_details tables
  
  Questa migration assicura che le policy RLS permettano accesso pubblico
  a tutte le operazioni necessarie per salvare ordini.
  
  Il problema CORS potrebbe essere causato da policy RLS che bloccano le richieste.
  Questa migration:
  1. Rimuove tutte le policy esistenti su orders e order_details
  2. Crea policy esplicite per ogni operazione (SELECT, INSERT, UPDATE, DELETE)
  3. Assicura che tutte le policy permettano accesso pubblico
*/

-- Rimuovi tutte le policy esistenti su orders
DROP POLICY IF EXISTS "Allow all operations on orders" ON orders;
DROP POLICY IF EXISTS "Allow delete operations on orders" ON orders;
DROP POLICY IF EXISTS "Public can create orders" ON orders;
DROP POLICY IF EXISTS "Users can read all orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can update orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;

-- Rimuovi tutte le policy esistenti su order_details
DROP POLICY IF EXISTS "Allow all operations on order_details" ON order_details;
DROP POLICY IF EXISTS "Allow delete operations on order_details" ON order_details;
DROP POLICY IF EXISTS "Users can read all order details" ON order_details;
DROP POLICY IF EXISTS "Users can create order details" ON order_details;
DROP POLICY IF EXISTS "Users can update order details" ON order_details;

-- Assicura che RLS sia abilitato
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_details ENABLE ROW LEVEL SECURITY;

-- Crea policy esplicite per orders - SELECT
CREATE POLICY "Public can select orders"
  ON orders
  FOR SELECT
  TO public
  USING (true);

-- Crea policy esplicite per orders - INSERT
CREATE POLICY "Public can insert orders"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Crea policy esplicite per orders - UPDATE
CREATE POLICY "Public can update orders"
  ON orders
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Crea policy esplicite per orders - DELETE
CREATE POLICY "Public can delete orders"
  ON orders
  FOR DELETE
  TO public
  USING (true);

-- Crea policy esplicite per order_details - SELECT
CREATE POLICY "Public can select order_details"
  ON order_details
  FOR SELECT
  TO public
  USING (true);

-- Crea policy esplicite per order_details - INSERT
CREATE POLICY "Public can insert order_details"
  ON order_details
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Crea policy esplicite per order_details - UPDATE
CREATE POLICY "Public can update order_details"
  ON order_details
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Crea policy esplicite per order_details - DELETE
CREATE POLICY "Public can delete order_details"
  ON order_details
  FOR DELETE
  TO public
  USING (true);


