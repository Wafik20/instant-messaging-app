import { WebSocketServer } from 'ws';
import constants from './constants/constants.js';


// Create a WebSocket server instance
const SOCKET_SERVER_PORT = constants.WEBSOCKET_PORT;
const wss = new WebSocketServer({
  port: SOCKET_SERVER_PORT, verifyClient: (info, cb) => {
    console.log('headers:', info.req.headers);
    const token = info.req.headers['sec-websocket-protocol'];
    if (token) {
      // Verify the token here (e.g., using JWT)
      // If valid, call cb(true), otherwise cb(false)
      cb(true);
    } else {
      console.log('No token provided');
      cb(false);
    }
  }
});
const connectedClients = new Map();

// Function to broadcast message to all connected clients
export const broadcastMessage = (message) => {

  const messageString = JSON.stringify(message);
  console.log('Broadcasting message:', messageString);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageString);
    }
  });
};

wss.on('connection', (socket) => {
  console.log('Client connected');

  // Listen for messages from client
  socket.on('message', (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      console.log('Received:', parsedMessage);
      // Broadcast the message to all clients
      broadcastMessage(parsedMessage);
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  // Handle client disconnection
  socket.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('WebSocket server running on ws://localhost:8080');

export default wss;
