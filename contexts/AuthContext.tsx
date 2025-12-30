import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';
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
  // Initialize from LocalStorage or fallback to Mock Data
  const [usersList, setUsersList] = useState<User[]>(() => {
    try {
      const savedUsers = localStorage.getItem('amps_users');
      return savedUsers ? JSON.parse(savedUsers) : MOCK_USERS;
    } catch (e) {
      console.error("Failed to load users from storage", e);
      return MOCK_USERS;
    }
  });

  // Initialize session from LocalStorage
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('amps_current_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  // Persist Users List
  useEffect(() => {
    localStorage.setItem('amps_users', JSON.stringify(usersList));
  }, [usersList]);

  // Persist Current Session
  useEffect(() => {
    if (user) {
      localStorage.setItem('amps_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('amps_current_user');
    }
  }, [user]);

  const login = (email: string, password: string): boolean => {
    // Check against current persisted state
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
    return exists;
  };

  const adminResetPassword = (userId: string, newPassword: string) => {
    setUsersList(prev => prev.map(u => 
      u.id === userId ? { ...u, password: newPassword } : u
    ));
    
    // If the logged in user is resetting their own password
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