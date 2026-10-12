import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let ioInstance: Server | null = null;

// Track active users per project for presence indicator
// Map of projectId -> Map of socketId -> { id, name }
const activeProjectUsers = new Map<string, Map<string, { id: string; name: string }>>();

export function initSockets(httpServer: HttpServer) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  ioInstance.on('connection', (socket: Socket) => {
    let currentProjectId: string | null = null;
    let currentUser: { id: string; name: string } | null = null;

    // Join user notification room
    socket.on('user:join', ({ userId }) => {
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });

    // Join project collaboration room with presence
    socket.on('project:join', ({ projectId, user }) => {
      if (!projectId) return;

      currentProjectId = projectId;
      currentUser = user;
      socket.join(`project:${projectId}`);

      if (!activeProjectUsers.has(projectId)) {
        activeProjectUsers.set(projectId, new Map());
      }
      if (user) {
        activeProjectUsers.get(projectId)!.set(socket.id, user);
      }

      // Broadcast updated presence list to room
      const activeList = Array.from(activeProjectUsers.get(projectId)!.values());
      // Deduplicate by user id
      const uniqueUsers = Array.from(new Map(activeList.map((u) => [u.id, u])).values());
      ioInstance?.to(`project:${projectId}`).emit('presence:update', { activeUsers: uniqueUsers });
    });

    // Leave project room
    socket.on('project:leave', ({ projectId }) => {
      if (projectId && activeProjectUsers.has(projectId)) {
        activeProjectUsers.get(projectId)!.delete(socket.id);
        const activeList = Array.from(activeProjectUsers.get(projectId)!.values());
        const uniqueUsers = Array.from(new Map(activeList.map((u) => [u.id, u])).values());
        ioInstance?.to(`project:${projectId}`).emit('presence:update', { activeUsers: uniqueUsers });
      }
      if (projectId) {
        socket.leave(`project:${projectId}`);
      }
    });

    socket.on('disconnect', () => {
      if (currentProjectId && activeProjectUsers.has(currentProjectId)) {
        activeProjectUsers.get(currentProjectId)!.delete(socket.id);
        const activeList = Array.from(activeProjectUsers.get(currentProjectId)!.values());
        const uniqueUsers = Array.from(new Map(activeList.map((u) => [u.id, u])).values());
        ioInstance?.to(`project:${currentProjectId}`).emit('presence:update', { activeUsers: uniqueUsers });
      }
    });
  });

  return ioInstance;
}

export function broadcastToProject(projectId: string, event: string, data: any) {
  if (ioInstance) {
    ioInstance.to(`project:${projectId}`).emit(event, data);
  }
}

export function sendNotificationToUser(userId: string, notification: any) {
  if (ioInstance) {
    ioInstance.to(`user:${userId}`).emit('notification:new', notification);
  }
}
