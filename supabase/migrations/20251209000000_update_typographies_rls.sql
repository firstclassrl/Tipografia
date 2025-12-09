/*
  Aggiorna le policy RLS per la tabella `typographies` (e per
  `order_typography_sends`) consentendo l'accesso al ruolo `public`.

  Il client usa la chiave anon e non gestisce l'autenticazione, quindi le
  policy legate al ruolo `authenticated` bloccavano insert/update e
  restituivano un 406 dal PostgREST. Allineiamo le policy allo stesso
  modello "public" già usato per `orders` e `order_details`.
*/

-- Assicurati che la RLS sia abilitata
ALTER TABLE public.typographies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_typography_sends ENABLE ROW LEVEL SECURITY;

-- Rimuovi le vecchie policy
DROP POLICY IF EXISTS "Users can read typographies" ON public.typographies;
DROP POLICY IF EXISTS "Users can insert typographies" ON public.typographies;
DROP POLICY IF EXISTS "Users can update typographies" ON public.typographies;
DROP POLICY IF EXISTS "Users can delete typographies" ON public.typographies;

DROP POLICY IF EXISTS "Users can read order_typography_sends" ON public.order_typography_sends;
DROP POLICY IF EXISTS "Users can insert order_typography_sends" ON public.order_typography_sends;

-- Nuove policy aperte al ruolo public per typographies
CREATE POLICY "Public can read typographies"
  ON public.typographies
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert typographies"
  ON public.typographies
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update typographies"
  ON public.typographies
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete typographies"
  ON public.typographies
  FOR DELETE
  TO public
  USING (true);

-- Policy aperte al ruolo public per order_typography_sends
CREATE POLICY "Public can read order_typography_sends"
  ON public.order_typography_sends
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert order_typography_sends"
  ON public.order_typography_sends
  FOR INSERT
  TO public
  WITH CHECK (true);


