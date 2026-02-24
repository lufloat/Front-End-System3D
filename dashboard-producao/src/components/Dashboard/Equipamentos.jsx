import React from 'react';
import { Printer, CheckCircle } from 'lucide-react';

/**
 * ✅ REDESIGN - Mesma pegada do CardsCapacidadeTimeline
 * Paleta: azul/roxo, verde para ativos
 * Dark + Light mode suportados
 */
const Equipamentos = ({ data, darkMode = false }) => {
  const wrapBg      = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const cardBg      = darkMode ? 'bg-gray-700/50' : 'bg-gray-50';
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-900';
  const textMuted   = darkMode ? 'text-gray-400' : 'text-gray-500';
  const borderClass = darkMode ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`${wrapBg} border rounded-2xl shadow-sm p-6 mb-8`}>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
          <Printer className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className={`text-lg font-bold ${textPrimary}`}>Equipamentos</h3>
          <p className={`text-xs ${textMuted} mt-0.5`}>Impressoras ativas no parque</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.map((equipamento, index) => (
          <div
            key={index}
            className={`${cardBg} border-2 ${borderClass} hover:border-blue-500 rounded-2xl p-5
                       hover:shadow-lg hover:scale-105 transition-all duration-300 group`}
          >
            {/* Ícone */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center border border-blue-200/50">
                <Printer className="w-5 h-5 text-blue-500" />
              </div>
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow shadow-green-400/50 animate-pulse" />
            </div>

            {/* Nome */}
            <h4 className={`text-base font-bold ${textPrimary} mb-2 group-hover:text-blue-500 transition-colors`}>
              {equipamento.nome}
            </h4>

            {/* Unidades ativas */}
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-semibold text-green-500">
                {equipamento.unidadesAtivas} unidades ativas
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Equipamentos;