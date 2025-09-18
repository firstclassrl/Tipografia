import React, { useState } from 'react';
import { X, Plus, Trash2, CheckCircle } from 'lucide-react';
import { EtichettaForm } from './forms/EtichettaForm';
import { AstuccioForm } from './forms/AstuccioForm';
import { BlisterForm } from './forms/BlisterForm';
import { supabase } from '../lib/supabase';

interface ProductItem {
  id: string;
  eanCode: string;
  clientName: string;
  productName: string;
  measurements?: string;
  packageType?: string;
  lotNumber: string;
  expiryDate: string;
  productionDate: string;
  quantity: string;
}

interface MultiProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  printType: 'etichetta' | 'astuccio' | 'blister';
}

export const MultiProductModal: React.FC<MultiProductModalProps> = ({ 
  isOpen, 
  onClose, 
  orderNumber, 
  printType 
}) => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [currentProduct, setCurrentProduct] = useState<ProductItem | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const addNewProduct = () => {
    const newProduct: ProductItem = {
      id: Date.now().toString(),
      eanCode: '',
      clientName: '',
      productName: '',
      measurements: '',
      packageType: '',
      lotNumber: '',
      expiryDate: '',
      productionDate: '',
      quantity: ''
    };
    setCurrentProduct(newProduct);
    setIsProductModalOpen(true);
  };

  const saveProduct = (productData: any) => {
    if (currentProduct) {
      const updatedProduct = { ...currentProduct, ...productData };
      setProducts(prev => [...prev, updatedProduct]);
      setCurrentProduct(null);
      setIsProductModalOpen(false);
    }
  };

  const removeProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const saveOrder = async () => {
    if (products.length === 0) {
      alert('⚠️ Attenzione\n\nAggiungi almeno un prodotto prima di salvare l\'ordine.');
      return;
    }

    try {
      // Crea l'ordine principale
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          print_type: printType,
          status: 'bozza'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Crea i dettagli per tutti i prodotti
      const orderDetails = products.map(product => ({
        order_id: orderData.id,
        ean_code: product.eanCode,
        client_name: product.clientName,
        product_name: product.productName,
        measurements: product.measurements || null,
        package_type: product.packageType || null,
        lot_number: product.lotNumber || null,
        expiry_date: product.expiryDate ? `${product.expiryDate.split('/')[1]}-${product.expiryDate.split('/')[0]}-01` : null,
        production_date: product.productionDate ? `${product.productionDate.split('/')[1]}-${product.productionDate.split('/')[0]}-01` : null,
        quantity: product.quantity ? parseInt(product.quantity) : 1
      }));

      const { error: detailsError } = await supabase
        .from('order_details')
        .insert(orderDetails);

      if (detailsError) throw detailsError;

      // Chiudi il modal e reindirizza
      onClose();
      // Qui potresti aggiungere un redirect alla pagina ordini
      
    } catch (error: any) {
      console.error('Errore nel salvare l\'ordine multi-prodotto:', error);
      alert('❌ Errore\n\nImpossibile salvare l\'ordine. Riprova più tardi.');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 w-full h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Nuovo Ordine - {printType.charAt(0).toUpperCase() + printType.slice(1)}
              </h2>
              <p className="text-white/70">Ordine N° {orderNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Add Product Button */}
            <div className="mb-6">
              <button
                onClick={addNewProduct}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-medium cursor-pointer"
                style={{ zIndex: 9999, position: 'relative' }}
              >
                <Plus className="h-5 w-5" />
                Aggiungi Prodotto
              </button>
            </div>

            {/* Products List */}
            {products.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-white/50 text-lg mb-4">
                  Nessun prodotto aggiunto
                </div>
                <p className="text-white/30">
                  Clicca su "Aggiungi Prodotto" per iniziare
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Prodotti ({products.length})
                </h3>
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-white">
                        Prodotto #{index + 1}
                      </h4>
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-white/70">EAN:</span>
                        <p className="text-white font-medium">{product.eanCode}</p>
                      </div>
                      <div>
                        <span className="text-white/70">Cliente:</span>
                        <p className="text-white font-medium">{product.clientName}</p>
                      </div>
                      <div>
                        <span className="text-white/70">Prodotto:</span>
                        <p className="text-white font-medium">{product.productName}</p>
                      </div>
                      <div>
                        <span className="text-white/70">Quantità:</span>
                        <p className="text-white font-medium">{product.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {products.length > 0 && (
            <div className="flex items-center justify-between p-6 border-t border-white/10">
              <p className="text-white/70">
                {products.length} prodotto{products.length !== 1 ? 'i' : ''} aggiunto{products.length !== 1 ? 'i' : ''}
              </p>
              <button
                onClick={saveOrder}
                className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 font-medium"
              >
                <CheckCircle className="h-5 w-5" />
                Aggiungi Prodotto
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product Form Modal */}
      {isProductModalOpen && currentProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 w-full h-full flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">
                Aggiungi Prodotto
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              {printType === 'etichetta' && (
                <EtichettaForm
                  orderNumber={orderNumber}
                  onSave={saveProduct}
                  isMultiProduct={true}
                />
              )}
              {printType === 'astuccio' && (
                <AstuccioForm
                  orderNumber={orderNumber}
                  onSave={saveProduct}
                  isMultiProduct={true}
                />
              )}
              {printType === 'blister' && (
                <BlisterForm
                  orderNumber={orderNumber}
                  onSave={saveProduct}
                  isMultiProduct={true}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
