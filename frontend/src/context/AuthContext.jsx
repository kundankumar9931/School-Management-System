
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import api from '../api/client.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check existing login session
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      const token = sessionStorage.getItem('token');

      // No saved token means user is not logged in
      if (!token) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const result = await api.get('/auth/me');

        if (isMounted && result.success) {
          const userData = result.data?.user || result.data;
          setUser(userData || null);
        } else if (isMounted) {
          sessionStorage.removeItem('token');
          setUser(null);
        }
      } catch (error) {
        if (isMounted) {
          console.error(
            'Session validation failed:',
            error.response?.data?.message || error.message
          );

          if (error.response?.status === 401) {
            sessionStorage.removeItem('token');
          }

          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      const result = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      if (!result.success || !result.data?.token || !result.data?.user) {
        throw new Error(result.message || 'Login failed');
      }

      const { token, user: userData } = result.data;

      // Save token for future API requests
      sessionStorage.setItem('token', token);

      setUser(userData);

      return userData;
    } catch (error) {
      sessionStorage.removeItem('token');

      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Login failed'
      );
    }
  };

  // Logout
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error(
        'Logout API error:',
        error.response?.data?.message || error.message
      );
    } finally {
      sessionStorage.removeItem('token');
      setUser(null);
    }
  };

  // Role verification
  const hasRole = (roles) => {
    if (!user) return false;

    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }

    return user.role === roles;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom authentication hook
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};

export default AuthContext;
