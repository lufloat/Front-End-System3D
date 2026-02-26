import React, { useState } from 'react';
import { TrendingUp, Clock, CheckCircle, ChevronRight, Printer, AlertCircle } from 'lucide-react';
import CalendarioMensal from './CalendarioMensal';

/**
 * ANÁLISE DE CAPACIDADE - COMPLETA COM RANKING DE MOTIVOS
 * Camadas 1 + 2
 */

const baseUrl = import.meta.env.VITE_API_URL || 'http://192.168.148.19:8088/api/';

const AnaliseCapacidadeEvoluida = ({ data }) => {
  const [mesModal, setMesModal] = useState(null);
  const [resumoConsolidado, setResumoConsolidado] = useState(null);
  const [impressoraSelecionada, setImpressoraSelecionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const abrirModal = async (mesAno) => {
    setMesModal(mesAno);
    setLoading(true);
    setError(null);

    try {
      const [mesNome, anoStr] = mesAno.split('/');
      const meses = {
        'JAN': 1, 'FEV': 2, 'MAR': 3, 'ABR': 4, 'MAI': 5, 'JUN': 6,
        'JUL': 7, 'AGO': 8, 'SET': 9, 'OUT': 10, 'NOV': 11, 'DEZ': 12
      };
      const mes = meses[mesNome];
      const ano = parseInt('20' + anoStr);

      const response = await fetch(
        `${baseUrl}Dashboard/timeline/mes-consolidado?ano=${ano}&mes=${mes}`
      );

      if (!response.ok) throw new Error('Erro ao carregar');
      
      const resultado = await response.json();
      console.log('✅ Dados recebidos:', resultado);
      setResumoConsolidado(resultado);
    } catch (err) {
      console.error('❌ Erro:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fecharModal = () => {
    setMesModal(null);
    setResumoConsolidado(null);
    setImpressoraSelecionada(null);
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

  return (
    <>
      {/* CAMADA 1 - CARDS MENSAIS */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Análise de Capacidade</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data?.map((card, index) => (
            <div
              key={index}
              className="bg-white border border-gray-300 rounded-lg p-5 cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all"
              onClick={() => abrirModal(card.mesAno)}
            >
              <div className="text-sm font-medium text-gray-500 mb-3">{card.mesAno}</div>
              <div className="mb-4">
                <div className="text-3xl font-bold text-gray-900">{card.utilizacaoPercent}%</div>
                <div className="text-xs text-gray-600">Utilização</div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <div className="text-xs text-gray-600">Produtivas</div>
                  <div className="text-lg font-semibold text-gray-900">{card.produtivas}h</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Sucesso</div>
                  <div className="text-lg font-semibold text-green-600">{card.sucessoPercent}%</div>
                </div>
              </div>
              <div className="text-xs text-blue-600 flex items-center justify-center gap-1">
                Ver análise detalhada →
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CAMADA 2 - MODAL CONSOLIDADO COMPLETO */}
      {mesModal && !impressoraSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={fecharModal}>
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto my-4" onClick={(e) => e.stopPropagation()}>
            
            {/* HEADER */}
            <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50 sticky top-0 z-10 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    📊 Análise de Capacidade - {mesModal}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Distribuição de tempo e produtividade consolidada</p>
                </div>
                <button onClick={fecharModal} className="text-gray-400 hover:text-gray-600 text-3xl font-bold leading-none">×</button>
              </div>
            </div>

            <div className="p-6">
              {loading && (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">Carregando análise completa...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 text-center">
                  <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                  <p className="text-red-800 text-lg font-semibold mb-4">{error}</p>
                  <button onClick={() => abrirModal(mesModal)} className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold">
                    Tentar Novamente
                  </button>
                </div>
              )}

              {!loading && !error && resumoConsolidado && (
                <div className="space-y-8">
                  
                  {/* BLOCO 1 - INDICADORES PRINCIPAIS */}
                  <div className="grid grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                        <div className="text-sm font-medium text-gray-600">Utilização</div>
                      </div>
                      <div className="text-5xl font-bold text-blue-600">
                        {resumoConsolidado.metricas?.utilizacao?.toFixed(1) || '0.0'}%
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-6 h-6 text-green-600" />
                        <div className="text-sm font-medium text-gray-600">Horas Produtivas</div>
                      </div>
                      <div className="text-5xl font-bold text-green-600">
                        {Math.round(resumoConsolidado.metricas?.horasProdutivas || 0)}h
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-6 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="w-6 h-6 text-purple-600" />
                        <div className="text-sm font-medium text-gray-600">Taxa Sucesso</div>
                      </div>
                      <div className="text-5xl font-bold text-purple-600">
                        {resumoConsolidado.metricas?.taxaSucesso?.toFixed(1) || '0.0'}%
                      </div>
                    </div>
                  </div>

                  {/* BLOCO 2 - DISTRIBUIÇÃO DO TEMPO */}
                  {resumoConsolidado.distribuicao && (
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm">
                      <h4 className="font-bold text-gray-900 text-xl mb-6 flex items-center gap-2">
                        📊 Distribuição do Tempo no Mês
                      </h4>

                      {/* BARRA 100% EMPILHADA */}
                      <div className="flex w-full h-20 rounded-lg overflow-hidden mb-6 shadow-lg">
                        {resumoConsolidado.distribuicao.producao?.taxa > 0 && (
                          <div 
                            className="bg-green-500 flex items-center justify-center text-white font-bold text-lg transition-all hover:opacity-90"
                            style={{ width: `${resumoConsolidado.distribuicao.producao.taxa}%` }}
                            title={`Produção: ${resumoConsolidado.distribuicao.producao.taxa.toFixed(1)}%`}
                          >
                            {resumoConsolidado.distribuicao.producao.taxa >= 8 && 
                              `${Math.round(resumoConsolidado.distribuicao.producao.taxa)}%`
                            }
                          </div>
                        )}
                        {resumoConsolidado.distribuicao.pausas?.taxa > 0 && (
                          <div 
                            className="bg-yellow-400 flex items-center justify-center text-gray-900 font-bold text-lg transition-all hover:opacity-90"
                            style={{ width: `${resumoConsolidado.distribuicao.pausas.taxa}%` }}
                            title={`Pausas: ${resumoConsolidado.distribuicao.pausas.taxa.toFixed(1)}%`}
                          >
                            {resumoConsolidado.distribuicao.pausas.taxa >= 8 && 
                              `${Math.round(resumoConsolidado.distribuicao.pausas.taxa)}%`
                            }
                          </div>
                        )}
                        {resumoConsolidado.distribuicao.ociosidade?.taxa > 0 && (
                          <div 
                            className="bg-red-500 flex items-center justify-center text-white font-bold text-lg transition-all hover:opacity-90"
                            style={{ width: `${resumoConsolidado.distribuicao.ociosidade.taxa}%` }}
                            title={`Ociosidade: ${resumoConsolidado.distribuicao.ociosidade.taxa.toFixed(1)}%`}
                          >
                            {resumoConsolidado.distribuicao.ociosidade.taxa >= 8 && 
                              `${Math.round(resumoConsolidado.distribuicao.ociosidade.taxa)}%`
                            }
                          </div>
                        )}
                        {resumoConsolidado.distribuicao.esperaOperador?.taxa > 0 && (
                          <div 
                            className="bg-orange-500 flex items-center justify-center text-white font-bold transition-all hover:opacity-90"
                            style={{ width: `${resumoConsolidado.distribuicao.esperaOperador.taxa}%` }}
                            title={`Espera Op.: ${resumoConsolidado.distribuicao.esperaOperador.taxa.toFixed(1)}%`}
                          />
                        )}
                        {resumoConsolidado.distribuicao.manutencao?.taxa > 0 && (
                          <div 
                            className="bg-blue-600 flex items-center justify-center text-white font-bold transition-all hover:opacity-90"
                            style={{ width: `${resumoConsolidado.distribuicao.manutencao.taxa}%` }}
                            title={`Manutenção: ${resumoConsolidado.distribuicao.manutencao.taxa.toFixed(1)}%`}
                          />
                        )}
                      </div>

                      {/* LEGENDA DETALHADA */}
                      <div className="grid grid-cols-5 gap-4 text-sm">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-5 bg-green-500 rounded shadow"></div>
                            <span className="font-semibold text-gray-700">Produção</span>
                          </div>
                          <div className="text-3xl font-bold text-green-600">
                            {resumoConsolidado.distribuicao.producao?.taxa?.toFixed(1) || '0.0'}%
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ({Math.round(resumoConsolidado.distribuicao.producao?.horas || 0)}h)
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-5 bg-yellow-400 rounded shadow"></div>
                            <span className="font-semibold text-gray-700">Pausas</span>
                          </div>
                          <div className="text-3xl font-bold text-yellow-600">
                            {resumoConsolidado.distribuicao.pausas?.taxa?.toFixed(1) || '0.0'}%
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ({Math.round(resumoConsolidado.distribuicao.pausas?.horas || 0)}h)
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-5 bg-red-500 rounded shadow"></div>
                            <span className="font-semibold text-gray-700">Ociosidade</span>
                          </div>
                          <div className="text-3xl font-bold text-red-600">
                            {resumoConsolidado.distribuicao.ociosidade?.taxa?.toFixed(1) || '0.0'}%
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ({Math.round(resumoConsolidado.distribuicao.ociosidade?.horas || 0)}h)
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-5 bg-orange-500 rounded shadow"></div>
                            <span className="font-semibold text-gray-700">Espera Op.</span>
                          </div>
                          <div className="text-3xl font-bold text-orange-600">
                            {resumoConsolidado.distribuicao.esperaOperador?.taxa?.toFixed(1) || '0.0'}%
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ({Math.round(resumoConsolidado.distribuicao.esperaOperador?.horas || 0)}h)
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-5 bg-blue-600 rounded shadow"></div>
                            <span className="font-semibold text-gray-700">Manutenção</span>
                          </div>
                          <div className="text-3xl font-bold text-blue-600">
                            {resumoConsolidado.distribuicao.manutencao?.taxa?.toFixed(1) || '0.0'}%
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ({Math.round(resumoConsolidado.distribuicao.manutencao?.horas || 0)}h)
                          </div>
                        </div>
                      </div>

                      {/* VALIDAÇÃO 100% */}
                      <div className="mt-6 pt-4 border-t-2 border-gray-200 text-right">
                        <span className={`text-lg font-bold ${
                          Math.abs((resumoConsolidado.distribuicao.totalTaxas || 0) - 100) < 0.1
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          Total: {resumoConsolidado.distribuicao.totalTaxas?.toFixed(2) || '0.00'}%
                          {Math.abs((resumoConsolidado.distribuicao.totalTaxas || 0) - 100) < 0.1 && ' ✓'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* BLOCO 3 - RANKING DE MOTIVOS */}
                  {resumoConsolidado.motivos && (
                    <div className="grid grid-cols-2 gap-6">
                      {/* Motivos de PAUSAS */}
                      {resumoConsolidado.motivos.pausas?.length > 0 && (
                        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 shadow-sm">
                          <h4 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                            🟡 Top Motivos - Pausas
                          </h4>
                          <div className="space-y-3">
                            {resumoConsolidado.motivos.pausas.map((motivo, idx) => (
                              <div key={idx} className="bg-white rounded-lg p-4 border border-yellow-300">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-semibold text-gray-900">{motivo.motivo}</span>
                                  <span className="text-yellow-600 font-bold text-lg">{motivo.percentual}%</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                  <span>{motivo.horas}h</span>
                                  <span>{motivo.ocorrencias} ocorrências</span>
                                </div>
                                {/* Barra proporcional */}
                                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-yellow-500"
                                    style={{ width: `${motivo.percentual}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Motivos de OCIOSIDADE */}
                      {resumoConsolidado.motivos.ociosidade?.length > 0 && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 shadow-sm">
                          <h4 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                            🔴 Top Motivos - Ociosidade
                          </h4>
                          <div className="space-y-3">
                            {resumoConsolidado.motivos.ociosidade.map((motivo, idx) => (
                              <div key={idx} className="bg-white rounded-lg p-4 border border-red-300">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-semibold text-gray-900">{motivo.motivo}</span>
                                  <span className="text-red-600 font-bold text-lg">{motivo.percentual}%</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                  <span>{motivo.horas}h</span>
                                  <span>{motivo.ocorrencias} ocorrências</span>
                                </div>
                                {/* Barra proporcional */}
                                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-red-500"
                                    style={{ width: `${motivo.percentual}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* BLOCO 4 - GRID DE IMPRESSORAS */}
                  {resumoConsolidado.impressoras?.length > 0 && (
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm">
                      <h4 className="font-bold text-gray-900 text-xl mb-4 flex items-center gap-2">
                        <Printer className="w-6 h-6" />
                        Análise por Impressora ({resumoConsolidado.totalImpressoras})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {resumoConsolidado.impressoras.map((imp, idx) => (
                          <div 
                            key={idx} 
                            className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-300 rounded-lg p-5 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group"
                            onClick={() => abrirCalendario(imp)}
                          >
                            <div className="flex justify-between items-center mb-4">
                              <span className="font-bold text-gray-900 text-xl">{imp.impressoraNome}</span>
                              <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                            </div>

                            {/* Mini Barra 100% */}
                            <div className="flex w-full h-4 rounded-md overflow-hidden mb-4 shadow">
                              <div className="bg-green-500" style={{ width: `${imp.taxaProducao}%` }} />
                              <div className="bg-yellow-400" style={{ width: `${imp.taxaPausas}%` }} />
                              <div className="bg-red-500" style={{ width: `${imp.taxaOciosidade}%` }} />
                            </div>

                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Produção:</span>
                                <span className="font-bold text-green-600">{imp.taxaProducao?.toFixed(1)}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Ociosidade:</span>
                                <span className="font-bold text-red-600">{imp.taxaOciosidade?.toFixed(1)}%</span>
                              </div>
                              <div className="flex justify-between border-t pt-2">
                                <span className="text-gray-600">Jobs OK:</span>
                                <span className="font-bold text-gray-900">{imp.jobsFinalizados}</span>
                              </div>
                            </div>

                            <div className="mt-3 text-center text-xs text-blue-600 font-semibold group-hover:underline">
                              Ver calendário mensal →
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CAMADA 3 - CALENDÁRIO */}
      {impressoraSelecionada && (
        <CalendarioMensal
          impressora={impressoraSelecionada}
          onFechar={() => setImpressoraSelecionada(null)}
        />
      )}
    </>
  );
};

export default AnaliseCapacidadeEvoluida;