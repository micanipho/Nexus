'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Alert, App, Space, Row, Col, Segmented, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, TeamOutlined, BankOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useAuthActions, useAuth } from '@/providers/authProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import useStyles from './style/register.style';
import { RegisterRequest } from '@/types/auth';

const { Text, Title } = Typography;

function InnerRegisterPage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'new-org' | 'quick-start'>('new-org');
  const { register } = useAuthActions();
  const { error } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { styles } = useStyles();
  const [form] = Form.useForm();
  
  // Magic link data
  const [inviteData, setInviteData] = useState<{ tenantId: string, role: string } | null>(null);

  useEffect(() => {
    const invite = searchParams.get('invite');
    const queryTenantId = searchParams.get('tenantId');
    const queryRole = searchParams.get('role');

    if (invite && typeof invite === 'string') {
      try {
        const decoded = JSON.parse(atob(invite));
        setInviteData(decoded);
        form.setFieldsValue({ tenantId: decoded.tenantId, role: decoded.role });
      } catch (e) {
        // Silent error
      }
    } else if (queryTenantId) {
      setInviteData({ tenantId: queryTenantId, role: queryRole || 'SalesRep' });
      form.setFieldsValue({ tenantId: queryTenantId, role: queryRole || 'SalesRep' });
    }
  }, [searchParams, form]);

  const isMagicLink = !!inviteData;

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      let tenantName = undefined;
      let tenantId = undefined;
      let role = 'Admin';

      if (isMagicLink) {
        tenantId = inviteData.tenantId;
        role = inviteData.role;
      } else if (mode === 'new-org') {
        tenantName = values.organisationName;
        role = 'Admin';
      } else {
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
      message.success('Account created successfully!');
      router.push('/dashboard');
    } catch (err: any) {
      // Error handled by state
    } finally {
      setLoading(false);
    }
  };

  const title = isMagicLink ? 'Join Workspace' : (mode === 'new-org' ? 'Create Organisation' : 'Quick Start');
  const subtitle = isMagicLink 
    ? 'Complete your profile to join the team.' 
    : (mode === 'new-org' ? 'Set up a private workspace for your team.' : 'Get started instantly in the Nexus community.');

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
          <Title level={4} style={{ margin: '8px 0 4px 0' }}>{title}</Title>
          <Text type="secondary" className={styles.subtitle}>{subtitle}</Text>
        </div>

        {!isMagicLink && (
          <div className={styles.segmentedWrapper}>
            <Segmented
              block
              value={mode}
              onChange={(v) => setMode(v as any)}
              options={[
                { label: 'New Organisation', value: 'new-org', icon: <BankOutlined /> },
                { label: 'Quick Start', value: 'quick-start', icon: <ThunderboltOutlined /> },
              ]}
              className={styles.segmented}
            />
          </div>
        )}

        {isMagicLink && (
          <Alert 
            message="Invitation Accepted" 
            description="You are joining an existing organisation. Your account will be configured automatically."
            type="success" 
            showIcon 
            style={{ marginBottom: '24px' }}
          />
        )}

        {error && <Alert message={error} type="error" showIcon className={styles.errorAlert} />}

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          size="large"
          layout="vertical"
          requiredMark={false}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true, message: 'Required' }]}
                className={styles.formItem}
              >
                <Input placeholder="John" className={styles.input} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true, message: 'Required' }]}
                className={styles.formItem}
              >
                <Input placeholder="Doe" className={styles.input} />
              </Form.Item>
            </Col>
          </Row>

          {mode === 'new-org' && !isMagicLink && (
            <Form.Item
              name="organisationName"
              label="Organisation Name"
              rules={[{ required: true, message: 'Please enter your organisation name' }]}
              className={styles.formItem}
            >
              <Input prefix={<BankOutlined />} placeholder="e.g. Acme Corp" className={styles.input} />
            </Form.Item>
          )}

          <Form.Item
            name="email"
            label="Work Email"
            rules={[
              { required: true, message: 'Required' },
              { type: 'email', message: 'Invalid email' }
            ]}
            className={styles.formItem}
          >
            <Input prefix={<MailOutlined />} placeholder="john@company.com" className={styles.input} />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Required' },
              { min: 6, message: 'Min 6 characters' }
            ]}
            className={styles.formItem}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" className={styles.input} />
          </Form.Item>

          <Form.Item
            name="confirm"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
            className={styles.lastFormItem}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" className={styles.input} />
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" className={styles.submitButton} loading={loading} block>
              {isMagicLink ? 'Join Workspace' : (mode === 'new-org' ? 'Create Workspace' : 'Get Started')}
            </Button>
          </Form.Item>
          
          <div className={styles.footer}>
            <Space>
              <Text type="secondary">Already have an account?</Text>
              <Link href="/login">Sign In</Link>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>}>
      <InnerRegisterPage />
    </Suspense>
  );
}
