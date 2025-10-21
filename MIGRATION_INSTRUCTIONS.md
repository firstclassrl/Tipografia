# Istruzioni per Applicare la Migrazione

## Problema
Le date `expiry_date` e `production_date` sono attualmente obbligatorie nel database, ma dovrebbero essere opzionali.

## Soluzione
Devi applicare questa migrazione SQL al database Supabase:

```sql
-- Make expiry_date and production_date optional (nullable)
ALTER TABLE "public"."order_details" 
ALTER COLUMN "expiry_date" DROP NOT NULL;

ALTER TABLE "public"."order_details" 
ALTER COLUMN "production_date" DROP NOT NULL;
```

## Come Applicare la Migrazione

### Opzione 1: Dashboard Supabase (Raccomandato)
1. Vai al dashboard di Supabase: https://supabase.com/dashboard
2. Seleziona il tuo progetto
3. Vai su "SQL Editor" nel menu laterale
4. Incolla il codice SQL sopra
5. Clicca "Run" per eseguire la migrazione

### Opzione 2: CLI Supabase
```bash
cd supabase
npx supabase login
npx supabase db push
```

## Verifica
Dopo aver applicato la migrazione, le date saranno opzionali e il salvataggio degli ordini funzionerà correttamente anche quando i campi data sono vuoti.

## File di Migrazione
Il file di migrazione è già stato creato in: `supabase/migrations/20251021095910_make_dates_optional.sql`
