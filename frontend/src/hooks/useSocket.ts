import { useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useQueryClient } from '@tanstack/react-query';

const SOCKET_URL = import.meta.env['VITE_API_URL']?.replace('/api', '') ?? 'http://localhost:5000';
const SOCKETS_ENABLED = import.meta.env['VITE_SOCKETS_ENABLED'] === 'true';

export function useSocket() {
  const accessToken = useAuthStore(s => s.accessToken);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const qc = useQueryClient();
  const socketRef = useRef<import('socket.io-client').Socket | null>(null);

  useEffect(() => {
    if (!SOCKETS_ENABLED || !isAuthenticated || !accessToken) return;

    let socket: import('socket.io-client').Socket;

    import('socket.io-client').then(({ io }) => {
      socket = io(SOCKET_URL, {
        auth: { token: accessToken },
        transports: ['websocket', 'polling'],
      });

      socketRef.current = socket;

      socket.on('notification', () => {
        qc.invalidateQueries({ queryKey: ['notif-count'] });
        qc.invalidateQueries({ queryKey: ['notifications'] });
      });
    }).catch(() => {
      // Socket.io unavailable (e.g. serverless deployment) — notifications work via polling
    });

    return () => {
      socket?.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, accessToken, qc]);

  return socketRef;
}
