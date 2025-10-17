import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle, Edit } from 'lucide-react';
import { EtichettaForm } from './forms/EtichettaForm';
import { AstuccioForm } from './forms/AstuccioForm';
import { BlisterForm } from './forms/BlisterForm';
import { supabase } from '../lib/supabase';
import { Notification } from './Notification';

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
  existingOrder?: any; // Per modificare ordini esistenti
}

export const MultiProductModal: React.FC<MultiProductModalProps> = ({ 
  isOpen, 
  onClose, 
  orderNumber, 
  printType,
  existingOrder 
}) => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [currentProduct, setCurrentProduct] = useState<ProductItem | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  // Carica prodotti esistenti quando si modifica un ordine
  useEffect(() => {
    if (existingOrder && existingOrder.order_details) {
      const existingProducts: ProductItem[] = existingOrder.order_details.map((detail: any) => ({
        id: detail.id.toString(),
        eanCode: detail.ean_code || '',
        clientName: detail.client_name || '',
        productName: detail.product_name || '',
        measurements: detail.measurements || '',
        packageType: detail.package_type || '',
        lotNumber: detail.lot_number || '',
        expiryDate: detail.expiry_date ? formatDateForInput(detail.expiry_date) : '',
        productionDate: detail.production_date ? formatDateForInput(detail.production_date) : '',
        quantity: detail.quantity ? detail.quantity.toString() : ''
      }));
      setProducts(existingProducts);
    }
  }, [existingOrder]);

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${year}`;
  };

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
    setIsEditingExisting(false);
    setIsProductModalOpen(true);
  };

  const editProduct = (product: ProductItem) => {
    setCurrentProduct(product);
    setIsEditingExisting(true);
    setIsProductModalOpen(true);
  };

  const saveProduct = (productData: any) => {
    if (currentProduct) {
      const updatedProduct = { ...currentProduct, ...productData };
      
      if (isEditingExisting) {
        // Update existing product
        setProducts(prev => prev.map(p => 
          p.id === currentProduct.id ? updatedProduct : p
        ));
      } else {
        // Add new product
        setProducts(prev => [...prev, updatedProduct]);
      }
      
      setCurrentProduct(null);
      setIsEditingExisting(false);
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
      let orderData;
      
      if (existingOrder) {
        // MODIFICA ORDINE ESISTENTE
        // Aggiorna l'ordine principale
        const { data: updatedOrder, error: orderError } = await supabase
          .from('orders')
          .update({
            print_type: printType,
            status: 'bozza'
          })
          .eq('id', existingOrder.id)
          .select()
          .single();

        if (orderError) throw orderError;
        orderData = updatedOrder;

        // Elimina tutti i dettagli esistenti
        await supabase
          .from('order_details')
          .delete()
          .eq('order_id', existingOrder.id);

      } else {
        // NUOVO ORDINE
        const { data: newOrder, error: orderError } = await supabase
          .from('orders')
          .insert({
            order_number: orderNumber,
            print_type: printType,
            status: 'bozza'
          })
          .select()
          .single();

        if (orderError) throw orderError;
        orderData = newOrder;
      }

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

      // Mostra notifica di successo
      const action = existingOrder ? 'modificato' : 'salvato';
      setNotification({
        message: `Ordine N. ${orderNumber} ${action}`,
        type: 'success',
        isVisible: true
      });

      // Chiudi il modal dopo 3 secondi
      setTimeout(() => {
        onClose();
      }, 3000);
      
    } catch (error: any) {
      console.error('Errore nel salvare l\'ordine multi-prodotto:', error);
      setNotification({
        message: 'Errore nel salvare l\'ordine',
        type: 'error',
        isVisible: true
      });
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
{existingOrder ? 'Modifica' : 'Nuovo'} Ordine - {printType.charAt(0).toUpperCase() + printType.slice(1)}
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
                Aggiungi Etichetta
              </button>
            </div>

            {/* Products List */}
            {products.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-white/50 text-lg mb-4">
                  Nessuna etichetta aggiunta
                </div>
                <p className="text-white/30">
                  Clicca su "Aggiungi Etichetta" per iniziare
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Etichette ({products.length})
                </h3>
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-white">
                        Etichetta #{index + 1}
                      </h4>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => editProduct(product)}
                          className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4 text-blue-400" />
                        </button>
                        <button
                          onClick={() => removeProduct(product.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
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
                {products.length} etichetta{products.length !== 1 ? 'e' : ''} aggiunta{products.length !== 1 ? 'e' : ''}
              </p>
              <button
                onClick={saveOrder}
                className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 font-medium"
              >
                <CheckCircle className="h-5 w-5" />
                Salva Ordine
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
                {isEditingExisting ? 'Modifica Etichetta' : 'Aggiungi Etichetta'}
              </h3>
              <button
                onClick={() => {
                  setIsProductModalOpen(false);
                  setCurrentProduct(null);
                  setIsEditingExisting(false);
                }}
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
                  initialData={currentProduct ? {
                    eanCode: currentProduct.eanCode,
                    clientName: currentProduct.clientName,
                    productName: currentProduct.productName,
                    measurements: currentProduct.measurements || '',
                    lotNumber: currentProduct.lotNumber,
                    expiryDate: currentProduct.expiryDate,
                    productionDate: currentProduct.productionDate,
                    quantity: currentProduct.quantity
                  } : undefined}
                />
              )}
              {printType === 'astuccio' && (
                <AstuccioForm
                  orderNumber={orderNumber}
                  onSave={saveProduct}
                  isMultiProduct={true}
                  initialData={currentProduct ? {
                    eanCode: currentProduct.eanCode,
                    clientName: currentProduct.clientName,
                    productName: currentProduct.productName,
                    packageType: currentProduct.packageType || '',
                    lotNumber: currentProduct.lotNumber,
                    expiryDate: currentProduct.expiryDate,
                    productionDate: currentProduct.productionDate,
                    quantity: currentProduct.quantity
                  } : undefined}
                />
              )}
              {printType === 'blister' && (
                <BlisterForm
                  orderNumber={orderNumber}
                  onSave={saveProduct}
                  isMultiProduct={true}
                  initialData={currentProduct ? {
                    eanCode: currentProduct.eanCode,
                    clientName: currentProduct.clientName,
                    productName: currentProduct.productName,
                    measurements: currentProduct.measurements || '',
                    lotNumber: currentProduct.lotNumber,
                    expiryDate: currentProduct.expiryDate,
                    productionDate: currentProduct.productionDate,
                    quantity: currentProduct.quantity
                  } : undefined}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
        duration={3000}
      />
    </>
  );
};
