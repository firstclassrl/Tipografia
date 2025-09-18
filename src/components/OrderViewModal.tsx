import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import { Order, OrderDetails } from '../lib/supabase';
import logoFarmap from '../assets/logo farmap industry.png';

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

  const handleDownload = () => {
    // Per ora usiamo la funzione di stampa del browser
    // In futuro si potrebbe implementare un download PDF
    window.print();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl">
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
          <div className="p-8 overflow-y-auto max-h-[calc(90vh-100px)]">
            <div className="bg-white min-h-[297mm] w-[210mm] mx-auto border border-gray-300 shadow-lg p-8">
              {/* Header with Logo */}
              <div className="text-center mb-8">
                <img
                  src={logoFarmap}
                  alt="Farmap Industry"
                  className="h-16 w-auto mx-auto mb-4"
                />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  ORDINE DI PRODUZIONE
                </h1>
                <div className="flex justify-center gap-8 text-sm text-gray-600">
                  <span><strong>Ordine:</strong> {order.order_number}</span>
                  <span><strong>Data:</strong> {formatDate(order.created_at)}</span>
                  <span><strong>Stato:</strong> {order.status}</span>
                </div>
              </div>

              {/* Order Details */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                  Dettagli Ordine
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Tipo di Stampa:</strong> {order.print_type?.toUpperCase()}
                  </div>
                  <div>
                    <strong>Numero Prodotti:</strong> {orderDetails.length}
                  </div>
                  <div>
                    <strong>Data Creazione:</strong> {formatDate(order.created_at)}
                  </div>
                  <div>
                    <strong>Ultimo Aggiornamento:</strong> {formatDate(order.updated_at)}
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div className="mb-8">
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

              {/* Footer */}
              <div className="mt-12 border-t border-gray-300 pt-6">
                <div className="grid grid-cols-3 gap-8 text-sm">
                  <div>
                    <strong>Firma Responsabile:</strong>
                    <div className="border-b border-gray-300 mt-8 h-8"></div>
                  </div>
                  <div>
                    <strong>Data Consegna:</strong>
                    <div className="border-b border-gray-300 mt-8 h-8"></div>
                  </div>
                  <div>
                    <strong>Note:</strong>
                    <div className="border-b border-gray-300 mt-8 h-8"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};
