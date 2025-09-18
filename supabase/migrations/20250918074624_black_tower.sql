/*
  # Sistema di gestione ordini tipografia

  1. Nuove Tabelle
    - `orders` - Tabella principale degli ordini
      - `id` (uuid, primary key)
      - `order_number` (text, numero ordine univoco)
      - `print_type` (text, tipo di stampa: etichetta, astuccio, blister)
      - `status` (text, stato dell'ordine)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `order_details` - Dettagli specifici dell'ordine
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key)
      - `ean_code` (text)
      - `client_name` (text)
      - `product_name` (text)
      - `measurements` (text, per etichette e blister)
      - `package_type` (text, per astuccio)
      - `lot_number` (text)
      - `expiry_date` (date)
      - `production_date` (date)
      - `quantity` (integer)

  2. Sicurezza
    - Abilita RLS su tutte le tabelle
    - Policy per permettere lettura/scrittura agli utenti autenticati
*/

-- Tabella ordini principali
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  print_type text NOT NULL CHECK (print_type IN ('etichetta', 'astuccio', 'blister')),
  status text DEFAULT 'bozza' CHECK (status IN ('bozza', 'inviato', 'completato', 'annullato')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabella dettagli ordini
CREATE TABLE IF NOT EXISTS order_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  ean_code text NOT NULL,
  client_name text NOT NULL,
  product_name text NOT NULL,
  measurements text, -- Per etichette e blister
  package_type text, -- Per astuccio
  lot_number text NOT NULL,
  expiry_date date NOT NULL,
  production_date date NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamptz DEFAULT now()
);

-- Abilita Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_details ENABLE ROW LEVEL SECURITY;

-- Policy per gli ordini
CREATE POLICY "Users can read all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policy per i dettagli ordini
CREATE POLICY "Users can read all order details"
  ON order_details
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create order details"
  ON order_details
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update order details"
  ON order_details
  FOR UPDATE
  TO authenticated
  USING (true);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_details_order_id ON order_details(order_id);

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();