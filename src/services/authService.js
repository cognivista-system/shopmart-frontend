import api, { setTokens, clearTokens } from './api';
import { STORAGE, ROLES } from '../utils/constants';

const persistUser = (user) => localStorage.setItem(STORAGE.USER, JSON.stringify(user));
export const getStoredUser = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE.USER)); } catch { return null; }
};

export const authService = {
  async login(credentials) {
    try {
      const { data } = await api.post('/auth/login', credentials);
      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      const user = data.user || { email: credentials.email, name: credentials.email.split('@')[0], role: ROLES.CUSTOMER };
      persistUser(user);
      return { user, tokens: data };
    } catch (err) {
      if (err?.response) throw err;
      // Demo fallback: allow exploring the authenticated UI without a backend.
      const email = credentials.email.toLowerCase();
      const role = email.startsWith('superadmin') ? ROLES.SUPER_ADMIN
        : email.startsWith('admin') ? ROLES.ADMIN
          : ROLES.CUSTOMER;
      const labels = { [ROLES.SUPER_ADMIN]: 'Super Admin', [ROLES.ADMIN]: 'Admin', [ROLES.CUSTOMER]: credentials.email.split('@')[0] };
      const user = {
        id: 1, name: labels[role],
        email: credentials.email, role,
      };
      setTokens({ accessToken: 'demo.token', refreshToken: 'demo.refresh' });
      persistUser(user);
      return { user, tokens: { accessToken: 'demo.token' }, demo: true };
    }
  },

  async register(payload) {
    const { data } = await api.post('/auth/register', payload);
    return data;
  },

  async verifyOtp(payload) {
    const { data } = await api.post('/auth/verify-otp', payload);
    if (data.accessToken) setTokens(data);
    if (data.user) persistUser(data.user);
    return data;
  },

  async resendOtp(email) {
    const { data } = await api.post('/auth/resend-otp', { email });
    return data;
  },

  async me() {
    const { data } = await api.get('/auth/me');
    persistUser(data);
    return data;
  },

  logout() {
    api.post('/auth/logout').catch(() => {});
    clearTokens();
  },
};
