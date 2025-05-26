/**
 * Program Name: instant-messaging-server
 * Description : A real-time instant messaging server using Express and Javascript's native WebSocket.
 * Version     : 1.0.0 
 * Author      : Wafik Aboualim
 * Created On  : May 22, 2025
 * Last Updated: May 26, 2025
 * License     : MIT
 */
import api from './api.js';
import initSocketServer from './socket.js';
import constants from './constants/constants.js';

api.listen(constants.SERVER_PORT, () => {
  console.log(`Server is running on port ${constants.SERVER_PORT}`);
});

initSocketServer();