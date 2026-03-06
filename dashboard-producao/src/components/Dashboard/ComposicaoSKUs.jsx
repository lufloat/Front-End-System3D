import React, { useState, useEffect } from 'react';
import { Package, Wrench, Sparkles, Cpu, FlaskConical, Ticket } from 'lucide-react';
import { catosAPI } from '../../services/Catosapi';

const ComposicaoSKUs = ({ data, darkMode = false, anoSelecionado = 2026 }) => {
  const [catosData, setCatosData] = useState(null);
  const [catosError, setCatosError] = useState(false);

  const wrapBg      = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-900';
  const textMuted   = darkMode ? 'text-gray-400' : 'text-gray-500';

  useEffect(() => {
    catosAPI.getMonthlyTotals()
      .then(res => {
        // Filtra pelo ano selecionado e soma todos os meses
        const rows = (res.data?.rows || []).filter(r => r.year === anoSelecionado);
        if (!rows.length) { setCatosData(null); return; }

        const totals = rows.reduce((acc, r) => ({
          mesas:                  (acc.mesas                  || 0) + (r.mesas                  || 0),
          componentes:            (acc.componentes            || 0) + (r.componentes            || 0),
          sku_ticket:             (acc.sku_ticket             || 0) + (r.sku_ticket             || 0),
          sku_estimated:          (acc.sku_estimated          || 0) + (r.sku_estimated          || 0),
          componentes_prototipo:  (acc.componentes_prototipo  || 0) + (r.componentes_prototipo  || 0),
        }), {});

        setCatosData(totals);
        setCatosError(false);
      })
      .catch(() => setCatosError(true));
  }, [anoSelecionado]);

  // Cards base (do backend existente)
  const cardsBase = [
    {
      label: 'Mesas',
      value: catosData?.mesas ?? data.pecas,
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

  // Cards extras do Catos (só aparecem se API respondeu)
  const cardsExtra = catosData ? [
    {
      label: 'Componentes',
      value: catosData.componentes,
      icon: Cpu,
      gradient: 'from-orange-500 to-amber-500',
    },
    {
      label: 'SKU Ticket',
      value: catosData.sku_ticket,
      icon: Ticket,
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      label: 'SKU Estimado',
      value: catosData.sku_estimated,
      icon: Sparkles,
      gradient: 'from-teal-500 to-cyan-500',
    },
    {
      label: 'Comp. Protótipo',
      value: catosData.componentes_prototipo,
      icon: FlaskConical,
      gradient: 'from-violet-500 to-purple-600',
    },
  ] : [];

  const todosCards = [...cardsBase, ...cardsExtra];

  return (
    <div className={`${wrapBg} border rounded-2xl shadow-sm p-6 mb-8`}>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${textPrimary}`}>Indicadores do Sistema</h3>
            <p className={`text-xs ${textMuted} mt-0.5`}>Distribuição por categoria — {anoSelecionado}</p>
          </div>
        </div>

        {catosError && (
          <span className="text-xs text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-700">
            ⚠️ Catos offline — dados parciais
          </span>
        )}
      </div>

      <div className={`grid gap-4 ${todosCards.length > 3 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-3'}`}>
        {todosCards.map(({ label, value, icon: Icon, gradient }) => (
          <div
            key={label}
            className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-center`}
          >
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Icon className="w-4 h-4" />
            </div>
            <div className="text-3xl font-bold mb-1">{value ?? '—'}</div>
            <div className="text-xs opacity-80 font-medium">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComposicaoSKUs;