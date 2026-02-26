'use client';

import React, { useEffect } from 'react';
import { Layout, Spin } from 'antd';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { useAuth } from '../../providers/authProvider';
import useStyles from './style/layout.style';

const { Content } = Layout;

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { styles } = useStyles();
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout className={styles.layout}>
      <Sidebar 
          mobileOpen={mobileMenuOpen} 
          onMobileClose={() => setMobileMenuOpen(false)} 
      />
      <Layout className={styles.mainSection}>
        <Topbar onMenuClick={() => setMobileMenuOpen(true)} />
        <Content className={styles.content}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
