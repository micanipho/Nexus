'use client';

import React from 'react';
import { AuthProvider } from './authProvider';
import { ClientProvider } from './clientProvider';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <ClientProvider>
        {children}
      </ClientProvider>
    </AuthProvider>
  );
};
