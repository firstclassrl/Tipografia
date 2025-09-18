/*
  # Fix RLS policies for orders table

  1. Security Changes
    - Drop existing restrictive INSERT policy for orders table
    - Create new permissive INSERT policy that allows all users to create orders
    - This is needed because the app doesn't currently implement user authentication
    
  2. Notes
    - This allows anonymous users to create orders
    - For production, consider implementing proper authentication
*/

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can create orders" ON orders;

-- Create a new permissive INSERT policy that allows anyone to create orders
CREATE POLICY "Anyone can create orders"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);