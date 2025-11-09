
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// FIX: Import RTK Query hooks instead of the 'api' object for making API calls.
import { useLazyGetMeQuery, useLoginMutation, useRegisterMutation } from '../services/api';
import type { User, AuthContextType } from '../types';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // FIX: Use RTK Query hooks for API operations.
  const [triggerGetMe] = useLazyGetMeQuery();
  const [loginMutation] = useLoginMutation();
  const [registerMutation] = useRegisterMutation();

  const fetchUser = useCallback(async () => {
    if (token) {
      try {
        // FIX: Use the lazy query trigger to fetch user data.
        const { data: currentUser, isSuccess } = await triggerGetMe();
        if (isSuccess && currentUser) {
          setUser(currentUser);
        } else {
            throw new Error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Failed to fetch user', error);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        navigate('/');
      }
    }
    setLoading(false);
  }, [token, navigate, triggerGetMe]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    // FIX: Use the login mutation hook and unwrap the result.
    const { token, user } = await loginMutation({ email, password }).unwrap();
    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);
    navigate('/dashboard');
  };

  const register = async (name: string, email: string, password: string) => {
    // FIX: Use the register mutation hook.
    await registerMutation({ name, email, password }).unwrap();
    // After registration, user must be approved. They stay on the landing page,
    // and can now try to log in (which will show a pending approval message if they do).
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/');
  };

  const authContextValue: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token,
    login,
    register,
    logout,
    loading,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
