import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const response = await api.get('/api/me');
        if (response.status === 200) {
          setUser(response.data);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMe();
  }, []);

  const login = async (email, password, role) => {
    const response = await api.post('/login', { email, password, role });
    // Fetch full user data upon successful login
    const meResponse = await api.get('/api/me');
    setUser(meResponse.data);
    return response.data;
  };

  const logout = async () => {
    try {
      await api.get('/logout');
    } catch (error) {
      console.error(error);
    } finally {
      setUser(null);
      navigate('/login');
    }
  };

  const value = {
    user,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
