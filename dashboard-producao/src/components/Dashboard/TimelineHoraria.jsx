import React, { useState, useEffect } from 'react';
import { Clock, Activity, AlertCircle, Info, TrendingUp } from 'lucide-react';

// ── helpers compartilhados ──
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

const TimelineHoraria = ({ machineId, impressoraNome, data, onFechar, darkMode = false }) => {
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const txtP   = darkMode ? 'text-gray-100' : 'text-gray-900';
  const txtS   = darkMode ? 'text-gray-400' : 'text-gray-600';
  const border = darkMode ? 'border-gray-700' : 'border-gray-200';

  useEffect(() => { carregarTimeline(); }, [machineId, data]);

  const carregarTimeline = async () => {
    setLoading(true);
    setError(null);
    try {
      const dataFormatada = new Date(data).toISOString().split('T')[0];
      const response = await fetch(
        `https://localhost:7248/api/Dashboard/timeline/dia/${machineId}?data=${dataFormatada}`
      );
      if (!response.ok) throw new Error('Erro ao carregar timeline');
      setTimelineData(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const corStatus = (status) => ({
    'Producao': 'bg-green-500', 'Pausa': 'bg-yellow-500',
    'Ociosa': 'bg-red-500', 'EsperaOperador': 'bg-orange-500',
    'Manutencao': 'bg-blue-500'
  }[status] || 'bg-gray-400');

  const iconeStatus = (status) => ({
    'Producao': '🟢', 'Pausa': '🟡', 'Ociosa': '🔴',
    'EsperaOperador': '🟠', 'Manutencao': '🔵'
  }[status] || '⚪');

  const nomeStatus = (status) => ({
    'Producao': 'Produção', 'Pausa': 'Pausa', 'Ociosa': 'Ociosa',
    'EsperaOperador': 'Aguardando Operador', 'Manutencao': 'Manutenção'
  }[status] || status);

  const formatarDataCompleta = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('pt-BR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onFechar}>
      <div className={`${cardBg} rounded-3xl max-w-7xl w-full max-h-[90vh] overflow-y-auto shadow-2xl`}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className={`p-6 border-b ${border} ${darkMode ? '' : 'bg-gradient-to-r from-blue-50 to-white'} sticky top-0 z-10 rounded-t-3xl`}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className={`text-3xl font-bold ${txtP} flex items-center gap-3`}>
                <Clock className="w-8 h-8 text-blue-600" /> Timeline do Dia
              </h3>
              <p className={`text-sm ${txtS} mt-1`}>
                {impressoraNome || `M${machineId}`} • {formatarDataCompleta(data)}
              </p>
            </div>
            <button onClick={onFechar} className={`${txtS} text-3xl font-bold hover:rotate-90 transition-transform duration-300`}>×</button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          {loading && (
            <div className="text-center py-16">
              <div className="relative mx-auto mb-4 w-16 h-16">
                <div className={`absolute inset-0 border-4 ${darkMode ? 'border-blue-900' : 'border-blue-200'} rounded-full`} />
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
              </div>
              <p className={`${txtS} text-lg`}>Carregando timeline do dia...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <p className="text-red-800 font-semibold text-lg mb-2">Erro ao carregar timeline</p>
              <p className="text-red-700 text-sm mb-4">{error}</p>
              <button onClick={carregarTimeline} className="bg-red-600 text-white px-6 py-3 rounded-xl">Tentar Novamente</button>
            </div>
          )}

          {!loading && !error && timelineData && (
            <div className="space-y-8">

              {/* Resumo do dia */}
              {timelineData.resumo && (() => {
                const r = timelineData.resumo;
                return (
                  <div>
                    <h4 className={`text-xl font-bold ${txtP} mb-4 flex items-center gap-2`}>
                      <TrendingUp className="w-6 h-6 text-blue-600" /> Resumo do Dia
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      {/* Produção */}
                      <div className={`${darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border-2 rounded-xl p-4`}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full" />
                          <span className={`text-xs font-semibold ${darkMode ? 'text-green-400' : 'text-green-900'}`}>🟢 Produção</span>
                        </div>
                        <div className="text-2xl font-bold text-green-600">{fmt(r.taxaProducao)}%</div>
                        <div className={`text-xs ${txtS} mt-1`}>{fmtH(r.horasProducao)}</div>
                      </div>

                      {/* ✅ FIX: Pausas com 2 casas + fmtH */}
                      <div className={`${darkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border-2 rounded-xl p-4`}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                          <span className={`text-xs font-semibold ${darkMode ? 'text-yellow-400' : 'text-yellow-900'}`}>🟡 Pausas</span>
                        </div>
                        <div className="text-2xl font-bold text-yellow-600">{fmtPausa(r.taxaPausas)}%</div>
                        <div className={`text-xs ${txtS} mt-1`}>{fmtH(r.horasPausas)}</div>
                      </div>

                      {/* Ociosidade */}
                      <div className={`${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border-2 rounded-xl p-4`}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full" />
                          <span className={`text-xs font-semibold ${darkMode ? 'text-red-400' : 'text-red-900'}`}>🔴 Ociosidade</span>
                        </div>
                        <div className="text-2xl font-bold text-red-600">{fmt(r.taxaOciosidade)}%</div>
                        <div className={`text-xs ${txtS} mt-1`}>{fmtH(r.horasOciosidade)}</div>
                      </div>

                      {/* Espera Operador */}
                      <div className={`${darkMode ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'} border-2 rounded-xl p-4`}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 bg-orange-500 rounded-full" />
                          <span className={`text-xs font-semibold ${darkMode ? 'text-orange-400' : 'text-orange-900'}`}>🟠 Espera Op.</span>
                        </div>
                        <div className="text-2xl font-bold text-orange-600">{fmt(r.taxaEsperaOperador)}%</div>
                        <div className={`text-xs ${txtS} mt-1`}>{fmtH(r.horasEsperaOperador)}</div>
                      </div>

                      {/* Manutenção */}
                      <div className={`${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border-2 rounded-xl p-4`}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full" />
                          <span className={`text-xs font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-900'}`}>🔵 Manutenção</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">{fmt(r.taxaManutencao)}%</div>
                        <div className={`text-xs ${txtS} mt-1`}>{fmtH(r.horasManutencao)}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-sm font-semibold ${Math.abs(r.totalTaxas - 100) < 0.1 ? 'text-green-600' : 'text-red-600'}`}>
                        Total: {fmt(r.totalTaxas, 2)}%
                        {Math.abs(r.totalTaxas - 100) < 0.1 && ' ✓'}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Motivos do dia */}
              {timelineData.motivosDia && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {timelineData.motivosDia.pausas?.length > 0 && (
                    <div className={`${darkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border-2 rounded-2xl p-5`}>
                      <h4 className={`text-lg font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-900'} mb-4`}>🟡 Motivos de Pausas</h4>
                      <div className="space-y-2">
                        {timelineData.motivosDia.pausas.slice(0, 5).map((motivo, idx) => (
                          <div key={idx} className={`${cardBg} rounded-xl p-3 border ${darkMode ? 'border-yellow-900' : 'border-yellow-200'}`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-sm font-semibold ${txtP}`}>{motivo.motivo || 'Não especificado'}</span>
                              {/* ✅ fmtH para pausas do dia */}
                              <span className="text-sm font-bold text-yellow-600">{fmtH(motivo.horas)}</span>
                            </div>
                            <div className={`text-xs ${txtS}`}>{motivo.ocorrencias || 0} ocorrências</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {timelineData.motivosDia.ociosidade?.length > 0 && (
                    <div className={`${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border-2 rounded-2xl p-5`}>
                      <h4 className={`text-lg font-bold ${darkMode ? 'text-red-400' : 'text-red-900'} mb-4`}>🔴 Motivos de Ociosidade</h4>
                      <div className="space-y-2">
                        {timelineData.motivosDia.ociosidade.slice(0, 5).map((motivo, idx) => (
                          <div key={idx} className={`${cardBg} rounded-xl p-3 border ${darkMode ? 'border-red-900' : 'border-red-200'}`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-sm font-semibold ${txtP}`}>{motivo.motivo || 'Não especificado'}</span>
                              <span className="text-sm font-bold text-red-600">{motivo.horas?.toFixed(1)}h</span>
                            </div>
                            <div className={`text-xs ${txtS}`}>{motivo.ocorrencias || 0} ocorrências</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Timeline */}
              {timelineData.blocos?.length > 0 && (
                <div>
                  <h4 className={`text-xl font-bold ${txtP} mb-6 flex items-center gap-2`}>
                    <Activity className="w-6 h-6 text-blue-600" /> Linha do Tempo (24 horas)
                  </h4>
                  <div className="space-y-3">
                    {timelineData.blocos.map((bloco, idx) => (
                      <div key={idx} className={`${cardBg} border-2 ${border} rounded-xl p-4 hover:shadow-lg transition-all`}>
                        <div className="flex items-start gap-4">
                          {/* Horário */}
                          <div className="flex-shrink-0 text-center w-14">
                            <div className={`text-sm font-bold ${txtP}`}>{bloco.inicio}</div>
                            <div className={`text-xs ${txtS}`}>→</div>
                            <div className={`text-sm font-bold ${txtP}`}>{bloco.fim}</div>
                          </div>

                          {/* Ícone status */}
                          <div className="flex-shrink-0">
                            <div className={`${corStatus(bloco.status)} w-14 h-14 rounded-lg flex items-center justify-center text-2xl shadow-md`}>
                              {iconeStatus(bloco.status)}
                            </div>
                          </div>

                          {/* Detalhes */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className={`text-lg font-bold ${txtP}`}>{nomeStatus(bloco.status)}</h5>
                              {/* ✅ fmtH para blocos da timeline */}
                              <span className={`text-sm font-semibold ${txtS}`}>{fmtH(bloco.duracao)}</span>
                            </div>
                            {bloco.motivo && (
                              <div className="flex items-start gap-2 mb-2">
                                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  <span className="font-semibold">Motivo:</span> {bloco.motivo}
                                </div>
                              </div>
                            )}
                            {bloco.mensagem && (
                              <div className={`text-sm ${darkMode ? 'text-gray-400 bg-gray-700/50' : 'text-gray-600 bg-gray-50'} italic rounded-lg p-2`}>
                                "{bloco.mensagem}"
                              </div>
                            )}
                            {bloco.jobId && (
                              <div className={`text-xs ${txtS} mt-2`}>Job: {bloco.jobNome || bloco.jobId}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!timelineData.blocos || timelineData.blocos.length === 0) && (
                <div className={`${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'} border-2 rounded-xl p-8 text-center`}>
                  <AlertCircle className={`w-12 h-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'} mx-auto mb-4`} />
                  <p className={txtS}>Nenhum evento registrado neste dia.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default TimelineHoraria;