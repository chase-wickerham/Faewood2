import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Replicache } from 'replicache';
import ErrorBoundary from './ErrorBoundary';
import debounce from 'lodash/debounce';

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
  const { loading, error, data } = useQuery(GET_USER);
  const [editorContent, setEditorContent] = useState('');
  const repRef = useRef(null);

  const initReplicache = useCallback(async () => {
    if (!data || !data.me) {
      console.log('User data not available, skipping Replicache initialization');
      return;
    }

    console.log('Initializing Replicache with user ID:', data.me.id);
    if (repRef.current) {
      console.log('Closing existing Replicache instance');
      await repRef.current.close();
    }

    repRef.current = new Replicache({
      name: `user-editor-${data.me.id}`,
      licenseKey: import.meta.env.VITE_REPLICACHE_LICENSE_KEY,
      pushURL: `${import.meta.env.VITE_API_URL}/replicache-push`,
      pullURL: `${import.meta.env.VITE_API_URL}/replicache-pull`,
      auth: data.me.id,
    });

    console.log('Replicache instance created');

    repRef.current.mutate.updateEditorContent = async (tx, args) => {
      console.log('Updating editor content in Replicache', args);
      if (args && args.content !== undefined) {
        await tx.put('editorContent', args.content);
      } else {
        console.error('Invalid arguments for updateEditorContent', args);
      }
    };

    try {
      await repRef.current.pull();
      console.log('Initial Replicache pull completed');
    } catch (err) {
      console.error('Error during initial Replicache pull:', err);
    }
  }, [data]);

  useEffect(() => {
    if (data && data.me) {
      initReplicache();
    }
  }, [data, initReplicache]);

  useEffect(() => {
    if (!repRef.current) {
      console.log('Replicache not initialized, skipping subscription');
      return;
    }

    console.log('Setting up Replicache subscription');
    const subscribe = async () => {
      try {
        for await (const { editorContent } of repRef.current.subscribe()) {
          console.log('Received update from Replicache subscription:', editorContent);
          if (editorContent !== undefined) {
            setEditorContent(editorContent);
          }
        }
      } catch (err) {
        if (err.message !== "Closed") {
          console.error('Error in Replicache subscription:', err);
        }
      }
    };

    subscribe();
  }, []);

  const handleLogout = () => {
    console.log('Logging out...');
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    console.log('Token removed, authentication state updated');
    navigate('/');
  };

  const debouncedSave = useCallback(
    debounce((content) => {
      if (repRef.current && repRef.current.mutate && repRef.current.mutate.updateEditorContent) {
        repRef.current.mutate.updateEditorContent({
          userID: data.me.id,
          content: content
        }).catch(err => 
          console.error('Error updating editor content:', err)
        );
      } else {
        console.error('Replicache or mutator not properly initialized');
      }
    }, 5000),
    [data]
  );

  const handleEditorChange = (content) => {
    console.log('Editor content changed:', content);
    setEditorContent(content);
    debouncedSave(content);
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
      <ErrorBoundary>
        <ReactQuill 
          value={editorContent} 
          onChange={handleEditorChange}
          style={{ height: '300px', marginBottom: '50px' }}
        />
      </ErrorBoundary>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;