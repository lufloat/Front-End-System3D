import React from 'react';

const DistribuicaoTempo = ({ distribuicao }) => {
  if (!distribuicao) return null;

  // ✅ VERIFICA SE SOMA 100%
  const total = distribuicao.totalTaxas;
  const isValid = Math.abs(total - 100) < 0.1;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-bold text-gray-900">
          📈 Distribuição do Tempo no Mês
        </h4>
        <div className="flex items-center gap-2">
          <div className={`text-sm font-semibold ${isValid ? 'text-green-600' : 'text-red-600'}`}>
            Total: {total.toFixed(2)}%
          </div>
          {isValid && (
            <span className="text-green-600">✓</span>
          )}
        </div>
      </div>

      {/* BARRA VISUAL HORIZONTAL */}
      <div className="mb-6">
        <div className="flex w-full h-12 rounded-lg overflow-hidden shadow-md">
          {/* PRODUÇÃO */}
          {distribuicao.producao.taxa > 0 && (
            <div
              className="bg-green-500 flex items-center justify-center text-white text-xs font-bold transition-all hover:opacity-80"
              style={{ width: `${distribuicao.producao.taxa}%` }}
              title={`Produção: ${distribuicao.producao.taxa.toFixed(2)}%`}
            >
              {distribuicao.producao.taxa >= 5 && `${distribuicao.producao.taxa.toFixed(0)}%`}
            </div>
          )}

          {/* PAUSAS */}
          {distribuicao.pausas.taxa > 0 && (
            <div
              className="bg-yellow-500 flex items-center justify-center text-white text-xs font-bold transition-all hover:opacity-80"
              style={{ width: `${distribuicao.pausas.taxa}%` }}
              title={`Pausas: ${distribuicao.pausas.taxa.toFixed(2)}%`}
            >
              {distribuicao.pausas.taxa >= 5 && `${distribuicao.pausas.taxa.toFixed(0)}%`}
            </div>
          )}

          {/* OCIOSIDADE */}
          {distribuicao.ociosidade.taxa > 0 && (
            <div
              className="bg-red-500 flex items-center justify-center text-white text-xs font-bold transition-all hover:opacity-80"
              style={{ width: `${distribuicao.ociosidade.taxa}%` }}
              title={`Ociosidade: ${distribuicao.ociosidade.taxa.toFixed(2)}%`}
            >
              {distribuicao.ociosidade.taxa >= 5 && `${distribuicao.ociosidade.taxa.toFixed(0)}%`}
            </div>
          )}

          {/* ESPERA OPERADOR */}
          {distribuicao.esperaOperador.taxa > 0 && (
            <div
              className="bg-orange-500 flex items-center justify-center text-white text-xs font-bold transition-all hover:opacity-80"
              style={{ width: `${distribuicao.esperaOperador.taxa}%` }}
              title={`Espera Operador: ${distribuicao.esperaOperador.taxa.toFixed(2)}%`}
            >
              {distribuicao.esperaOperador.taxa >= 5 && `${distribuicao.esperaOperador.taxa.toFixed(0)}%`}
            </div>
          )}

          {/* MANUTENÇÃO */}
          {distribuicao.manutencao.taxa > 0 && (
            <div
              className="bg-blue-500 flex items-center justify-center text-white text-xs font-bold transition-all hover:opacity-80"
              style={{ width: `${distribuicao.manutencao.taxa}%` }}
              title={`Manutenção: ${distribuicao.manutencao.taxa.toFixed(2)}%`}
            >
              {distribuicao.manutencao.taxa >= 5 && `${distribuicao.manutencao.taxa.toFixed(0)}%`}
            </div>
          )}
        </div>
      </div>

      {/* CARDS DETALHADOS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* PRODUÇÃO */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs font-semibold text-green-900">Produção</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {distribuicao.producao.taxa.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {distribuicao.producao.horas}h
          </div>
        </div>

        {/* PAUSAS */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-xs font-semibold text-yellow-900">Pausas</span>
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            {distribuicao.pausas.taxa.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {distribuicao.pausas.horas}h
          </div>
        </div>

        {/* OCIOSIDADE */}
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs font-semibold text-red-900">Ociosidade</span>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {distribuicao.ociosidade.taxa.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {distribuicao.ociosidade.horas}h
          </div>
        </div>

        {/* ESPERA OPERADOR */}
        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-xs font-semibold text-orange-900">Espera</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {distribuicao.esperaOperador.taxa.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {distribuicao.esperaOperador.horas}h
          </div>
        </div>

        {/* MANUTENÇÃO */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-xs font-semibold text-blue-900">Manutenção</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {distribuicao.manutencao.taxa.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {distribuicao.manutencao.horas}h
          </div>
        </div>
      </div>

      {/* ALERTA SE NÃO SOMA 100% */}
      {!isValid && (
        <div className="mt-4 bg-yellow-50 border border-yellow-300 rounded p-3 text-sm text-yellow-800">
          ⚠️ Atenção: A soma das taxas está em {total.toFixed(2)}% (esperado: 100%)
        </div>
      )}
    </div>
  );
};

export default DistribuicaoTempo;