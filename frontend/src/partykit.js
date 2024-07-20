import { createClient } from 'partykit';

const client = createClient({
  url: 'wss://your-partykit-server-url', // Replace with your actual Partykit server URL
  // Add any other configuration options you need
});

client.on('connect', () => {
  console.log('Connected to Partykit server');
});

client.on('message', (message) => {
  console.log('Received message:', message);
});

client.on('disconnect', () => {
  console.log('Disconnected from Partykit server');
});

export default client;
