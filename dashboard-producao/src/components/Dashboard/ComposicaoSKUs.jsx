import React from 'react';
import { Package, Wrench, Sparkles } from 'lucide-react';

/**
 * ✅ REDESIGN - Mesma pegada do CardsCapacidadeTimeline
 */
const ComposicaoSKUs = ({ data, darkMode = false }) => {
  const wrapBg      = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-900';
  const textMuted   = darkMode ? 'text-gray-400' : 'text-gray-500';

  const cards = [
    {
      label: 'Mesas',
      value: data.pecas,
      icon: Package,
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Ferramentas e Diversos',
      value: data.ferramentasDiversos,
      icon: Wrench,
      gradient: 'from-purple-500 to-indigo-600',
    },
    {
      label: 'Novos SKUs',
      value: data.novosSkus,
      icon: Sparkles,
      gradient: 'from-green-500 to-emerald-600',
    },
  ];

  return (
    <div className={`${wrapBg} border rounded-2xl shadow-sm p-6 mb-8`}>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
          <Package className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className={`text-lg font-bold ${textPrimary}`}>Composição de SKUs</h3>
          <p className={`text-xs ${textMuted} mt-0.5`}>Distribuição por categoria</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {cards.map(({ label, value, icon: Icon, gradient }) => (
          <div
            key={label}
            className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-center`}
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-4xl font-bold mb-1">{value}</div>
            <div className="text-sm opacity-80 font-medium">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComposicaoSKUs;