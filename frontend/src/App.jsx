import React, { useEffect, useState } from 'react';
import { Replicache } from 'replicache';
import { Provider } from 'react-redux';
import { ApolloProvider } from '@apollo/client';
import store from './store';
import client from './apolloClient';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';

const App = () => {
  const [rep, setRep] = useState(null);

  useEffect(() => {
    const rep = new Replicache({
      name: 'faewood-forge',
      licenseKey: import.meta.env.VITE_REPLICACHE_LICENSE_KEY,
      pushURL: 'http://localhost:5000/replicache/push',
      pullURL: 'http://localhost:5000/replicache/pull',
      mutators: {
        createUser: async tx => {
          const { name, email } = tx.args;
          // Code to create a user
        },
        updateUser: async tx => {
          const { id, name, email } = tx.args;
          // Code to update a user
        },
        // Add more mutators as needed
      },
    });

    setRep(rep);

    
  }, []);

  return (
    <Provider store={store}>
      <ApolloProvider client={client}>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </Router>
      </ApolloProvider>
    </Provider>
  );
};

export default App;
