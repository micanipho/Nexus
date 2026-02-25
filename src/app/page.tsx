'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Typography, Space, Layout } from 'antd';
import { RocketOutlined, LoginOutlined } from '@ant-design/icons';
import useStyles from './style/page.style';

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

export default function LandingPage() {
  const { styles } = useStyles();

  return (
    <Layout className={styles.layout}>
      {/* Background Decorations */}
      <div className={styles.decorationTop} />
      <div className={styles.decorationBottom} />

            <Header className={styles.header}>
              <div className={styles.logoWrapper}>
                <Image 
                  src="/logo.svg" 
                  alt="Nexus Logo" 
                  width={64} 
                  height={64} 
                  className={styles.logoImage}
                />
                <div className={styles.logo}>Nexus</div>
              </div>
      
        <Space size="large">
          <Link href="/login">
            <Button type="text" icon={<LoginOutlined />} className={styles.navLink}>Login</Button>
          </Link>
          <Link href="/register">
            <Button type="primary" shape="round" className={styles.primaryButtonSmall}>Join Nexus</Button>
          </Link>
        </Space>
      </Header>

      <Content className={styles.content}>
        <div className={styles.heroSection}>
          <h1 className={styles.title}>
            Sales automation,<br />
            <span className={styles.gradientText}>fused with simplicity.</span>
          </h1>

          <Paragraph className={styles.paragraph}>
            The enterprise-grade pipeline manager that stays out of your way
            so you can focus on what matters: closing with Nexus.
          </Paragraph>

          <Space size="large">
            <Link href="/register">
              <Button
                type="primary"
                size="large"
                icon={<RocketOutlined />}
                className={styles.primaryButton}
              >
                Start Your Journey
              </Button>
            </Link>
          </Space>
        </div>
      </Content>
    </Layout>
  );
}
