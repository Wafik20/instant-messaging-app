import { WebSocketServer } from 'ws';
import constants from './constants/constants.js';
import { verifyJwtToken } from './utils/tokenHelper.js';

const connectedClients = new Map();

// Create a WebSocket server instance
const SOCKET_SERVER_PORT = constants.WEBSOCKET_PORT;
const wss = new WebSocketServer({
  port: SOCKET_SERVER_PORT,
  verifyClient: (info, cb) => {

    const authHeader = info.req.headers['authorization'];
    if (!authHeader) {
      console.log('No Authorization header');
      return cb(false, 401, 'Unauthorized');
    }

    const tokenMatch = authHeader.match(/^Bearer\s(.+)$/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) {
      console.log('No auth token');
      return cb(false, 401, 'Unauthorized');
    }

    try {
      const decoded = verifyJwtToken(token);

      if (!decoded || !decoded.valid) {
        console.warn('Invalid token');
        return cb(false, 401, 'Unauthorized');
      }

      console.log('Token decoded:', decoded);
      info.req.user = decoded.decoded;
      console.log('Token verified successfully:', decoded);

      return cb(true);
    } catch (err) {
      console.error('Token verification failed:', err?.message || err);
      return cb(false, 401, 'Unauthorized');
    }
  }
});

// Function to broadcast message to all connected clients
export const broadcastMessage = (message, author) => {

  const messageString = JSON.stringify(message);
  const toBeSent = `${author} says "${messageString}"`;
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(toBeSent);
    }
  });
};

wss.on('connection', (ws, req) => {
  // Attach user info from verifyClient to the socket
  ws.user = req.user;
  // Add user to the connected clients map
  connectedClients.set(ws.user, ws);
  // Log the user information
  console.log('New client connected:', ws.user);
  // Send a message to the newly connected client 
  // That contains all connected users
  const connectedUsers = connectedClients.keys();
  ws.send(JSON.stringify({
    type: 'connectedUsers',
    users: Array.from(connectedUsers)
  }));
  console.log(connectedClients);

  // Listen for messages from client
  ws.on('message', (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      console.log('Received:', parsedMessage);
      // Broadcast the message to all clients
      broadcastMessage(parsedMessage, ws.user.username);
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('WebSocket server running on ws://localhost:8080');

export default wss;
