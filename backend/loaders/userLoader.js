const DataLoader = require('dataloader');
const User = require('../models/User'); // Ensure this path is correct

const userLoader = new DataLoader(async (keys) => {
  const users = await User.find({ _id: { $in: keys } });
  return keys.map(key => users.find(user => user._id.toString() === key.toString()));
});

module.exports = userLoader;
