import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'business' | 'normal' | null;

interface User {
  id: string;
  email: string;
  role: UserRole;
  businessName?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole, businessName?: string) => Promise<boolean>;
  register: (email: string, password: string, role: UserRole, businessName?: string) => Promise<boolean>;
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('foodsaver_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string, role: UserRole, businessName?: string): Promise<boolean> => {
    // Mock authentication - in production, this would validate against a backend
    const users = JSON.parse(localStorage.getItem('foodsaver_users') || '[]');
    const existingUser = users.find((u: any) => u.email === email);
    
    if (existingUser && existingUser.password === password) {
      const loggedInUser = {
        id: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
        businessName: existingUser.businessName
      };
      setUser(loggedInUser);
      localStorage.setItem('foodsaver_user', JSON.stringify(loggedInUser));
      return true;
    }
    return false;
  };

  const register = async (email: string, password: string, role: UserRole, businessName?: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('foodsaver_users') || '[]');
    const existingUser = users.find((u: any) => u.email === email);
    
    if (existingUser) {
      return false;
    }

    const newUser = {
      id: crypto.randomUUID(),
      email,
      password,
      role,
      businessName
    };

    users.push(newUser);
    localStorage.setItem('foodsaver_users', JSON.stringify(users));
    
    const loggedInUser = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      businessName: newUser.businessName
    };
    setUser(loggedInUser);
    localStorage.setItem('foodsaver_user', JSON.stringify(loggedInUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('foodsaver_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
