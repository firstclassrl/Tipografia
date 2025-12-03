import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const webhookUrl = process.env.N8N_ORDER_WEBHOOK_URL!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

interface Body {
  pdfPath: string;
  typographyIds: string[];
  subject: string;
  bodyTemplate: string;
}

export const handler: Handler = async (event) => {
  try {
    if (!webhookUrl) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'N8N_ORDER_WEBHOOK_URL non configurata' }),
      };
    }

    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Body mancante' }),
      };
    }

    const { pdfPath, typographyIds, subject, bodyTemplate } = JSON.parse(
      event.body,
    ) as Body;

    if (!pdfPath || !Array.isArray(typographyIds) || typographyIds.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'pdfPath e typographyIds sono obbligatori',
        }),
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from('order-pdfs')
      .getPublicUrl(pdfPath);

    const pdfUrl = publicUrlData.publicUrl;
    if (!pdfUrl) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Impossibile generare URL pubblico PDF' }),
      };
    }

    const { data: typographies, error: typoError } = await supabase
      .from('typographies')
      .select('id, name, contact_person, email')
      .in('id', typographyIds);

    if (typoError) {
      console.error('Errore Supabase typographies:', typoError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Errore nel recuperare le tipografie' }),
      };
    }

    if (!typographies || typographies.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Nessuna tipografia trovata per gli id forniti',
        }),
      };
    }

    const recipients = typographies.map((t) => ({
      name: t.name as string,
      contact_person: (t.contact_person as string | null) ?? null,
      email: t.email as string,
    }));

    const payload = {
      subject,
      body_template: bodyTemplate,
      pdf_url: pdfUrl,
      recipients,
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        console.error('Errore chiamando n8n:', response.status, text);
        return {
          statusCode: 502,
          body: JSON.stringify({
            error: `Errore chiamando n8n (${response.status})`,
            details: text,
          }),
        };
      }
    } catch (e: any) {
      console.error('Fetch verso n8n fallita:', e);
      return {
        statusCode: 502,
        body: JSON.stringify({
          error: 'fetch to n8n failed',
          details: String(e?.message || e),
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (err: any) {
    console.error('Errore send-order-email function:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message ?? 'Errore interno' }),
    };
  }
};


