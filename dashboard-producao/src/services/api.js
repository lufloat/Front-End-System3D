import axios from 'axios';

 const API_BASE_URL = import.meta.env.VITE_API_URL 

const api = axios.create({
 baseURL: API_BASE_URL,
 headers: {
 'Content-Type': 'application/json',
 },
 timeout: 60000, // 60 segundos padrão
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
 message: error.message
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
 error => {
 return Promise.reject(error);
 }
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

 getRecondicionados: (params = {}) =>
 api.get('/Producao/recondicionados', { params }),

 getProducaoPlacas: (params = {}) =>
 api.get('/Producao/placas', { params }),

 getEquipamentos: () =>
 api.get('/Producao/equipamentos'),

 // ==========================================
 // Visão Geral - Mensal (CONSOLIDADO)
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
 // Visão Geral - Por Impressora (ANUAL)
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
 // Cards - KG e Capacidade (CONSOLIDADO)
 // ==========================================
 getCardsKg: (params = {}) =>
 api.get('/Dashboard/cards/kg', { params }),
 
 // ==========================================
 // Cards - Por Impressora (MÊS ESPECÍFICO)
 // ==========================================
 getCardsKgPorImpressora: (params = {}) =>
 api.get('/Dashboard/cards/kg/impressora', { params }),

 getCardsCapacidadePorImpressora: (params = {}) =>
 api.get('/Dashboard/cards/capacidade/impressora', { params }),

 // ==========================================
 // ✅ TIMELINE - NOVOS ENDPOINTS OTIMIZADOS
 // ==========================================

 /**
 * Obter resumo mensal consolidado (todas impressoras)
 * GET /api/dashboard/timeline/mes-consolidado?ano=2026&mes=1
 * Com cache de 30 minutos no backend
 */
 obterResumoMensalConsolidado: (ano, mes) => {
 return api.get('/Dashboard/timeline/mes-consolidado', {
 params: { ano, mes },
 timeout: 120000 // 2 minutos (cache backend reduz muito)
 });
 },

 /**
 * Obter resumo mensal de uma impressora específica
 * GET /api/dashboard/timeline/mes-impressora/{machineId}?ano=2026&mes=1
 */
 obterResumoMensalImpressora: (machineId, ano, mes) => {
 return api.get(`/Dashboard/timeline/mes-impressora/${machineId}`, {
 params: { ano, mes },
 timeout: 90000 // 90 segundos
 });
 },

 /**
 * Obter resumo de um dia específico
 * GET /api/dashboard/timeline/dia/{machineId}?data=2026-01-15
 */
 obterResumoDiario: (machineId, data) => {
 return api.get(`/Dashboard/timeline/dia/${machineId}`, {
 params: { data },
 timeout: 30000 // 30 segundos
 });
 },

 /**
 * Obter timeline horária de um dia (estilo Teams)
 * GET /api/dashboard/timeline/horaria/{machineId}?data=2026-01-15
 */
 obterTimelineHoraria: (machineId, data) => {
 return api.get(`/Dashboard/timeline/horaria/${machineId}`, {
 params: { data },
 timeout: 30000 // 30 segundos
 });
 },

 // ==========================================
 // ANÁLISE DE EVENTOS (ANTIGO - MANTIDO)
 // ==========================================
 analisarTodasImpressoras: (params = {}) =>
 api.get('/Dashboard/analise/todas-impressoras', {
 params,
 timeout: 120000 // 2 minutos
 }),

 analisarImpressora: (machineId, params = {}) =>
 api.get(`/Dashboard/analise/impressora/${machineId}`, {
 params,
 timeout: 90000
 }),

 obterEventosImpressora: (machineId, params = {}) =>
 api.get(`/Dashboard/eventos/impressora/${machineId}`, { params }),

 obterEventosJob: (jobUuid, params = {}) =>
 api.get(`/Dashboard/eventos/job/${jobUuid}`, { params }),

 // ==========================================
 // Sincronização
 // ==========================================
 sincronizarMes: (ano, mes) =>
 api.post(`/Sync/mes?ano=${ano}&mes=${mes}`),

 sincronizarPeriodo: (params) =>
 api.post('/Sync/periodo', null, { params }),

 sincronizarAno: (ano) =>
 api.post(`/Sync/ano?ano=${ano}`),

 sincronizarUltimosMeses: () =>
 api.post('/Sync/ultimos-meses'),
};

export default api;