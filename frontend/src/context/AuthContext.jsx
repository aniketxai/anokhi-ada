import { useCallback, useEffect, useState } from 'react';
import { AuthContext } from './authContext';
import api from '../api';

const TOKEN_KEY = 'customerToken';
const USER_KEY = 'customerUser';

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [loading, setLoading] = useState(false);

  const persistSession = useCallback((nextToken, nextUser) => {
    if (nextToken) localStorage.setItem(TOKEN_KEY, nextToken);
    else localStorage.removeItem(TOKEN_KEY);

    if (nextUser) localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    else localStorage.removeItem(USER_KEY);

    setToken(nextToken || '');
    setUser(nextUser || null);
  }, []);

  const register = useCallback(async ({ name, email, phone, password }) => {
    setLoading(true);
    try {
      const data = await api.registerCustomer({ name, email, phone, password });
      persistSession(data.token, data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, [persistSession]);

  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    try {
      const data = await api.loginCustomer({ email, password });
      persistSession(data.token, data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, [persistSession]);

  const logout = useCallback(() => {
    persistSession('', null);
  }, [persistSession]);

  // Keep the profile fresh (e.g. name changes) whenever a token exists.
  useEffect(() => {
    if (!token) return;
    api.fetchMyProfile()
      .then((res) => {
        if (res?.data) {
          localStorage.setItem(USER_KEY, JSON.stringify(res.data));
          setUser(res.data);
        }
      })
      .catch(() => {
        // token expired/invalid — log out silently
        persistSession('', null);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        loading,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
