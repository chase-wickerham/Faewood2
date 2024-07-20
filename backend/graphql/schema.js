const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Query {
    hello: String
    getUser(id: ID!): User
    getUsers: [User]
  }

  type Mutation {
    createUser(name: String!, email: String!, password: String!): AuthPayload
  }

  type User {
    id: ID!
    name: String!
    email: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }
`;

module.exports = typeDefs;
