import React, { useState, useEffect } from 'react';
import { X, Calendar, TrendingUp } from 'lucide-react';
import TimelineHoraria from './TimelineHoraria';

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

const TimelineCalendario = ({ impressora, onFechar, darkMode = false }) => {
  const [resumoMensal, setResumoMensal] = useState(null);
  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const txtP   = darkMode ? 'text-gray-100' : 'text-gray-900';
  const txtS   = darkMode ? 'text-gray-400' : 'text-gray-600';
  const border = darkMode ? 'border-gray-700' : 'border-gray-200';

  useEffect(() => { carregarDados(); }, [impressora]);

const carregarDados = async () => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'https://back-endsystem3d.onrender.com/api/';
      const response = await fetch(
        `${baseUrl}Dashboard/timeline/mes-impressora/${impressora.impressoraId}?ano=${impressora.ano}&mes=${impressora.mes}`
      );
      if (!response.ok) throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
      const resultado = await response.json();
      setResumoMensal(resultado);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const obterCorDia = (taxa) => {
    if (taxa >= 80) return 'bg-green-500 hover:bg-green-600';
    if (taxa >= 60) return 'bg-green-400 hover:bg-green-500';
    if (taxa >= 40) return 'bg-yellow-400 hover:bg-yellow-500';
    if (taxa >= 20) return 'bg-orange-400 hover:bg-orange-500';
    return 'bg-red-400 hover:bg-red-500';
  };

  return (
    <>
      {!diaSelecionado && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onFechar}>
          <div className={`${cardBg} rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl`}
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className={`p-6 border-b ${border} sticky top-0 ${cardBg} z-10 rounded-t-3xl`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className={`text-2xl font-bold ${txtP} flex items-center gap-3`}>
                    <Calendar className="w-7 h-7 text-blue-500" />
                    Calendário - {impressora.impressoraNome || `M${impressora.impressoraId}`}
                  </h3>
                  <p className={`text-sm ${txtS} mt-1`}>{impressora.mesAno}</p>
                </div>
                <button onClick={onFechar} className={`${txtS} hover:text-gray-400 transition-colors`}>
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-6">
              {loading && (
                <div className="text-center py-12">
                  <div className="relative mx-auto mb-4 w-12 h-12">
                    <div className={`absolute inset-0 border-4 ${darkMode ? 'border-blue-900' : 'border-blue-200'} rounded-full`} />
                    <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
                  </div>
                  <p className={txtS}>Carregando calendário...</p>
                </div>
              )}

              {error && (
                <div className={`${darkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'} border-2 rounded-2xl p-6 text-center`}>
                  <p className={`${darkMode ? 'text-red-300' : 'text-red-800'} font-semibold mb-2`}>Erro ao carregar calendário</p>
                  <p className={`${darkMode ? 'text-red-400' : 'text-red-700'} text-sm mb-4`}>{error}</p>
                  <button onClick={carregarDados} className="bg-red-600 text-white px-4 py-2 rounded-xl">
                    Tentar Novamente
                  </button>
                </div>
              )}

              {!loading && !error && resumoMensal && (
                <div className="space-y-6">

                  {/* Resumo do mês */}
                  {resumoMensal.metricas && (() => {
                    const m = resumoMensal.metricas;
                    return (
                      <div>
                        <h4 className={`font-semibold ${txtP} mb-3 flex items-center gap-2`}>
                          <TrendingUp className="w-5 h-5 text-blue-500" /> Resumo do Mês
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">

                          <div className={`${darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border rounded-xl p-3`}>
                            <div className={`text-xs ${txtS} mb-1`}>🟢 Produção</div>
                            <div className="text-lg font-bold text-green-500">{fmt(m.taxaProducao)}%</div>
                            <div className={`text-xs ${txtS}`}>{Number(m.producao || 0).toFixed(1)}h</div>
                          </div>

                          <div className={`${darkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border rounded-xl p-3`}>
                            <div className={`text-xs ${txtS} mb-1`}>🟡 Pausas</div>
                            <div className="text-lg font-bold text-yellow-500">{fmtPausa(m.taxaPausas)}%</div>
                            <div className={`text-xs ${txtS}`}>{fmtH(m.pausas)}</div>
                          </div>

                          <div className={`${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border rounded-xl p-3`}>
                            <div className={`text-xs ${txtS} mb-1`}>🔴 Ociosidade</div>
                            <div className="text-lg font-bold text-red-500">{fmt(m.taxaOciosidade)}%</div>
                            <div className={`text-xs ${txtS}`}>{Number(m.ociosidade || 0).toFixed(1)}h</div>
                          </div>

                          <div className={`${darkMode ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'} border rounded-xl p-3`}>
                            <div className={`text-xs ${txtS} mb-1`}>🟠 Espera Op.</div>
                            <div className="text-lg font-bold text-orange-500">{fmt(m.taxaEsperaOperador)}%</div>
                            <div className={`text-xs ${txtS}`}>{Number(m.esperaOperador || 0).toFixed(1)}h</div>
                          </div>

                          <div className={`${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border rounded-xl p-3`}>
                            <div className={`text-xs ${txtS} mb-1`}>🔵 Manutenção</div>
                            <div className="text-lg font-bold text-blue-500">{fmt(m.taxaManutencao)}%</div>
                            <div className={`text-xs ${txtS}`}>{Number(m.manutencao || 0).toFixed(1)}h</div>
                          </div>
                        </div>

                        <div className="text-xs text-right mt-2">
                          <span className={Math.abs(m.totalTaxas - 100) < 0.5 ? 'font-semibold text-green-500' : 'font-semibold text-red-500'}>
                            Total: {fmt(m.totalTaxas, 2)}%
                            {Math.abs(m.totalTaxas - 100) < 0.5 && ' ✓'}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Calendário */}
                  {resumoMensal.calendario?.length > 0 && (
                    <div>
                      <h4 className={`font-semibold ${txtP} mb-3`}>📅 Calendário do Mês</h4>
                      <p className={`text-sm ${txtS} mb-4`}>Clique em um dia para ver a timeline horária</p>

                      <div className="grid grid-cols-7 gap-2 mb-2">
                        {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map((d, i) => (
                          <div key={i} className={`text-center text-xs font-semibold ${txtS} pb-2`}>{d}</div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-2">
                        {resumoMensal.calendario.map((dia, idx) => (
                          <div key={idx}
                            className={`${obterCorDia(dia.taxaProducao)} rounded-lg p-3 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all shadow-sm`}
                            onClick={() => setDiaSelecionado(dia)}
                            title={`${dia.data}: ${fmt(dia.taxaProducao)}% produção`}
                          >
                            <div className="text-center">
                              <div className="text-sm font-bold text-white">{dia.dia}</div>
                              <div className="text-xs text-white opacity-90">{fmt(dia.taxaProducao, 0)}%</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Legenda */}
                  <div className={`flex flex-wrap items-center justify-center gap-4 text-xs ${txtS}`}>
                    {[['bg-green-500','80-100%'],['bg-green-400','60-80%'],['bg-yellow-400','40-60%'],['bg-orange-400','20-40%'],['bg-red-400','0-20%']].map(([c,l]) => (
                      <div key={l} className="flex items-center gap-2">
                        <div className={`w-4 h-4 ${c} rounded`} /><span>{l}</span>
                      </div>
                    ))}
                  </div>

                  {/* Jobs */}
                  {resumoMensal.metricas && (
                    <div className={`${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-xl p-4`}>
                      <h4 className={`font-semibold ${txtP} mb-3`}>📦 Jobs do Mês</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div><span className={txtS}>Finalizados:</span> <span className="ml-2 font-semibold text-green-500">{resumoMensal.metricas.jobsFinalizados || 0}</span></div>
                        <div><span className={txtS}>Abortados:</span> <span className="ml-2 font-semibold text-red-500">{resumoMensal.metricas.jobsAbortados || 0}</span></div>
                        <div><span className={txtS}>Taxa Sucesso:</span> <span className={`ml-2 font-semibold ${txtP}`}>{fmt(resumoMensal.metricas.taxaSucesso)}%</span></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {diaSelecionado && (
        <TimelineHoraria
          machineId={impressora.impressoraId}
          impressoraNome={impressora.impressoraNome}
          data={diaSelecionado.data}
          onFechar={() => setDiaSelecionado(null)}
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

export default TimelineCalendario; 