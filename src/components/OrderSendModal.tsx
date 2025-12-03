import React, { useEffect, useState } from 'react';
import { X, Mail, Loader2 } from 'lucide-react';
import { Typography, OrderWithDetails } from '../lib/supabase';
import { createOrderTypographySends, getTypographies, uploadOrderPdf } from '../lib/typographiesApi';
import { pdf } from '@react-pdf/renderer';
import { OrderPDF } from './OrderPDF';

type OrderSendModalProps = {
  isOpen: boolean;
  order: OrderWithDetails | null;
  onClose: () => void;
};

export const OrderSendModal: React.FC<OrderSendModalProps> = ({
  isOpen,
  order,
  onClose,
}) => {
  const [typographies, setTypographies] = useState<Typography[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTypographies, setLoadingTypographies] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [subject, setSubject] = useState(
    `Ordine Tipografia ${order?.order_number ?? ''}`.trim(),
  );
  const [bodyTemplate, setBodyTemplate] = useState(
    'Ciao {{contact_person}}, ti allego il PDF destinato a {{name}}.',
  );

  useEffect(() => {
    if (!isOpen) {
      setSelectedIds([]);
      setError(null);
      setSuccess(null);
      return;
    }

    const load = async () => {
      try {
        setLoadingTypographies(true);
        const data = await getTypographies();
        setTypographies(data);
      } catch (err) {
        console.error(err);
        setError('Errore nel caricamento delle tipografie.');
      } finally {
        setLoadingTypographies(false);
      }
    };

    load();
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSend = async () => {
    setError(null);
    setSuccess(null);

    if (selectedIds.length === 0) {
      setError('Seleziona almeno una tipografia a cui inviare l\'ordine.');
      return;
    }

    try {
      setLoading(true);

      const pdfBlob = await pdf(<OrderPDF order={order} />).toBlob();
      const pdfPath = await uploadOrderPdf(order, pdfBlob);

      await createOrderTypographySends(order.id, selectedIds, pdfPath);

      const resp = await fetch('/.netlify/functions/send-order-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfPath,
          typographyIds: selectedIds,
          subject: subject.trim() || `Ordine Tipografia ${order.order_number}`,
          bodyTemplate: bodyTemplate.trim(),
        }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(
          data.error || 'Errore nella funzione server di invio mail ordine.',
        );
      }

      setSuccess('Richiesta di invio ordine registrata e inviata a n8n.');
    } catch (err) {
      console.error(err);
      setError('Errore durante la registrazione dell\'invio ordine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl bg-gradient-to-br from-gray-900 to-black border border-white/10 shadow-2xl p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white rounded-full bg-white/10 p-1"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-red-500/20 border border-red-500/40">
            <Mail className="h-5 w-5 text-red-200" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white">Invia ordine alle tipografie</h2>
            <p className="text-sm text-white/70">
              Scegli una o più tipografie a cui inviare l&apos;ordine. Verrà generato un PDF e salvato in Supabase.
            </p>
          </div>
        </div>

        <div className="mb-4 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white/80 flex items-center justify-between">
          <div>
            <div className="font-semibold">Ordine {order.order_number}</div>
            <div className="text-xs text-white/60">
              {order.print_type} · {new Date(order.created_at).toLocaleDateString('it-IT')}
            </div>
          </div>
          {order.order_details[0] && (
            <div className="text-xs text-white/70 text-right">
              Cliente:{' '}
              <span className="font-semibold text-white">
                {order.order_details[0].client_name}
              </span>
            </div>
          )}
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">
              Oggetto email
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/80"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">
              Template corpo email
            </label>
            <input
              type="text"
              value={bodyTemplate}
              onChange={(e) => setBodyTemplate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/80"
            />
            <p className="mt-1 text-[10px] text-white/50">
              Puoi usare le variabili {'{{contact_person}}'} e {'{{name}}'} nel testo.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-3 rounded-xl bg-red-500/20 border border-red-400/50 text-red-100 px-3 py-2 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-3 rounded-xl bg-green-500/20 border border-green-400/50 text-green-100 px-3 py-2 text-sm">
            {success}
          </div>
        )}

        <div className="max-h-64 overflow-y-auto rounded-2xl bg-white/5 border border-white/10 p-3 mb-4">
          {loadingTypographies ? (
            <div className="py-6 text-center text-white/70">
              Caricamento tipografie...
            </div>
          ) : typographies.length === 0 ? (
            <div className="py-6 text-center text-white/70 text-sm">
              Nessuna tipografia configurata. Crea almeno una tipografia dalla schermata
              &nbsp;
              <span className="font-semibold">Tipografie</span>.
            </div>
          ) : (
            <div className="space-y-2">
              {typographies.map((t) => {
                const checked = selectedIds.includes(t.id);
                return (
                  <label
                    key={t.id}
                    className={`flex items-center justify-between gap-3 px-3 py-2 rounded-2xl border cursor-pointer transition-all ${
                      checked
                        ? 'bg-red-500/20 border-red-400/60'
                        : 'bg-white/5 border-white/15 hover:bg-white/10 hover:border-white/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-white/40 bg-black/40"
                        checked={checked}
                        onChange={() => toggleSelection(t.id)}
                      />
                      <div>
                        <div className="text-sm font-semibold text-white">{t.name}</div>
                        <div className="text-xs text-white/70">
                          {t.contact_person && <span className="mr-2">{t.contact_person} · </span>}
                          <span>{t.email}</span>
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/20 text-white text-sm hover:bg-white/10 hover:border-white/40 transition-colors"
          >
            Annulla
          </button>
          <button
            type="button"
            disabled={loading || typographies.length === 0}
            onClick={handleSend}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold shadow-lg hover:from-red-600 hover:to-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Invio in corso...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Invia ordine
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


