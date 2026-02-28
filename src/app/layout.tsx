import React from 'react';
import { Geist } from "next/font/google";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { App } from 'antd';
import { AppProviders } from '../providers';
import { ThemeProvider } from '../providers/themeProvider';
import './globals.css';

const geist = Geist({
  subsets: ["latin"],
  display: 'swap',
});

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
