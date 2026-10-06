import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

let ioInstance = null;

/**
 * Attaches Socket.IO to the existing HTTP server. Every socket authenticates
 * with the same JWT the REST API uses (passed via the `auth` handshake
 * option), then joins two rooms: one scoped to their own user id (for
 * personal notifications/match alerts) and one scoped to their role (for
 * broadcasts like "a new match was proposed" that any Hospital Admin should
 * see, not just one).
 */
export function initSocket(httpServer, corsOrigin) {
  ioInstance = new Server(httpServer, {
    cors: { origin: corsOrigin || 'http://localhost:5173' },
  });

  ioInstance.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Missing auth token'));
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      socket.user = payload;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  ioInstance.on('connection', (socket) => {
    socket.join(`user:${socket.user.id}`);
    socket.join(`role:${socket.user.role}`);
  });

  return ioInstance;
}

export function emitToUser(userId, event, payload) {
  ioInstance?.to(`user:${userId}`).emit(event, payload);
}

export function emitToRole(role, event, payload) {
  ioInstance?.to(`role:${role}`).emit(event, payload);
}
