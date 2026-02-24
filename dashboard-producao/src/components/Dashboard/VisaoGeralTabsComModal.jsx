import React, { useState, useMemo, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Printer, TrendingUp, AlertTriangle, XCircle, BarChart3 } from "lucide-react";

/**
 * ✅ REDESIGN - Mesma pegada do CardsCapacidadeTimeline
 * Paleta: azul/roxo, verde para produção
 * Dark + Light mode suportados
 */
const VisaoGeralTabsComModal = ({
  producao = [],
  prototipos = [],
  failed = [],
  aborted = [],
  producaoPorImpressora = [],
  prototiposPorImpressora = [],
  failedPorImpressora = [],
  abortedPorImpressora = [],
  anoSelecionado = "2026",
  darkMode = false,
  onDadosCalculados,
}) => {
  const [activeTab, setActiveTab]               = useState("geral");
  const [modalData, setModalData]               = useState([]);
  const [periodoSelecionado, setPeriodoSelecionado] = useState(null);
  const [tituloModal, setTituloModal]           = useState("");

  // ── tokens ───────────────────────────────────────────────────────────────
  const wrapBg      = darkMode ? "bg-gray-800 border-gray-700"  : "bg-white border-gray-200";
  const cardBg      = darkMode ? "bg-gray-800"  : "bg-white";
  const textPrimary = darkMode ? "text-gray-100" : "text-gray-900";
  const textMuted   = darkMode ? "text-gray-400" : "text-gray-500";
  const innerBg     = darkMode ? "bg-gray-700/50" : "bg-gray-50";
  const borderClass = darkMode ? "border-gray-700" : "border-gray-200";
  const divider     = darkMode ? "border-gray-700" : "border-gray-100";
  const rowHover    = darkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50";
  const tabActive   = darkMode
    ? "border-b-2 border-blue-400 text-blue-400 font-semibold"
    : "border-b-2 border-blue-600 text-blue-600 font-semibold";
  const tabInactive = darkMode
    ? "text-gray-400 hover:text-gray-200"
    : "text-gray-500 hover:text-gray-700";
  const gridStroke  = darkMode ? "#374151" : "#e5e7eb";
  const axisColor   = darkMode ? "#9ca3af" : "#6b7280";
  const tooltipBg   = darkMode ? "#1f2937" : "#ffffff";
  const tooltipBorder = darkMode ? "#374151" : "#e5e7eb";

  // ── meses ────────────────────────────────────────────────────────────────
  const mesesDoAno = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => {
      const mes = String(i + 1).padStart(2, "0");
      return `${mes}/${anoSelecionado}`;
    }), [anoSelecionado]);

  const filtrarPorAno  = (dados = []) => dados.filter(d => d.periodo?.endsWith(`/${anoSelecionado}`));
  const completarMeses = (dados = []) => mesesDoAno.map(periodo => {
    const item = dados.find(d => d.periodo === periodo);
    return { periodo, valor: item?.valor ?? 0 };
  });

  const producaoFiltrada   = useMemo(() => completarMeses(filtrarPorAno(producao)),   [producao,   anoSelecionado]);
  const prototiposFiltrada = useMemo(() => completarMeses(filtrarPorAno(prototipos)), [prototipos, anoSelecionado]);
  const failedFiltrada     = useMemo(() => completarMeses(filtrarPorAno(failed)),     [failed,     anoSelecionado]);
  const abortedFiltrada    = useMemo(() => completarMeses(filtrarPorAno(aborted)),    [aborted,    anoSelecionado]);

  const dadosGerais = useMemo(() => mesesDoAno.map(periodo => {
    const prod     = producaoFiltrada.find(d   => d.periodo === periodo)?.valor || 0;
    const proto    = prototiposFiltrada.find(d => d.periodo === periodo)?.valor || 0;
    const perdidos = failedFiltrada.find(d     => d.periodo === periodo)?.valor || 0;
    const abort    = abortedFiltrada.find(d    => d.periodo === periodo)?.valor || 0;
    const total    = prod + proto + perdidos + abort;
    return {
      periodo,
      producao:           prod,
      prototipo:          proto,
      perdidos,
      abortados:          abort,
      total,
      percentualFalhas:   total > 0 ? (perdidos / total) * 100 : 0,
      percentualAbortados: total > 0 ? (abort   / total) * 100 : 0,
    };
  }), [producaoFiltrada, prototiposFiltrada, failedFiltrada, abortedFiltrada, mesesDoAno]);

  const totaisAnuais = useMemo(() => {
    const tp  = dadosGerais.reduce((s, d) => s + d.producao,  0);
    const tpr = dadosGerais.reduce((s, d) => s + d.prototipo, 0);
    const tpe = dadosGerais.reduce((s, d) => s + d.perdidos,  0);
    const tab = dadosGerais.reduce((s, d) => s + d.abortados, 0);
    const tg  = tp + tpr + tpe + tab;
    return {
      totalProducao: tp, totalPrototipo: tpr,
      totalPerdidos: tpe, totalAbortados: tab, totalGeral: tg,
      percentualFalhas:    tg > 0 ? (tpe / tg) * 100 : 0,
      percentualAbortados: tg > 0 ? (tab / tg) * 100 : 0,
    };
  }, [dadosGerais]);

  useEffect(() => { onDadosCalculados?.(dadosGerais); }, [dadosGerais, onDadosCalculados]);

  // ── modal ────────────────────────────────────────────────────────────────
  const abrirModal = (periodo, tipo) => {
    const map = {
      producao:  { dados: producaoPorImpressora,  titulo: "Produção"           },
      prototipos:{ dados: prototiposPorImpressora, titulo: "Protótipos"         },
      perdidos:  { dados: failedPorImpressora,     titulo: "Perdidos (Failed)"  },
      abortados: { dados: abortedPorImpressora,    titulo: "Abortados"          },
    };
    const entry = map[tipo];
    if (!entry) return;
    setModalData(entry.dados.filter(d => d.periodo === periodo));
    setPeriodoSelecionado(periodo);
    setTituloModal(entry.titulo);
  };

  const fecharModal = () => { setModalData([]); setPeriodoSelecionado(null); setTituloModal(""); };

  const formatNumber = (num) => num?.toLocaleString("pt-BR") || "0";

  const tabColor = (tipo) => ({
    producao:   "text-green-500",
    prototipos: "text-blue-500",
    perdidos:   "text-red-500",
    abortados:  "text-orange-500",
  }[tipo] || textPrimary);

  const tabs = [
    { id: "geral",      label: "Visão Geral" },
    { id: "producao",   label: "Produção"    },
    { id: "prototipos", label: "Protótipos"  },
    { id: "perdidos",   label: "Perdidos"    },
    { id: "abortados",  label: "Abortados"   },
  ];

  const chartDataMap = {
    producao:   producaoFiltrada,
    prototipos: prototiposFiltrada,
    perdidos:   failedFiltrada,
    abortados:  abortedFiltrada,
  };

  const chartColorMap = {
    producao:   "rgb(34,197,94)",
    prototipos: "rgb(59,130,246)",
    perdidos:   "rgb(239,68,68)",
    abortados:  "rgb(249,115,22)",
  };

  // ── summary cards ────────────────────────────────────────────────────────
  const summaryCards = [
    {
      label: "Produção",
      value: totaisAnuais.totalProducao,
      icon: TrendingUp,
      color: "from-green-500 to-emerald-600",
      badge: null,
    },
    {
      label: "Protótipos",
      value: totaisAnuais.totalPrototipo,
      icon: Printer,
      color: "from-blue-500 to-blue-600",
      badge: null,
    },
    {
      label: "Perdidos",
      value: totaisAnuais.totalPerdidos,
      icon: XCircle,
      color: "from-red-500 to-pink-600",
      badge: `${totaisAnuais.percentualFalhas.toFixed(2)}% de falhas`,
    },
    {
      label: "Abortados",
      value: totaisAnuais.totalAbortados,
      icon: AlertTriangle,
      color: "from-orange-500 to-orange-600",
      badge: `${totaisAnuais.percentualAbortados.toFixed(2)}% de abortados`,
    },
  ];

  return (
    <>
      <div className={`${wrapBg} border rounded-2xl shadow-sm p-6 mb-8`}>

        {/* ── Header ── */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${textPrimary}`}>Visão Geral — {anoSelecionado}</h2>
            <p className={`text-xs ${textMuted} mt-0.5`}>Resumo anual de produção e falhas</p>
          </div>
        </div>

        {/* ── Cards de resumo ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {summaryCards.map(({ label, value, icon: Icon, color, badge }) => (
            <div
              key={label}
              className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-shadow`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold opacity-90">{label}</span>
              </div>
              <div className="text-2xl font-bold">{formatNumber(value)}</div>
              {badge && <div className="text-xs opacity-75 mt-1">{badge}</div>}
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className={`flex border-b ${borderClass} mb-6 overflow-x-auto`}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 whitespace-nowrap text-sm transition-colors ${
                activeTab === tab.id ? tabActive : tabInactive
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Gráfico ── */}
        <ResponsiveContainer width="100%" height={380}>
          {activeTab === "geral" ? (
            <BarChart data={dadosGerais} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="periodo" tick={{ fontSize: 11, fill: axisColor }} />
              <YAxis tick={{ fontSize: 11, fill: axisColor }} />
              <Tooltip
                contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 12, color: darkMode ? "#f3f4f6" : "#111827" }}
                formatter={(v, name) => [formatNumber(v), { producao: "Produção", prototipo: "Protótipo", perdidos: "Perdidos", abortados: "Abortados" }[name] || name]}
              />
              <Legend
                formatter={(v) => ({ producao: "Produção", prototipo: "Protótipo", perdidos: "Perdidos", abortados: "Abortados" }[v] || v)}
              />
              <Bar dataKey="producao"  stackId="a" fill="rgb(34,197,94)"  radius={[0,0,0,0]} />
              <Bar dataKey="prototipo" stackId="a" fill="rgb(59,130,246)"  radius={[0,0,0,0]} />
              <Bar dataKey="perdidos"  stackId="a" fill="rgb(239,68,68)"   radius={[0,0,0,0]} />
              <Bar dataKey="abortados" stackId="a" fill="rgb(249,115,22)"  radius={[4,4,0,0]} />
            </BarChart>
          ) : (
            <BarChart
              data={chartDataMap[activeTab]}
              barSize={36}
              onClick={e => e?.activeLabel && abrirModal(e.activeLabel, activeTab)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="periodo" tick={{ fontSize: 11, fill: axisColor }} />
              <YAxis tick={{ fontSize: 11, fill: axisColor }} />
              <Tooltip
                contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 12, color: darkMode ? "#f3f4f6" : "#111827" }}
              />
              <Bar
                dataKey="valor"
                fill={chartColorMap[activeTab]}
                radius={[4,4,0,0]}
                cursor="pointer"
              />
            </BarChart>
          )}
        </ResponsiveContainer>

        {activeTab !== "geral" && (
          <p className={`text-xs ${textMuted} text-center mt-3`}>
            Clique em uma barra para ver detalhes por impressora
          </p>
        )}
      </div>

      {/* ── Modal ── */}
      {periodoSelecionado && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={fecharModal}
        >
          <div
            className={`${cardBg} border ${borderClass} rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl animate-slideUp`}
            onClick={e => e.stopPropagation()}
          >
            {/* Header modal */}
            <div className={`p-6 border-b ${borderClass} sticky top-0 ${cardBg} z-10 rounded-t-3xl`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                    <Printer className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${textPrimary}`}>{tituloModal}</h3>
                    <p className={`text-xs ${textMuted} mt-0.5`}>{periodoSelecionado} — por impressora</p>
                  </div>
                </div>
                <button
                  onClick={fecharModal}
                  className={`${textMuted} hover:${textPrimary} text-3xl font-bold transition-all hover:rotate-90 duration-300`}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Conteúdo modal */}
            <div className="p-6">
              {modalData.length === 0 ? (
                <div className={`text-center ${textMuted} py-12`}>
                  <Printer className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum dado para este mês</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {modalData.map((d, i) => (
                    <div
                      key={i}
                      className={`${innerBg} border ${borderClass} ${rowHover} rounded-xl px-4 py-3 flex justify-between items-center transition-colors`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                          <Printer className="w-4 h-4 text-blue-500" />
                        </div>
                        <span className={`font-medium text-sm ${textPrimary}`}>{d.nomeImpressora}</span>
                      </div>
                      <span className={`text-lg font-bold ${tabColor(activeTab)}`}>
                        {formatNumber(d.valor)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn  { animation: fadeIn  0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </>
  );
};

export default VisaoGeralTabsComModal;