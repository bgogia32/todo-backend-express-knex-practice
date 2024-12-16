const WebSocket = require('ws');
let wss;

function SetUpWebSocket(server) {
    wss = new WebSocket.Server({ server });
    console.log('WebSocket Setup and running!');

    wss.on('connection', (ws) => {
        console.log('New WebSocket client connected.');

        ws.send('Hello from Express!');
      
        ws.on('message', (data) => {
          console.log('Received message from client: ' + data);
          ws.send('I received: ' + data);
        });
        // Handle client disconnection
        ws.on('close', () => {
          console.log('WebSocket client disconnected.');
        });
      });
}

function BroadcastUpdate(updateType, updateDetails) {
    const message = JSON.stringify({ updateType, updateDetails });
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
}

module.exports = {
    SetUpWebSocket,
    BroadcastUpdate
}