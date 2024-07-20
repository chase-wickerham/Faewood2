import { onConnection } from 'partykit';

onConnection((client) => {
  console.log(`Client connected: ${client.id}`);

  client.on('message', (message) => {
    console.log(`Received message from ${client.id}: ${message}`);
    // Echo the message back to the client
    client.send(`Echo: ${message}`);
  });

  client.on('close', () => {
    console.log(`Client disconnected: ${client.id}`);
  });
});
