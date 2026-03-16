import axios from 'axios';

const catosApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // ✅ mesmo proxy do api.js
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
  // ✅ sem /api/v1/ aqui — já está no baseURL via proxy
  getMonthlyTotals: () =>
    catosApi.get('/metrics/system/monthly-totals'),
};

export default catosApi;