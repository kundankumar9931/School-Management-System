
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
      try {
        const result = await api.get('/auth/me');

        if (isMounted && result.success) {
          // Handle both possible response structures
          const userData = result.data?.user || result.data;
          setUser(userData || null);
        } else if (isMounted) {
          setUser(null);
        }
      } catch (error) {
        if (isMounted) {
          setUser(null);
          console.error(
            'Session validation failed:',
            error.response?.data?.message || error.message
          );
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
    const result = await api.post('/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    });

    if (!result.success || !result.data?.user) {
      throw new Error(result.message || 'Login failed');
    }

    const userData = result.data.user;

    setUser(userData);

    return userData;
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
