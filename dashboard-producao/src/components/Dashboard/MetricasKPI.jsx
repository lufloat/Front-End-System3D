import React from 'react';
import { TrendingUp, TrendingDown, Target, Layers, CheckCircle, FlaskConical } from 'lucide-react';

/**
 * ✅ REDESIGN - Mesma pegada do CardsCapacidadeTimeline
 */

const Variacao = ({ valor, darkMode }) => {
  const isPositivo = valor >= 0;
  return (
    <div className={`flex items-center gap-1 text-sm font-semibold ${isPositivo ? 'text-green-500' : 'text-red-500'}`}>
      {isPositivo ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
      {isPositivo ? '+' : ''}{valor.toFixed(1)}%
    </div>
  );
};

const MetricasKPI = ({ data, darkMode = false }) => {
  const cardBg      = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-900';
  const textMuted   = darkMode ? 'text-gray-400' : 'text-gray-500';
  const trackBg    = darkMode ? 'bg-gray-700' : 'bg-gray-200';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

      {/* SKUs Totais */}
      <div className={`${cardBg} border rounded-2xl p-6 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 group`}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
            <Target className="w-4 h-4 text-white" />
          </div>
          <p className={`text-sm font-medium ${textMuted}`}>SKUs Totais</p>
        </div>
        <h3 className={`text-3xl font-bold ${textPrimary} mb-1`}>{data.skusTotais}</h3>
        <p className={`text-xs ${textMuted} mb-3`}>
          Meta {data.metaSkus} — {data.progressoSkus.toFixed(1)}%
        </p>
        <div className={`w-full ${trackBg} rounded-full h-1.5 mb-3`}>
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(data.progressoSkus, 100)}%` }}
          />
        </div>
        <Variacao valor={data.variacaoSkus} darkMode={darkMode} />
      </div>

      {/* Produção */}
      <div className={`${cardBg} border rounded-2xl p-6 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 group`}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <p className={`text-sm font-medium ${textMuted}`}>Produção</p>
        </div>
        <h3 className={`text-3xl font-bold ${textPrimary} mb-1`}>
          {data.producao.toLocaleString('pt-BR')}
        </h3>
        <p className={`text-xs ${textMuted} mb-3`}>unidades produzidas</p>
        <div className="mb-3" /> {/* spacer para alinhar variação */}
        <Variacao valor={data.variacaoProducao} darkMode={darkMode} />
      </div>

      {/* Taxa de Sucesso */}
      <div className={`${cardBg} border rounded-2xl p-6 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 group`}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
          <p className={`text-sm font-medium ${textMuted}`}>Taxa de Sucesso</p>
        </div>
        <h3 className={`text-3xl font-bold ${textPrimary} mb-1`}>
          {data.taxaSucesso.toFixed(1)}%
        </h3>
        <p className={`text-xs ${textMuted} mb-3`}>média das impressoras</p>
        <div className={`w-full ${trackBg} rounded-full h-1.5 mb-3`}>
          <div
            className="bg-gradient-to-r from-purple-500 to-indigo-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(data.taxaSucesso, 100)}%` }}
          />
        </div>
        <Variacao valor={data.variacaoTaxaSucesso} darkMode={darkMode} />
      </div>

      {/* Protótipos */}
      <div className={`${cardBg} border rounded-2xl p-6 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 group`}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
            <FlaskConical className="w-4 h-4 text-white" />
          </div>
          <p className={`text-sm font-medium ${textMuted}`}>Protótipos</p>
        </div>
        <h3 className={`text-3xl font-bold ${textPrimary} mb-1`}>{data.prototipos}</h3>
        <p className={`text-xs ${textMuted} mb-3`}>desenvolvidos</p>
        <div className="mb-3" />
        <Variacao valor={data.variacaoPrototipos} darkMode={darkMode} />
      </div>

    </div>
  );
};

export default MetricasKPI;