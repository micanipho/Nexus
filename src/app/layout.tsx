import React from 'react';
import { Geist } from "next/font/google";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { App } from 'antd';
import { AppProviders } from '../providers';
import { ThemeProvider } from '../providers/themeProvider';
import type { Metadata, Viewport } from 'next';
import './globals.css';

const geist = Geist({
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Nexus',
    default: 'Nexus | Enterprise Sales Automation',
  },
  description: 'Streamline your B2B sales operations, pipeline tracking, and contract renewals with Nexus.',
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="en">
      <body className={geist.className}>
      <AntdRegistry>
        <ThemeProvider fontFamily={geist.style.fontFamily}>
          <App>
            <AppProviders>
              {children}
            </AppProviders>
          </App>
        </ThemeProvider>
      </AntdRegistry>
      </body>
      </html>
  );
}
