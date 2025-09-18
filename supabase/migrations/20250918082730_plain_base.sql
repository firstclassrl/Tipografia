/*
  # Update RLS policies for orders table

  1. Security Changes
    - Drop existing restrictive INSERT policy for orders table
    - Create new policy allowing public INSERT operations
    - This allows unauthenticated users to create orders

  2. Changes
    - Remove authentication requirement for creating orders
    - Allow public access to INSERT operations on orders table
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;

-- Create a new policy that allows public INSERT operations
CREATE POLICY "Public can create orders"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);