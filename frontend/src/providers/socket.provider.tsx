"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

interface CustomSession {
  access_token?: string;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (status !== "authenticated" || !session) {
      return;
    }

    const customSession = session as unknown as CustomSession;

    const token = customSession.access_token;

    if (!token) {
      console.warn(
        "Impossible d'initialiser le WebSocket : Token introuvable dans la session.",
      );
      return;
    }

    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    const socketInstance = io(backendUrl, {
      auth: {
        token: token,
      },
      transports: ["websocket"],
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      setSocket(socketInstance);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      setSocket(null);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [session, status]);

  const contextValue = useMemo(
    () => ({ socket, isConnected }),
    [socket, isConnected],
  );

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};
