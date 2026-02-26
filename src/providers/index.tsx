'use client';

import React from 'react';
import { AuthProvider } from './authProvider';
import { ClientProvider } from './clientProvider';
import { OpportunityProvider } from './opportunityProvider';
import { ProposalProvider } from './proposalProvider';
import { ContractProvider } from './contractProvider';
import { ActivityProvider } from './activityProvider';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <ClientProvider>
        <OpportunityProvider>
          <ProposalProvider>
            <ContractProvider>
              <ActivityProvider>
                {children}
              </ActivityProvider>
            </ContractProvider>
          </ProposalProvider>
        </OpportunityProvider>
      </ClientProvider>
    </AuthProvider>
  );
};
