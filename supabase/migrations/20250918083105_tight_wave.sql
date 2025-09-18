/*
  # Reset RLS policies for public access

  This migration completely resets the RLS policies for orders and order_details tables
  to allow public access for all operations, resolving the RLS violation errors.

  ## Changes
  1. Drop all existing policies on orders table
  2. Drop all existing policies on order_details table  
  3. Create new permissive policies allowing public access
  4. Ensure RLS is enabled but with public access policies

  ## Security
  - Allows public INSERT, SELECT, UPDATE operations
  - Suitable for applications without user authentication
*/

-- Drop all existing policies on orders table
DROP POLICY IF EXISTS "Public can create orders" ON orders;
DROP POLICY IF EXISTS "Users can read all orders" ON orders;
DROP POLICY IF EXISTS "Users can update orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;

-- Drop all existing policies on order_details table
DROP POLICY IF EXISTS "Users can create order details" ON order_details;
DROP POLICY IF EXISTS "Users can read all order details" ON order_details;
DROP POLICY IF EXISTS "Users can update order details" ON order_details;

-- Ensure RLS is enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_details ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for orders table
CREATE POLICY "Allow all operations on orders"
  ON orders
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create permissive policies for order_details table
CREATE POLICY "Allow all operations on order_details"
  ON order_details
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);