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
        const rows = (res.data?.rows || []).filter(r => r.year === anoSelecionado);
        if (!rows.length) { setCatosData(null); return; }

        const totals = rows.reduce((acc, r) => ({
          mesas:                 (acc.mesas                 || 0) + (r.mesas                 || 0),
          componentes:           (acc.componentes           || 0) + (r.componentes           || 0),
          sku_ticket:            (acc.sku_ticket            || 0) + (r.sku_ticket            || 0),
          sku_estimated:         (acc.sku_estimated         || 0) + (r.sku_estimated         || 0),
          componentes_prototipo: (acc.componentes_prototipo || 0) + (r.componentes_prototipo || 0),
        }), {});

        setCatosData(totals);
        setCatosError(false);
      })
      .catch(() => setCatosError(true));
  }, [anoSelecionado]);

  const cardsBase = [
    { label: 'Mesas',                value: catosData?.mesas ?? data.pecas,      icon: Package,      gradient: 'from-blue-500 to-blue-600'       },
    { label: 'Ferramentas e Div.',   value: data.ferramentasDiversos,            icon: Wrench,       gradient: 'from-purple-500 to-indigo-600'    },
    { label: 'Novos SKUs',           value: data.novosSkus,                      icon: Sparkles,     gradient: 'from-green-500 to-emerald-600'    },
  ];

  const cardsExtra = catosData ? [
    { label: 'Componentes',          value: catosData.componentes,               icon: Cpu,          gradient: 'from-orange-500 to-amber-500'     },
    { label: 'SKU Ticket',           value: catosData.sku_ticket,                icon: Ticket,       gradient: 'from-pink-500 to-rose-500'        },
    { label: 'SKU Estimado',         value: catosData.sku_estimated,             icon: Sparkles,     gradient: 'from-teal-500 to-cyan-500'        },
    { label: 'Comp. Protótipo',      value: catosData.componentes_prototipo,     icon: FlaskConical, gradient: 'from-violet-500 to-purple-600'    },
  ] : [];

  const todosCards = [...cardsBase, ...cardsExtra];

  return (
    <div className={`${wrapBg} border rounded-2xl shadow-sm px-5 py-4 mb-8`}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
            <Package className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${textPrimary}`}>Indicadores do Sistema</h3>
            <p className={`text-xs ${textMuted}`}>Distribuição por categoria — {anoSelecionado}</p>
          </div>
        </div>

        {catosError && (
          <span className="text-xs text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-700">
            ⚠️ Catos offline
          </span>
        )}
      </div>

      {/* Cards compactos */}
      <div className="flex flex-wrap gap-2">
        {todosCards.map(({ label, value, icon: Icon, gradient }) => (
          <div
            key={label}
            className={`bg-gradient-to-br ${gradient} rounded-xl px-4 py-2.5 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-3 min-w-[130px]`}
          >
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xl font-bold leading-tight">{value ?? '—'}</div>
              <div className="text-xs opacity-80 font-medium leading-tight">{label}</div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default ComposicaoSKUs;