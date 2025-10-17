import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, PrinterIcon } from 'lucide-react';
import { OrdersList } from '../components/OrdersList';

export const OrdersPage: React.FC = () => {
  const [grouping, setGrouping] = useState<'monthly' | 'yearly'>('monthly');
  const [clientFilter, setClientFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-white/80 font-medium">Filtra:</span>
            <input
              type="text"
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              placeholder="Cliente"
              className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <span className="text-white/80 font-medium">Data da:</span>
            <input
              type="text"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="gg/mm/yyyy"
              pattern="\d{2}/\d{2}/\d{4}"
              className={`px-3 py-2 rounded-xl bg-white/10 border text-white placeholder-white/60 focus:outline-none focus:ring-2 ${
                dateFrom && !dateFrom.match(/^\d{2}\/\d{2}\/\d{4}$/) 
                  ? 'border-red-500 focus:ring-red-500/30' 
                  : 'border-white/20 focus:ring-white/30'
              }`}
            />
            <span className="text-white/80 font-medium">a:</span>
            <input
              type="text"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="gg/mm/yyyy"
              pattern="\d{2}/\d{2}/\d{4}"
              className={`px-3 py-2 rounded-xl bg-white/10 border text-white placeholder-white/60 focus:outline-none focus:ring-2 ${
                dateTo && !dateTo.match(/^\d{2}\/\d{2}\/\d{4}$/) 
                  ? 'border-red-500 focus:ring-red-500/30' 
                  : 'border-white/20 focus:ring-white/30'
              }`}
            />
            <button
              onClick={() => {
                setClientFilter('');
                setDateFrom('');
                setDateTo('');
              }}
              className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-medium hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-gray-500/25"
            >
              Pulisci filtri
            </button>
          </div>
          <div className="flex items-center gap-2">
          <button
            onClick={() => {
              console.log('Setting grouping to monthly');
              setGrouping('monthly');
            }}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-300 ${grouping === 'monthly' ? 'bg-red-600 text-white border-red-500' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}
          >
            Mensile
          </button>
          <button
            onClick={() => {
              console.log('Setting grouping to yearly');
              setGrouping('yearly');
            }}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-300 ${grouping === 'yearly' ? 'bg-red-600 text-white border-red-500' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}
          >
            Annuale
          </button>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl pointer-events-none"></div>
        <div className="relative">
          <OrdersList grouping={grouping} clientFilter={clientFilter} dateFrom={dateFrom} dateTo={dateTo} />
        </div>
      </div>
    </div>
  );
};