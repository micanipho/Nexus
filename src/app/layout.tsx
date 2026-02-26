import React from 'react';
import { Geist } from "next/font/google";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, App, theme as antdTheme } from 'antd';
import type { ThemeConfig } from 'antd';
import { AppProviders } from '../providers';
import './globals.css';

const geist = Geist({
  subsets: ["latin"],
  display: 'swap',
});

const theme: ThemeConfig = {
  token: {
    fontFamily: geist.style.fontFamily,
    colorPrimary: '#0B3B73',
    colorInfo: '#0B3B73',
    colorBgBase: '#FFFFFF',
    colorTextBase: '#0A1A2B',
    colorBorder: '#E5E7EB',
    borderRadius: 8,
    fontSize: 14,
  },
  components: {
    Layout: {
      headerBg: '#FFFFFF',
      bodyBg: '#FFFFFF',
      siderBg: '#0B3B73',
      triggerBg: '#0B3B73',
    },
    Menu: {
      itemSelectedBg: '#0B2545',
      itemSelectedColor: '#FFFFFF',
      itemColor: 'rgba(255,255,255,0.85)',
      itemHoverColor: '#FFFFFF',
      itemHoverBg: 'rgba(255,255,255,0.05)',
    },
    Card: { headerHeight: 52 },
    Table: { headerSplitColor: '#E5E7EB' },
    Statistic: { titleFontSize: 12 },
  },
  algorithm: antdTheme.defaultAlgorithm,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="en">
      <body className={geist.className}>
      <AntdRegistry>
        <ConfigProvider theme={theme}>
          <App>
            <AppProviders>
              {children}
            </AppProviders>
          </App>
        </ConfigProvider>
      </AntdRegistry>
      </body>
      </html>
  );
}
