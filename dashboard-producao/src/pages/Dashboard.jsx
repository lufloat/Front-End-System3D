import React, { useState, useEffect } from "react";
import { dashboardAPI } from "../services/api.js";
import { Moon, Sun } from 'lucide-react';

import MetricasKPI from "../components/Dashboard/MetricasKPI";
import ComposicaoSKUs from "../components/Dashboard/ComposicaoSKUs";
import EvolucaoSKUs from "../components/Dashboard/EvolucaoSKUs";
import ProducaoAnual from "../components/Dashboard/ProducaoAnual";
import TabelaProducaoMensal from "../components/Dashboard/TabelaProducaoMensal";
import VisaoGeralTabsComModal from "../components/Dashboard/VisaoGeralTabsComModal";
import CardsKgComModal from "../components/Dashboard/CardsKgComModal";
import CardsCapacidadeTimeline from "../components/Dashboard/CardsCapacidadeTimeline";
import Equipamentos from "../components/Dashboard/Equipamentos";

const Dashboard = () => {
  const [anoSelecionado, setAnoSelecionado] = useState(2026);
  const [mesSelecionado, setMesSelecionado] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dadosGeraisTabela, setDadosGeraisTabela] = useState([]);
  
  // ✅ DARK MODE STATE
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [dados, setDados] = useState({
    metricas: null,
    evolucaoSKUs: [],
    producaoAnual: [],
    producaoMensal: [],
    visaoGeral: {
      producao: [],
      prototipos: [],
      erros: [],
      peso: [],
      failed: [],
      aborted: [],
    },
    cardsKg: [],
    cardsCapacidade: [],
    equipamentos: [],
    cardsKgPorImpressora: [],
    cardsCapacidadePorImpressora: [],
    producaoPorImpressoraAnual: [],
    prototiposPorImpressoraAnual: [],
    errosPorImpressoraAnual: [],
    pesoPorImpressoraAnual: [],
    failedPorImpressoraAnual: [],
    abortedPorImpressoraAnual: [],
  });

  const anosDisponiveis = [2024, 2025, 2026];

  // ✅ SALVAR E APLICAR DARK MODE
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anoSelecionado, mesSelecionado]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const carregarCardsCapacidadeConsolidados = async (ano) => {
    const promises = [];

    for (let mes = 1; mes <= 12; mes++) {
      promises.push(
        dashboardAPI.obterResumoMensalConsolidado(ano, mes)
          .then(response => ({
            mes,
            dados: response.data
          }))
          .catch(error => {
            console.warn(`⚠️ Erro ao buscar ${ano}/${mes}:`, error.message);
            return { mes, dados: null };
          })
      );
    }

    const resultados = await Promise.all(promises);

    const cards = resultados
      .filter(r => r.dados && r.dados.metricas)
      .map(r => {
        const { metricas } = r.dados;
        const mesNome = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 
                        'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'][r.mes - 1];
        const anoAbrev = String(ano).slice(-2);

        return {
          mesAno: `${mesNome}/${anoAbrev}`,
          mes: r.mes,
          ano: ano,
          utilizacaoPercent: parseFloat((metricas.utilizacao || 0).toFixed(1)),
          produtivas: Math.round(metricas.horasProdutivas || 0),
          sucessoPercent: parseFloat((metricas.taxaSucesso || 0).toFixed(1)),
          jobsFinalizados: metricas.jobsFinalizados || 0,
          jobsAbortados: metricas.jobsAbortados || 0
        };
      });

    return cards;
  };

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        metricas,
        evolucao,
        anual,
        mensalDetalhada,
        producao,
        prototipos,
        erros,
        peso,
        failed,
        aborted,
        kg,
        capacidade,
        equipamentos,
        kgPorImpressora,
        capacidadePorImpressora,
        producaoPorImpressoraAnual,
        prototiposPorImpressoraAnual,
        errosPorImpressoraAnual,
        pesoPorImpressoraAnual,
        failedPorImpressoraAnual,
        abortedPorImpressoraAnual,
      ] = await Promise.all([
        dashboardAPI.getMetricasKPI({
          ano: anoSelecionado,
          mesInicio: 1,
          mesFim: 12,
        }),
        dashboardAPI.getEvolucaoSKUs({
          anoInicio: anoSelecionado - 1,
          mesInicio: 6,
          anoFim: anoSelecionado,
          mesFim: 12,
        }),
        dashboardAPI.getProducaoAnual({
          anoInicio: 2019,
          anoFim: anoSelecionado,
        }),
        dashboardAPI.getProducaoMensalDetalhada({
          ano: anoSelecionado,
          mesInicio: 1,
          mesFim: 12,
        }),
        dashboardAPI.getProducaoMensal({
          ano: anoSelecionado,
          mesInicio: 1,
          mesFim: 12,
        }),
        dashboardAPI.getPrototiposMensal({
          ano: anoSelecionado,
          mesInicio: 1,
          mesFim: 12,
        }),
        dashboardAPI.getErrosMensal({
          ano: anoSelecionado,
          mesInicio: 1,
          mesFim: 12,
        }),
        dashboardAPI.getPesoMensal({
          ano: anoSelecionado,
          mesInicio: 1,
          mesFim: 12,
        }),
        dashboardAPI.getFailedMensal({
          ano: anoSelecionado,
          mesInicio: 1,
          mesFim: 12,
        }),
        dashboardAPI.getAbortedMensal({
          ano: anoSelecionado,
          mesInicio: 1,
          mesFim: 12,
        }),
        dashboardAPI.getCardsKg({
          ano: anoSelecionado,
          mesInicio: 1,
          mesFim: 12,
        }),
        carregarCardsCapacidadeConsolidados(anoSelecionado),
        dashboardAPI.getEquipamentos(),
        dashboardAPI.getCardsKgPorImpressora({
          ano: anoSelecionado,
          mes: mesSelecionado,
        }),
        dashboardAPI.getCardsCapacidadePorImpressora({
          ano: anoSelecionado,
          mes: mesSelecionado,
        }),
        dashboardAPI.getProducaoPorImpressoraAnual({
          ano: anoSelecionado,
          mesInicio: 1,
          mesFim: 12,
        }),
        dashboardAPI.getPrototiposPorImpressoraAnual({
          ano: anoSelecionado,
          mesInicio: 1,
          mesFim: 12,
        }),
        dashboardAPI.getErrosPorImpressoraAnual({
          ano: anoSelecionado,
          mesInicio: 1,
          mesFim: 12,
        }),
        dashboardAPI.getPesoPorImpressoraAnual({
          ano: anoSelecionado,
          mesInicio: 1,
          mesFim: 12,
        }),
        dashboardAPI.getFailedPorImpressoraAnual({
          ano: anoSelecionado,
          mesInicio: 1,
          mesFim: 12,
        }),
        dashboardAPI.getAbortedPorImpressoraAnual({
          ano: anoSelecionado,
          mesInicio: 1,
          mesFim: 12,
        }),
      ]);

      setDados({
        metricas: metricas.data,
        evolucaoSKUs: evolucao.data,
        producaoAnual: anual.data,
        producaoMensal: mensalDetalhada.data,
        visaoGeral: {
          producao: producao.data,
          prototipos: prototipos.data,
          erros: erros.data,
          peso: peso.data,
          failed: failed.data,
          aborted: aborted.data,
        },
        cardsKg: kg.data,
        cardsCapacidade: capacidade,
        equipamentos: equipamentos.data,
        cardsKgPorImpressora: kgPorImpressora.data,
        cardsCapacidadePorImpressora: capacidadePorImpressora.data,
        producaoPorImpressoraAnual: producaoPorImpressoraAnual.data,
        prototiposPorImpressoraAnual: prototiposPorImpressoraAnual.data,
        errosPorImpressoraAnual: errosPorImpressoraAnual.data,
        pesoPorImpressoraAnual: pesoPorImpressoraAnual.data,
        failedPorImpressoraAnual: failedPorImpressoraAnual.data,
        abortedPorImpressoraAnual: abortedPorImpressoraAnual.data,
      });
    } catch (err) {
      console.error("❌ Erro ao carregar dados:", err);
      setError("Erro ao carregar os dados. Verifique a API.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ CLASSES DINÂMICAS
  const bgClass = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const textPrimaryClass = darkMode ? 'text-gray-100' : 'text-gray-900';
  const textSecondaryClass = darkMode ? 'text-gray-400' : 'text-gray-500';

  if (loading) {
    return (
      <div className={`min-h-screen ${bgClass} flex items-center justify-center transition-colors duration-300`}>
        <div className="text-center">
          <div className="relative mx-auto mb-6 w-20 h-20">
            <div className={`absolute inset-0 border-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-full`} />
            <div className="absolute inset-0 border-4 border-[#F2294E] rounded-full border-t-transparent animate-spin" />
          </div>
          <p className={`${textPrimaryClass} text-lg font-semibold mb-2`}>
            Carregando dados de {anoSelecionado}...
          </p>
          <p className={`text-sm ${textSecondaryClass}`}>
            Buscando 12 meses do endpoint consolidado...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${bgClass} flex items-center justify-center transition-colors duration-300`}>
        <div className="text-center">
          <div className={`w-20 h-20 ${darkMode ? 'bg-red-900/50' : 'bg-red-100'} rounded-full flex items-center justify-center mx-auto mb-6`}>
            <span className="text-4xl">⚠️</span>
          </div>
          <p className={`font-bold text-xl mb-2 ${textPrimaryClass}`}>Erro ao carregar dashboard</p>
          <p className={`${textSecondaryClass} mb-6`}>{error}</p>
          <button
            onClick={carregarDados}
            className="bg-[#F2294E] hover:bg-[#FF6A00] text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass} py-8 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className={`text-4xl font-bold ${textPrimaryClass} flex items-center gap-3`}>
              <div className="w-12 h-12 rounded-2xl bg-[#F2294E] flex items-center justify-center shadow-lg">
                <span className="text-2xl">📊</span>
              </div>
              Dashboard de Produção 3D
            </h1>
            <p className={`text-sm ${textSecondaryClass} mt-2 ml-15`}>
              Visualizando dados de {anoSelecionado}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* DARK MODE TOGGLE */}
            <button
              onClick={toggleDarkMode}
              className={`relative w-16 h-8 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#57F2F2] focus:ring-offset-2 ${
                darkMode ? 'bg-[#022840]' : 'bg-gray-300'
              }`}
              aria-label="Toggle dark mode"
              title={darkMode ? 'Modo claro' : 'Modo escuro'}
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform duration-300 flex items-center justify-center shadow-md ${
                  darkMode ? 'translate-x-8' : 'translate-x-0'
                }`}
              >
                {darkMode ? (
                  <Moon className="w-4 h-4 text-[#022840]" />
                ) : (
                  <Sun className="w-4 h-4 text-[#FF6A00]" />
                )}
              </div>
            </button>

            {/* SELETOR DE ANO */}
            <div className="flex items-center gap-3">
              <label htmlFor="ano-select" className={`text-sm font-semibold ${textPrimaryClass}`}>
                Ano:
              </label>
              <select
                id="ano-select"
                value={anoSelecionado}
                onChange={(e) => setAnoSelecionado(Number(e.target.value))}
                className={`border-2 ${
                  darkMode ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-900'
                } rounded-xl px-5 py-2.5 text-sm font-semibold hover:border-[#57F2F2] focus:outline-none focus:ring-2 focus:ring-[#57F2F2] focus:border-transparent transition-all`}
              >
                {anosDisponiveis.map((ano) => (
                  <option key={ano} value={ano}>
                    {ano}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* COMPONENTES */}
        {dados.metricas && <MetricasKPI data={dados.metricas} darkMode={darkMode} />}
        {dados.metricas && <ComposicaoSKUs data={dados.metricas} darkMode={darkMode} />}
        {dados.evolucaoSKUs.length > 0 && (
          <EvolucaoSKUs data={dados.evolucaoSKUs} darkMode={darkMode} />
        )}
        {dados.producaoAnual.length > 0 && (
          <ProducaoAnual data={dados.producaoAnual} darkMode={darkMode} />
        )}

        {dados.visaoGeral.producao.length > 0 && (
          <VisaoGeralTabsComModal
            producao={dados.visaoGeral.producao}
            prototipos={dados.visaoGeral.prototipos}
            failed={dados.visaoGeral.failed}
            aborted={dados.visaoGeral.aborted}
            producaoPorImpressora={dados.producaoPorImpressoraAnual}
            prototiposPorImpressora={dados.prototiposPorImpressoraAnual}
            failedPorImpressora={dados.failedPorImpressoraAnual}
            abortedPorImpressora={dados.abortedPorImpressoraAnual}
            anoSelecionado={String(anoSelecionado)}
            onDadosCalculados={setDadosGeraisTabela}
            darkMode={darkMode}
          />
        )}

        {dadosGeraisTabela.length > 0 && (
          <TabelaProducaoMensal
            dadosGerais={dadosGeraisTabela}
            anoSelecionado={String(anoSelecionado)}
            darkMode={darkMode}
          />
        )}

        {/* ✅ CARDS KG COM DARK MODE */}
        {dados.cardsKg.length > 0 && (
          <CardsKgComModal
            data={dados.cardsKg}
            dadosPorImpressora={dados.cardsKgPorImpressora}
            darkMode={darkMode}
          />
        )}

        {/* ✅ CARDS CAPACIDADE COM DARK MODE */}
        {dados.cardsCapacidade.length > 0 && (
          <CardsCapacidadeTimeline
            data={dados.cardsCapacidade}
            darkMode={darkMode}
          />
        )}

        {dados.equipamentos.length > 0 && (
          <Equipamentos data={dados.equipamentos} darkMode={darkMode} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;