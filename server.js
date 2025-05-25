import api from './api.js';
import initSocketServer from './socket.js';
import constants from './constants/constants.js';

api.listen(constants.SERVER_PORT, () => {
  console.log(`Server is running on port ${constants.SERVER_PORT}`);
});

initSocketServer();