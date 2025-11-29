import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI } from '../services/api';
import type { AuthResponse } from '../types';

interface AuthContextType {
  user: AuthResponse | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthResponse | null>(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // Remove token from user object if it exists (token is now in httpOnly cookie)
      if (parsedUser.token) {
        delete parsedUser.token;
      }
      return parsedUser;
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const login = async (username: string, password: string) => {
    const response = await authAPI.login({ username, password });
    // Remove token from response (it's in httpOnly cookie, not accessible to JS)
    const { token, ...userData } = response;
    setUser(userData as AuthResponse);
    localStorage.setItem('user', JSON.stringify(userData));
    // Set loading to false immediately since we have user data
    setIsLoading(false);
  };

  const register = async (username: string, password: string, email: string) => {
    const response = await authAPI.register({ username, password, email });
    // Remove token from response (it's in httpOnly cookie, not accessible to JS)
    const { token, ...userData } = response;
    setUser(userData as AuthResponse);
    localStorage.setItem('user', JSON.stringify(userData));
    // Set loading to false immediately since we have user data
    setIsLoading(false);
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint to clear httpOnly cookie
      await authAPI.logout();
    } catch (error) {
      // Even if logout fails, clear local state
      console.error('Logout error:', error);
    } finally {
      // Clear all auth-related state
    setUser(null);
    localStorage.removeItem('user');
      // Note: Game session state will be cleared when user becomes null
      // and Game component re-renders, but we could also clear it explicitly here
    }
  };

  // Validate token on app start
  useEffect(() => {
    const validateToken = async () => {
      setIsLoading(true);
      // Check if user exists in localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const validation = await authAPI.validateToken();
          if (validation.valid && validation.userId && validation.username) {
            // Token is valid, update user info
            const userData = {
              message: 'Token validated',
              userId: validation.userId,
              username: validation.username,
              displayName: validation.displayName,
              email: validation.email,
              emailVerified: validation.emailVerified,
              avatarUrl: validation.avatarUrl,
            };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          } else {
            // Token invalid, clear user
            setUser(null);
            localStorage.removeItem('user');
          }
        } catch (error) {
          // Token validation failed, clear user
          console.error('Token validation error:', error);
          setUser(null);
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    validateToken();
  }, []); // Only run on mount

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

