const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const User = require('../models/User');

const resolvers = {
  Query: {
    hello: () => 'Hello world!',
    getUser: async (parent, args) => {
      return await User.findById(args.id);
    },
    getUsers: async () => {
      return await User.find();
    },
  },
  Mutation: {
    createUser: async (parent, args) => {
      const hashedPassword = await bcrypt.hash(args.password, 10);
      const user = new User({
        name: args.name,
        email: args.email,
        password: hashedPassword,
      });
      await user.save();
      const token = generateToken(user);
      return { token, user };
    },
  },
};

module.exports = resolvers;
