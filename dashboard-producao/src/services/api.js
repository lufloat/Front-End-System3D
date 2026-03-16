import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  },
  timeout: 60000,
});

api.interceptors.response.use(
  response => response,
  error => {
    console.error('❌ Erro na API:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response?.status === 401) {
      console.error('Não autorizado');
    } else if (error.response?.status === 500) {
      console.error('Erro interno do servidor');
    }

    return Promise.reject(error);
  }
);

api.interceptors.request.use(
  config => {
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.params);
    return config;
  },
  error => Promise.reject(error)
);

export const dashboardAPI = {
  // ==========================================
  // KPIs e SKUs
  // ==========================================
  getMetricasKPI: (params = {}) =>
    api.get('/Dashboard/kpis', { params }),

  getEvolucaoSKUs: (params = {}) =>
    api.get('/Dashboard/evolucao-skus', { params }),

  // ==========================================
  // Produção Geral
  // ==========================================
  getProducaoAnual: (params = {}) =>
    api.get('/Producao/anual', { params }),

  getProducaoMensalDetalhada: (params = {}) =>
    api.get('/Producao/mensal', { params }),

  getEquipamentos: () =>
    api.get('/Producao/equipamentos'),

  // ==========================================
  // Visão Geral - Mensal
  // ==========================================
  getProducaoMensal: (params = {}) =>
    api.get('/Dashboard/visao-geral/producao', { params }),

  getPrototiposMensal: (params = {}) =>
    api.get('/Dashboard/visao-geral/prototipos', { params }),

  getErrosMensal: (params = {}) =>
    api.get('/Dashboard/visao-geral/erros', { params }),

  getPesoMensal: (params = {}) =>
    api.get('/Dashboard/visao-geral/peso', { params }),

  getFailedMensal: (params = {}) =>
    api.get('/Dashboard/visao-geral/failed', { params }),

  getAbortedMensal: (params = {}) =>
    api.get('/Dashboard/visao-geral/aborted', { params }),

  // ==========================================
  // Visão Geral - Por Impressora (Anual)
  // ==========================================
  getProducaoPorImpressoraAnual: (params = {}) =>
    api.get('/Dashboard/visao-geral/producao/impressora/anual', { params }),

  getPrototiposPorImpressoraAnual: (params = {}) =>
    api.get('/Dashboard/visao-geral/prototipos/impressora/anual', { params }),

  getErrosPorImpressoraAnual: (params = {}) =>
    api.get('/Dashboard/visao-geral/erros/impressora/anual', { params }),

  getPesoPorImpressoraAnual: (params = {}) =>
    api.get('/Dashboard/visao-geral/peso/impressora/anual', { params }),

  getFailedPorImpressoraAnual: (params = {}) =>
    api.get('/Dashboard/visao-geral/failed/impressora/anual', { params }),

  getAbortedPorImpressoraAnual: (params = {}) =>
    api.get('/Dashboard/visao-geral/aborted/impressora/anual', { params }),

  // ==========================================
  // Cards - KG
  // ==========================================
  getCardsKg: (params = {}) =>
    api.get('/Dashboard/cards/kg', { params }),

  getCardsKgPorImpressora: (params = {}) =>
    api.get('/Dashboard/cards/kg/impressora', { params }),

  getCardsCapacidadePorImpressora: (params = {}) =>
    api.get('/Dashboard/cards/capacidade/impressora', { params }),

  // ==========================================
  // Timeline
  // ==========================================
  obterResumoMensalConsolidado: (ano, mes) =>
    api.get('/Dashboard/timeline/mes-consolidado', {
      params: { ano, mes },
      timeout: 120000,
    }),

  obterResumoMensalImpressora: (machineId, ano, mes) =>
    api.get(`/Dashboard/timeline/mes-impressora/${machineId}`, {
      params: { ano, mes },
      timeout: 90000,
    }),

  obterResumoDiario: (machineId, data) =>
    api.get(`/Dashboard/timeline/dia/${machineId}`, {
      params: { data },
      timeout: 30000,
    }),

  // ==========================================
  // Métricas do Sistema (API do Gabriel - novos)
  // ==========================================

  // Totais mensais globais: mesas, componentes, sku_ticket, sku_estimated, componentes_prototipo
  // GET /metrics/system/monthly-totals?year=2026&month=3
  getMonthlyTotals: (params = {}) =>
    api.get('/metrics/system/monthly-totals', { params }),

  // SKUs/componentes produzidos em um período
  // GET /metrics/system/produced-items-period?tipo=sku&data_inicio=2026-01-01&data_fim=2026-03-31
  getProducedItemsPeriod: (params = {}) =>
    api.get('/metrics/system/produced-items-period', { params }),

  // Tempos mensais por impressora: printing, paused, idle, waiting_cleaning (em horas e segundos)
  // GET /metrics/system/printer-times-monthly?year=2026&month=3
  getPrinterTimesMonthly: (params = {}) =>
    api.get('/metrics/system/printer-times-monthly', { params }),

  // Material usado e perdido por mês, impressora e material (em gramas e kg)
  // GET /metrics/system/material-usage-monthly?year=2026&month=3
  getMaterialUsageMonthly: (params = {}) =>
    api.get('/metrics/system/material-usage-monthly', { params }),

  // Taxa de sucesso mensal com breakdown por status (finished, failed, aborted, etc.)
  // GET /metrics/system/success-rate-monthly?year=2026&month=3
  getSuccessRateMonthly: (params = {}) =>
    api.get('/metrics/system/success-rate-monthly', { params }),
};

export default api;