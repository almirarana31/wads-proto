import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

// Demo users
const demoUsers = [
  {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@bianca.com',
    password: 'admin123',
    role: 'admin',
    phone: '555-111-0000'
  },
  {
    id: 'staff1',
    name: 'Sarah Johnson',
    email: 'staff@bianca.com',
    password: 'staff123',
    role: 'employee',
    phone: '555-222-0000'
  },
  {
    id: 'user1',
    name: 'Jane Smith',
    email: 'user@example.com',
    password: 'user123',
    role: 'customer',
    phone: '555-333-0000'
  }
];

export const AuthProvider = ({ children }) => {
  // Check localStorage for existing user
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('users');
    return savedUsers ? JSON.parse(savedUsers) : demoUsers;
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Save users to localStorage when they change
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);
  
  // Save current user to localStorage when it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);
  
  // Initialize auth state
  useEffect(() => {
    // Simulate auth initialization
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);
  
  // User authentication
  const authenticate = (email, password, rememberMe = false) => {
    setError(null);
    
    // Find user with matching email and password
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    
    if (user) {
      // Create a safe user object without password
      const safeUser = { ...user };
      delete safeUser.password;
      
      setCurrentUser(safeUser);
      
      // If not using remember me, set a session expiration
      if (!rememberMe) {
        // Session expires in 8 hours
        const expiration = new Date().getTime() + 8 * 60 * 60 * 1000;
        sessionStorage.setItem('sessionExpires', expiration.toString());
      }
      
      return safeUser;
    } else {
      setError('Invalid email or password');
      return null;
    }
  };
  
  // User logout
  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('sessionExpires');
    localStorage.removeItem('currentUser');
  };
  
  // Register new user
  const register = (userData) => {
    setError(null);
    
    // Check if email already exists
    if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      setError('Email already in use');
      return false;
    }
    
    // Create new user with id and role
    const newUser = {
      id: `user${Date.now()}`,
      role: 'customer', // Default role for new registrations
      ...userData
    };
    
    setUsers([...users, newUser]);
    
    // Auto-login after registration
    const safeUser = { ...newUser };
    delete safeUser.password;
    setCurrentUser(safeUser);
    
    return true;
  };
  
  // Check for session expiration (for non-remember-me logins)
  useEffect(() => {
    const checkSession = () => {
      const expiration = sessionStorage.getItem('sessionExpires');
      
      if (expiration && currentUser) {
        const now = new Date().getTime();
        if (now > parseInt(expiration)) {
          logout();
        }
      }
    };
    
    // Check session validity every minute
    const interval = setInterval(checkSession, 60 * 1000);
    
    // Initial check
    checkSession();
    
    return () => clearInterval(interval);
  }, [currentUser]);
  
  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        loading,
        error,
        authenticate,
        logout,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;