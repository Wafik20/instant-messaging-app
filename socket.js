// import { db, getUserByUsername } from './database.js';
// import { WebSocketServer } from 'ws';

// // Create a WebSocket server on port 8080
// const server = new WebSocketServer({ port: 8080 });
// const connectedClients = new Map();

// server.on('headers', (headers) => {
//     // Ask for bearer token
//     // Identify the client by the token
//   console.log('Headers received:', headers);
// });

// server.on('connection', (socket) => {
//   console.log('Client connected');

//   // Listen for messages from client
//   socket.on('message', (message) => {
//     console.log(`Received: ${message}`);
//     socket.send(`Server says: ${message}`);
//   });

//   // Handle client disconnection
//   socket.on('close', () => {
//     console.log('Client disconnected');
//   });
// });

// console.log('WebSocket server running on ws://localhost:8080');
