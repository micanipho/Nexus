'use client';

import React from 'react';
import { AuthProvider } from './authProvider';
import { ClientProvider } from './clientProvider';
import { OpportunityProvider } from './opportunityProvider';
import { ProposalProvider } from './proposalProvider';
import { ContractProvider } from './contractProvider';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <ClientProvider>
        <OpportunityProvider>
          <ProposalProvider>
            <ContractProvider>
              {children}
            </ContractProvider>
          </ProposalProvider>
        </OpportunityProvider>
      </ClientProvider>
    </AuthProvider>
  );
};
