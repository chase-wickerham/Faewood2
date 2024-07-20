const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');

async function startServer() {
  const app = express();

  // Enable CORS for the frontend origin
  app.use(cors({
    origin: 'http://67.207.82.0:3001', // Your frontend URL
    credentials: true
  }));

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in the environment variables');
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const token = req.headers.authorization || '';
      if (token) {
        try {
          const user = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
          return { user };
        } catch (err) {
          console.log('Error verifying token:', err);
        }
      }
      return {};
    },
  });

  await server.start();

  server.applyMiddleware({ 
    app, 
    path: '/graphql',
    cors: false // Disable Apollo Server's default CORS as we're handling it with Express
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server ready at http://67.207.82.0:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch(error => {
  console.error('Error starting server:', error);
  process.exit(1);
});