const User = require('../models/User');
const connectToDatabase = require('../dbConnection');

async function push(req, res) {
  let db;
  try {
    db = await connectToDatabase();
    const { clientID, mutations } = req.body;
    const userID = req.headers['x-replicache-auth'];
    console.log('Received push:', { clientID, userID, mutations });

    for (const mutation of mutations) {
      if (mutation.name === 'updateEditorContent') {
        const { content } = mutation.args;
        const user = await User.findByIdAndUpdate(
          userID,
          { $set: { editorContent: content } },
          { new: true, runValidators: true }
        );
        if (!user) {
          throw new Error(`User not found: ${userID}`);
        }
        console.log(`Updated content for user ${userID}`);
      }
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('Push error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

async function pull(req, res) {
  let db;
  try {
    db = await connectToDatabase();
    const { clientID } = req.body;
    const userID = req.headers['x-replicache-auth'];
    console.log('Received pull:', { clientID, userID });

    if (!userID) {
      throw new Error('User ID not provided in auth header');
    }

    const user = await User.findById(userID);
    if (!user) {
      throw new Error(`User not found: ${userID}`);
    }

    res.json({
      lastMutationID: 0, // You might want to implement a way to track this
      cookie: null,
      patch: [
        {
          op: 'put',
          key: 'editorContent',
          value: user.editorContent || '',
        },
      ],
    });
  } catch (error) {
    console.error('Pull error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

module.exports = { push, pull };