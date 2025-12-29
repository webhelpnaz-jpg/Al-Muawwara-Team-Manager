import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../services/mockData';

interface AuthContextType {
  user: User | null;
  usersList: User[]; // Expose full list for Admin
  login: (email: string, password: string) => boolean;
  logout: () => void;
  forgotPassword: (email: string) => boolean;
  adminResetPassword: (userId: string, newPassword: string) => void;
  updateUser: (updatedUser: User) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usersList, setUsersList] = useState<User[]>(MOCK_USERS);
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string): boolean => {
    // Check against current state, not static mock
    const foundUser = usersList.find(u => u.email === email && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const forgotPassword = (email: string): boolean => {
    const exists = usersList.some(u => u.email === email);
    // In a real app, this sends an email. Here we just confirm the user exists.
    return exists;
  };

  const adminResetPassword = (userId: string, newPassword: string) => {
    setUsersList(prev => prev.map(u => 
      u.id === userId ? { ...u, password: newPassword } : u
    ));
    
    // If the logged in user is resetting their own password (rare but possible), update session
    if (user?.id === userId) {
      setUser(prev => prev ? { ...prev, password: newPassword } : null);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUsersList(prev => prev.map(u => 
      u.id === updatedUser.id ? updatedUser : u
    ));
    // Update current session if the logged-in user is updated
    if (user?.id === updatedUser.id) {
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      usersList, 
      login, 
      logout, 
      forgotPassword, 
      adminResetPassword, 
      updateUser,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};