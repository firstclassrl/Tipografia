import React, { useState, useEffect } from 'react';
import { supabase, OrderWithDetails } from '../lib/supabase';
import { FileText, Mail, Calendar, Package, Eye, Trash2, Edit, ChevronDown } from 'lucide-react';
import { OrderDetailsModal } from './OrderDetailsModal';
import { OrderViewModal } from './OrderViewModal';
import { MultiProductModal } from './MultiProductModal';
import { pdf } from '@react-pdf/renderer';
import { OrderPDF } from './OrderPDF';

type OrdersListProps = {
  grouping?: 'monthly' | 'yearly';
  clientFilter?: string;
  dateFrom?: string; // yyyy-mm-dd
  dateTo?: string;   // yyyy-mm-dd
};

export const OrdersList: React.FC<OrdersListProps> = ({ grouping = 'monthly', clientFilter = '', dateFrom = '', dateTo = '' }) => {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<number | null>(null);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});

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

  const formatMonthKey = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`; // e.g., 2025-10
  };

  const formatYearKey = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}`;
  };

  const normalizedClient = clientFilter.trim().toLowerCase();

  // Converte formato italiano (gg/mm/yyyy) in formato ISO (yyyy-mm-dd)
  const convertItalianDateToISO = (italianDate: string): string | null => {
    if (!italianDate || !italianDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      return null;
    }
    const [day, month, year] = italianDate.split('/');
    return `${year}-${month}-${day}`;
  };

  const passesFilters = (order: OrderWithDetails) => {
    let ok = true;
    if (normalizedClient) {
      const clientName = order.order_details[0]?.client_name?.toLowerCase?.() || '';
      ok = ok && clientName.includes(normalizedClient);
    }
    if (dateFrom) {
      const isoFrom = convertItalianDateToISO(dateFrom);
      if (isoFrom) {
        ok = ok && new Date(order.created_at) >= new Date(isoFrom);
      }
    }
    if (dateTo) {
      const isoTo = convertItalianDateToISO(dateTo);
      if (isoTo) {
        const to = new Date(isoTo);
        to.setHours(23,59,59,999);
        ok = ok && new Date(order.created_at) <= to;
      }
    }
    return ok;
  };

  const groupOrders = () => {
    const map: Record<string, OrderWithDetails[]> = {};
    for (const order of orders.filter(passesFilters)) {
      const key = grouping === 'yearly' ? formatYearKey(order.created_at) : formatMonthKey(order.created_at);
      if (!map[key]) map[key] = [];
      map[key].push(order);
    }
    // sort groups descending by key
    const sortedKeys = Object.keys(map).sort((a, b) => b.localeCompare(a));
    return { keys: sortedKeys, map };
  };

  const toggleFolder = (key: string) => {
    setOpenFolders(prev => ({ ...prev, [key]: !prev[key] }));
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
      
      // Crea il file PDF e fornisci subito il download
      const pdfFile = new File([pdfBlob], `Ordine_${order.order_number}.pdf`, {
        type: 'application/pdf'
      });
      
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `Ordine_${order.order_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Apri mailto direttamente (l'utente allegherà il PDF scaricato)
      const mailtoUrl = `mailto:tipografia@example.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body + '\n\nNOTA: Il PDF è stato scaricato automaticamente. Allegalo prima di inviare.')}`;
      window.open(mailtoUrl);
      
    } catch (error) {
      console.error('Errore nell\'invio email:', error);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Aggiorna la lista locale
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      setEditingStatus(null);
    } catch (error) {
      console.error('Errore nell\'aggiornare lo stato:', error);
      alert('Errore nell\'aggiornare lo stato. Riprova.');
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

  // Manteniamo la funzione per eventuali usi futuri, ma non mostriamo più il badge di stato nella card
  const getStatusColor = (_status: string) => 'bg-white/20 text-white border border-white/30';

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

  const grouped = groupOrders();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent">I Tuoi Ordini</h2>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl">
          <FileText className="h-16 w-16 text-white/40 mx-auto mb-6" />
          <p className="text-white/80 text-xl mb-2">Nessun ordine trovato</p>
          <p className="text-white/60">Crea il tuo primo ordine per iniziare</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {grouped.keys.map(key => (
            <div key={key} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4">
              <button
                onClick={() => toggleFolder(key)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${openFolders[key] ? 'rotate-180' : ''}`} />
                  <span className="font-semibold tracking-wide">
                    {grouping === 'yearly' ? `Anno ${key}` : new Date(key + '-01').toLocaleDateString('it-IT', { year: 'numeric', month: 'long' })}
                  </span>
                </div>
                <span className="text-sm opacity-80">{(grouped.map[key] || []).length} ordini</span>
              </button>

              {openFolders[key] && (
                <div className="mt-4 grid gap-4">
                  {(grouped.map[key] || []).map(order => (
                    <div key={order.id} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 hover:bg-white/15 hover:border-white/30 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl">
                      <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-red-500/20 to-red-700/20 rounded-xl border border-red-500/30">
                    {getPrintTypeIcon(order.print_type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Ordine {order.order_number}</h3>
                    <p className="text-red-300 capitalize font-medium">{order.print_type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setViewModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 backdrop-blur-sm bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 border border-white/20 hover:border-white/40 font-medium"
                  >
                    <Eye className="h-4 w-4" />
                    Visualizza
                  </button>
                  <button
                    onClick={() => {
                      console.log('DEBUG - Setting selectedOrder:', order);
                      setSelectedOrder(order);
                      setEditModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/25 font-medium"
                  >
                    <Edit className="h-4 w-4" />
                    Modifica
                  </button>
                  <button
                    onClick={() => sendEmail(order)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-red-500/25 font-medium"
                  >
                    <Mail className="h-4 w-4" />
                    Invia Ordine
                  </button>
                  <button
                    onClick={() => deleteOrder(order)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-red-700/25 font-medium"
                  >
                    <Trash2 className="h-4 w-4" />
                    Elimina
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-white/70 mb-2">
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

              
            </div>
                  ))}
                </div>
              )}
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

      {selectedOrder && (
        <MultiProductModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedOrder(null);
            fetchOrders(); // Ricarica gli ordini dopo la modifica
          }}
          orderNumber={selectedOrder.order_number}
          printType={selectedOrder.print_type as 'etichetta' | 'astuccio' | 'blister'}
          existingOrder={selectedOrder}
        />
      )}
    </div>
  );
};