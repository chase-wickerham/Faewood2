import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';

// GraphQL query to fetch user data
const GET_USER = gql`
  query GetUser {
    me {
      id
      email
    }
  }
`;

const Dashboard = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  // Execute the GetUser query
  const { loading, error, data, refetch } = useQuery(GET_USER);

  useEffect(() => {
    console.log('Dashboard mounted, refetching user data');
    refetch();
  }, [refetch]);

  const handleLogout = () => {
    console.log('Logging out...');
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    console.log('Token removed, authentication state updated');
    navigate('/');
  };

  console.log('Dashboard render - loading:', loading, 'error:', error, 'data:', data);

  if (loading) return <p>Loading...</p>;
  if (error) {
    console.error('GraphQL error:', error);
    return (
      <div>
        <p>Error: {error.message}</p>
        <p>Please check the console for more details.</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome to your Dashboard</h1>
      {data && data.me && (
        <>
          <p>Logged in as: {data.me.email}</p>
          <p>User ID: {data.me.id}</p>
        </>
      )}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;