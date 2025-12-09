/*
  Aggiunge:
  - Tabella `typographies` per l'anagrafica delle tipografie
  - Tabella `order_typography_sends` per tracciare gli invii ordine verso le tipografie
  - Trigger AFTER INSERT su `order_typography_sends` che emette un NOTIFY con i dati utili per n8n
*/

-- Tabella anagrafica tipografie
CREATE TABLE IF NOT EXISTS public.typographies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_person text,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.typographies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read typographies"
  ON public.typographies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert typographies"
  ON public.typographies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update typographies"
  ON public.typographies
  FOR UPDATE
  TO authenticated
  USING (true);

-- Tabella che traccia gli invii ordine verso una o più tipografie
CREATE TABLE IF NOT EXISTS public.order_typography_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  typography_id uuid NOT NULL REFERENCES public.typographies(id) ON DELETE CASCADE,
  pdf_path text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.order_typography_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read order_typography_sends"
  ON public.order_typography_sends
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert order_typography_sends"
  ON public.order_typography_sends
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function + trigger per notificare n8n via NOTIFY
CREATE OR REPLACE FUNCTION public.notify_order_typography_send()
RETURNS TRIGGER AS $$
DECLARE
  v_order public.orders;
  v_typography public.typographies;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = NEW.order_id;
  SELECT * INTO v_typography FROM public.typographies WHERE id = NEW.typography_id;

  PERFORM pg_notify(
    'order_typography_sends',
    json_build_object(
      'order_id', NEW.order_id,
      'order_number', v_order.order_number,
      'print_type', v_order.print_type,
      'typography_id', NEW.typography_id,
      'typography_name', v_typography.name,
      'typography_email', v_typography.email,
      'pdf_path', NEW.pdf_path,
      'created_at', NEW.created_at
    )::text
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS order_typography_sends_after_insert ON public.order_typography_sends;

CREATE TRIGGER order_typography_sends_after_insert
AFTER INSERT ON public.order_typography_sends
FOR EACH ROW
EXECUTE FUNCTION public.notify_order_typography_send();





