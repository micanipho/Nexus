'use client';

import React from 'react';
import { Layout, Space, Typography, Button, Popconfirm } from 'antd';
import { LogoutOutlined, MenuOutlined } from '@ant-design/icons';
import { useAuth, useAuthActions } from '@/providers/authProvider';
import useStyles from './style/Topbar.style';

const { Header } = Layout;
const { Text } = Typography;

interface TopbarProps {
  onMenuClick: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const { styles } = useStyles();
  const { user } = useAuth();
  const authActions = useAuthActions();
  
  const handleLogout = async () => {
    if (authActions) {
      await authActions.logout();
    }
  };

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
      <Space size={12}>
        <div className={styles.userSpace}>
          <Text className={styles.userName}>
            {user ? `${user.firstName} ${user.lastName}` : 'John Doe'}
          </Text>
        </div>
        
        <Popconfirm
          title="Logout"
          description="Are you sure you want to log out?"
          onConfirm={handleLogout}
          okText="Yes"
          cancelText="No"
          placement="bottomRight"
        >
          <Button 
            type="text" 
            danger 
            icon={<LogoutOutlined />} 
            className={styles.logoutDesktop}
          >
            Logout
          </Button>
          <Button 
            type="text" 
            danger 
            icon={<LogoutOutlined />} 
            className={styles.logoutMobile}
          />
        </Popconfirm>
      </Space>
    </Header>
  );
};

export default Topbar;
