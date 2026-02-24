import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp } from 'lucide-react';

/**
 * ✅ REDESIGN - Mesma pegada do CardsCapacidadeTimeline
 * Paleta: azul/roxo, verde para produção
 * Dark + Light mode suportados
 */
const ProducaoAnual = ({ data, darkMode = false }) => {
  const wrapBg      = darkMode ? 'bg-gray-800 border-gray-700'  : 'bg-white border-gray-200';
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-900';
  const textMuted   = darkMode ? 'text-gray-400' : 'text-gray-500';
  const gridStroke  = darkMode ? '#374151' : '#e5e7eb';
  const axisColor   = darkMode ? '#9ca3af' : '#6b7280';
  const tooltipBg   = darkMode ? '#1f2937' : '#ffffff';
  const tooltipBorder = darkMode ? '#374151' : '#e5e7eb';

  return (
    <div className={`${wrapBg} border rounded-2xl shadow-sm p-6 mb-8`}>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className={`text-lg font-bold ${textPrimary}`}>Produção Anual</h3>
          <p className={`text-xs ${textMuted} mt-0.5`}>Comparativo de produção e protótipos por ano</p>
        </div>
      </div>

      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barSize={36}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis
            dataKey="ano"
            tick={{ fontSize: 11, fill: axisColor }}
            stroke="transparent"
          />
          <YAxis
            tick={{ fontSize: 11, fill: axisColor }}
            stroke="transparent"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: 12,
              color: darkMode ? '#f3f4f6' : '#111827',
              boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            }}
            cursor={{ fill: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}
          />
          <Legend
            wrapperStyle={{ fontSize: 13, color: axisColor, paddingTop: 16 }}
          />
          <Bar
            dataKey="producao"
            name="Produção"
            fill="rgb(34,197,94)"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="prototipo"
            name="Protótipo"
            fill="rgb(99,102,241)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProducaoAnual;