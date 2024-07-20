import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';

const GET_USER = gql`
  query GetUser {
    me {
      id
      email
    }
  }
`;

const WelcomePage = ({ setIsAuthenticated }) => {
  const { loading, error, data } = useQuery(GET_USER);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/');
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>Welcome to Faewood Forge</h1>
      <p>Your email: {data.me.email}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default WelcomePage;