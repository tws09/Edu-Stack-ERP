import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

let io: SocketServer | null = null;

export function initSocket(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: {
      origin: env.frontendUrl,
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const payload = jwt.verify(token, env.jwtSecret) as {
        userId: string;
        orgId?: string;
        branchId?: string;
        role: string;
      };
      socket.data.userId = payload.userId;
      socket.data.orgId = payload.orgId;
      socket.data.branchId = payload.branchId;
      socket.data.role = payload.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { userId, orgId, branchId } = socket.data;

    // Join personal room for targeted notifications
    socket.join(`user:${userId}`);

    // Join org+branch room for broadcast messages
    if (orgId && branchId) {
      socket.join(`branch:${orgId}:${branchId}`);
    }

    socket.on('disconnect', () => {
      socket.leave(`user:${userId}`);
    });
  });

  return io;
}

export function getIO(): SocketServer {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

/** Send a notification to a specific user */
export function emitToUser(userId: string, event: string, data: unknown): void {
  getIO().to(`user:${userId}`).emit(event, data);
}

/** Broadcast to all users in a branch */
export function emitToBranch(orgId: string, branchId: string, event: string, data: unknown): void {
  getIO().to(`branch:${orgId}:${branchId}`).emit(event, data);
}
