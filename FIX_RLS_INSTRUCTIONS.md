# Istruzioni per Risolvere il Problema di Salvataggio Ordini

## Problema
Errore CORS o di salvataggio quando si tenta di creare un nuovo ordine. Questo è spesso causato da policy RLS (Row Level Security) che bloccano le richieste.

## Soluzione

### Passo 1: Applica la Migration per Correggere le Policy RLS

1. Vai su **Supabase Dashboard**: https://supabase.com/dashboard
2. Seleziona il tuo progetto
3. Vai su **SQL Editor** nel menu laterale
4. Apri il file `supabase/migrations/20251205000000_fix_orders_rls_policies.sql`
5. Copia tutto il contenuto del file
6. Incolla nel SQL Editor di Supabase
7. Clicca su **Run** per eseguire la migration

Questa migration:
- Rimuove tutte le policy esistenti su `orders` e `order_details`
- Crea policy esplicite per ogni operazione (SELECT, INSERT, UPDATE, DELETE)
- Assicura che tutte le policy permettano accesso pubblico

### Passo 2: Verifica le Policy

Dopo aver eseguito la migration, puoi verificare che le policy siano corrette eseguendo:

```sql
-- Verifica policy su orders
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('orders', 'order_details')
ORDER BY tablename, policyname;
```

Dovresti vedere 4 policy per `orders` e 4 policy per `order_details`:
- SELECT policy
- INSERT policy  
- UPDATE policy
- DELETE policy

Tutte dovrebbero avere `roles = '{public}'` per permettere accesso pubblico.

### Passo 3: Testa il Salvataggio

1. Ricarica l'applicazione su Netlify
2. Prova a creare un nuovo ordine
3. Controlla la console del browser per eventuali errori

### Passo 4: Debug (se il problema persiste)

Se vedi ancora errori, controlla nella console del browser:

1. **Errore CORS**: 
   - Verifica che le variabili d'ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` siano corrette su Netlify
   - Assicurati che l'URL di Supabase sia corretto (deve iniziare con `https://`)

2. **Errore 403/42501 (Permission Denied)**:
   - Le policy RLS non sono state applicate correttamente
   - Esegui di nuovo la migration
   - Verifica che RLS sia abilitato ma con policy permissive

3. **Errore 401 (Unauthorized)**:
   - La chiave anon (`VITE_SUPABASE_ANON_KEY`) è errata o mancante
   - Verifica le variabili d'ambiente su Netlify

4. **Altri errori**:
   - Controlla il messaggio di errore completo nella console
   - I nuovi log dovrebbero mostrare dettagli più specifici sull'errore

## Note

- Le policy create da questa migration permettono accesso **pubblico** (senza autenticazione)
- Questo è appropriato per un'applicazione senza sistema di autenticazione utenti
- Per maggiore sicurezza in futuro, considera di implementare autenticazione e policy più restrittive


