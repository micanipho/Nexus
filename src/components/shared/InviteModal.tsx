'use client';

import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button, Typography, App } from 'antd';
import { MailOutlined, CopyOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { UserRole } from '../../types';
import { useAuth } from '../../providers/authProvider';
import emailjs from '@emailjs/browser';

const { Text } = Typography;

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
}

const InviteModal: React.FC<InviteModalProps> = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const { user } = useAuth();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  // Generate the magic link based on the selected role
  const generateInviteLink = (role: UserRole) => {
    if (!user?.tenantId) return '';
    // Use the live URL rather than window.location.origin for emails
    const baseUrl = 'https://nexus-alpha-gules.vercel.app'; 
    
    // Create a JSON string with the sensitive data and encode it to Base64
    const payload = JSON.stringify({ tenantId: user.tenantId, role });
    const encodedPayload = btoa(payload);
    
    return `${baseUrl}/register?invite=${encodedPayload}`;
  };

  const handleCopyLink = async () => {
    try {
      const values = await form.validateFields();
      const link = generateInviteLink(values.role);
      await navigator.clipboard.writeText(link);
      message.success('Invite link copied to clipboard!');
    } catch (error) {
      // Form validation failed
    }
  };

  const handleSendEmail = async (values: any) => {
    if (!user?.tenantId) {
      message.error('Missing workspace context. Please login again.');
      return;
    }

    setLoading(true);
    const inviteLink = generateInviteLink(values.role);

    try {
      // Frontend-only email sending via EmailJS
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID';
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID';
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY';

      if (serviceId === 'YOUR_SERVICE_ID') {
        console.warn("EmailJS is not fully configured in your .env file yet.");
      }

      const templateParams = {
        to_email: values.email,
        role: values.role === UserRole.SALES_REP ? 'Sales Representative' : 
              values.role === UserRole.BUSINESS_DEVELOPMENT_MANAGER ? 'Business Development Manager' : 'Sales Manager',
        invite_link: inviteLink,
        inviter_name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'a colleague',
        tenant_name: user?.tenantName || 'our workspace'
      };

      await emailjs.send(serviceId, templateId, templateParams, publicKey);

      message.success(`Invitation sent successfully to ${values.email}!`);
      form.resetFields();
      onClose();
    } catch (error: any) {
      console.error('EmailJS error:', error);
      message.error(error.text || 'An unexpected error occurred sending the invite.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SafetyCertificateOutlined style={{ color: '#0B3B73' }} />
          Invite Team Member
        </span>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <div style={{ marginBottom: '24px', marginTop: '16px' }}>
        <Text type="secondary">
          Send a dedicated magic link to invite a new user to your workspace <b>({user?.tenantName || 'Unknown'})</b>. 
          The link will automatically assign them to your organisation.
        </Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSendEmail}
        initialValues={{ role: UserRole.SALES_REP }}
      >
        <Form.Item
          name="email"
          label="Email Address"
          rules={[
            { required: true, message: 'Please enter the invitee\'s email address' },
            { type: 'email', message: 'Please enter a valid email address' }
          ]}
        >
          <Input placeholder="colleague@example.com" prefix={<MailOutlined />} />
        </Form.Item>

        <Form.Item
          name="role"
          label="Assign Role"
          rules={[{ required: true, message: 'Please select a role' }]}
        >
          <Select>
            <Select.Option value={UserRole.SALES_REP}>Sales Representative</Select.Option>
            <Select.Option value={UserRole.BUSINESS_DEVELOPMENT_MANAGER}>Business Development Manager</Select.Option>
            {user?.roles?.includes(UserRole.ADMIN) && (
              <Select.Option value={UserRole.SALES_MANAGER}>Sales Manager</Select.Option>
            )}
          </Select>
        </Form.Item>

        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
          <Button 
            icon={<CopyOutlined />} 
            onClick={handleCopyLink}
            style={{ flex: 1 }}
          >
            Copy Link
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            icon={<MailOutlined />} 
            loading={loading}
            style={{ flex: 1 }}
          >
            Send Invite via Email
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default InviteModal;
