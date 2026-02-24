import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

/**
 * ✅ REDESIGN - Mesma pegada do CardsCapacidadeTimeline
 */
const EvolucaoSKUs = ({ data, darkMode = false }) => {
  const wrapBg        = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary   = darkMode ? 'text-gray-100' : 'text-gray-900';
  const textMuted     = darkMode ? 'text-gray-400' : 'text-gray-500';
  const gridStroke    = darkMode ? '#374151' : '#e5e7eb';
  const axisColor     = darkMode ? '#9ca3af' : '#6b7280';
  const tooltipBg     = darkMode ? '#1f2937' : '#ffffff';
  const tooltipBorder = darkMode ? '#374151' : '#e5e7eb';

  return (
    <div className={`${wrapBg} border rounded-2xl shadow-sm p-6 mb-8`}>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className={`text-lg font-bold ${textPrimary}`}>Evolução de SKUs (mesas)</h3>
          <p className={`text-xs ${textMuted} mt-0.5`}>Acompanhamento mensal</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis
            dataKey="periodo"
            tick={{ fontSize: 11, fill: axisColor }}
            stroke="transparent"
          />
          <YAxis
            domain={[240, 280]}
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
            cursor={{ stroke: darkMode ? '#4b5563' : '#d1d5db', strokeWidth: 1 }}
          />
          <Line
            type="monotone"
            dataKey="valor"
            name="SKUs"
            stroke="rgb(99,102,241)"
            strokeWidth={3}
            dot={{ fill: 'rgb(99,102,241)', r: 5, strokeWidth: 0 }}
            activeDot={{ r: 7, fill: 'rgb(139,92,246)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EvolucaoSKUs;