const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const connectToDatabase = require('./dbConnection');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const { push, pull } = require('./replicache/replicacheHandlers');

async function startServer() {
  const app = express();

  app.use(cors({
    origin: 'http://67.207.82.0:3001', // Your frontend URL
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-replicache-auth'],
  }));

  app.use(express.json());

  // Connect to MongoDB
  await connectToDatabase();

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
    cors: false
  });

  // Add Replicache routes
  app.post('/replicache-push', push);
  app.post('/replicache-pull', pull);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server ready at http://67.207.82.0:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch(error => {
  console.error('Error starting server:', error);
  process.exit(1);
});