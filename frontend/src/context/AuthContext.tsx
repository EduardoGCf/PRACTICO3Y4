import React, {
  createContext,
  useState,
  useEffect,
  type ReactNode,
  useContext,
} from 'react';
import {
  getCurrentUser,
  login as loginService,
  register as registerService,
  logout as logoutService,
} from '../api/authService';
import type { Usuario } from '../types/models';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import Cookies from 'js-cookie';

interface AuthContextProps {
  user: Usuario | null;
  loading: boolean;
  loginUser: (username: string, password: string) => Promise<void>;
  registerUser: (username: string, email: string, password: string, password2: string) => Promise<void>;
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  const clearSession = () => {
    setUser(null);
    localStorage.removeItem('user');
    

    Cookies.remove('sessionid', { path: '/' });
    Cookies.remove('csrftoken', { path: '/' });
    Cookies.remove('sessionid', { path: '/', domain: 'localhost' });
    Cookies.remove('csrftoken', { path: '/', domain: 'localhost' });
  };

  useEffect(() => {
    (async () => {
      try {
        const userLS = localStorage.getItem('user');
        if (userLS) {
          setUser(JSON.parse(userLS));
        } else {
          await api.get('/auth/csrf/');
          const u = await getCurrentUser();
          setUser(u);
          localStorage.setItem('user', JSON.stringify(u));
        }
      } catch (error) {
        console.log('Error al obtener usuario:', error);
        clearSession();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loginUser = async (username: string, password: string) => {
    try {
      await api.get('/auth/csrf/');
      await loginService({ username, password });
      const u = await getCurrentUser();
      setUser(u);
      localStorage.setItem('user', JSON.stringify(u));
      navigate('/');
    } catch (error) {
      console.log('Error en login:', error);
      clearSession();
      throw error;
    }
  };

  const registerUser = async (username: string, email: string, password: string, password2: string) => {
    await registerService({ username, email, password, password2 });
    navigate('/login');
  };

  const logoutUser = async () => {
    try {
      await logoutService();
      clearSession();
      navigate('/');
    } catch (error) {
      console.log('Error en logout, limpiando sesión de todas formas:', error);
      clearSession();
      navigate('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, registerUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}