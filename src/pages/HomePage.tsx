import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye } from 'lucide-react';
import { OrderModal } from '../components/OrderModal';
import { supabase } from '../lib/supabase';
import logoFarmap from '../assets/logo farmap industry.png';
import iconaTipografia from '../assets/icona-tipografia.png';

export const HomePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const generateOrderNumber = async () => {
    try {
      // Recupera l'ultimo numero ordine dal database
      const { data: lastOrder, error } = await supabase
        .from('orders')
        .select('order_number')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Errore nel recuperare l\'ultimo ordine:', error);
        // Se c'è un errore, usa il timestamp come fallback
        return `ORD${Date.now()}`;
      }

      // Se non ci sono ordini, inizia da 1
      if (!lastOrder || lastOrder.length === 0) {
        return 'ORD1';
      }

      // Estrai il numero dall'ultimo ordine e incrementa
      const lastOrderNumber = lastOrder[0].order_number;
      const lastNumber = parseInt(lastOrderNumber.replace('ORD', ''));
      const nextNumber = isNaN(lastNumber) ? 1 : lastNumber + 1;
      
      return `ORD${nextNumber}`;
    } catch (error) {
      console.error('Errore nella generazione del numero ordine:', error);
      // Fallback in caso di errore
      return `ORD${Date.now()}`;
    }
  };

  const handleNewOrder = async () => {
    try {
      const newOrderNumber = await generateOrderNumber();
      setOrderNumber(newOrderNumber);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Errore nella generazione del numero ordine:', error);
      // Fallback in caso di errore
      setOrderNumber(`ORD${Date.now()}`);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 relative z-10">
          {/* Logo Section */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <img 
                src={logoFarmap} 
                alt="Farmap Industry" 
                className="h-20 w-auto filter drop-shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent rounded-lg blur-xl"></div>
            </div>
          </div>
          
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl shadow-2xl">
                  <img 
                    src={iconaTipografia} 
                    alt="Tipografia" 
                    className="h-10 w-10 object-contain"
                  />
                </div>
                <div className="absolute inset-0 bg-red-500 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-red-100 to-red-200 bg-clip-text text-transparent tracking-tight">
                Sistema Ordini Tipografia
              </h1>
            </div>
            
            <div className="h-1 w-32 bg-gradient-to-r from-red-500 to-red-700 mx-auto rounded-full mb-6 shadow-lg"></div>
          </div>
          
          <p className="text-xl text-white/80 max-w-md mx-auto mt-8 font-light">
            Per creare il tuo nuovo ordine clicca qui sotto.
          </p>
        </div>

        {/* Main Action Buttons */}
        <div className="text-center mb-16 relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12">
          <button
            onClick={handleNewOrder}
            className="group relative inline-flex items-center gap-4 px-12 py-6 bg-gradient-to-r from-red-600 via-red-500 to-red-700 text-white rounded-2xl font-bold text-xl shadow-2xl hover:shadow-red-500/25 transform hover:-translate-y-2 hover:scale-105 transition-all duration-500 border border-red-400/30"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-800 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-sm"></div>
            
            <div className="relative flex items-center gap-4">
              <div className="p-2 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors duration-300">
                <Plus className="h-7 w-7 group-hover:rotate-180 transition-transform duration-500" />
              </div>
              <span className="tracking-wide">NUOVO ORDINE</span>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
            
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500 to-red-700 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-10"></div>
          </button>

          <Link
            to="/orders"
            className="group relative inline-flex items-center gap-4 px-12 py-6 backdrop-blur-xl bg-white/10 border border-white/20 text-white rounded-2xl font-bold text-xl shadow-2xl hover:bg-white/15 hover:border-white/30 transform hover:-translate-y-2 hover:scale-105 transition-all duration-500"
          >
            <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-sm"></div>
            
            <div className="relative flex items-center gap-4">
              <div className="p-2 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors duration-300">
                <Eye className="h-7 w-7 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <span className="tracking-wide">GESTIONE ORDINI</span>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
            
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-white/20 blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-10"></div>
          </Link>
          </div>
        </div>
      </div>

      {/* Modal */}
      <OrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        orderNumber={orderNumber}
      />
    </>
  );
};