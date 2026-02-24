import React, { useState } from 'react';
import { Info, Printer, AlertTriangle, XCircle, ChevronRight, TrendingUp, Package, BarChart3, Zap } from 'lucide-react';
import { dashboardAPI } from '../../services/api';

/**
 * ✅ REDESIGN - Mesma pegada do CardsCapacidadeTimeline
 * Paleta: azul/roxo gradiente, verde para produção
 * Dark + Light mode suportados
 */
const CardsKgComModal = ({ data, darkMode = true }) => {
  const [mesModal, setMesModal] = useState(null);
  const [dadosModal, setDadosModal] = useState([]);
  const [loadingModal, setLoadingModal] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});

  const toggleExpand = (mesAno, event) => {
    event.stopPropagation();
    setExpandedCards(prev => ({
      ...prev,
      [mesAno]: !prev[mesAno]
    }));
  };

  const abrirModal = async (mesAno) => {
    setMesModal(mesAno);
    setLoadingModal(true);
    try {
      const [mesTexto, anoTexto] = mesAno.split('/');
      const ano = 2000 + parseInt(anoTexto);
      const meses = {
        'JAN': 1, 'FEV': 2, 'MAR': 3, 'ABR': 4,
        'MAI': 5, 'JUN': 6, 'JUL': 7, 'AGO': 8,
        'SET': 9, 'OUT': 10, 'NOV': 11, 'DEZ': 12
      };
      const mes = meses[mesTexto];
      const response = await dashboardAPI.getCardsKgPorImpressora({ ano, mes });
      setDadosModal(response.data);
    } catch (error) {
      console.error('❌ Erro ao buscar dados do modal:', error);
      setDadosModal([]);
    } finally {
      setLoadingModal(false);
    }
  };

  const fecharModal = () => {
    setMesModal(null);
    setDadosModal([]);
  };

  const cardBgClass    = darkMode ? 'bg-gray-800'  : 'bg-white';
  const textPrimary    = darkMode ? 'text-gray-100' : 'text-gray-900';
  const textSecondary  = darkMode ? 'text-gray-400' : 'text-gray-500';
  const borderClass    = darkMode ? 'border-gray-700' : 'border-gray-200';
  const innerBg        = darkMode ? 'bg-gray-700/50' : 'bg-gray-50';

  return (
    <>
      {/* ── CARDS MENSAIS ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-2xl font-bold ${textPrimary} flex items-center gap-3`}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              Produção em Quilogramas
            </h3>
            <p className={`text-sm ${textSecondary} mt-2 ml-13`}>
              Clique em qualquer mês para ver detalhes por impressora
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.map((card, index) => {
            const isExpanded = expandedCards[card.mesAno];

            return (
              <div
                key={index}
                className={`${cardBgClass} border-2 ${borderClass} hover:border-blue-500 rounded-2xl p-6 cursor-pointer
                           hover:shadow-2xl hover:scale-105 transition-all duration-300 group relative overflow-hidden`}
                onClick={() => abrirModal(card.mesAno)}
              >
                {/* hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className={`text-lg font-bold ${textPrimary}`}>{card.mesAno}</span>
                    </div>
                    <ChevronRight className={`w-5 h-5 ${textSecondary} group-hover:text-blue-500 group-hover:translate-x-1 transition-all`} />
                  </div>

                  {/* Métricas */}
                  <div className="space-y-3 mb-5">

                    {/* Produção — verde */}
                    <div className={`${innerBg} border border-green-500/30 rounded-xl p-3`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-4 h-4 text-green-500" />
                        <span className={`text-xs font-medium ${textSecondary}`}>Produção</span>
                      </div>
                      <div className="text-xl font-bold text-green-500">{card.producaoKg}kg</div>
                    </div>

                    {/* Protótipo — azul */}
                    <div className={`${innerBg} border border-blue-500/30 rounded-xl p-3`}>
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        <span className={`text-xs font-medium ${textSecondary}`}>Protótipo</span>
                      </div>
                      <div className="text-xl font-bold text-blue-500">{card.prototipoKg}kg</div>
                    </div>

                    {/* Erros — vermelho, expansível */}
                    <div
                      className={`${innerBg} border-2 ${isExpanded ? 'border-red-500' : 'border-red-400/30'} rounded-xl p-3 transition-all`}
                      onClick={(e) => toggleExpand(card.mesAno, e)}
                    >
                      <div className="flex justify-between items-center cursor-pointer">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className={`text-xs font-medium ${textSecondary}`}>
                            Erros {isExpanded ? '▼' : '▶'}
                          </span>
                        </div>
                        <div className="text-xl font-bold text-red-500">{card.errosKg}kg</div>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-red-400/20 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-orange-500 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Failed
                            </span>
                            <span className="text-sm font-bold text-orange-500">{card.failedKg}kg</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-red-500 flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> Aborted
                            </span>
                            <span className="text-sm font-bold text-red-500">{card.abortedKg}kg</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Total — sutil, sem exagero */}
                  <div className={`${darkMode ? 'bg-gray-700/60' : 'bg-gray-100'} border ${borderClass} rounded-xl px-4 py-3 flex justify-between items-center`}>
                    <span className={`text-xs font-semibold ${textSecondary}`}>Total</span>
                    <span className={`text-lg font-bold ${textPrimary}`}>{card.totalKg}kg</span>
                  </div>

                  {/* CTA */}
                  <div className="mt-4 flex items-center justify-center gap-2 text-blue-500 text-sm font-semibold group-hover:gap-3 transition-all">
                    <Printer className="w-4 h-4" />
                    <span>Ver por impressora</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MODAL ── */}
      {mesModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={fecharModal}
        >
          <div
            className={`${cardBgClass} rounded-3xl max-w-7xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className={`p-8 border-b ${borderClass} sticky top-0 ${cardBgClass} z-10 rounded-t-3xl`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-3xl font-bold ${textPrimary}`}>Produção por Impressora</h3>
                    <p className={`text-sm ${textSecondary} mt-1`}>{mesModal} — Análise detalhada em kg</p>
                  </div>
                </div>
                <button
                  onClick={fecharModal}
                  className={`${textSecondary} hover:${textPrimary} text-4xl font-bold transition-all hover:rotate-90 duration-300`}
                >
                  ×
                </button>
              </div>
            </div>

            {/* CONTEÚDO */}
            <div className="p-8">
              {loadingModal ? (
                <div className="text-center py-20">
                  <div className="relative mx-auto mb-6 w-20 h-20">
                    <div className={`absolute inset-0 border-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-full`} />
                    <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
                  </div>
                  <p className={`${textPrimary} text-lg font-semibold`}>Carregando dados das impressoras...</p>
                </div>
              ) : (
                <>
                  {/* Grid de Impressoras */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {dadosModal.map((impressora, idx) => (
                      <div
                        key={idx}
                        className={`${cardBgClass} border-2 ${borderClass} hover:border-blue-500 rounded-2xl p-6 hover:shadow-xl transition-all`}
                      >
                        {/* Nome */}
                        <div className={`flex items-center gap-3 mb-4 pb-4 border-b ${borderClass}`}>
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                            <Printer className="w-5 h-5 text-blue-500" />
                          </div>
                          <h4 className={`font-bold text-lg ${textPrimary}`}>{impressora.nomeImpressora}</h4>
                        </div>

                        {/* Métricas */}
                        <div className="space-y-3">
                          {/* Produção */}
                          <div className={`${innerBg} border border-green-500/30 rounded-lg p-3 flex justify-between items-center`}>
                            <span className={`text-xs ${textSecondary}`}>Produção</span>
                            <span className="text-lg font-bold text-green-500">{impressora.producaoKg}kg</span>
                          </div>

                          {/* Protótipo */}
                          <div className={`${innerBg} border border-blue-500/30 rounded-lg p-3 flex justify-between items-center`}>
                            <span className={`text-xs ${textSecondary}`}>Protótipo</span>
                            <span className="text-lg font-bold text-blue-500">{impressora.prototipoKg}kg</span>
                          </div>

                          {/* Erros */}
                          <div className={`${innerBg} border border-red-400/30 rounded-lg p-3`}>
                            <div className="flex justify-between items-center mb-2">
                              <span className={`text-xs ${textSecondary}`}>Erros Total</span>
                              <span className="text-lg font-bold text-red-500">{impressora.errosKg}kg</span>
                            </div>
                            <div className={`pt-2 border-t ${borderClass} space-y-1`}>
                              <div className="flex justify-between text-xs">
                                <span className="text-orange-500 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> Failed
                                </span>
                                <span className="font-bold text-orange-500">{impressora.failedKg}kg</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-red-500 flex items-center gap-1">
                                  <XCircle className="w-3 h-3" /> Aborted
                                </span>
                                <span className="font-bold text-red-500">{impressora.abortedKg}kg</span>
                              </div>
                            </div>
                          </div>

                          {/* Total — sutil */}
                          <div className={`${darkMode ? 'bg-gray-700/60' : 'bg-gray-100'} border ${borderClass} rounded-lg px-4 py-3 flex justify-between items-center`}>
                            <span className={`text-xs font-semibold ${textSecondary}`}>Total</span>
                            <span className={`text-xl font-bold ${textPrimary}`}>{impressora.totalKg}kg</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Vazio */}
                  {dadosModal.length === 0 && (
                    <div className={`text-center ${textSecondary} py-16`}>
                      <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg">Nenhum dado disponível para este mês</p>
                    </div>
                  )}

                  {/* Resumo Geral */}
                  {dadosModal.length > 0 && (
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} border-2 ${borderClass} rounded-2xl p-8`}>
                      <h4 className={`text-xl font-bold ${textPrimary} mb-6 flex items-center gap-2`}>
                        <BarChart3 className="w-6 h-6 text-blue-500" />
                        Resumo Geral do Mês
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                          <div className="text-sm opacity-80 mb-2">Total Produção</div>
                          <div className="text-3xl font-bold">
                            {dadosModal.reduce((acc, i) => acc + i.producaoKg, 0).toFixed(2)}kg
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                          <div className="text-sm opacity-80 mb-2">Total Protótipo</div>
                          <div className="text-3xl font-bold">
                            {dadosModal.reduce((acc, i) => acc + i.prototipoKg, 0).toFixed(2)}kg
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
                          <div className="text-sm opacity-80 mb-2 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" /> Total Erros
                          </div>
                          <div className="text-3xl font-bold">
                            {dadosModal.reduce((acc, i) => acc + i.errosKg, 0).toFixed(2)}kg
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                          <div className="text-sm opacity-80 mb-2">Total Geral</div>
                          <div className="text-3xl font-bold">
                            {dadosModal.reduce((acc, i) => acc + i.totalKg, 0).toFixed(2)}kg
                          </div>
                        </div>
                      </div>

                      {/* Breakdown erros */}
                      <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className={`${cardBgClass} rounded-xl p-4 border-2 border-orange-400/30`}>
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                            <span className="text-sm font-semibold text-orange-500">Failed</span>
                          </div>
                          <div className="text-2xl font-bold text-orange-500">
                            {dadosModal.reduce((acc, i) => acc + i.failedKg, 0).toFixed(2)}kg
                          </div>
                        </div>

                        <div className={`${cardBgClass} rounded-xl p-4 border-2 border-red-400/30`}>
                          <div className="flex items-center gap-2 mb-2">
                            <XCircle className="w-5 h-5 text-red-500" />
                            <span className="text-sm font-semibold text-red-500">Aborted</span>
                          </div>
                          <div className="text-2xl font-bold text-red-500">
                            {dadosModal.reduce((acc, i) => acc + i.abortedKg, 0).toFixed(2)}kg
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn  { animation: fadeIn  0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </>
  );
};

export default CardsKgComModal;