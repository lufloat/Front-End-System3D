import React from 'react';
import { Printer } from 'lucide-react';

const CardsPorImpressora = ({ tipo, data }) => {
  const isKg = tipo === 'kg';

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        {isKg ? 'Material por Impressora (Kg)' : 'Capacidade por Impressora'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((card, index) => (
          <div
            key={index}
            className={`rounded-lg border-2 p-6 ${
              isKg ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-900">
                  {card.nomeImpressora}
                </span>
              </div>
              <span className="text-xs text-gray-500">ID: {card.machineId}</span>
            </div>

            {/* Conteúdo */}
            {isKg ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Produção</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {card.producaoKg}kg
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Protótipo</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {card.prototipoKg}kg
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Erros</span>
                  <span className="text-sm font-semibold text-red-600">
                    {card.errosKg}kg
                  </span>
                </div>

                <div className="pt-3 border-t border-green-300">
                  <div className="bg-green-500 text-white rounded-lg py-2 px-4 text-center font-bold">
                    {card.totalKg}kg
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-500 text-white rounded-lg py-3 px-4 text-center">
                  <div className="text-2xl font-bold">{card.utilizacaoPercent}%</div>
                  <div className="text-xs mt-1">Utilização</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg py-3 px-4 text-center border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">Produtivas</div>
                    <div className="text-lg font-bold text-gray-900">
                      {card.horasProdutivas}h
                    </div>
                  </div>

                  <div className="bg-white rounded-lg py-3 px-4 text-center border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">Sucesso</div>
                    <div className="text-lg font-bold text-gray-900">
                      {card.taxaSucessoPercent}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardsPorImpressora;