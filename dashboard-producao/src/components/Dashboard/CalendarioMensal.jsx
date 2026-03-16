import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, TrendingUp } from 'lucide-react';
import TimelineHoraria from './TimelineHoraria';

/**
 * ============================================
 * CAMADA 3 - CALENDÁRIO MENSAL (HEATMAP)
 * ============================================
 * - Heatmap de dias do mês
 * - Resumo de métricas mensais
 * - Clique no dia → abre timeline horária
 */
const baseUrl = import.meta.env.VITE_API_URL || 'http://192.168.148.19:8088/api/';

const CalendarioMensal = ({ impressora, onFechar }) => {
  const [resumoMensal, setResumoMensal] = useState(null);
  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    carregarDados();
  }, [impressora]);

  const carregarDados = async () => {
    setLoading(true);
    setError(null);

    try {
    const response = await fetch(
  `${baseUrl}Dashboard/timeline/mes-consolidado?ano=${impressora.ano}&mes=${impressora.mes}`

    );

      if (!response.ok) throw new Error('Erro ao carregar calendário');

      const resultado = await response.json();
      console.log('📅 Calendário carregado:', resultado);
      setResumoMensal(resultado);
    } catch (err) {
      console.error('❌ Erro:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Define a cor do dia baseado na taxa de produção
   */
  const obterCorDia = (taxaProducao) => {
    if (taxaProducao === null || taxaProducao === undefined) return 'bg-gray-200';
    if (taxaProducao >= 80) return 'bg-green-500';
    if (taxaProducao >= 60) return 'bg-green-400';
    if (taxaProducao >= 40) return 'bg-yellow-400';
    if (taxaProducao >= 20) return 'bg-orange-400';
    return 'bg-red-400';
  };

  /**
   * Obtém o primeiro dia da semana do mês (0 = Domingo)
   */
  const getPrimeiroDiaSemana = () => {
    if (!resumoMensal || !resumoMensal.calendario || resumoMensal.calendario.length === 0) {
      return 0;
    }
    const primeiroDia = new Date(resumoMensal.calendario[0].data);
    return primeiroDia.getDay();
  };

  return (
    <>
      {!diaSelecionado && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" 
          onClick={onFechar}
        >
          <div 
            className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-white sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-blue-600" />
                    {impressora.impressoraNome || `M${impressora.impressoraId}`}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{impressora.mesAno}</p>
                </div>
                <button 
                  onClick={onFechar} 
                  className="text-gray-400 hover:text-gray-600 text-3xl font-bold transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-6">
              {loading && (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">Carregando calendário...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                  <p className="text-red-800 font-semibold text-lg mb-2">Erro ao carregar</p>
                  <p className="text-red-700 text-sm mb-4">{error}</p>
                  <button 
                    onClick={carregarDados} 
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Tentar Novamente
                  </button>
                </div>
              )}

              {!loading && !error && resumoMensal && (
                <div className="space-y-8">
                  {/* ============================================ */}
                  {/* RESUMO DO MÊS */}
                  {/* ============================================ */}
                  {resumoMensal.metricas && (
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        Resumo do Mês
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {/* Produção */}
                        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                          <div className="text-xs text-gray-600 mb-1">🟢 Produção</div>
                          <div className="text-2xl font-bold text-green-600">
                            {resumoMensal.metricas.taxaProducao?.toFixed(1) ?? '0.0'}%
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {Math.round(resumoMensal.metricas.producao || 0)}h
                          </div>
                        </div>

                        {/* Pausas */}
                        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                          <div className="text-xs text-gray-600 mb-1">🟡 Pausas</div>
                          <div className="text-2xl font-bold text-yellow-600">
                            {resumoMensal.metricas.taxaPausas?.toFixed(1) ?? '0.0'}%
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {Math.round(resumoMensal.metricas.pausas || 0)}h
                          </div>
                        </div>

                        {/* Ociosidade */}
                        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                          <div className="text-xs text-gray-600 mb-1">🔴 Ociosidade</div>
                          <div className="text-2xl font-bold text-red-600">
                            {resumoMensal.metricas.taxaOciosidade?.toFixed(1) ?? '0.0'}%
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {Math.round(resumoMensal.metricas.ociosidade || 0)}h
                          </div>
                        </div>

                        {/* Espera Operador */}
                        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                          <div className="text-xs text-gray-600 mb-1">🟠 Espera Op.</div>
                          <div className="text-2xl font-bold text-orange-600">
                            {resumoMensal.metricas.taxaEsperaOperador?.toFixed(1) ?? '0.0'}%
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {Math.round(resumoMensal.metricas.esperaOperador || 0)}h
                          </div>
                        </div>

                        {/* Manutenção */}
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                          <div className="text-xs text-gray-600 mb-1">🔵 Manutenção</div>
                          <div className="text-2xl font-bold text-blue-600">
                            {resumoMensal.metricas.taxaManutencao?.toFixed(1) ?? '0.0'}%
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {Math.round(resumoMensal.metricas.manutencao || 0)}h
                          </div>
                        </div>
                      </div>
                      {/* Validação 100% */}
                      <div className="mt-3 text-right">
                        <span className={`text-sm font-semibold ${
                          Math.abs(resumoMensal.metricas.totalTaxas - 100) < 0.1
                            ? "text-green-600"
                            : "text-red-600"
                        }`}>
                          {/* ✅ CERTO */}
                           Total: {resumoMensal.metricas.totalTaxas?.toFixed(2) ?? '0.00'}%
                          {Math.abs(resumoMensal.metricas.totalTaxas - 100) < 0.1 && ' ✓'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ============================================ */}
                  {/* CALENDÁRIO (HEATMAP) */}
                  {/* ============================================ */}
                  {resumoMensal.calendario && resumoMensal.calendario.length > 0 && (
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-4">
                        📅 Calendário do Mês
                      </h4>
                      
                      {/* Dias da Semana */}
                      <div className="grid grid-cols-7 gap-2 mb-2">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia, idx) => (
                          <div key={idx} className="text-center text-sm font-semibold text-gray-600 py-2">
                            {dia}
                          </div>
                        ))}
                      </div>

                      {/* Grid de Dias */}
                      <div className="grid grid-cols-7 gap-2">
                        {/* Espaços vazios antes do primeiro dia */}
                        {Array.from({ length: getPrimeiroDiaSemana() }).map((_, idx) => (
                          <div key={`empty-${idx}`} className="aspect-square" />
                        ))}

                        {/* Dias do mês */}
                        {resumoMensal.calendario.map((dia, idx) => (
                          <div
                            key={idx}
                            className={`${obterCorDia(dia.taxaProducao)} rounded-lg p-3 cursor-pointer hover:ring-4 hover:ring-blue-400 transition-all shadow-md aspect-square flex flex-col items-center justify-center`}
                            onClick={() => setDiaSelecionado(dia)}
                            title={`Dia ${dia.dia} - Produção: ${dia.taxaProducao?.toFixed(1)}%`}
                          >
                            <div className="text-center">
                              <div className="text-lg font-bold text-white drop-shadow-md">
                                {dia.dia}
                              </div>
                              <div className="text-xs text-white opacity-90 font-semibold">
                                {dia.taxaProducao?.toFixed(0)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ============================================ */}
                  {/* LEGENDA */}
                  {/* ============================================ */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="text-sm font-semibold text-gray-700 mb-3">Legenda de Produtividade</div>
                    <div className="flex items-center justify-center gap-6 flex-wrap text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-500 rounded shadow-sm"></div>
                        <span className="font-medium">80-100% (Excelente)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-400 rounded shadow-sm"></div>
                        <span className="font-medium">60-80% (Bom)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-yellow-400 rounded shadow-sm"></div>
                        <span className="font-medium">40-60% (Regular)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-orange-400 rounded shadow-sm"></div>
                        <span className="font-medium">20-40% (Baixo)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-red-400 rounded shadow-sm"></div>
                        <span className="font-medium">0-20% (Crítico)</span>
                      </div>
                    </div>
                  </div>

                  {/* ============================================ */}
                  {/* JOBS DO MÊS */}
                  {/* ============================================ */}
                  {resumoMensal.metricas && (
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-5">
                      <h4 className="font-semibold text-gray-900 mb-4">Resumo de Jobs</h4>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-3xl font-bold text-green-600">
                            {resumoMensal.metricas.jobsFinalizados || 0}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">Finalizados</div>
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-red-600">
                            {resumoMensal.metricas.jobsAbortados || 0}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">Abortados</div>
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-blue-600">
                            {resumoMensal.metricas.taxaSucesso?.toFixed(1) || '0.0'}%
                          </div>
                          <div className="text-sm text-gray-600 mt-1">Taxa Sucesso</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal - Timeline Horária (Camada 4) */}
      {diaSelecionado && (
        <TimelineHoraria
          machineId={impressora.impressoraId}
          impressoraNome={impressora.impressoraNome}
          data={diaSelecionado.data}
          onFechar={() => setDiaSelecionado(null)}
        />
      )}
    </>
  );
};

export default CalendarioMensal;