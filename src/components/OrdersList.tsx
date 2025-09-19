import React, { useState, useEffect } from 'react';
import { supabase, OrderWithDetails } from '../lib/supabase';
import { FileText, Mail, Calendar, Package, Eye, Trash2 } from 'lucide-react';
import { OrderDetailsModal } from './OrderDetailsModal';
import { OrderViewModal } from './OrderViewModal';
import { pdf } from '@react-pdf/renderer';
import { OrderPDF } from './OrderPDF';

export const OrdersList: React.FC = () => {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_details (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Errore nel recuperare gli ordini:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async (order: OrderWithDetails): Promise<Blob> => {
    try {
      // Genera PDF usando @react-pdf/renderer
      const pdfBlob = await pdf(<OrderPDF order={order} />).toBlob();
      return pdfBlob;
      
    } catch (error) {
      console.error('Errore nella generazione PDF:', error);
      throw error;
    }
  };

  const sendEmail = async (order: OrderWithDetails) => {
    try {
      // Genera il PDF
      const pdfBlob = await generatePDF(order);
      
      // Prepara il contenuto della mail
      const subject = `Ordine Tipografia ${order.order_number}`;
      const body = `
Gentile Tipografia,

in allegato trovate l'ordine ${order.order_number} per la stampa di ${order.print_type}.

Dettagli ordine:
- Tipo di stampa: ${order.print_type}
- Data ordine: ${new Date(order.created_at).toLocaleDateString('it-IT')}
- Numero prodotti: ${order.order_details.length}

Cordiali saluti
      `.trim();
      
      // Crea il file PDF
      const pdfFile = new File([pdfBlob], `Ordine_${order.order_number}.pdf`, {
        type: 'application/pdf'
      });
      
      // Prova con Web Share API se disponibile
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          title: subject,
          text: body,
          files: [pdfFile]
        });
      } else {
        // Fallback: apre mailto con istruzioni per allegare il PDF scaricato
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `Ordine_${order.order_number}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Apri mailto
        const mailtoUrl = `mailto:tipografia@example.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body + '\n\nNOTA: Il PDF è stato scaricato automaticamente. Allegalo prima di inviare.')}`;
        window.open(mailtoUrl);
      }
      
    } catch (error) {
      console.error('Errore nell\'invio email:', error);
    }
  };

  const deleteOrder = async (order: OrderWithDetails) => {
    if (!confirm(`Sei sicuro di voler eliminare l'ordine ${order.order_number}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', order.id);

      if (error) throw error;

      // Ricarica la lista degli ordini
      fetchOrders();
    } catch (error: any) {
      console.error('Errore nell\'eliminare l\'ordine:', error);
      
      if (error.code === '42501' || error.message?.includes('permission denied')) {
        alert('Errore: Non hai i permessi per eliminare questo ordine. Contatta l\'amministratore.');
      } else if (error.message?.includes('violates foreign key constraint')) {
        alert('Errore: Impossibile eliminare l\'ordine. Potrebbero esserci dettagli collegati.');
      } else {
        alert('Errore nell\'eliminare l\'ordine. Riprova.');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'bozza': return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
      case 'inviato': return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
      case 'completato': return 'bg-green-500/20 text-green-300 border border-green-500/30';
      case 'annullato': return 'bg-red-500/20 text-red-300 border border-red-500/30';
      default: return 'bg-white/20 text-white border border-white/30';
    }
  };

  const getPrintTypeIcon = (type: string) => {
    switch (type) {
      case 'etichetta': return <FileText className="h-6 w-6 text-red-400" />;
      case 'astuccio': return <Package className="h-6 w-6 text-white" />;
      case 'blister': return <Package className="h-6 w-6 text-red-300" />;
      default: return <FileText className="h-6 w-6 text-white" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent">I Tuoi Ordini</h2>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-red-500/25"
        >
          Aggiorna
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl">
          <FileText className="h-16 w-16 text-white/40 mx-auto mb-6" />
          <p className="text-white/80 text-xl mb-2">Nessun ordine trovato</p>
          <p className="text-white/60">Crea il tuo primo ordine per iniziare</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map(order => (
            <div key={order.id} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-red-500/20 to-red-700/20 rounded-xl border border-red-500/30">
                    {getPrintTypeIcon(order.print_type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Ordine {order.order_number}</h3>
                    <p className="text-red-300 capitalize font-medium">{order.print_type}</p>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-sm ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-white/70 mb-6">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-red-400" />
                  {new Date(order.created_at).toLocaleDateString('it-IT')}
                </div>
                {order.order_details.length > 0 && (
                  <div>
                    Cliente: <span className="font-bold text-white">{order.order_details[0].client_name}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setSelectedOrder(order);
                    setViewModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-6 py-3 backdrop-blur-sm bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 border border-white/20 hover:border-white/40 font-medium"
                >
                  <Eye className="h-4 w-4" />
                  Visualizza
                </button>
                <button
                  onClick={() => sendEmail(order)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-red-500/25 font-medium"
                >
                  <Mail className="h-4 w-4" />
                  Invia Ordine
                </button>
                <button
                  onClick={() => deleteOrder(order)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-red-700/25 font-medium"
                >
                  <Trash2 className="h-4 w-4" />
                  Elimina
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={false}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {selectedOrder && (
        <OrderViewModal
          order={selectedOrder}
          orderDetails={selectedOrder.order_details}
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
        />
      )}
    </div>
  );
};