'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import type { ThemeConfig } from 'antd';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode, fontFamily?: string }> = ({ children, fontFamily }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only access localStorage safely on the client
    const savedMode = localStorage.getItem('nexus_theme');
    if (savedMode === 'dark') {
      setIsDarkMode(true);
    }
    setMounted(true);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem('nexus_theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  const theme: ThemeConfig = {
    token: {
      fontFamily: fontFamily,
      colorPrimary: isDarkMode ? '#3399ff' : '#0B3B73',
      colorInfo: isDarkMode ? '#3399ff' : '#0B3B73',
      // Base colors change based on mode
      colorBgBase: isDarkMode ? '#141414' : '#FFFFFF',
      colorTextBase: isDarkMode ? '#FFFFFF' : '#0A1A2B',
      colorBorder: isDarkMode ? '#303030' : '#E5E7EB',
      borderRadius: 8,
      fontSize: 14,
    },
    components: {
      Layout: {
        headerBg: isDarkMode ? '#1f1f1f' : '#FFFFFF',
        bodyBg: isDarkMode ? '#141414' : '#FFFFFF',
        siderBg: isDarkMode ? '#0B3B73' : '#0B3B73',
        triggerBg: isDarkMode ? '#0B3B73' : '#0B3B73',
      },
      Menu: {
        itemSelectedBg: '#0B2545',
        itemSelectedColor: '#FFFFFF',
        itemColor: isDarkMode ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)',
        itemHoverColor: isDarkMode ? '#FFFFFF' : '#0B3B73',
        itemHoverBg: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
      },
      Card: { headerHeight: 52 },
      Table: { 
        headerSplitColor: isDarkMode ? '#303030' : '#E5E7EB',
        headerBg: isDarkMode ? '#1f1f1f' : '#fafafa',
      },
      Statistic: { titleFontSize: 12 },
    },
    algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      <ConfigProvider theme={theme}>
        {/* Render children plainly until mounted to avoid hydration mismatch */}
        <div style={{ visibility: mounted ? 'visible' : 'hidden' }}>
            {children}
        </div>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};
