# Risoluzione Problemi CORS e Salvataggio Ordini

## Problema
Errore CORS quando si tenta di salvare un nuovo ordine da Netlify a Supabase:
```
Access to fetch at 'https://...supabase.co/rest/v1/orders...' from origin 'https://tipografia1.netlify.app' 
has been blocked by CORS policy
```

## Cause Possibili

### 1. Variabili d'Ambiente Mancanti o Errate su Netlify

**Verifica:**
1. Vai su Netlify Dashboard → Il tuo sito → **Site settings** → **Environment variables**
2. Assicurati che siano presenti:
   - `VITE_SUPABASE_URL` (es: `https://xxxxx.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY` (la chiave anon pubblica)

**Soluzione:**
- Se mancano, aggiungile con i valori corretti dal tuo progetto Supabase
- Dopo aver aggiunto/modificato le variabili, fai un nuovo deploy

### 2. Policy RLS (Row Level Security) su Supabase

**Verifica:**
1. Vai su Supabase Dashboard → Il tuo progetto → **SQL Editor**
2. Esegui questa query per verificare le policy:

```sql
-- Verifica policy su orders
SELECT * FROM pg_policies WHERE tablename = 'orders';

-- Verifica policy su order_details  
SELECT * FROM pg_policies WHERE tablename = 'order_details';
```

**Soluzione:**
Se le policy non permettono accesso pubblico, esegui questa migration:

```sql
-- Assicurati che le policy permettano accesso pubblico
CREATE POLICY IF NOT EXISTS "Allow all operations on orders"
  ON orders
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow all operations on order_details"
  ON order_details
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);
```

### 3. Configurazione Supabase Client

**Verifica:**
- Controlla la console del browser per errori di configurazione
- Verifica che `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` siano corretti

**Nota:** Supabase gestisce CORS automaticamente per le richieste REST API. Se vedi errori CORS, è probabile che:
- Le variabili d'ambiente siano errate
- Le policy RLS blocchino le richieste
- Ci sia un problema di rete

### 4. Verifica Rapida

Apri la console del browser e verifica:
1. Se vedi errori sulle variabili d'ambiente → Configura le variabili su Netlify
2. Se vedi errori 403/401 → Problema con le policy RLS
3. Se vedi errori CORS → Verifica URL e chiavi Supabase

## Soluzione Rapida

1. **Verifica variabili d'ambiente su Netlify:**
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   ```

2. **Riavvia il deploy su Netlify** dopo aver modificato le variabili

3. **Verifica le policy RLS su Supabase** (vedi sopra)

4. **Testa di nuovo il salvataggio ordine**

## Debug

Se il problema persiste, controlla nella console del browser:
- L'URL completo della richiesta che fallisce
- Il codice di errore HTTP (403, 401, 500, ecc.)
- Il messaggio di errore completo

Questi dettagli aiutano a identificare se il problema è:
- **CORS**: Errore nella preflight request (OPTIONS)
- **RLS**: Errore 403 Forbidden
- **Configurazione**: Errore 401 Unauthorized o URL errato
- **Database**: Errore 500 o errori SQL


