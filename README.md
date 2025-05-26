# Instant Messaging Application

A real-time instant messaging application built with Node.js, Express, and WebSocket.

## Features

- Real-time messaging using WebSocket
- JWT-based authentication
- Private messaging
- SQLite database for data persistence
- RESTful API endpoints

## Tech Stack

- **Backend**: Node.js, Express
- **Real-time Communication**: WebSocket (ws)
- **Database**: SQLite3
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Environment Variables**: dotenv
- **CORS Support**: cors

## Project Structure

```
instant-messaging-app/
├── constants/         # Application constants and configuration
├── db/               # Database files
├── middleware/       # Express middleware
├── routes/           # API routes
├── utils/            # Utility functions
├── api.js           # Express API setup
├── database.js      # Database configuration and queries
├── server.js        # Main application entry point
├── socket.js        # WebSocket server implementation
└── package.json     # Project dependencies and scripts
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```

- `POST /api/auth/login` - Login user
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```

## WebSocket Events

### Client to Server

1. `getClientInfo`
   - Get information about the current client

2. `sendPrivateMessage`
   - Send a private message to a user
   ```json
   {
     "recipient": "user_id",
     "message": "string"
   }
   ```

3. `getConnectedUsers`
   - Get list of currently connected users

### Server to Client

1. `error`
   - Error message
   ```json
   {
     "type": "error",
     "message": "string"
   }
   ```

2. `privateMessage`
   - Private message received
   ```json
   {
     "type": "privateMessage",
     "content": "string",
     "sender": "object",
     "timestamp": "string"
   }
   ```

3. `connectedUsers`
   - List of connected users
   ```json
   {
     "type": "connectedUsers",
     "users": ["user_id1", "user_id2"]
   }
   ```

4. `clientInfo`
   - Client information
   ```json
   {
     "type": "clientInfo",
     "client": {
       "id": "string",
       "connectedAt": "string",
       "user": "object"
     }
   }
   ```

## Coming Soon

- Chat rooms functionality
- Room message broadcasting
- Room management (create/join/leave)
- Message persistence in database

## Setup and Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Wafik20/instant-messaging-app.git
   cd instant-messaging-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```
   PORT=3000
   WEBSOCKET_PORT=8080
   JWT_SECRET=your-secret-key
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

## WebSocket Client Example

```javascript
const ws = new WebSocket('ws://localhost:8080', {
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});

ws.onopen = () => {
  console.log('Connected to WebSocket server');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};

// Send a private message
ws.send(JSON.stringify({
  type: 'sendPrivateMessage',
  content: {
    recipient: 'user_id',
    message: 'Hello!'
  }
}));
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
