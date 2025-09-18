import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle } from 'lucide-react';

interface EtichettaFormProps {
  orderNumber: string;
  onSave: () => void;
}

interface FormData {
  eanCode: string;
  clientName: string;
  productName: string;
  measurements: string;
  lotNumber: string;
  expiryDate: string; // mm/yyyy format
  productionDate: string; // mm/yyyy format
  quantity: string;
}

export const EtichettaForm: React.FC<EtichettaFormProps> = ({ orderNumber, onSave }) => {
  const [formData, setFormData] = useState<FormData>({
    eanCode: '',
    clientName: '',
    productName: '',
    measurements: '',
    lotNumber: '',
    expiryDate: '',
    productionDate: '',
    quantity: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate EAN code is provided
    if (!formData.eanCode.trim()) {
      alert('Il codice EAN è obbligatorio');
      return;
    }
    
    // Validate client name is provided
    if (!formData.clientName.trim()) {
      alert('Il nome cliente è obbligatorio');
      return;
    }
    
    // Validate product name is provided
    if (!formData.productName.trim()) {
      alert('Il nome prodotto è obbligatorio');
      return;
    }
    
    setLoading(true);

    try {
      // Crea l'ordine principale
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          print_type: 'etichetta',
          status: 'bozza'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Crea i dettagli dell'ordine
      const { error: detailsError } = await supabase
        .from('order_details')
        .insert({
          order_id: orderData.id,
          ean_code: formData.eanCode,
          client_name: formData.clientName,
          product_name: formData.productName,
          measurements: formData.measurements || null,
          lot_number: formData.lotNumber || null,
          expiry_date: formData.expiryDate ? `${formData.expiryDate}-01` : null,
          production_date: formData.productionDate ? `${formData.productionDate}-01` : null,
          quantity: formData.quantity ? parseInt(formData.quantity) : 1
        });

      if (detailsError) throw detailsError;

      onSave();
    } catch (error: any) {
      console.error('Errore nel salvare l\'ordine:', error);
      
      if (error.code === '23505' || error.message?.includes('duplicate key')) {
        alert('Errore: Numero ordine già esistente. Riprova con un nuovo ordine.');
      } else if (error.message?.includes('409')) {
        alert('Errore: Numero ordine già esistente. Riprova con un nuovo ordine.');
      } else {
        alert('Errore nel salvare l\'ordine. Riprova.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-bold text-white mb-3">
            Codice EAN *
          </label>
          <input
            type="text"
            name="eanCode"
            value={formData.eanCode}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/30 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-white placeholder-white/50 font-medium"
            placeholder="Es. 1234567890123"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-white mb-3">
            Nome Cliente *
          </label>
          <input
            type="text"
            name="clientName"
            value={formData.clientName}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/30 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-white placeholder-white/50 font-medium"
            placeholder="Es. Farmacia XYZ"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-white mb-3">
            Nome Prodotto *
          </label>
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/30 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-white placeholder-white/50 font-medium"
            placeholder="Es. Medicinale ABC 100mg"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-white mb-3">
            Misure Etichetta *
          </label>
          <input
            type="text"
            name="measurements"
            value={formData.measurements}
            onChange={handleInputChange}
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/30 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-white placeholder-white/50 font-medium"
            placeholder="Es. 50x30mm"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-white mb-3">
            Lotto
          </label>
          <input
            type="text"
            name="lotNumber"
            value={formData.lotNumber}
            onChange={handleInputChange}
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/30 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-white placeholder-white/50 font-medium"
            placeholder="Es. LOT123456"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-white mb-3">
            Scadenza (MM/YYYY)
          </label>
          <input
            type="text"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleInputChange}
            pattern="^(0[1-9]|1[0-2])\/\d{4}$"
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/30 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-white font-medium"
            placeholder="Es. 12/2025"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-white mb-3">
            Data Produzione (MM/YYYY)
          </label>
          <input
            type="text"
            name="productionDate"
            value={formData.productionDate}
            onChange={handleInputChange}
            pattern="^(0[1-9]|1[0-2])\/\d{4}$"
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/30 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-white font-medium"
            placeholder="Es. 01/2025"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-white mb-3">
            Quantità Etichette
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleInputChange}
            min="1"
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/30 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-white placeholder-white/50 font-medium"
            placeholder="Es. 1000"
          />
        </div>
      </div>

      <div className="flex justify-end pt-8 border-t border-white/20">
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-red-500 to-red-600 text-white px-10 py-4 rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-3 font-bold text-lg shadow-lg hover:shadow-red-500/25 hover:-translate-y-1"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              Salvataggio...
            </>
          ) : (
            <>
              <CheckCircle className="h-6 w-6" />
              Salva Ordine
            </>
          )}
        </button>
      </div>
    </form>
  );
};