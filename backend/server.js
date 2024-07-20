const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginLandingPageGraphQLPlayground } = require('@apollo/server-plugin-landing-page-graphql-playground');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const replicacheRouter = require('./routes/replicache');
const authMiddleware = require('./middleware/auth');
const userLoader = require('./loaders/userLoader');

dotenv.config();

const startServer = async () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({
      user: req.user,
      loaders: {
        userLoader,
      },
    }),
    introspection: true,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  });

  await server.start();
  app.use(authMiddleware); // Use auth middleware
  app.use('/graphql', expressMiddleware(server));
  app.use('/replicache', replicacheRouter);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
