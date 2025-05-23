import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const SERVER_PORT = process.env.PORT || 3000;
const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT || 8080;

export default { JWT_SECRET, SERVER_PORT, WEBSOCKET_PORT };
