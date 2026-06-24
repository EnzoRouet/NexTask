"use client";

import { SessionProvider } from "next-auth/react";
import { SocketProvider } from "./socket.provider";
import React from "react";

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <SocketProvider>{children}</SocketProvider>
    </SessionProvider>
  );
};
