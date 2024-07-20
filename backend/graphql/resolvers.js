const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectToDatabase = require('../dbConnection');

const resolvers = {
  Query: {
    me: async (_, __, context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      const db = await connectToDatabase();
      return await db.models.User.findById(context.user.userId);
    },
  },
  Mutation: {
    signup: async (_, { email, password }) => {
      const db = await connectToDatabase();
      const User = db.models.User;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ email, password: hashedPassword });
      await user.save();

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

      return { token, user };
    },
    login: async (_, { email, password }) => {
      const db = await connectToDatabase();
      const User = db.models.User;
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('No user found with this email');
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new Error('Invalid password');
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

      return { token, user };
    },
  },
};

module.exports = resolvers;