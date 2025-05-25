import { WebSocketServer } from 'ws';
import constants from './constants/constants.js';
import { verifyJwtToken } from './utils/tokenHelper.js';
import { v4 as uuidv4 } from 'uuid';

const connectedClients = new Map(); // Map user_id -> [clients]
let wss;
const SOCKET_SERVER_PORT = constants.WEBSOCKET_PORT;

const initSocketServer = () => {
  if (!wss) {
    wss = new WebSocketServer({
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

    wss.on('connection', (ws, req) => {
      // Create a new client object
      ws.client = generateNewClient(req.user);
      console.log('user', req.user, 'connected with client', ws.client.id);

      // Add user to the connected clients map
      if (!connectedClients.has(req.user.id)) {
        connectedClients.set(req.user.id, [ws]);
      } else {
        connectedClients.get(req.user.id).push(ws);
      }

      // Log the user information
      console.log('New client connected:', ws.client);

      // Listen for messages from client
      ws.on('message', (message) => {
        try {
          const [parsedMessage, parseError] = safeJsonParse(message);
          if (parseError) {
            throw new Error('Invalid JSON format');
          }
          const { type, content } = parsedMessage;
          switch (type) {
            case 'getClientInfo':
              handleGetClientInfo(ws);
              break;
            case 'joinRoom':
              handleJoinRoom(ws, content);
              break
            case 'leaveRoom':
              handleLeaveRoom(ws, content);
              break;
            case 'createRoom':
              handleCreateRoom(ws, content);
              break;
            case 'sendRoomMessage':
              handleSendRoomMessage(ws, content);
            case 'sendPrivateMessage':
              handleSendPrivateMessage(ws, content);
              break;
            case 'getConnectedUsers':
              handleGetConnectedUsers(ws);
              break;
            default:
              handleInvalidMessageType(ws);
              break;
          }
        } catch (error) {
          console.warn('Error parsing message');
          throwErrorToClient(ws, 'Error parsing message: ' + error.message);
        }
      });

      // Handle client disconnection
      ws.on('close', () => {
        console.log('Client disconnected');
        // TODO: Remove client from connectedClients map
      });
    });
  }
  console.log('WebSocket server running on ws://localhost:8080');
}

function safeJsonParse(data) {
  try {
    return [JSON.parse(data), null];
  } catch (error) {
    return [null, error];
  }
}

function throwErrorToClient(ws, errorMessage) {
  if (ws && ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify({
      type: 'error',
      message: errorMessage
    }));
  } else {
    console.error('WebSocket is not open or does not exist');
  }
}

function generateNewClient(user) {
  const newClient = {
    id: uuidv4(),
    connectedAt: new Date().toISOString(),
    user: user,
  };
  return newClient;
}

function handleGetConnectedUsers(ws) {
  ws.send(JSON.stringify({
    type: 'connectedUsers',
    users: Array.from(connectedClients.keys())
  }));
  return true;
}

function handleSendPrivateMessage(ws, content) {
  const { recipient, message } = content;

  if (!recipient || !message) {
    return throwErrorToClient(ws, 'Recipient and message are required for private messages.');
  }

  if (!connectedClients.has(recipient)) {
    return throwErrorToClient(ws, `Recipient '${recipient}' is not connected.`);
  }

  const recipientClients = connectedClients.get(recipient);

  const privateMessage = {
    type: 'privateMessage',
    content: message,
    sender: ws.client.user, // use ws.client.user if you need sender info
    timestamp: new Date().toISOString()
  };

  for (const recipientWs of recipientClients) {
    if (recipientWs.readyState === recipientWs.OPEN) {
      recipientWs.send(JSON.stringify(privateMessage));
    } else {
      console.warn(`Recipient client ${recipientWs.client.id} is not open.`);
    }
  }

  console.log(`Private message sent from ${ws.client.user.id} to ${recipient}:`, message);
  return true;
}

// TBI
function handleSendRoomMessage(ws, content) {
  return false;
}
function handleCreateRoom(ws, content) {
  return false;
}
function handleLeaveRoom(ws, content) {
  return false;
}
function handleJoinRoom(ws, content) {
  return false;
}
function handleInvalidMessageType(ws) {
  ws.send(JSON.stringify({
    type: 'error',
    message: 'Unknown message type'
  }));
}
function handleGetClientInfo(ws) {
  ws.send(JSON.stringify({
    type: 'clientInfo',
    client: ws.client
  }));
  return true;
}

export default initSocketServer;
