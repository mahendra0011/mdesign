import { createContext, useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api.js';
import { disconnectSocket } from '../lib/socket.js';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      return data.user;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    refreshMe().finally(() => setLoading(false));
  }, [refreshMe]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('mdesign_token', data.accessToken);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password, otp) => {
    const { data } = await api.post('/auth/register', { name, email, password, otp });
    localStorage.setItem('mdesign_token', data.accessToken);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore */
    }
    localStorage.removeItem('mdesign_token');
    disconnectSocket();
    setUser(null);
  };

  const token = localStorage.getItem('mdesign_token') || null;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };