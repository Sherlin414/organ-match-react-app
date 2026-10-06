import dotenv from 'dotenv';
dotenv.config();

import { createServer } from 'http';
import app from './app.js';
import { initSocket } from './realtime/io.js';

const PORT = process.env.PORT || 4000;

const httpServer = createServer(app);
initSocket(httpServer, process.env.CORS_ORIGIN);

httpServer.listen(PORT, () => {
  console.log(`OrganMatch Relay backend listening on http://localhost:${PORT}`);
  console.log(`Socket.IO real-time layer attached on the same port.`);
});
