import React from 'react';
import { X, Calendar, Package, FileText } from 'lucide-react';
import { OrderWithDetails } from '../lib/supabase';

interface OrderDetailsModalProps {
  order: OrderWithDetails;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen) return null;

  const details = order.order_details?.[0];

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
      case 'etichetta': return <FileText className="h-8 w-8 text-red-400" />;
      case 'astuccio': return <Package className="h-8 w-8 text-white" />;
      case 'blister': return <Package className="h-8 w-8 text-red-300" />;
      default: return <FileText className="h-8 w-8 text-white" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="backdrop-blur-xl bg-black/40 border border-white/20 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-8 border-b border-white/20 bg-gradient-to-r from-red-500/10 to-black/20">
          <div className="flex items-center gap-3">
            {getPrintTypeIcon(order.print_type)}
            <div>
              <h2 className="text-2xl font-bold text-white">Ordine {order.order_number}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-red-300 capitalize font-medium">{order.print_type}</span>
                <span className={`px-3 py-1 rounded-xl text-xs font-bold backdrop-blur-sm ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white/10 rounded-full transition-colors duration-200 border border-white/20 hover:border-white/40"
          >
            <X className="h-6 w-6 text-white/70 hover:text-white" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
          {!details ? (
            <div className="text-center py-8">
              <p className="text-white/60">Nessun dettaglio disponibile per questo ordine.</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white/60 mb-2">Data Creazione</h3>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-red-400" />
                  <span className="text-white font-medium">
                    {new Date(order.created_at).toLocaleDateString('it-IT', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white/60 mb-2">Codice EAN</h3>
                <span className="text-white font-mono text-lg">{details.ean_code}</span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white/60 mb-2">Nome Cliente</h3>
                <span className="text-white font-medium">{details.client_name}</span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white/60 mb-2">Prodotto</h3>
                <span className="text-white font-medium">{details.product_name}</span>
              </div>
            </div>

            <div className="space-y-4">
              {details.measurements && (
                <div>
                  <h3 className="text-sm font-bold text-white/60 mb-2">
                    {order.print_type === 'etichetta' ? 'Misure Etichetta' : 'Misura Blister'}
                  </h3>
                  <span className="text-white font-medium">{details.measurements}</span>
                </div>
              )}

              {details.package_type && (
                <div>
                  <h3 className="text-sm font-bold text-white/60 mb-2">Tipo Astuccio</h3>
                  <span className="text-white font-medium">{details.package_type}</span>
                </div>
              )}

              <div>
                <h3 className="text-sm font-bold text-white/60 mb-2">Lotto</h3>
                <span className="text-white font-mono text-lg">{details.lot_number}</span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white/60 mb-2">Data Produzione</h3>
                <span className="text-white font-medium">
                  {new Date(details.production_date).toLocaleDateString('it-IT')}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white/60 mb-2">Scadenza</h3>
                <span className="text-white font-medium">
                  {new Date(details.expiry_date).toLocaleDateString('it-IT')}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white/60 mb-2">Quantità</h3>
                <span className="text-white font-bold text-lg">{details.quantity.toLocaleString('it-IT')}</span>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};