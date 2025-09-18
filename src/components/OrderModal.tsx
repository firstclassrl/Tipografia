import React, { useState } from 'react';
import { X, FileText, Package, Layers } from 'lucide-react';
import { MultiProductModal } from './MultiProductModal';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
}

export type PrintType = 'etichetta' | 'astuccio' | 'blister';

export const OrderModal: React.FC<OrderModalProps> = ({ isOpen, onClose, orderNumber }) => {
  const [selectedPrintType, setSelectedPrintType] = useState<PrintType | null>(null);

  if (!isOpen) return null;

  const handlePrintTypeSelected = (printType: PrintType) => {
    setSelectedPrintType(printType);
  };

  const handleBackToSelection = () => {
    setSelectedPrintType(null);
  };

  const handleOrderSaved = () => {
    onClose();
    setSelectedPrintType(null);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="backdrop-blur-xl bg-black/40 border border-white/20 w-full h-full flex flex-col">
        <div className="flex items-center justify-between p-8 border-b border-white/20 bg-gradient-to-r from-red-500/10 to-black/20">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent">Nuovo Ordine</h2>
            <p className="text-white/70 mt-2">Ordine N° <span className="font-mono font-bold text-red-400 text-lg">{orderNumber}</span></p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white/10 rounded-full transition-colors duration-200 border border-white/20 hover:border-white/40"
          >
            <X className="h-6 w-6 text-white/70 hover:text-white" />
          </button>
        </div>

        <div className="flex-1 p-8 overflow-y-auto">
          {!selectedPrintType ? (
            <div>
              <h3 className="text-2xl font-bold text-white mb-8 text-center">Seleziona il tipo di stampa</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <button
                  onClick={() => handlePrintTypeSelected('etichetta')}
                  className="group p-8 backdrop-blur-xl bg-white/5 border-2 border-white/20 rounded-2xl hover:border-red-500 hover:bg-white/10 hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-500 text-center hover:-translate-y-2"
                >
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-500/20 to-red-700/20 rounded-full flex items-center justify-center group-hover:from-red-500/40 group-hover:to-red-700/40 transition-all duration-300 border border-red-500/30">
                    <FileText className="h-10 w-10 text-red-400 group-hover:text-red-300" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3 group-hover:text-red-200 transition-colors">Etichetta</h4>
                  <p className="text-white/70 group-hover:text-white/90 transition-colors">Stampa etichette personalizzate con codici EAN e informazioni prodotto</p>
                </button>

                <button
                  onClick={() => handlePrintTypeSelected('astuccio')}
                  className="group p-8 backdrop-blur-xl bg-white/5 border-2 border-white/20 rounded-2xl hover:border-white hover:bg-white/10 hover:shadow-2xl hover:shadow-white/20 transition-all duration-500 text-center hover:-translate-y-2"
                >
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center group-hover:from-white/20 group-hover:to-white/10 transition-all duration-300 border border-white/30">
                    <Package className="h-10 w-10 text-white/80 group-hover:text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3 group-hover:text-white transition-colors">Astuccio</h4>
                  <p className="text-white/70 group-hover:text-white/90 transition-colors">Stampa astucci per il confezionamento dei prodotti</p>
                </button>

                <button
                  onClick={() => handlePrintTypeSelected('blister')}
                  className="group p-8 backdrop-blur-xl bg-white/5 border-2 border-white/20 rounded-2xl hover:border-black hover:bg-black/20 hover:shadow-2xl hover:shadow-black/40 transition-all duration-500 text-center hover:-translate-y-2"
                >
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-black/20 to-black/10 rounded-full flex items-center justify-center group-hover:from-black/40 group-hover:to-black/20 transition-all duration-300 border border-red-500/30">
                    <Layers className="h-10 w-10 text-red-300 group-hover:text-red-200" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3 group-hover:text-red-200 transition-colors">Blister</h4>
                  <p className="text-white/70 group-hover:text-white/90 transition-colors">Stampa blister trasparenti per prodotti farmaceutici</p>
                </button>
              </div>
            </div>
          ) : (
            <MultiProductModal
              isOpen={true}
              onClose={() => {
                setSelectedPrintType(null);
                onClose();
              }}
              orderNumber={orderNumber}
              printType={selectedPrintType}
            />
          )}
        </div>
      </div>
    </div>
  );
};