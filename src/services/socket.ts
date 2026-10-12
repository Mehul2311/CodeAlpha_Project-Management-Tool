import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(window.location.origin, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      // Socket connected
    });

    socket.on('disconnect', () => {
      // Socket disconnected
    });
  }
  return socket;
}

export function joinProjectRoom(projectId: string, user: { id: string; name: string }) {
  const s = getSocket();
  s.emit('project:join', { projectId, user });
}

export function leaveProjectRoom(projectId: string, user: { id: string; name: string }) {
  const s = getSocket();
  s.emit('project:leave', { projectId, user });
}

export function joinUserRoom(userId: string) {
  const s = getSocket();
  s.emit('user:join', { userId });
}
