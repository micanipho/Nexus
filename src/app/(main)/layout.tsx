'use client';

import React from 'react';
import { Layout } from 'antd';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import useStyles from './layout.style';

const { Content } = Layout;

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { styles } = useStyles();

  return (
    <Layout className={styles.layout}>
      <Sidebar />
      <Layout className={styles.mainSection}>
        <Topbar />
        <Content className={styles.content}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
