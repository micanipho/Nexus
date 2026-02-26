'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, App, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuthActions, useAuth } from '@/providers/authProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import useStyles from './style/login.style';

const { Title, Text, Paragraph } = Typography;

export default function LoginPage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const { login } = useAuthActions();
  const { error } = useAuth();
  const router = useRouter();
  const { styles } = useStyles();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      message.success('Login successful!');
      router.push('/dashboard');
    } catch (err) {
      message.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <Image 
              src="/logo.svg" 
              alt="Nexus Logo" 
              width={48} 
              height={48} 
              className={styles.logo}
            />
            <h1 className={styles.title}>NEXUS</h1>
          </div>
          <Text type="secondary" className={styles.subtitle}>Enterprise Sales Automation</Text>
        </div>

        {error && <Alert message={error} type="error" showIcon className={styles.errorAlert} />}

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Please input your Email!', type: 'email' }]}
            className={styles.formItem}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" className={styles.input} />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
            className={styles.passwordItem}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" className={styles.input} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className={styles.submitButton} loading={loading}>
              Log in
            </Button>
          </Form.Item>
          
          <div className={styles.footer}>
            <Space orientation="vertical" size={4}>
              <p className={styles.subtitle}>
                Don't have an account? <Link href="/register">Create an account</Link>
              </p>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
}
