import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { catosAPI } from '../../services/Catosapi';

const LINHAS = [
  { key: 'mesas',                 nome: 'Mesas',            cor: '#6366f1' },
  { key: 'componentes',           nome: 'Componentes',      cor: '#f97316' },
  { key: 'sku_ticket',            nome: 'SKU Ticket',       cor: '#ec4899' },
  { key: 'sku_estimated',         nome: 'SKU Estimado',     cor: '#14b8a6' },
  { key: 'componentes_prototipo', nome: 'Componentes de protótipos',  cor: '#8b5cf6' },
];

// Quais linhas ficam visíveis por padrão
const VISIVEIS_DEFAULT = new Set(['mesas', 'sku_ticket', 'sku_estimated']);

const EvolucaoSKUs = ({ data, darkMode = false, anoSelecionado = 2026 }) => {
  const [catosRows, setCatosRows] = useState([]);
  const [catosError, setCatosError] = useState(false);
  const [visiveis, setVisiveis] = useState(VISIVEIS_DEFAULT);

  const wrapBg        = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary   = darkMode ? 'text-gray-100' : 'text-gray-900';
  const textMuted     = darkMode ? 'text-gray-400' : 'text-gray-500';
  const gridStroke    = darkMode ? '#374151' : '#e5e7eb';
  const axisColor     = darkMode ? '#9ca3af' : '#6b7280';
  const tooltipBg     = darkMode ? '#1f2937' : '#ffffff';
  const tooltipBorder = darkMode ? '#374151' : '#e5e7eb';

  useEffect(() => {
    catosAPI.getMonthlyTotals()
      .then(res => {
        const rows = (res.data?.rows || [])
          .filter(r => r.year === anoSelecionado)
          .sort((a, b) => a.month - b.month)
          .map(r => ({
            periodo: r.period, // ex: "2026-01"
            mesas: r.mesas || 0,
            componentes: r.componentes || 0,
            sku_ticket: r.sku_ticket || 0,
            sku_estimated: r.sku_estimated || 0,
            componentes_prototipo: r.componentes_prototipo || 0,
          }));
        setCatosRows(rows);
        setCatosError(false);
      })
      .catch(() => setCatosError(true));
  }, [anoSelecionado]);

  const toggleLinha = (key) => {
    setVisiveis(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // Se catos offline, usa dados do backend existente (data prop)
  const chartData = catosRows.length > 0 ? catosRows : data.map(d => ({
    periodo: d.periodo,
    mesas: d.valor,
  }));

  const temCatos = catosRows.length > 0;

  return (
    <div className={`${wrapBg} border rounded-2xl shadow-sm p-6 mb-8`}>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${textPrimary}`}>Acompanhamento mensal </h3>
            <p className={`text-xs ${textMuted} mt-0.5`}>Acompanhamento mensal — {anoSelecionado}</p>
          </div>
        </div>

        {catosError && (
          <span className="text-xs text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-700">
            ⚠️ Catos offline — apenas mesas
          </span>
        )}
      </div>

      {/* Toggle de linhas (só aparece se catos respondeu) */}
      {temCatos && (
        <div className="flex flex-wrap gap-2 mb-5">
          {LINHAS.map(({ key, nome, cor }) => {
            const ativo = visiveis.has(key);
            return (
              <button
                key={key}
                onClick={() => toggleLinha(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  ativo
                    ? 'text-white shadow-sm'
                    : darkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-400'
                      : 'bg-gray-100 border-gray-200 text-gray-400'
                }`}
                style={ativo ? { backgroundColor: cor, borderColor: cor } : {}}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: ativo ? 'white' : cor }}
                />
                {nome}
              </button>
            );
          })}
        </div>
      )}

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis
            dataKey="periodo"
            tick={{ fontSize: 11, fill: axisColor }}
            stroke="transparent"
            tickFormatter={v => {
              // "2026-01" → "JAN"
              const meses = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
              const m = parseInt(v?.split('-')[1]) - 1;
              return meses[m] ?? v;
            }}
          />
          <YAxis tick={{ fontSize: 11, fill: axisColor }} stroke="transparent" />
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
          {temCatos && <Legend wrapperStyle={{ display: 'none' }} />}

          {temCatos
            ? LINHAS.filter(l => visiveis.has(l.key)).map(({ key, nome, cor }) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={nome}
                  stroke={cor}
                  strokeWidth={2.5}
                  dot={{ fill: cor, r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              ))
            : (
                <Line
                  type="monotone"
                  dataKey="mesas"
                  name="Mesas"
                  stroke="rgb(99,102,241)"
                  strokeWidth={3}
                  dot={{ fill: 'rgb(99,102,241)', r: 5, strokeWidth: 0 }}
                  activeDot={{ r: 7, fill: 'rgb(139,92,246)' }}
                />
              )
          }
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EvolucaoSKUs;