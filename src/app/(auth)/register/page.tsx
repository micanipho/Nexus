'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, App, Space, Row, Col, Segmented, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, TeamOutlined, BankOutlined } from '@ant-design/icons';
import { useAuthActions, useAuth } from '@/providers/authProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import useStyles from './style/register.style';

const { Text } = Typography;

type RegistrationMode = 'new-org' | 'join-org' | 'quick-start';

const modeLabels: Record<RegistrationMode, string> = {
  'new-org': 'New Organisation',
  'join-org': 'Join Organisation',
  'quick-start': 'Quick Start',
};

const roleOptions = [
  { label: 'Sales Manager', value: 'SalesManager' },
  { label: 'Business Development Manager', value: 'BusinessDevelopmentManager' },
  { label: 'Sales Rep', value: 'SalesRep' },
];

export default function RegisterPage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<RegistrationMode>('new-org');
  const { register } = useAuthActions();
  const { error } = useAuth();
  const router = useRouter();
  const { styles } = useStyles();
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const tenantName = mode === 'new-org' ? values.tenantName : undefined;
      const tenantId = mode === 'join-org' ? values.tenantId : undefined;
      let role: string | undefined;
      if (mode === 'join-org') {
        role = values.role;
      } else if (mode === 'quick-start') {
        role = 'SalesRep';
      }

      await register(
        values.firstName,
        values.lastName,
        values.email,
        values.password,
        tenantName,
        tenantId,
        role,
      );
      message.success('Registration successful!');
      router.push('/dashboard');
    } catch (err) {
      message.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (value: string | number) => {
    setMode(value as RegistrationMode);
    form.resetFields(['tenantName', 'tenantId', ...(value !== 'join-org' ? ['role'] : [])]);
  };

  const subtitleMap: Record<RegistrationMode, string> = {
    'new-org': 'Create a new organisation',
    'join-org': 'Join an existing organisation with a Tenant ID',
    'quick-start': 'Get started quickly as a Sales Rep',
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
          <Text type="secondary" className={styles.subtitle}>{subtitleMap[mode]}</Text>
        </div>

        <div className={styles.segmentedWrapper}>
          <Segmented
            block
            value={mode}
            onChange={handleModeChange}
            options={[
              { label: modeLabels['new-org'], value: 'new-org' },
              { label: modeLabels['join-org'], value: 'join-org' },
              { label: modeLabels['quick-start'], value: 'quick-start' },
            ]}
            className={styles.segmented}
          />
        </div>

        {error && <Alert message={error} type="error" showIcon className={styles.errorAlert} />}

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          size="large"
          layout="vertical"
        >
          {/* Scenario A: New Organisation — tenant name */}
          {mode === 'new-org' && (
            <Form.Item
              name="tenantName"
              rules={[{ required: true, message: 'Please enter your organisation name' }]}
              className={styles.formItem}
            >
              <Input prefix={<BankOutlined />} placeholder="Organisation Name" className={styles.input} />
            </Form.Item>
          )}

          {/* Scenario B: Join Organisation — tenant ID + role */}
          {mode === 'join-org' && (
            <>
              <Form.Item
                name="tenantId"
                rules={[{ required: true, message: 'Please enter the organisation Tenant ID' }]}
                className={styles.formItem}
              >
                <Input prefix={<TeamOutlined />} placeholder="Tenant ID" className={styles.input} />
              </Form.Item>
              <Form.Item
                name="role"
                rules={[{ required: true, message: 'Please select your role' }]}
                className={styles.formItem}
              >
                <Select placeholder="Select your role" options={roleOptions} className={styles.input} />
              </Form.Item>
            </>
          )}

          {/* Scenario C: Quick Start — auto-assigned as SalesRep, no extra fields */}

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
              {mode === 'new-org' ? 'Create Organisation' : 'Join Organisation'}
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
