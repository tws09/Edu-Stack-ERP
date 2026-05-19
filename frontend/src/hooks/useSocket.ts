import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';
import { useQueryClient } from '@tanstack/react-query';

const SOCKET_URL = import.meta.env['VITE_API_URL']?.replace('/api', '') ?? 'http://localhost:5000';

export function useSocket() {
  const accessToken = useAuthStore(s => s.accessToken);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const qc = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const socket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('notification', () => {
      // Invalidate unread count so the bell badge updates
      qc.invalidateQueries({ queryKey: ['notif-count'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, accessToken, qc]);

  return socketRef;
}
