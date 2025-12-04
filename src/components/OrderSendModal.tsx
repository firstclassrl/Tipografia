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
    `<html>
  <body style="margin:0; padding:0; background-color:#f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5; padding:20px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; border:1px solid #e0e0e0;">
            <!-- Header -->
            <tr>
              <td style="background-color:#000000; padding:16px 24px; text-align:left;">
                <span style="color:#d62828; font-family:Arial, sans-serif; font-size:18px; font-weight:bold;">
                  FARMAP Industry
                </span>
              </td>
            </tr>
            <!-- Titolo -->
            <tr>
              <td style="padding:24px 24px 8px 24px; font-family:Arial, sans-serif;">
                <h1 style="margin:0; font-size:20px; color:#d62828;">
                  Ordine tipografia – {{name}}
                </h1>
              </td>
            </tr>
            <!-- Testo principale -->
            <tr>
              <td style="padding:0 24px 16px 24px; font-family:Arial, sans-serif; color:#333333; font-size:14px; line-height:1.6;">
                <p style="margin:0 0 12px 0;">
                  Buongiorno {{contact_person}},
                </p>
                <p style="margin:0 0 12px 0;">
                  In allegato trova il <strong>PDF con il dettaglio dell’ordine di stampa</strong>, con le <strong>quantità richieste</strong> per ciascun articolo.
                </p>
                <p style="margin:0 0 12px 0;">
                  Le chiedo gentilmente di inviarmi:
                </p>
                <ul style="margin:0 0 12px 18px; padding:0; color:#333333;">
                  <li>un <strong>preventivo di spesa</strong> completo (stampa, eventuali impianti, trasporto);</li>
                  <li>i <strong>tempi di consegna</strong> stimati per questo ordine.</li>
                </ul>
                <p style="margin:0;">
                  In caso di dubbi o necessità di chiarimenti può rispondermi direttamente a questa email.
                </p>
              </td>
            </tr>
            <!-- Separatore -->
            <tr>
              <td style="padding:0 24px;">
                <hr style="border:none; border-top:1px solid #eeeeee; margin:8px 0 16px 0;">
              </td>
            </tr>
            <!-- Firma -->
            <tr>
              <td style="padding:0 24px 24px 24px; font-family:Arial, sans-serif; color:#555555; font-size:13px; line-height:1.4;">
                <p style="margin:0 0 4px 0;">
                  Cordiali saluti,
                </p>
                <p style="margin:0; font-weight:bold; color:#000000;">
                  Donatella Venturini - grafica@farmap.it
                </p>
                <p style="margin:2px 0 0 0; color:#d62828; font-weight:bold;">
                  FARMAP Industry Srl
                </p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="background-color:#f0f0f0; padding:10px 24px; text-align:center; font-family:Arial, sans-serif; font-size:11px; color:#888888;">
                Questo messaggio è stato generato dal sistema ordini TIPOGRAFIA FARMAP.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  );
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateDraft, setTemplateDraft] = useState(bodyTemplate);

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

      setSuccess('Richiesta di invio ordine inviata correttamente!');
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
              Scegli una o più tipografie a cui inviare l&apos;ordine.
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
            <button
              type="button"
              onClick={() => {
                setTemplateDraft(bodyTemplate);
                setIsTemplateModalOpen(true);
              }}
              className="w-full px-3 py-2 rounded-xl bg-gray-500/20 border border-gray-400/50 text-gray-100 text-sm text-left hover:bg-gray-500/30 hover:border-gray-300 transition-colors"
            >
              Modifica Corpo Mail
            </button>
            <p className="mt-1 text-[10px] text-white/50">
              Il template è precompilato. Puoi personalizzarlo cliccando su &quot;Modifica Corpo Mail&quot;. Puoi usare le variabili {'{{contact_person}}'} e {'{{name}}'} nel testo.
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

      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-3xl bg-gradient-to-br from-gray-900 to-black border border-white/10 shadow-2xl p-6 relative">
            <button
              type="button"
              onClick={() => setIsTemplateModalOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white rounded-full bg-white/10 p-1"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-semibold text-white mb-2">
              Modifica Corpo Mail
            </h3>
            <p className="text-xs text-white/60 mb-4">
              Modifica con attenzione il template HTML dell&apos;email. Puoi usare le variabili {'{{contact_person}}'} e {'{{name}}'} nel testo.
            </p>
            <textarea
              value={templateDraft}
              onChange={(e) => setTemplateDraft(e.target.value)}
              className="w-full h-64 px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-red-500/80"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/20 text-white text-sm hover:bg-white/10 hover:border-white/40 transition-colors"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={() => {
                  setBodyTemplate(templateDraft);
                  setIsTemplateModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold shadow-lg hover:from-red-600 hover:to-red-700 transition-all"
              >
                Salva template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


