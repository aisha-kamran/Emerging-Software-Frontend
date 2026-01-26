import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_super_admin: boolean;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // 👇 Change 1: localStorage -> sessionStorage
      const token = sessionStorage.getItem('token');
      const savedUser = sessionStorage.getItem('user_data');
      
      if (token && savedUser) {
        try {
            setUser(JSON.parse(savedUser));
        } catch (error) {
            logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { access_token } = await api.login(email, password);
      
      // 👇 Change 2: localStorage -> sessionStorage
      sessionStorage.setItem('token', access_token);

      const admins = await api.fetchAdmins();
      const currentUser = admins.find((u: any) => u.email === email);

      if (!currentUser) {
        throw new Error('User details missing');
      }

      const userData: User = {
        id: currentUser.id,
        email: currentUser.email,
        full_name: currentUser.full_name,
        is_super_admin: currentUser.is_super_admin,
        token: access_token
      };

      // 👇 Change 3: localStorage -> sessionStorage
      sessionStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
      return true;

    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    // 👇 Change 4: localStorage -> sessionStorage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user_data');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout,
      isSuperAdmin: user?.is_super_admin || false 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};