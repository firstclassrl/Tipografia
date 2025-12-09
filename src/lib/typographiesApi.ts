import { supabase, OrderWithDetails, Typography } from './supabase';

const ORDER_PDFS_BUCKET = 'order-pdfs';

export async function getTypographies(): Promise<Typography[]> {
  const { data, error } = await supabase
    .from('typographies')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Errore nel recuperare le tipografie:', error);
    throw error;
  }

  return data || [];
}

export interface TypographyInput {
  id?: string;
  name: string;
  contact_person?: string;
  email: string;
}

export async function createOrUpdateTypography(input: TypographyInput): Promise<Typography> {
  const payload = {
    name: input.name,
    contact_person: input.contact_person ?? null,
    email: input.email,
  };

  if (input.id) {
    const { data, error } = await supabase
      .from('typographies')
      .update(payload)
      .eq('id', input.id)
      .select('*')
      .single();

    if (error) {
      console.error('Errore nell\'aggiornare la tipografia:', error);
      throw error;
    }

    return data as Typography;
  }

  const { data, error } = await supabase
    .from('typographies')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    console.error('Errore nel creare la tipografia:', error);
    throw error;
  }

  return data as Typography;
}

export async function deleteTypography(id: string): Promise<void> {
  const { error } = await supabase
    .from('typographies')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Errore nell\'eliminare la tipografia:', error);
    throw error;
  }
}

export async function uploadOrderPdf(order: OrderWithDetails, pdfBlob: Blob): Promise<string> {
  // Usa il numero ordine nel nome del file; fallback all'id se manca
  const baseName = (order.order_number && order.order_number.trim()) || order.id;
  const safeName = baseName.replace(/\s+/g, '_');
  const filePath = `orders/${safeName}.pdf`;

  const { error } = await supabase.storage
    .from(ORDER_PDFS_BUCKET)
    .upload(filePath, pdfBlob, {
      cacheControl: '3600',
      upsert: true,
      contentType: 'application/pdf',
    });

  if (error) {
    console.error('Errore durante l\'upload del PDF ordine:', error);
    throw error;
  }

  return filePath;
}

export async function createOrderTypographySends(
  orderId: string,
  typographyIds: string[],
  pdfPath: string,
) {
  if (typographyIds.length === 0) return;

  const rows = typographyIds.map((typography_id) => ({
    order_id: orderId,
    typography_id,
    pdf_path: pdfPath,
  }));

  const { error } = await supabase
    .from('order_typography_sends')
    .insert(rows);

  if (error) {
    console.error('Errore nella creazione di order_typography_sends:', error);
    throw error;
  }
}



