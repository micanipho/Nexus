'use client';

import React from 'react';
import { Layout, Avatar, Dropdown, Space, Typography, Button, Badge } from 'antd';
import { UserOutlined, BellOutlined, LogoutOutlined, QuestionCircleOutlined } from '@ant-design/icons';

import type { MenuProps } from 'antd';

const { Header } = Layout;
const { Text } = Typography;

type MenuItem = Required<MenuProps>['items'][number];

const Topbar: React.FC = () => {
  const userMenuItems: MenuItem[] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'My Profile',
    },
    {
      key: 'help',
      icon: <QuestionCircleOutlined />,
      label: 'Help Center',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
    },
  ];

  return (
    <Header
      style={{
        padding: '0 24px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        position: 'sticky',
        top: 0,
        zIndex: 1,
        width: '100%',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <Space size={20}>
        <Badge count={5} size="small">
          <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} />
        </Badge>
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
          <Space style={{ cursor: 'pointer' }}>
            <Avatar icon={<UserOutlined />} />
            <Text strong>John Doe</Text>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default Topbar;
