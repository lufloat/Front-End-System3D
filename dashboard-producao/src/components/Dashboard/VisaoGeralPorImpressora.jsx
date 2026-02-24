import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const VisaoGeralPorImpressora = ({ tipo, data }) => {
  const getTitulo = () => {
    switch (tipo) {
      case 'producao':
        return 'Produção por Impressora';
      case 'prototipos':
        return 'Protótipos por Impressora';
      case 'erros':
        return 'Erros por Impressora';
      case 'peso':
        return 'Material Consumido por Impressora (Kg)';
      default:
        return 'Dados por Impressora';
    }
  };

  const getCor = () => {
    switch (tipo) {
      case 'producao':
        return 'rgb(59, 130, 246)'; // azul
      case 'prototipos':
        return 'rgb(168, 85, 247)'; // roxo
      case 'erros':
        return 'rgb(239, 68, 68)'; // vermelho
      case 'peso':
        return 'rgb(34, 197, 94)'; // verde
      default:
        return 'rgb(107, 114, 128)'; // cinza
    }
  };

  // Agrupa dados por impressora
  const dadosAgrupados = data.reduce((acc, item) => {
    const existing = acc.find(x => x.nomeImpressora === item.nomeImpressora);
    if (existing) {
      existing.valor += item.valor;
    } else {
      acc.push({
        nomeImpressora: item.nomeImpressora,
        valor: item.valor,
      });
    }
    return acc;
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{getTitulo()}</h3>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={dadosAgrupados}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(229, 231, 235)" />
          <XAxis
            dataKey="nomeImpressora"
            tick={{ fontSize: 11, fill: 'rgb(107, 114, 128)' }}
            stroke="rgb(156, 163, 175)"
            angle={-15}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'rgb(107, 114, 128)' }}
            stroke="rgb(156, 163, 175)"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid rgb(229, 231, 235)',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar dataKey="valor" fill={getCor()} name="Valor" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VisaoGeralPorImpressora;