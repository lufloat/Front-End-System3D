import React, { useState, useEffect } from 'react';
import { Calendar, ChevronRight, Activity, Clock, TrendingUp, Printer, BarChart3, Zap, Target, Award } from 'lucide-react';
import TimelineCalendario from './TimelineCalendario';

const baseUrl = import.meta.env.VITE_API_URL || 'http://192.168.148.19:8088/api/';

// ── Versão do cache: mude este número sempre que a estrutura da API mudar ──
const CACHE_VERSION = 'v6'; // ← bumped para invalidar caches antigos sem taxaSucesso

const fmt = (n, d = 1) => {
  if (n === null || n === undefined || isNaN(n)) return '0.0';
  return Number(n).toFixed(d);
};

const fmtPausa = (n) => {
  if (n === null || n === undefined || isNaN(n)) return '0.00';
  return Number(n).toFixed(2);
};

const fmtH = (h) => {
  if (!h || isNaN(h)) return '0.0h';
  const v = Number(h);
  if (v < 1) {
    const min = Math.round(v * 60);
    return min <= 0 ? '< 1min' : `${min}min`;
  }
  return `${v.toFixed(1)}h`;
};

const calcPctMotivos = (motivos) => {
  if (!motivos || motivos.length === 0) return [];
  const totalHoras = motivos.reduce((acc, m) => acc + (Number(m.horas) || 0), 0);
  return motivos.map(m => ({
    ...m,
    pctReal: totalHoras > 0 ? (Number(m.horas) / totalHoras) * 100 : 0,
  }));
};

// ── Calcula taxaSucesso a partir das impressoras individuais (fallback) ──
const calcTaxaSucessoFallback = (impressoras) => {
  if (!impressoras || impressoras.length === 0) return 0;
  const totalFin = impressoras.reduce((s, i) => s + (i.jobsFinalizados || 0), 0);
  const totalAbo = impressoras.reduce((s, i) => s + (i.jobsAbortados  || 0), 0);
  const total = totalFin + totalAbo;
  return total > 0 ? parseFloat(((totalFin / total) * 100).toFixed(1)) : 0;
};

// ── Limpa todos os caches sem a versão atual ──
const limparCacheAntigo = () => {
  const keysParaRemover = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('consolidado_') && !key.includes(CACHE_VERSION)) {
      keysParaRemover.push(key);
    }
  }
  keysParaRemover.forEach(k => localStorage.removeItem(k));
  if (keysParaRemover.length > 0) {
    console.log(`🧹 Cache antigo limpo: ${keysParaRemover.length} entradas removidas`);
  }
};

const CardsCapacidadeTimeline = ({ data, darkMode = false }) => {
  const [mesModal, setMesModal] = useState(null);
  const [resumoConsolidado, setResumoConsolidado] = useState(null);
  const [impressoraSelecionada, setImpressoraSelecionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const MAX_RETRIES = 3;
  const TIMEOUT_MS = 30000;

  useEffect(() => {
    limparCacheAntigo();
  }, []);

  const abrirModal = async (mesAno) => {
    setMesModal(mesAno);
    setLoading(true);
    setLoadingProgress(0);
    setError(null);

    try {
      const [mesNome, anoStr] = mesAno.split('/');
      const meses = {
        'JAN': 1, 'FEV': 2, 'MAR': 3, 'ABR': 4, 'MAI': 5, 'JUN': 6,
        'JUL': 7, 'AGO': 8, 'SET': 9, 'OUT': 10, 'NOV': 11, 'DEZ': 12,
      };
      const mes = meses[mesNome];
      const ano = parseInt('20' + anoStr);

      const cacheKey = `consolidado_${CACHE_VERSION}_${ano}_${mes}`;
      const cacheTimestampKey = `${cacheKey}_timestamp`;

      const cached = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(cacheTimestampKey);

      if (cached && cacheTimestamp) {
        const age = Date.now() - parseInt(cacheTimestamp);
        if (age < 4 * 60 * 60 * 1000) {
          const parsed = JSON.parse(cached);
          const taxaCache = Number(parsed?.metricas?.taxaSucesso ?? -1);
          if (taxaCache > 0 && parsed?.metricas?.taxaSucesso !== undefined) {
            setResumoConsolidado(parsed);
            setLoading(false);
            return;
          }
          localStorage.removeItem(cacheKey);
          localStorage.removeItem(cacheTimestampKey);
        }
      }

      setLoadingProgress(10);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
      setLoadingProgress(30);

      const url = `${baseUrl}Dashboard/timeline/mes-consolidado?ano=${ano}&mes=${mes}`;
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      setLoadingProgress(60);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      setLoadingProgress(80);
      const resultado = await response.json();

      if (!resultado.distribuicao) throw new Error('Resposta da API sem campo "distribuicao".');

      // ── Log diagnóstico (remova após confirmar o fix) ──
      console.log('📦 JSON completo da API:', resultado);
      console.log('📊 metricas:', resultado.metricas);
      console.log('🔑 chaves de metricas:', Object.keys(resultado.metricas || {}));
      console.log('🎯 taxaSucesso da API:', resultado.metricas?.taxaSucesso);

      localStorage.setItem(cacheKey, JSON.stringify(resultado));
      localStorage.setItem(cacheTimestampKey, Date.now().toString());
      setLoadingProgress(100);
      setResumoConsolidado(resultado);
      setRetryCount(0);
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Tempo limite excedido. Tente novamente.');
      } else {
        setError(err.message);
      }
      if (retryCount < MAX_RETRIES && err.name !== 'AbortError') {
        setRetryCount(retryCount + 1);
        setTimeout(() => abrirModal(mesAno), 2000);
      }
    } finally {
      setLoading(false);
      setLoadingProgress(0);
    }
  };

  const fecharModal = () => {
    setMesModal(null);
    setResumoConsolidado(null);
    setImpressoraSelecionada(null);
    setRetryCount(0);
  };

  const abrirCalendario = (impressora) => {
    const [mesNome, anoStr] = mesModal.split('/');
    const meses = {
      'JAN': 1, 'FEV': 2, 'MAR': 3, 'ABR': 4, 'MAI': 5, 'JUN': 6,
      'JUL': 7, 'AGO': 8, 'SET': 9, 'OUT': 10, 'NOV': 11, 'DEZ': 12
    };
    setImpressoraSelecionada({
      ...impressora,
      ano: parseInt('20' + anoStr),
      mes: meses[mesNome],
      mesAno: mesModal
    });
  };

  const getUtilizacaoColor = (p) => {
    if (p >= 70) return 'from-green-500 to-emerald-600';
    if (p >= 50) return 'from-blue-500 to-cyan-600';
    if (p >= 30) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  const getSucessoColor = (p) => {
    if (p >= 80) return 'text-green-500';
    if (p >= 60) return 'text-blue-500';
    if (p >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const txtP   = darkMode ? 'text-gray-100' : 'text-gray-900';
  const txtS   = darkMode ? 'text-gray-400' : 'text-gray-600';
  const border = darkMode ? 'border-gray-700' : 'border-gray-200';

  const pausaBg     = darkMode ? 'bg-yellow-900/30 border-yellow-700' : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200';
  const pausaTitulo = darkMode ? 'text-yellow-300' : 'text-yellow-900';
  const pausaItemBg = darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-yellow-100';
  const pausaValor  = darkMode ? 'text-yellow-400' : 'text-yellow-700';
  const pausaBarBg  = darkMode ? 'bg-gray-600' : 'bg-gray-200';

  const ocioBg      = darkMode ? 'bg-red-900/30 border-red-700' : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200';
  const ocioTitulo  = darkMode ? 'text-red-300' : 'text-red-900';
  const ocioItemBg  = darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-red-100';
  const ocioValor   = darkMode ? 'text-red-400' : 'text-red-700';

  return (
    <>
      {/* ── CARDS MENSAIS ─────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-2xl font-bold ${txtP} flex items-center gap-3`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            Análise de Capacidade e Timeline
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data && data.map((card, index) => (
            <div
              key={index}
              className={`${cardBg} border-2 ${border} hover:border-blue-500 rounded-2xl p-6 cursor-pointer
                         hover:shadow-2xl hover:scale-105 transition-all duration-300 group relative overflow-hidden`}
              onClick={() => abrirModal(card.mesAno)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className={`text-lg font-bold ${txtP}`}>{card.mesAno}</span>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${txtS} group-hover:text-blue-500 group-hover:translate-x-1 transition-all`} />
                </div>

                <div className="mb-6">
                  <div className="flex items-end gap-2 mb-2">
                    <span className={`text-4xl font-bold bg-gradient-to-r ${getUtilizacaoColor(card.utilizacaoPercent)} bg-clip-text text-transparent`}>
                      {card.utilizacaoPercent}%
                    </span>
                    <span className={`text-sm font-medium ${txtS} mb-2`}>utilização</span>
                  </div>
                  <div className={`w-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                    <div className={`h-full bg-gradient-to-r ${getUtilizacaoColor(card.utilizacaoPercent)} rounded-full`}
                      style={{ width: `${card.utilizacaoPercent}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-green-50'} rounded-xl p-3`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-green-500" />
                      <span className={`text-xs font-medium ${txtS}`}>Produtivas</span>
                    </div>
                    <div className="text-xl font-bold text-green-500">{card.produtivas}h</div>
                  </div>
                  <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-purple-50'} rounded-xl p-3`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="w-4 h-4 text-purple-500" />
                      <span className={`text-xs font-medium ${txtS}`}>Sucesso</span>
                    </div>
                    <div className={`text-xl font-bold ${getSucessoColor(card.sucessoPercent)}`}>{card.sucessoPercent}%</div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-blue-500 text-sm font-semibold">
                  <Target className="w-4 h-4" /><span>Ver análise completa</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MODAL ─────────────────────────────────────────── */}
      {mesModal && !impressoraSelecionada && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={fecharModal}>
          <div className={`${cardBg} rounded-3xl max-w-7xl w-full max-h-[90vh] overflow-y-auto shadow-2xl`}
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className={`p-8 border-b ${border} sticky top-0 ${cardBg} z-10 rounded-t-3xl`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-3xl font-bold ${txtP}`}>Análise - {mesModal}</h3>
                    <p className={`text-sm ${txtS} mt-1`}>Visão consolidada de tempo e produtividade</p>
                  </div>
                </div>
                <button onClick={fecharModal} className={`${txtS} text-4xl font-bold hover:rotate-90 transition-transform duration-300`}>×</button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-8">
              {loading && (
                <div className="text-center py-20">
                  <div className="relative mx-auto mb-6 w-20 h-20">
                    <div className={`absolute inset-0 border-4 ${darkMode ? 'border-blue-900' : 'border-blue-200'} rounded-full`} />
                    <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
                  </div>
                  <p className={`${txtP} text-lg font-semibold mb-4`}>
                    {loadingProgress >= 80 ? 'Finalizando...' :
                     loadingProgress >= 60 ? 'Agregando dados...' :
                     loadingProgress >= 30 ? 'Processando impressoras...' : 'Verificando cache...'}
                  </p>
                  {loadingProgress > 0 && (
                    <div className={`w-96 mx-auto ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-3 overflow-hidden`}>
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all"
                        style={{ width: `${loadingProgress}%` }} />
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className={`${darkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'} border-2 rounded-2xl p-8 text-center`}>
                  <p className={`${darkMode ? 'text-red-300' : 'text-red-800'} font-bold text-lg mb-2`}>Erro ao carregar</p>
                  <p className={`${darkMode ? 'text-red-400' : 'text-red-700'} text-sm mb-6`}>{error}</p>
                  {retryCount < MAX_RETRIES
                    ? <p className={`text-sm ${txtS}`}>🔄 Tentando novamente... ({retryCount}/{MAX_RETRIES})</p>
                    : <button onClick={() => { setRetryCount(0); abrirModal(mesModal); }}
                        className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold">Tentar Novamente</button>
                  }
                </div>
              )}

              {!loading && !error && resumoConsolidado && (() => {
                const dist = resumoConsolidado.distribuicao || {};
                const met  = resumoConsolidado.metricas    || {};

                // ── taxaSucesso: lê da API, com fallback calculado das impressoras ──
                const taxaSucesso = Number(
                  met.taxaSucesso != null && met.taxaSucesso !== 0
                    ? met.taxaSucesso
                    : calcTaxaSucessoFallback(resumoConsolidado.impressoras)
                );

                const hProd   = Number(dist.producao?.horas       || 0);
                const hPausa  = Number(dist.pausas?.horas         || 0);
                const hOcio   = Number(dist.ociosidade?.horas     || 0);
                const hEspera = Number(dist.esperaOperador?.horas || 0);
                const hManut  = Number(dist.manutencao?.horas     || 0);

                const mPausas = calcPctMotivos(resumoConsolidado.motivos?.pausas        || []);
                const mOcio   = calcPctMotivos(resumoConsolidado.motivos?.ociosidade    || []);
                const mEspera = calcPctMotivos(resumoConsolidado.motivos?.esperaOperador || []);

                return (
                  <div className="space-y-8">

                    {/* ── Indicadores principais ── */}
                    <div>
                      <h4 className={`text-xl font-bold ${txtP} mb-6 flex items-center gap-2`}>
                        <TrendingUp className="w-6 h-6 text-blue-500" /> Indicadores Principais
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"><Activity className="w-7 h-7" /></div>
                            <span className="text-sm font-semibold opacity-90">Utilização</span>
                          </div>
                          <div className="text-4xl font-bold mb-2">{fmt(met.utilizacao)}%</div>
                          <div className="text-sm opacity-75">Taxa de uso das máquinas</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"><Clock className="w-7 h-7" /></div>
                            <span className="text-sm font-semibold opacity-90">Horas Produtivas</span>
                          </div>
                          <div className="text-4xl font-bold mb-2">{hProd.toFixed(1)}h</div>
                          <div className="text-sm opacity-75">Tempo em produção ativa</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"><Award className="w-7 h-7" /></div>
                            <span className="text-sm font-semibold opacity-90">Taxa de Sucesso</span>
                          </div>
                          <div className="text-4xl font-bold mb-2">{fmt(taxaSucesso)}%</div>
                          <div className="text-sm opacity-75">Jobs finalizados com êxito</div>
                        </div>
                      </div>
                    </div>

                    {/* ── Distribuição ── */}
                    <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border-2 ${border} rounded-2xl p-8`}>
                      <h4 className={`text-xl font-bold ${txtP} mb-6 flex items-center gap-2`}>
                        <BarChart3 className="w-6 h-6 text-blue-500" /> Distribuição do Tempo no Mês
                      </h4>

                      <div className="flex w-full h-16 rounded-2xl overflow-hidden mb-6 shadow-lg">
                        {dist.producao?.taxa > 0 && (
                          <div className="bg-green-500 flex items-center justify-center text-white text-sm font-bold"
                            style={{ width: `${dist.producao.taxa}%` }}
                            title={`Produção: ${fmt(dist.producao.taxa)}%`}>
                            {dist.producao.taxa >= 10 && `${Math.round(dist.producao.taxa)}%`}
                          </div>
                        )}
                        {dist.pausas?.taxa > 0 && (
                          <div className="bg-yellow-500"
                            style={{ width: `${dist.pausas.taxa}%`, minWidth: '4px' }}
                            title={`Pausas: ${fmtPausa(dist.pausas.taxa)}%`} />
                        )}
                        {dist.ociosidade?.taxa > 0 && (
                          <div className="bg-red-500 flex items-center justify-center text-white text-sm font-bold"
                            style={{ width: `${dist.ociosidade.taxa}%` }}
                            title={`Ociosidade: ${fmt(dist.ociosidade.taxa)}%`}>
                            {dist.ociosidade.taxa >= 10 && `${Math.round(dist.ociosidade.taxa)}%`}
                          </div>
                        )}
                        {dist.esperaOperador?.taxa > 0 && (
                          <div className="bg-orange-500 flex items-center justify-center text-white text-sm font-bold"
                            style={{ width: `${dist.esperaOperador.taxa}%` }}
                            title={`Espera Op.: ${fmt(dist.esperaOperador.taxa)}%`}>
                            {dist.esperaOperador.taxa >= 10 && `${Math.round(dist.esperaOperador.taxa)}%`}
                          </div>
                        )}
                        {dist.manutencao?.taxa > 0 && (
                          <div className="bg-blue-500 flex items-center justify-center text-white text-sm font-bold"
                            style={{ width: `${dist.manutencao.taxa}%` }}
                            title={`Manutenção: ${fmt(dist.manutencao.taxa)}%`}>
                            {dist.manutencao.taxa >= 10 && `${Math.round(dist.manutencao.taxa)}%`}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className={`${cardBg} rounded-xl p-4 border-2 ${darkMode ? 'border-green-800' : 'border-green-200'}`}>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-4 h-4 bg-green-500 rounded-full" />
                            <span className={`text-xs font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'}`}>Produção</span>
                          </div>
                          <div className="text-2xl font-bold text-green-500">{fmt(dist.producao?.taxa)}%</div>
                          <div className={`text-xs ${txtS} mt-2`}>{hProd.toFixed(1)}h</div>
                        </div>

                        <div className={`${cardBg} rounded-xl p-4 border-2 ${darkMode ? 'border-yellow-800' : 'border-yellow-200'}`}>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-4 h-4 bg-yellow-500 rounded-full" />
                            <span className={`text-xs font-semibold ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>Pausas</span>
                          </div>
                          <div className="text-2xl font-bold text-yellow-500">{fmtPausa(dist.pausas?.taxa)}%</div>
                          <div className={`text-xs ${txtS} mt-2`}>{fmtH(hPausa)}</div>
                        </div>

                        <div className={`${cardBg} rounded-xl p-4 border-2 ${darkMode ? 'border-red-800' : 'border-red-200'}`}>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-4 h-4 bg-red-500 rounded-full" />
                            <span className={`text-xs font-semibold ${darkMode ? 'text-red-400' : 'text-red-700'}`}>Ociosidade</span>
                          </div>
                          <div className="text-2xl font-bold text-red-500">{fmt(dist.ociosidade?.taxa)}%</div>
                          <div className={`text-xs ${txtS} mt-2`}>{hOcio.toFixed(1)}h</div>
                        </div>

                        <div className={`${cardBg} rounded-xl p-4 border-2 ${darkMode ? 'border-orange-800' : 'border-orange-200'}`}>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-4 h-4 bg-orange-500 rounded-full" />
                            <span className={`text-xs font-semibold ${darkMode ? 'text-orange-400' : 'text-orange-700'}`}>Espera Op.</span>
                          </div>
                          <div className="text-2xl font-bold text-orange-500">{fmt(dist.esperaOperador?.taxa)}%</div>
                          <div className={`text-xs ${txtS} mt-2`}>{hEspera.toFixed(1)}h</div>
                        </div>

                        <div className={`${cardBg} rounded-xl p-4 border-2 ${darkMode ? 'border-blue-800' : 'border-blue-200'}`}>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-4 h-4 bg-blue-500 rounded-full" />
                            <span className={`text-xs font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>Manutenção</span>
                          </div>
                          <div className="text-2xl font-bold text-blue-500">{fmt(dist.manutencao?.taxa)}%</div>
                          <div className={`text-xs ${txtS} mt-2`}>{hManut.toFixed(1)}h</div>
                        </div>
                      </div>

                      <div className="mt-6 text-right">
                        <span className={Math.abs(dist.totalTaxas - 100) < 0.5 ? 'text-sm font-bold text-green-500' : 'text-sm font-bold text-red-500'}>
                          Total: {fmt(dist.totalTaxas, 2)}%
                          {Math.abs(dist.totalTaxas - 100) < 0.5 && ' ✓'}
                        </span>
                      </div>
                    </div>

                    {/* ── Motivos ── */}
                    <div>
                      <h4 className={`text-xl font-bold ${txtP} mb-6`}>📋 Principais Motivos de Parada</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {mPausas.length > 0 && (
                          <div className={`${pausaBg} border-2 rounded-2xl p-6`}>
                            <h5 className={`font-bold ${pausaTitulo} mb-4 flex items-center gap-2 text-lg`}>
                              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
                              Top Motivos de Pausas
                            </h5>
                            <div className="space-y-3">
                              {mPausas.map((m, idx) => (
                                <div key={idx} className={`${pausaItemBg} rounded-xl p-4 border`}>
                                  <div className="flex justify-between items-center mb-2">
                                    <span className={`text-sm font-semibold ${txtP}`}>{m.motivo}</span>
                                    <span className={`text-sm font-bold ${pausaValor}`}>{fmt(m.pctReal)}%</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className={`flex-1 ${pausaBarBg} rounded-full h-2`}>
                                      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full"
                                        style={{ width: `${Math.min(m.pctReal, 100)}%` }} />
                                    </div>
                                    <span className={`text-xs ${txtS} font-medium whitespace-nowrap`}>{fmtH(m.horas)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {mOcio.length > 0 && (
                          <div className={`${ocioBg} border-2 rounded-2xl p-6`}>
                            <h5 className={`font-bold ${ocioTitulo} mb-4 flex items-center gap-2 text-lg`}>
                              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                              Top Motivos de Ociosidade
                            </h5>
                            <div className="space-y-3">
                              {mOcio.map((m, idx) => (
                                <div key={idx} className={`${ocioItemBg} rounded-xl p-4 border`}>
                                  <div className="flex justify-between items-center mb-2">
                                    <span className={`text-sm font-semibold ${txtP}`}>{m.motivo}</span>
                                    <span className={`text-sm font-bold ${ocioValor}`}>{fmt(m.pctReal)}%</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className={`flex-1 ${pausaBarBg} rounded-full h-2`}>
                                      <div className="bg-gradient-to-r from-red-400 to-red-600 h-2 rounded-full"
                                        style={{ width: `${Math.min(m.pctReal, 100)}%` }} />
                                    </div>
                                    <span className={`text-xs ${txtS} font-medium whitespace-nowrap`}>{fmtH(m.horas)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ── Impressoras ── */}
                    {resumoConsolidado.impressoras?.length > 0 && (
                      <div>
                        <h4 className={`text-xl font-bold ${txtP} mb-6 flex items-center gap-2`}>
                          <Printer className="w-6 h-6 text-blue-500" />
                          Análise por Impressora ({resumoConsolidado.totalImpressoras || resumoConsolidado.impressoras.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {resumoConsolidado.impressoras.map((imp, idx) => (
                            <div key={idx}
                              className={`${cardBg} border-2 ${border} hover:border-blue-500 rounded-2xl p-6 cursor-pointer hover:shadow-2xl transition-all group`}
                              onClick={() => abrirCalendario(imp)}
                            >
                              <div className="flex justify-between items-center mb-4">
                                <div>
                                  <span className={`font-bold text-xl ${txtP}`}>{imp.impressoraNome || `M${imp.impressoraId}`}</span>
                                  <div className={`text-xs ${txtS} mt-1`}>{imp.jobsFinalizados || 0} jobs finalizados</div>
                                </div>
                                <ChevronRight className={`w-6 h-6 ${txtS} group-hover:text-blue-500 group-hover:translate-x-1 transition-all`} />
                              </div>

                              <div className="flex w-full h-10 rounded-xl overflow-hidden mb-4 shadow-md">
                                {imp.taxaProducao > 0 && (
                                  <div className="bg-green-500" style={{ width: `${imp.taxaProducao}%` }} title={`Produção: ${fmt(imp.taxaProducao)}%`} />
                                )}
                                {imp.taxaPausas > 0 && (
                                  <div className="bg-yellow-500" style={{ width: `${imp.taxaPausas}%`, minWidth: '3px' }} title={`Pausas: ${fmtPausa(imp.taxaPausas)}%`} />
                                )}
                                {imp.taxaOciosidade > 0 && (
                                  <div className="bg-red-500" style={{ width: `${imp.taxaOciosidade}%` }} title={`Ociosidade: ${fmt(imp.taxaOciosidade)}%`} />
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-green-50'} rounded-lg p-3`}>
                                  <span className={`text-xs ${txtS}`}>🟢 Produção</span>
                                  <div className="font-bold text-lg text-green-500">{fmt(imp.taxaProducao)}%</div>
                                </div>
                                <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-red-50'} rounded-lg p-3`}>
                                  <span className={`text-xs ${txtS}`}>🔴 Ociosidade</span>
                                  <div className="font-bold text-lg text-red-500">{fmt(imp.taxaOciosidade)}%</div>
                                </div>
                              </div>

                              {imp.taxaPausas > 0 && (
                                <div className={`mt-3 flex items-center justify-between ${darkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'} rounded-lg px-3 py-2`}>
                                  <span className={`text-xs ${txtS}`}>🟡 Pausas</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-yellow-500">{fmtPausa(imp.taxaPausas)}%</span>
                                    <span className={`text-xs ${txtS}`}>({fmtH(imp.horasPausas)})</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Calendário */}
      {impressoraSelecionada && (
        <TimelineCalendario
          impressora={impressoraSelecionada}
          onFechar={() => setImpressoraSelecionada(null)}
          darkMode={darkMode}
        />
      )}

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
};

export default CardsCapacidadeTimeline;