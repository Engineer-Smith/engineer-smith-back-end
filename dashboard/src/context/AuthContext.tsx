import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import apiService from '../services/ApiService';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (loginCredential: string, password: string) => Promise<void>;
  ssoLogin: () => void;
  register: (
    username: string,
    firstName: string,    // Required field
    lastName: string,     // Required field
    email?: string,
    password?: string,
    inviteCode?: string,
    role?: string
  ) => Promise<void>;
  validateInviteCode: (inviteCode: string) => Promise<{ valid: boolean; organizationName?: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  login: async () => { },
  ssoLogin: () => { },
  register: async () => { },
  validateInviteCode: async () => ({ valid: false }),
  logout: async () => { },
  clearError: () => { },
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  });

  const setError = (message: string) => {
    setState((prev) => ({
      ...prev,
      loading: false,
      error: message,
    }));
  };

  const setAuthenticated = (user: User) => {
    setState({
      user,
      isAuthenticated: true,
      loading: false,
      error: null,
    });
  };

  const setUnauthenticated = () => {
    setState({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    });
  };

  // Helper function to get fully populated user data
  const getFullUserData = async (): Promise<User | null> => {
    try {
      // FIXED: Server returns direct response, no wrapper
      const response: { success: boolean; user: User } = await apiService.getCurrentUser();

      if (response.success && response.user) {
        return response.user;
      }
      return null;
    } catch (error) {
      console.error('Failed to get full user data:', error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const checkAuthStatus = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true }));

        // FIXED: Server returns direct response, no wrapper
        const response: { success: boolean; user: User } = await apiService.getCurrentUser();

        if (!mounted) return;

        if (response.success && response.user) {
          setAuthenticated(response.user);
        } else {
          setUnauthenticated();
        }
      } catch (error) {
        if (!mounted) return;
        setUnauthenticated();
      }
    };

    checkAuthStatus();

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (loginCredential: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // FIXED: Server returns direct response, no wrapper
      const response: { success: boolean; user: User; csrfToken: string } = await apiService.login({
        loginCredential,
        password
      });

      if (!response.success || !response.user) {
        setError('Login failed');
        return;
      }

      // Step 2: Get fully populated user data (includes organization)
      const fullUser = await getFullUserData();

      if (fullUser) {
        setAuthenticated(fullUser);
      } else {
        // Fallback to basic user data if getCurrentUser fails
        setAuthenticated(response.user);
      }

    } catch (error: any) {
      console.error('Login error:', error);
      // FIXED: Handle error properly - server may return error message directly
      const errorMessage = error.message || error.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
    }
  }, []);

  const ssoLogin = useCallback(() => {
    const ssoUrl = apiService.getSSOLoginUrl();
    window.location.href = ssoUrl;
  }, []);

  const register = useCallback(
    async (
      username: string,
      firstName: string,     // Required parameter
      lastName: string,      // Required parameter
      email?: string,
      password?: string,
      inviteCode?: string,
      role?: string
    ) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // FIXED: Server returns direct response, no wrapper
        const response: { success: boolean; user: User; csrfToken: string } = await apiService.register({
          username,
          firstName,    // Pass firstName to API
          lastName,     // Pass lastName to API
          email,
          password,
          inviteCode,
          role,
        });

        if (!response.success || !response.user) {
          setError('Registration failed');
          return;
        }

        // Step 2: Get fully populated user data (includes organization)
        const fullUser = await getFullUserData();

        if (fullUser) {
          setAuthenticated(fullUser);
        } else {
          // Fallback to basic user data if getCurrentUser fails
          setAuthenticated(response.user);
        }

      } catch (error: any) {
        console.error('Registration error:', error);
        // FIXED: Handle error properly - server may return error message directly
        const errorMessage = error.message || error.response?.data?.message || 'Registration failed. Please try again.';
        setError(errorMessage);
      }
    },
    []
  );

  const validateInviteCode = useCallback(async (inviteCode: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // FIXED: Server returns direct response, no wrapper
      const response: { success: boolean; organization: { _id: string; name: string } } =
        await apiService.validateInviteCode({ inviteCode });

      setState((prev) => ({ ...prev, loading: false }));

      if (!response.success || !response.organization) {
        setError('Invalid invite code');
        return { valid: false };
      }

      return {
        valid: true,
        organizationName: response.organization.name
      };
    } catch (error: any) {
      console.error('Invite code validation error:', error);
      // FIXED: Handle error properly
      const errorMessage = error.message || error.response?.data?.message || 'Failed to validate invite code';
      setError(errorMessage);
      return { valid: false };
    }
  }, []);

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // FIXED: Server returns direct response, no wrapper
      await apiService.logout();
      document.cookie = 'csrfToken=; Max-Age=0; path=/;';
    } catch (error) {
      console.error('Logout error:', error);
      // Don't show error to user for logout - just proceed
    }

    setUnauthenticated();
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    ssoLogin,
    register,
    validateInviteCode,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;