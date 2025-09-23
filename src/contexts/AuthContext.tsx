import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'viewer';
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for authentication
const mockUsers = [
  { id: '1', email: 'admin@renee.com', password: 'password123', name: 'Admin User', role: 'admin' as const },
  { id: '2', email: 'manager@renee.com', password: 'password123', name: 'Manager User', role: 'manager' as const },
  { id: '3', email: 'viewer@renee.com', password: 'password123', name: 'Viewer User', role: 'viewer' as const },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('renee_admin_token');
    if (token) {
      try {
        const userData = JSON.parse(atob(token));
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('renee_admin_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser = mockUsers.find(u => u.email === email && u.password === password);
    
    if (mockUser) {
      const userData = {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
      };
      
      // Create mock JWT token (base64 encoded user data)
      const token = btoa(JSON.stringify(userData));
      localStorage.setItem('renee_admin_token', token);
      
      setUser(userData);
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    localStorage.removeItem('renee_admin_token');
    setUser(null);
    navigate('/admin/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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