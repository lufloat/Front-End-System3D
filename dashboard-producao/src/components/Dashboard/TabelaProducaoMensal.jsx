import React from 'react';
import { BarChart3 } from 'lucide-react';

/**
 * ✅ REDESIGN - Mesma pegada do CardsCapacidadeTimeline
 * Dark + Light mode, paleta azul/roxo, verde para produção
 */
const TabelaProducaoMensal = ({ dadosGerais = [], anoSelecionado = "2026", darkMode = false }) => {
  const formatNumber  = (num) => num?.toLocaleString('pt-BR') || '0';
  const formatPercent = (num) => num?.toFixed(2) || '0.00';

  const totais = {
    producao:  dadosGerais.reduce((s, r) => s + (r.producao  || 0), 0),
    prototipo: dadosGerais.reduce((s, r) => s + (r.prototipo || 0), 0),
    abortados: dadosGerais.reduce((s, r) => s + (r.abortados || 0), 0),
    perdidos:  dadosGerais.reduce((s, r) => s + (r.perdidos  || 0), 0),
    total:     dadosGerais.reduce((s, r) => s + (r.total     || 0), 0),
  };

  const percentualFalhasTotal    = totais.total > 0 ? (totais.perdidos  / totais.total) * 100 : 0;
  const percentualAbortadosTotal = totais.total > 0 ? (totais.abortados / totais.total) * 100 : 0;

  // ── tokens ──────────────────────────────────────────────────────────────
  const wrapBg      = darkMode ? 'bg-gray-800 border-gray-700'  : 'bg-white border-gray-200';
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-900';
  const textMuted   = darkMode ? 'text-gray-400' : 'text-gray-500';
  const thBg        = darkMode ? 'bg-gray-700/60' : 'bg-gray-50';
  const thText      = darkMode ? 'text-gray-400'  : 'text-gray-500';
  const rowHover    = darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50';
  const divider     = darkMode ? 'border-gray-700' : 'border-gray-100';
  const footBg      = darkMode ? 'bg-gray-700/40'  : 'bg-gradient-to-r from-blue-50 to-purple-50';
  const footBorder  = darkMode ? 'border-blue-500/40' : 'border-blue-400';

  return (
    <div className={`${wrapBg} border rounded-2xl shadow-sm p-6 mb-8`}>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className={`text-lg font-bold ${textPrimary}`}>
            Detalhamento Mensal — {anoSelecionado}
          </h3>
          <p className={`text-xs ${textMuted} mt-0.5`}>Resumo de produção por período</p>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto rounded-xl">
        <table className="min-w-full text-sm">
          <thead>
            <tr className={`${thBg} ${thText} uppercase tracking-wider text-xs`}>
              <th className="px-4 py-3 text-left font-semibold rounded-tl-xl">Mês</th>
              <th className="px-4 py-3 text-center font-semibold">Produção</th>
              <th className="px-4 py-3 text-center font-semibold">Mesas de protótipos</th>
              <th className="px-4 py-3 text-center font-semibold">Abortados</th>
              <th className="px-4 py-3 text-center font-semibold">Perdidos</th>
              <th className="px-4 py-3 text-center font-semibold">% Falhas</th>
              <th className="px-4 py-3 text-center font-semibold">% Abortados</th>
              <th className="px-4 py-3 text-center font-semibold rounded-tr-xl">Total</th>
            </tr>
          </thead>

          <tbody>
            {dadosGerais.map((row, index) => (
              <tr
                key={index}
                className={`border-b ${divider} last:border-0 ${rowHover} transition-colors duration-150`}
              >
                <td className={`px-4 py-3 font-semibold ${textPrimary}`}>{row.periodo}</td>

                <td className="px-4 py-3 text-center font-semibold text-green-500">
                  {formatNumber(row.producao)}
                </td>
                <td className="px-4 py-3 text-center font-semibold text-blue-500">
                  {formatNumber(row.prototipo)}
                </td>
                <td className="px-4 py-3 text-center font-semibold text-orange-500">
                  {formatNumber(row.abortados)}
                </td>
                <td className="px-4 py-3 text-center font-semibold text-red-500">
                  {formatNumber(row.perdidos)}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold 
                    ${darkMode ? 'bg-red-500/15 text-red-400' : 'bg-red-50 text-red-600'}`}>
                    {formatPercent(row.percentualFalhas)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold 
                    ${darkMode ? 'bg-orange-500/15 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
                    {formatPercent(row.percentualAbortados)}%
                  </span>
                </td>
                <td className={`px-4 py-3 text-center font-bold ${textPrimary}`}>
                  {formatNumber(row.total)}
                </td>
              </tr>
            ))}
          </tbody>

          {/* Footer total */}
          <tfoot>
            <tr className={`${footBg} border-t-2 ${footBorder} font-bold`}>
              <td className={`px-4 py-4 rounded-bl-xl font-bold ${textPrimary}`}>TOTAL</td>
              <td className="px-4 py-4 text-center text-green-500 font-bold">
                {formatNumber(totais.producao)}
              </td>
              <td className="px-4 py-4 text-center text-blue-500 font-bold">
                {formatNumber(totais.prototipo)}
              </td>
              <td className="px-4 py-4 text-center text-orange-500 font-bold">
                {formatNumber(totais.abortados)}
              </td>
              <td className="px-4 py-4 text-center text-red-500 font-bold">
                {formatNumber(totais.perdidos)}
              </td>
              <td className="px-4 py-4 text-center">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold
                  ${darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'}`}>
                  {formatPercent(percentualFalhasTotal)}%
                </span>
              </td>
              <td className="px-4 py-4 text-center">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold
                  ${darkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700'}`}>
                  {formatPercent(percentualAbortadosTotal)}%
                </span>
              </td>
              <td className={`px-4 py-4 text-center font-bold text-lg ${textPrimary} rounded-br-xl`}>
                {formatNumber(totais.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Legenda */}
      <div className={`mt-5 pt-4 border-t ${divider} flex flex-wrap gap-4 text-xs ${textMuted}`}>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
          <span>Produção — peças finalizadas com sucesso</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
          <span>Protótipo — testes e amostras</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
          <span>Abortados — jobs cancelados manualmente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
          <span>Perdidos — falhas de impressão</span>
        </div>
      </div>
    </div>
  );
};

export default TabelaProducaoMensal;