'use client';

import React from 'react';
import { Layout, Avatar, Dropdown, Space, Typography, Button, Badge } from 'antd';
import { UserOutlined, BellOutlined, LogoutOutlined, QuestionCircleOutlined, MenuOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuth, useAuthActions } from '@/providers/authProvider';
import useStyles from './style/Topbar.style';

const { Header } = Layout;
const { Text } = Typography;

type MenuItem = Required<MenuProps>['items'][number];

interface TopbarProps {
  onMenuClick: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const { styles } = useStyles();
  const { user } = useAuth();
  const authActions = useAuthActions();
  
  const handleMenuClick: MenuProps['onClick'] = async (e) => {
    if (e.key === 'logout') {
      if (authActions) {
        await authActions.logout();
      }
    }
  };

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
      <div className={styles.menuBtnWrapper}>
        <Button 
          type="text" 
          icon={<MenuOutlined />} 
          onClick={onMenuClick} 
          style={{ fontSize: '18px', marginRight: '16px' }}
        />
      </div>
      <div style={{ flex: 1 }} /> {/* Spacer if menu is hidden */}
      <Space size={20}>
        <Badge count={5} size="small">
          <Button type="text" icon={<BellOutlined className={styles.bellIcon} />} />
        </Badge>
        <Dropdown menu={{ items: userMenuItems, onClick: handleMenuClick }} placement="bottomRight" arrow>
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
