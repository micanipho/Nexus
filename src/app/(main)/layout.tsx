'use client';

import React, { useEffect } from 'react';
import { Layout, Spin } from 'antd';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '../../providers/authProvider';
import useStyles from './style/layout.style';

const SalesAssistant = dynamic(() => import('@/components/ai/SalesAssistant'), { ssr: false });

const { Content } = Layout;

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { styles } = useStyles();
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

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
      <Navbar />
      <Layout className={styles.mainSection}>
        <Content className={styles.content}>
          {children}
        </Content>
      </Layout>
      <SalesAssistant />
    </Layout>
  );
}
