const express = require('express');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

const router = express.Router();

// Mock database for changes
let changes = [];

// Handle pull request
router.post('/pull', async (req, res) => {
  const { clientID } = req.body;
  const since = req.body.since || 0;

  console.log(`Received pull request from client: ${clientID}, since: ${since}`);

  // Retrieve changes since the provided version
  const response = {
    lastMutationID: changes.length,
    patch: changes.slice(since).map(change => ({
      op: 'put',
      key: change.key,
      value: change.value,
    })),
  };

  console.log(`Sending response to pull request: ${JSON.stringify(response, null, 2)}`);
  res.json(response);
});

// Handle push request
router.post('/push', async (req, res) => {
  const { clientID, mutations } = req.body;

  console.log(`Received push request from client: ${clientID}, mutations: ${JSON.stringify(mutations, null, 2)}`);

  mutations.forEach(mutation => {
    const { id, name, args } = mutation;

    if (name === 'createUser') {
      const user = {
        id: uuidv4(),
        name: args.name,
        email: args.email,
      };
      changes.push({
        key: `user/${user.id}`,
        value: user,
      });
      console.log(`Created user: ${JSON.stringify(user, null, 2)}`);
    } else if (name === 'updateUser') {
      const index = changes.findIndex(change => change.key === `user/${args.id}`);
      if (index !== -1) {
        changes[index] = {
          key: `user/${args.id}`,
          value: { id: args.id, name: args.name, email: args.email },
        };
        console.log(`Updated user: ${JSON.stringify(changes[index].value, null, 2)}`);
      }
    }
    // Add more mutation handlers as needed
  });

  res.json({});
});

module.exports = router;
