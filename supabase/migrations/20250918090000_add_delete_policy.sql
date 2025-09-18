/*
  # Add DELETE policy for orders and order_details

  This migration adds the missing DELETE policy for orders and order_details tables
  to allow deletion operations that are currently failing.

  ## Changes
  1. Add DELETE policy for orders table
  2. Add DELETE policy for order_details table
  3. Ensure CASCADE deletion works properly

  ## Security
  - Allows public DELETE operations for both tables
  - Maintains referential integrity with CASCADE deletion
*/

-- Add DELETE policy for orders table
CREATE POLICY "Allow delete operations on orders"
  ON orders
  FOR DELETE
  TO public
  USING (true);

-- Add DELETE policy for order_details table  
CREATE POLICY "Allow delete operations on order_details"
  ON order_details
  FOR DELETE
  TO public
  USING (true);
