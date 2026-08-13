import axios from 'axios';

export const api = axios.create({ baseURL: '/api', withCredentials: true });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mdesign_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && !original.url.includes('/auth/')) {
      original._retry = true;
      refreshing =
        refreshing ||
        axios
          .post('/api/auth/refresh', {}, { withCredentials: true })
          .then(({ data }) => {
            localStorage.setItem('mdesign_token', data.accessToken);
          })
          .finally(() => {
            refreshing = null;
          });
      try {
        await refreshing;
        return api(original);
      } catch {
        localStorage.removeItem('mdesign_token');
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export function errorMsg(err) {
  return err?.response?.data?.error || err?.message || 'Something went wrong';
}