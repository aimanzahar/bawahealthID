import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { convex } from '../convex/client';
// FIX: Import from the correct Convex-generated API file
import { api } from '../../convex/_generated/api';

interface User {
  _id: string;
  email: string;
  name?: string;
  phoneNumber?: string;
  nricNumber?: string;
  myDigitalIdVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('[AuthContext] Checking auth status...');
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        console.log('[AuthContext] Found stored userId:', userId);
        const userData = await convex.query(api.auth.getUser, { userId: userId as any });
        console.log('[AuthContext] Retrieved user data:', !!userData);
        setUser(userData);
      }
    } catch (error) {
      console.error('[AuthContext] Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('[AuthContext] Attempting login for:', email);
      const userId = await convex.mutation(api.auth.signIn, { email, password });
      console.log('[AuthContext] Login successful, userId:', userId);
      const userData = await convex.query(api.auth.getUser, { userId: userId as any });

      await AsyncStorage.setItem('userId', userId);
      setUser(userData);
      console.log('[AuthContext] User state updated after login');
    } catch (error: any) {
      console.error('[AuthContext] Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (email: string, password: string, name?: string): Promise<User> => {
    console.log('[AuthContext] register() called with email:', email, 'name:', name);
    try {
      console.log('[AuthContext] Calling Convex signUp mutation...');
      const userId = await convex.mutation(api.auth.signUp, { email, password, name });
      console.log('[AuthContext] Convex signUp mutation completed, userId:', userId);
      
      console.log('[AuthContext] Fetching user data from Convex...');
      const userData = await convex.query(api.auth.getUser, { userId: userId as any });
      console.log('[AuthContext] User data retrieved:', userData ? `{ _id: ${userData._id}, email: ${userData.email} }` : 'null');

      if (!userData) {
        console.error('[AuthContext] User data is null after registration');
        throw new Error('Failed to retrieve user data after registration');
      }

      console.log('[AuthContext] Storing userId in AsyncStorage...');
      await AsyncStorage.setItem('userId', userId);
      console.log('[AuthContext] AsyncStorage updated successfully');
      
      console.log('[AuthContext] Updating user state...');
      setUser(userData);
      console.log('[AuthContext] User state updated after registration, returning userData');
      
      return userData;
    } catch (error: any) {
      console.error('[AuthContext] Registration failed with error:', error.message);
      console.error('[AuthContext] Full error object:', error);
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = async () => {
    console.log('[AuthContext] Logging out');
    await AsyncStorage.removeItem('userId');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};