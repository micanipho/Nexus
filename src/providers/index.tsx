'use client';

import React from 'react';
import { AuthProvider } from './authProvider';
import { ClientProvider } from './clientProvider';
import { OpportunityProvider } from './opportunityProvider';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <ClientProvider>
        <OpportunityProvider>
          {children}
        </OpportunityProvider>
      </ClientProvider>
    </AuthProvider>
  );
};
