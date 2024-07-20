import React, { useState, useEffect } from 'react';
import { ApolloProvider } from '@apollo/client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import client from './apolloClient';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';

const App = () => {
  // State to keep track of user authentication status
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // State to manage loading state while checking authentication
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Function to check if the user is authenticated
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      console.log('Checking authentication, token:', token ? 'exists' : 'not found');
      setIsAuthenticated(!!token);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  console.log('App render - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ApolloProvider client={client}>
      <Router>
        <Routes>
          {/* Route for the main page */}
          <Route 
            path="/" 
            element={isAuthenticated ? 
              <Navigate to="/dashboard" /> : 
              <AuthPage setIsAuthenticated={setIsAuthenticated} />
            } 
          />
          {/* Route for the dashboard page */}
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? 
              <Dashboard setIsAuthenticated={setIsAuthenticated} /> : 
              <Navigate to="/" />
            } 
          />
        </Routes>
      </Router>
    </ApolloProvider>
  );
};

export default App;