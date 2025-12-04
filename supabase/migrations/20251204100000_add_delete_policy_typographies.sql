/*
  Abilita l'eliminazione delle tipografie dall'applicazione.

  La tabella `typographies` ha già RLS attivo e policy per SELECT, INSERT e UPDATE,
  ma mancava la policy per DELETE, quindi le cancellazioni venivano bloccate.
*/

-- Consenti agli utenti autenticati di eliminare le tipografie
CREATE POLICY "Users can delete typographies"
  ON public.typographies
  FOR DELETE
  TO authenticated
  USING (true);


