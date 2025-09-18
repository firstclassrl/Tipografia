import React, { useState, useEffect } from 'react';
import { supabase, OrderWithDetails } from '../lib/supabase';
import { FileText, Mail, Calendar, Package, Eye, Trash2 } from 'lucide-react';
import { OrderDetailsModal } from './OrderDetailsModal';
import { OrderViewModal } from './OrderViewModal';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logoFarmap from '../assets/logo farmap industry.png';

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
      // Crea un elemento temporaneo per il contenuto PDF
      const tempDiv = document.createElement('div');
      tempDiv.className = 'print-content';
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '280mm';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.padding = '15px';
      tempDiv.style.fontSize = '11px';
      tempDiv.style.lineHeight = '1.3';
      
      // Popola il contenuto
      tempDiv.innerHTML = `
        <div class="text-center mb-4">
          <img src="${logoFarmap}" alt="Farmap Industry" style="height: 40px; width: auto; margin: 0 auto 15px;">
          <h1 style="font-size: 24px; font-weight: bold; color: black; margin-bottom: 10px;">ORDINE DI STAMPA</h1>
          <div style="display: flex; justify-content: center; gap: 30px; font-size: 12px; color: #666;">
            <span><strong>Ordine:</strong> ${order.order_number}</span>
            <span><strong>Data:</strong> ${new Date(order.created_at).toLocaleDateString('it-IT')}</span>
            <span><strong>Stato:</strong> ${order.status}</span>
          </div>
        </div>
        
        <div class="mb-4">
          <h2 style="font-size: 18px; font-weight: bold; color: black; margin-bottom: 15px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Dettagli Ordine</h2>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; font-size: 11px;">
            <div><strong>Tipo di Stampa:</strong><br/>${order.print_type?.toUpperCase()}</div>
            <div><strong>Numero Prodotti:</strong><br/>${order.order_details.length}</div>
            <div><strong>Data Creazione:</strong><br/>${new Date(order.created_at).toLocaleDateString('it-IT')}</div>
            <div><strong>Ultimo Aggiornamento:</strong><br/>${new Date(order.updated_at).toLocaleDateString('it-IT')}</div>
          </div>
        </div>
        
        <div class="mb-4">
          <h2 style="font-size: 18px; font-weight: bold; color: black; margin-bottom: 15px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Prodotti</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="border: 1px solid #333; padding: 4px; text-align: left;">Prodotto</th>
                <th style="border: 1px solid #333; padding: 4px; text-align: left;">Cliente</th>
                <th style="border: 1px solid #333; padding: 4px; text-align: left;">EAN</th>
                <th style="border: 1px solid #333; padding: 4px; text-align: left;">Lotto</th>
                <th style="border: 1px solid #333; padding: 4px; text-align: left;">Scadenza</th>
                <th style="border: 1px solid #333; padding: 4px; text-align: left;">Produzione</th>
                <th style="border: 1px solid #333; padding: 4px; text-align: left;">Qtà</th>
              </tr>
            </thead>
            <tbody>
              ${order.order_details.map(detail => `
                <tr>
                  <td style="border: 1px solid #333; padding: 4px;">${detail.product_name || 'N/A'}</td>
                  <td style="border: 1px solid #333; padding: 4px;">${detail.client_name || 'N/A'}</td>
                  <td style="border: 1px solid #333; padding: 4px;">${detail.ean_code || 'N/A'}</td>
                  <td style="border: 1px solid #333; padding: 4px;">${detail.lot_number || 'N/A'}</td>
                  <td style="border: 1px solid #333; padding: 4px;">${detail.expiry_date ? new Date(detail.expiry_date).toLocaleDateString('it-IT') : 'N/A'}</td>
                  <td style="border: 1px solid #333; padding: 4px;">${detail.production_date ? new Date(detail.production_date).toLocaleDateString('it-IT') : 'N/A'}</td>
                  <td style="border: 1px solid #333; padding: 4px;">${detail.quantity || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      
      document.body.appendChild(tempDiv);
      
      // Cattura il contenuto come immagine
      const canvas = await html2canvas(tempDiv, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 1200,
        height: 600
      });
      
      // Rimuovi l'elemento temporaneo
      document.body.removeChild(tempDiv);
      
      // Crea PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = 297;
      const pdfHeight = 210;
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;
      
      const x = (pdfWidth - finalWidth) / 2;
      const y = 10;
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      pdf.addImage(imageData, 'JPEG', x, y, finalWidth, finalHeight);
      
      // Converte in Blob
      const pdfBlob = pdf.output('blob');
      return pdfBlob;
      
    } catch (error) {
      console.error('Errore nella generazione PDF:', error);
      throw error;
    }
  };

  const sendEmail = async (order: OrderWithDetails) => {
    try {
      // Mostra messaggio di caricamento
      alert('📧 Generazione PDF allegato in corso...\n\nAttendere prego...');
      
      // Genera il PDF
      const pdfBlob = await generatePDF(order);
      
      // Crea URL per il PDF
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Crea un link temporaneo per il download
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `Ordine_${order.order_number}.pdf`;
      document.body.appendChild(link);
      
      // Scarica automaticamente il PDF
      link.click();
      document.body.removeChild(link);
      
      // Prepara il contenuto della mail
      const subject = encodeURIComponent(`Ordine Tipografia ${order.order_number}`);
      const body = encodeURIComponent(`
Gentile Tipografia,

in allegato trovate l'ordine ${order.order_number} per la stampa di ${order.print_type}.

Dettagli ordine:
- Tipo di stampa: ${order.print_type}
- Data ordine: ${new Date(order.created_at).toLocaleDateString('it-IT')}
- Numero prodotti: ${order.order_details.length}

IMPORTANTE: Il PDF "Ordine_${order.order_number}.pdf" è stato scaricato automaticamente nella cartella Download. 
Allegalo a questa email prima di inviarla.

Il PDF allegato contiene tutti i dettagli completi dell'ordine.

Cordiali saluti
      `.trim());
      
      // Apri la mail dopo il download
      setTimeout(() => {
        const mailtoUrl = `mailto:tipografia@example.com?subject=${subject}&body=${body}`;
        window.open(mailtoUrl);
        
        alert('✅ PDF scaricato e email preparata!\n\n📁 Il PDF è stato scaricato nella cartella Download\n📧 Email aperta con contenuto pre-compilato\n\n⬆️ Allega il PDF alla email prima di inviare');
      }, 500);
      
    } catch (error) {
      console.error('Errore nell\'invio email:', error);
      alert('❌ Errore\n\nImpossibile preparare l\'email. Riprova più tardi.');
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