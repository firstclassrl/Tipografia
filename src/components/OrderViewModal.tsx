import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import { Order, OrderDetails } from '../lib/supabase';
import logoFarmap from '../assets/logo farmap industry.png';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface OrderViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  orderDetails: OrderDetails[];
}

export const OrderViewModal: React.FC<OrderViewModalProps> = ({
  isOpen,
  onClose,
  order,
  orderDetails
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateForDisplay = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${year}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      const element = document.querySelector('.print-content') as HTMLElement;
      if (!element) {
        alert('❌ Errore\n\nImpossibile trovare il contenuto da scaricare.');
        return;
      }

      // Genera PDF senza messaggio

      // Cattura il contenuto come immagine
      const canvas = await html2canvas(element, {
        scale: 3, // Qualità molto alta
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 1400,
        height: 1000,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1400,
        windowHeight: 1000,
        removeContainer: true
      });

      // Crea PDF in formato A4 landscape
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Dimensioni A4 landscape in mm
      const pdfWidth = 297;
      const pdfHeight = 210;
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Usa tutto lo spazio disponibile del foglio A4
      const finalWidth = pdfWidth; // Usa tutta la larghezza
      const finalHeight = pdfHeight; // Usa tutta l'altezza

      // Posiziona l'immagine senza margini
      const x = 0; // Nessun margine laterale
      const y = 0; // Nessun margine superiore

      // Aggiungi l'immagine al PDF con migliore qualità
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      pdf.addImage(imageData, 'JPEG', x, y, finalWidth, finalHeight, undefined, 'FAST');

      // Scarica il PDF
      pdf.save(`Ordine_${order.order_number}.pdf`);
      
    } catch (error) {
      console.error('Errore nel download:', error);
      alert('❌ Errore\n\nImpossibile scaricare il PDF. Riprova più tardi.');
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">
                Ordine {order.order_number}
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.status === 'completato' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {order.status}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Download className="h-4 w-4" />
                Scarica
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Printer className="h-4 w-4" />
                Stampa
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content - A4 Landscape Layout */}
          <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="bg-white w-[290mm] mx-auto border border-gray-300 shadow-lg p-6 print-content">
              {/* Header with Logo */}
              <div className="text-center mb-3">
                <img
                  src={logoFarmap}
                  alt="Farmap Industry"
                  className="h-16 w-auto mx-auto mb-4"
                />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  ORDINE DI STAMPA
                </h1>
                <div className="flex justify-center gap-8 text-sm text-gray-600">
                  <span><strong>Ordine:</strong> {order.order_number}</span>
                  <span><strong>Data:</strong> {formatDate(order.created_at)}</span>
                  <span><strong>Stato:</strong> {order.status}</span>
                </div>
              </div>

              {/* Order Details - Horizontal Layout */}
              <div className="mb-3">
                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                  Dettagli Ordine
                </h2>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <strong>Tipo di Stampa:</strong><br/>
                    {order.print_type?.toUpperCase()}
                  </div>
                  <div>
                    <strong>Numero Prodotti:</strong><br/>
                    {orderDetails.length}
                  </div>
                  <div>
                    <strong>Data Creazione:</strong><br/>
                    {formatDate(order.created_at)}
                  </div>
                  <div>
                    <strong>Ultimo Aggiornamento:</strong><br/>
                    {formatDate(order.updated_at)}
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div className="mb-3">
                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                  Prodotti
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Prodotto</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Cliente</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold">EAN</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Lotto</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Scadenza</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Produzione</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Qtà</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderDetails.map((detail, index) => (
                        <tr key={detail.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-3 py-2">
                            {detail.product_name}
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            {detail.client_name}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 font-mono">
                            {detail.ean_code}
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            {detail.lot_number || '-'}
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            {formatDateForDisplay(detail.expiry_date)}
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            {formatDateForDisplay(detail.production_date)}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center">
                            {detail.quantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>


            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          
          body * {
            visibility: hidden;
          }
          
          .print-content, .print-content * {
            visibility: visible;
          }
          
          .print-content {
            position: absolute;
            left: 50%;
            top: 0;
            transform: translateX(-50%);
            width: 297mm;
            height: 210mm;
            background: white !important;
            color: black !important;
            font-size: 10px;
            line-height: 1.2;
            box-shadow: none !important;
            border: none !important;
            padding: 8mm !important;
            overflow: hidden;
            page-break-inside: avoid;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-content img {
            max-width: 100%;
            height: 40px !important;
            width: auto !important;
          }
          
          .print-content table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }
          
          .print-content th,
          .print-content td {
            border: 1px solid #333;
            padding: 4px;
            text-align: left;
          }
          
          .print-content th {
            background-color: #f5f5f5 !important;
            font-weight: bold;
          }
          
          .print-content h1,
          .print-content h2 {
            color: black !important;
          }
          
          .print-content .header {
            text-align: center;
            margin-bottom: 5px;
          }
          
          .print-content img {
            height: 40px !important;
            width: auto !important;
          }
          
          .print-content h1 {
            font-size: 20px !important;
            margin-bottom: 8px !important;
          }
          
          .print-content .details {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            margin: 8px 0;
            font-size: 10px !important;
          }
          
          .print-content h2 {
            font-size: 14px !important;
            margin-bottom: 5px !important;
          }
          
          .print-content table {
            font-size: 9px !important;
            margin-top: 5px !important;
          }
          
          .print-content th,
          .print-content td {
            padding: 3px !important;
            border: 1px solid #000 !important;
          }
        }
      `}</style>
    </>
  );
};
