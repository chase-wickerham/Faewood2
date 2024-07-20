const { generateToken } = require('./jwt');
const User = require('../models/User');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const user = await User.findOne({ email: 'your-email@example.com' });
    if (user) {
      const token = generateToken(user);
      console.log('Generated Token:', token);
    } else {
      console.log('User not found');
    }
    mongoose.disconnect();
  })
  .catch(err => console.log(err));
