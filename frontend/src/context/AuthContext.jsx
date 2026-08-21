import { React, createContext, useCallback, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = 'https://expense-tracker-backend-sz4u.onrender.com/api';

const API_URL = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistAuth = useCallback((userData, authToken, remember = false) => {
    clearAuth();

    const storage = remember ? localStorage : sessionStorage;

    storage.setItem('token', authToken);
    storage.setItem('user', JSON.stringify(userData));

    setUser(userData);
    setToken(authToken);
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');

    setUser(null);
    setToken(null);
  }, []);

  const login = useCallback(
    async (userData, authToken, remember = false) => {
      persistAuth(userData, authToken, remember);
    },
    [persistAuth],
  );

  const signup = useCallback(
    async (userData, authToken, remember = true) => {
      persistAuth(userData, authToken, remember);
    },
    [persistAuth],
  );

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);

    const activeStorage = localStorage.getItem('token')
      ? localStorage
      : sessionStorage;

    activeStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const localToken = localStorage.getItem('token');
        const sessionToken = sessionStorage.getItem('token');

        const storedToken = localToken || sessionToken;
        const remember = Boolean(localToken);

        if (!storedToken) {
          clearAuth();
          return;
        }

        const response = await axios.get(`${API_URL}/user/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        const userData = response.data.user || response.data;

        persistAuth(userData, storedToken, remember);
      } catch (error) {
        console.warn(
          'Authentication verification failed:',
          error.response?.data?.message || error.message,
        );

        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAuth();
  }, [clearAuth, persistAuth]);

  const value = {
    user,
    token,
    isLoading,
    login,
    signup,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
