import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

// Mock user database (using your existing credentials)
const MOCK_USERS = [
  { id: 1, name: 'Admin User', email: 'admin@bianca.com', password: 'admin123', role: 'admin' },
  { id: 2, name: 'Staff User', email: 'staff@bianca.com', password: 'staff123', role: 'employee' },
  { id: 3, name: 'Regular User', email: 'user@example.com', password: 'user123', role: 'customer' }
];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is stored in localStorage
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    setLoading(false);
  }, []);

  const login = (user, rememberMe = false) => {
    setCurrentUser(user);
    
    // Store user data based on remember me preference
    if (rememberMe) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      // Use sessionStorage for session-only storage
      sessionStorage.setItem('user', JSON.stringify(user));
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
  };

  // Helper function to check if user has a specific role
  const hasRole = (requiredRole) => {
    if (!currentUser) return false;
    return currentUser.role === requiredRole;
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      login, 
      logout, 
      loading,
      error,
      isAdmin: () => hasRole('admin'),
      isEmployee: () => hasRole('employee'),
      isCustomer: () => hasRole('customer'),
      hasRole,
      // Add a direct authentication function for your login component
      authenticate: (email, password, rememberMe) => {
        setError('');
        const user = MOCK_USERS.find(u => u.email === email && u.password === password);
        
        if (user) {
          // Create a copy without the password
          const { password, ...safeUser } = user;
          login(safeUser, rememberMe);
          return safeUser;
        } else {
          setError('Invalid email or password');
          return null;
        }
      }
    }}>
      {children}
    </AuthContext.Provider>
  );
};