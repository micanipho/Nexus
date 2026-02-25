'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, message, Space, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAuthActions, useAuth } from '@/providers/authProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import useStyles from './style/register.style';

const { Title, Text } = Typography;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const { register } = useAuthActions();
  const { error } = useAuth();
  const router = useRouter();
  const { styles } = useStyles();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await register(values.firstName, values.lastName, values.email, values.password);
      message.success('Registration successful!');
      router.push('/dashboard');
    } catch (err) {
      // Error handled by provider
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
              width={88} 
              height={88} 
              className={styles.logo}
            />
            <h1 className={styles.title}>NEXUS</h1>
          </div>
          <Text type="secondary" className={styles.subtitle}>Create your enterprise account</Text>
        </div>

        {error && <Alert message={error} type="error" showIcon className={styles.errorAlert} />}

        <Form
          name="register"
          onFinish={onFinish}
          size="large"
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                rules={[{ required: true, message: 'First name is required' }]}
                className={styles.formItem}
              >
                <Input prefix={<UserOutlined />} placeholder="First Name" className={styles.input} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                rules={[{ required: true, message: 'Last name is required' }]}
                className={styles.formItem}
              >
                <Input prefix={<UserOutlined />} placeholder="Last Name" className={styles.input} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your Email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
            className={styles.formItem}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" className={styles.input} />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your Password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
            className={styles.formItem}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" className={styles.input} />
          </Form.Item>

          <Form.Item
            name="confirm"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
            className={styles.lastFormItem}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" className={styles.input} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className={styles.submitButton} loading={loading}>
              Create Account
            </Button>
          </Form.Item>
          
          <div className={styles.footer}>
            <Space>
              <p className={styles.subtitle}>Already have an account?</p>
              <Link className={styles.subtitle} href="/login">Login</Link>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
}
