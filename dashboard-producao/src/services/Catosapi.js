import axios from 'axios';

const CATOS_API_URL = import.meta.env.VITE_CATOS_API_URL || '';

const catosApi = axios.create({
  baseURL: CATOS_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

catosApi.interceptors.response.use(
  response => response,
  error => {
    console.warn('⚠️ Catos API indisponível:', error.message);
    return Promise.reject(error);
  }
);

export const catosAPI = {
  getMonthlyTotals: () =>
    catosApi.get('/catos/api/v1/metrics/system/monthly-totals'),
};

export default catosApi;