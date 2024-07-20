import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';

// GraphQL mutation for user login
const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
      }
    }
  }
`;

// GraphQL mutation for user signup
const SIGNUP_MUTATION = gql`
  mutation Signup($email: String!, $password: String!) {
    signup(email: $email, password: $password) {
      token
      user {
        id
        email
      }
    }
  }
`;

const AuthPage = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  // Apollo hooks for login and signup mutations
  const [login, { loading: loginLoading, error: loginError }] = useMutation(LOGIN_MUTATION);
  const [signup, { loading: signupLoading, error: signupError }] = useMutation(SIGNUP_MUTATION);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(`Attempting to ${isLogin ? 'login' : 'signup'} with email:`, email);
    try {
      const { data } = isLogin 
        ? await login({ variables: { email, password } })
        : await signup({ variables: { email, password } });
      
      const { token, user } = isLogin ? data.login : data.signup;
      
      // Enhanced logging
      console.log('Authentication successful');
      console.log('User ID:', user.id);
      console.log('User email:', user.email);
      console.log('Token:', token);
      
      // Log the decoded token payload (without signature)
      try {
        const [, payloadBase64] = token.split('.');
        const payload = JSON.parse(atob(payloadBase64));
        console.log('Decoded token payload:', payload);
      } catch (error) {
        console.error('Error decoding token:', error);
      }

      localStorage.setItem('token', token);
      console.log('Token stored in localStorage');
      setIsAuthenticated(true);
      console.log('Authentication state updated, navigating to dashboard');
      navigate('/dashboard');
    } catch (err) {
      console.error('Authentication error:', err);
    }
  };

  console.log('AuthPage render - isLogin:', isLogin);

  return (
    <div>
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit" disabled={loginLoading || signupLoading}>
          {isLogin ? 'Login' : 'Sign Up'}
        </button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)}>
        Switch to {isLogin ? 'Sign Up' : 'Login'}
      </button>
      {(loginError || signupError) && <p>Error: {loginError?.message || signupError?.message}</p>}
    </div>
  );
};

export default AuthPage;