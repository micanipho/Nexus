'use client';

import React from 'react';
import { Layout, Avatar, Dropdown, Space, Typography, Button, Badge } from 'antd';
import { UserOutlined, BellOutlined, LogoutOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuth } from '@/providers/authProvider';
import useStyles from './style/Topbar.style';

const { Header } = Layout;
const { Text } = Typography;

type MenuItem = Required<MenuProps>['items'][number];

const Topbar: React.FC = () => {
  const { styles } = useStyles();
  const { user } = useAuth();
  
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
    <Header className={styles.header}>
      <Space size={20}>
        <Badge count={5} size="small">
          <Button type="text" icon={<BellOutlined className={styles.bellIcon} />} />
        </Badge>
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
          <Space className={styles.userSpace}>
            <Avatar icon={user?.avatar ? undefined : <UserOutlined />} src={user?.avatar} />
            <Text strong>{user ? `${user.firstName} ${user.lastName}` : 'John Doe'}</Text>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default Topbar;
