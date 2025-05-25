import { WebSocketServer } from 'ws';
import constants from './constants/constants.js';
import { verifyJwtToken } from './utils/tokenHelper.js';

const connectedClients = new Map();
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
      // Attach user info from verifyClient to the socket
      ws.user = req.user;
      // Add user to the connected clients map
      connectedClients.set(ws.user, ws);
      // Log the user information
      console.log('New client connected:', ws.user);

      // Listen for messages from client
      ws.on('message', (message) => {
        try {
          const [parsedMessage, parseError] = safeJsonParse(message);
          if (parseError) {
            throw new Error('Invalid JSON format');
          }
          const { type, content } = parsedMessage;
          switch (type) {
            case 'joinRoom':
              console.log('Join room request received:', content, 'from user:', ws.user);
              break
            case 'leaveRoom':
              console.log('Leave room request received:', content, 'from user:', ws.user);
              break;
            case 'createRoom':
              console.log('Create room request received:', content, 'from user:', ws.user);
              break;
            case 'sendRoomMessage':
              console.log('sendRoomMessage request received:', content, 'from user:', ws.user);
            case 'sendPrivateMessage':
              console.log('sendPrivateMessage request received:', content, 'from user:', ws.user);
              break;
            case 'getConnectedUsers':
              console.log('getConnectedUsers request received from user:', ws.user);
              // Send the list of connected users to the requesting client
              ws.send(JSON.stringify({
                type: 'connectedUsers',
                users: Array.from(connectedClients.keys())
              }));
              break;
            default:
              console.warn('Unknown message type:', type);
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Unknown message type'
              }));
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

export default initSocketServer;
