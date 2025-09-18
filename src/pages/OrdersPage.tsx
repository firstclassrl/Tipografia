import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, PrinterIcon } from 'lucide-react';
import { OrdersList } from '../components/OrdersList';

export const OrdersPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12 relative z-10">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/"
              className="group flex items-center gap-2 px-4 py-2 backdrop-blur-sm bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 border border-white/20 hover:border-white/40 font-medium"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
              Torna alla Home
            </Link>
            
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl shadow-2xl">
                  <PrinterIcon className="h-8 w-8 text-white" />
                </div>
                <div className="absolute inset-0 bg-red-500 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-red-100 to-red-200 bg-clip-text text-transparent tracking-tight">
                Gestione Ordini
              </h1>
            </div>
            
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>
          
          <div className="h-1 w-32 bg-gradient-to-r from-red-500 to-red-700 mx-auto rounded-full shadow-lg"></div>
        </div>
      </div>

      {/* Orders List */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>
        <div className="relative">
          <OrdersList />
        </div>
      </div>
    </div>
  );
};